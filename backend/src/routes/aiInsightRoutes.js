const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const {
  getMonthlyInsights,
} = require("../controllers/aiInsightController");

const router = express.Router();

router.use(authenticate);

router.get("/monthly", getMonthlyInsights);

module.exports = router;