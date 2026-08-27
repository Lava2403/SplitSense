const express = require("express");

const authenticate = require("../../middleware/auth");

const {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  googleConfig,
  googleLogin,
  listUsers,
} = require("../controllers/authController");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/google-config", googleConfig);
router.post("/google", googleLogin);

// Protected routes
router.get("/me", authenticate, getProfile);
router.get("/users", authenticate, listUsers);

module.exports = router;