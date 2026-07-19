require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service:"gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get("/api/db-test", async(req, res) => {
  try{
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  }catch (err) {
    console.error("Database Error:");
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
});

app.get("/api/profile", auth, (req, res) => {
  res.json({
    message: "Protected route",
    user: req.user,
  });
});

app.get("/", (req, res) => {
  res.send("Backend Running 🚀"); // this send normal string msg
});
app.get("/api/test", (req, res) => {
  res.json({
    message: "Hello from Backend 🚀" // this send json msg (object)
  });
});


app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    // check if email already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if(existingUser.rows.length > 0) {
      return res.status(400).json({
        message : "Email already exists",
      });
    }

    const hashedpw = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users(name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedpw]
    );

    return res.status(201).json({
      message: "Account created successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.post("/api/login", async (req, res) => {
  const {email, password} = req.body;

  if(!email || !password){
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  // find user
  const user = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  // check if user exist
  if(user.rows.length === 0){
    return res.status(400).json({
        message:"Invalid Email or Password",
    });
  }

  // comapre the pws
  const isMatch = await bcrypt.compare(
    password,
    user.rows[0].password
  );

  if(!isMatch){
    return res.status(400).json({
        message: "Invalid Email or Password",
    });
  }

  const token = jwt.sign(
    {
      id: user.rows[0].id,
      email: user.rows[0].email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  return res.status(200).json({
    message: "Login successful",
    token, // token: token
    user: {
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
    },
  });

});

app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if(!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    } 

    // Check if user exists
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Expiry = 1 hour
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    // Save token in database
    await pool.query(
      `UPDATE users
       SET reset_token = $1,
           reset_token_expiry = $2
       WHERE email = $3`,
      [resetToken, expiry, email]
    );

    const resetLink = `http://localhost:5174/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "SplitSense Password Reset",
      html: `
        <h2>Reset Your Password</h2>
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>

        <a href="${resetLink}">
          Reset Password
        </a>

        <p>This link will expire in 1 hour.</p>
      `,
    });

    return res.status(200).json({
      message: "Password reset email sent successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.post("/api/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    // Find user with this token
    const user = await pool.query(
      `SELECT * FROM users
       WHERE reset_token = $1
       AND reset_token_expiry > NOW()`,
      [token]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or Expired Token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear token
    await pool.query(
      `UPDATE users
       SET password = $1,
           reset_token = NULL,
           reset_token_expiry = NULL
       WHERE id = $2`,
      [hashedPassword, user.rows[0].id]
    );

    return res.status(200).json({
      message: "Password Reset Successful",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});