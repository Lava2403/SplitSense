const express = require("express");
const auth = require("../../middleware/auth");
const {
  signup,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  dbTest,
} = require("../controllers/authController");

const router = express.Router();

router.get("/db-test", dbTest);
router.get("/test", (_req, res) => {
  res.json({ message: "Hello from Backend 🚀" });
});
router.get("/profile", auth, getProfile);
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
