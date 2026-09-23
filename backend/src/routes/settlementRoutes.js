const express = require("express");

const authenticate =
  require("../middleware/authMiddleware");

const {
  getPendingSettlements,
  getSettlementSummary,
  createSettlement,
  getSettlementHistory,
} = require(
  "../controllers/settlementController"
);

const router = express.Router();

// All settlement routes require login
router.use(authenticate);

// Pending settlements
router.get(
  "/pending",
  getPendingSettlements
);

// Summary
router.get(
  "/summary",
  getSettlementSummary
);

// Settlement history
router.get(
  "/history",
  getSettlementHistory
);

// Record a settlement
router.post(
  "/",
  createSettlement
);

module.exports = router;