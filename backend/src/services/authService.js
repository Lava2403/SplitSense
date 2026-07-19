const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../../db");
const { sendPasswordResetEmail } = require("./emailService");

const signup = async ({ name, email, password }) => {
  const existingUser = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (existingUser.rows.length > 0) {
    const error = new Error("Email already exists");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users(name, email, password) VALUES ($1, $2, $3)",
    [name, email, hashedPassword]
  );

  return { message: "Account created successfully" };
};

const login = async ({ email, password }) => {
  const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

  if (user.rows.length === 0) {
    const error = new Error("Invalid Email or Password");
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.rows[0].password);

  if (!isMatch) {
    const error = new Error("Invalid Email or Password");
    error.statusCode = 400;
    throw error;
  }

  const token = jwt.sign(
    {
      id: user.rows[0].id,
      email: user.rows[0].email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    message: "Login successful",
    token,
    user: {
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
    },
  };
};

const getProfile = async (userId) => {
  const result = await pool.query(
    "SELECT id, name, email FROM users WHERE id = $1",
    [userId]
  );

  if (result.rows.length === 0) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

const forgotPassword = async (email) => {
  const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

  if (user.rows.length === 0) {
    const error = new Error("User not found");
    error.statusCode = 400;
    throw error;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000);

  await pool.query(
    `UPDATE users
     SET reset_token = $1,
         reset_token_expiry = $2
     WHERE email = $3`,
    [resetToken, expiry, email]
  );

  await sendPasswordResetEmail({ email, resetToken });

  return { message: "Password reset email sent successfully" };
};

const resetPassword = async (token, password) => {
  const user = await pool.query(
    `SELECT * FROM users
     WHERE reset_token = $1
     AND reset_token_expiry > NOW()`,
    [token]
  );

  if (user.rows.length === 0) {
    const error = new Error("Invalid or Expired Token");
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
    [hashedPassword, user.rows[0].id]
  );

  return { message: "Password Reset Successful" };
};

const testDatabase = async () => {
  const result = await pool.query("SELECT NOW()");
  return result.rows;
};

module.exports = {
  signup,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  testDatabase,
};
