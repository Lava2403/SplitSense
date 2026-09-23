const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const {
  getMonthlyInsights,
} = require("../controllers/aiInsightController");

const router = express.Router();

// All AI insight routes require authentication
router.use(authenticate);

// GET /api/ai-insights/monthly
router.get("/monthly", getMonthlyInsights);

module.exports = router;