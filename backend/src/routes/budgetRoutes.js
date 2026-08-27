const express = require("express");

const auth = require("../../middleware/auth");

const {
  getBudgetSummary,
} = require("../controllers/budgetController");

const router = express.Router();

router.use(auth);

router.get("/summary", getBudgetSummary);

module.exports = router;