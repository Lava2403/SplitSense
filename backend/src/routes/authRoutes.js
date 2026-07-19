const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getProfile);

module.exports = router;
