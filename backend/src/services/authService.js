const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const pool = require("../../db");

const JWT_SECRET = process.env.JWT_SECRET || "splitsense-dev-secret";

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

const createToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE LOWER(email) = $1",
    [normalizedEmail]
  );

  if (existingUser.rows.length > 0) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const inserted = await pool.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email`,
    [name.trim(), normalizedEmail, hashedPassword]
  );

  const newUser = inserted.rows[0];

  return {
    token: createToken(newUser),
    user: sanitizeUser(newUser),
  };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    "SELECT id, name, email, password FROM users WHERE LOWER(email) = $1",
    [normalizedEmail]
  );

  const user = result.rows[0];

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  return {
    token: createToken(user),
    user: sanitizeUser(user),
  };
};

const getUserById = async (id) => {
  const result = await pool.query(
    "SELECT id, name, email FROM users WHERE id = $1",
    [id]
  );

  return result.rows[0] ? sanitizeUser(result.rows[0]) : null;
};

const listUsers = async () => {
  const result = await pool.query(
    "SELECT id, name, email FROM users ORDER BY name ASC"
  );

  return result.rows.map(sanitizeUser);
};

const loginWithGoogle = async ({ credential, accessToken }) => {
  let email = "";
  let name = "";

  if (credential) {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    const payload = await response.json();

    if (!response.ok || !payload.email) {
      const error = new Error("Google sign-in failed. Please try again.");
      error.statusCode = 401;
      throw error;
    }

    if (
      process.env.GOOGLE_CLIENT_ID &&
      payload.aud &&
      payload.aud !== process.env.GOOGLE_CLIENT_ID
    ) {
      const error = new Error("Google sign-in is not configured for this app.");
      error.statusCode = 401;
      throw error;
    }

    email = payload.email;
    name = payload.name || payload.email.split("@")[0];
  } else if (accessToken) {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const payload = await response.json();

    if (!response.ok || !payload.email) {
      const error = new Error("Google sign-in failed. Please try again.");
      error.statusCode = 401;
      throw error;
    }

    email = payload.email;
    name = payload.name || payload.email.split("@")[0];
  } else {
    const error = new Error("Google sign-in is missing credentials.");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await pool.query(
    "SELECT id, name, email FROM users WHERE LOWER(email) = $1",
    [normalizedEmail]
  );

  let user = existing.rows[0];

  if (!user) {
    const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
    const inserted = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [String(name).trim(), normalizedEmail, randomPassword]
    );
    user = inserted.rows[0];
  }

  return {
    token: createToken(user),
    user: sanitizeUser(user),
  };
};

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

const requestPasswordReset = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    "SELECT id, email FROM users WHERE LOWER(email) = $1",
    [normalizedEmail]
  );

  const user = result.rows[0];

  if (!user) {
    return { requested: false };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000);

  await pool.query(
    `UPDATE users
     SET reset_token = $1,
         reset_token_expiry = $2
     WHERE id = $3`,
    [resetToken, expiry, user.id]
  );

  return {
    requested: true,
    email: user.email,
    resetLink: `${getFrontendUrl()}/reset-password/${resetToken}`,
  };
};

const sendResetEmail = async ({ to, resetLink }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return { sent: false };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "SplitSense Password Reset",
      html: `
      <h2>Reset your password</h2>
      <p>You requested a password reset for your SplitSense account.</p>
      <p><a href="${resetLink}">Reset password</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `,
    });

    return { sent: true };
  } catch (error) {
    console.error("Password reset email failed:", error.message);
    return { sent: false, error: error.message };
  }
};

const resetPassword = async ({ token, password }) => {
  if (!token) {
    const error = new Error("This reset link is invalid or has expired.");
    error.statusCode = 400;
    throw error;
  }

  if (!password || password.length < 6) {
    const error = new Error("Password must be at least 6 characters.");
    error.statusCode = 400;
    throw error;
  }

  const result = await pool.query(
    `SELECT id FROM users
     WHERE reset_token = $1
       AND reset_token_expiry > NOW()`,
    [token]
  );

  const user = result.rows[0];

  if (!user) {
    const error = new Error("This reset link is invalid or has expired.");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    `UPDATE users
     SET password = $1,
         reset_token = NULL,
         reset_token_expiry = NULL
     WHERE id = $2`,
    [hashedPassword, user.id]
  );
};

module.exports = {
  registerUser,
  loginUser,
  loginWithGoogle,
  getUserById,
  listUsers,
  requestPasswordReset,
  sendResetEmail,
  resetPassword,
  JWT_SECRET,
};
