const express = require("express");

const router = express.Router();

const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

// ===============================
// GET ALL EXPENSES
// GET /api/expenses
// ===============================
router.get("/", getExpenses);

// ===============================
// GET SINGLE EXPENSE
// GET /api/expenses/:id
// ===============================
router.get("/:id", getExpenseById);

// ===============================
// CREATE EXPENSE
// POST /api/expenses
// ===============================
router.post("/", createExpense);

// ===============================
// UPDATE EXPENSE
// PUT /api/expenses/:id
// ===============================
router.put("/:id", updateExpense);

// ===============================
// DELETE EXPENSE
// DELETE /api/expenses/:id
// ===============================
router.delete("/:id", deleteExpense);

module.exports = router;