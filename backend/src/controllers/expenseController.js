const expenseService = require("../services/expenseService");

// ==========================
// GET ALL EXPENSES
// ==========================
const getExpenses = async (req, res) => {
  try {
    const expenses = await expenseService.getAllExpenses();

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// GET SINGLE EXPENSE
// ==========================
const getExpenseById = async (req, res) => {
  try {
    const expense = await expenseService.getExpenseById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// CREATE EXPENSE
// ==========================
const createExpense = async (req, res) => {
  try {
    const newExpense = await expenseService.addExpense(req.body);

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      data: newExpense,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// UPDATE EXPENSE
// ==========================
const updateExpense = async (req, res) => {
  try {
    const updatedExpense = await expenseService.updateExpense(
      req.params.id,
      req.body
    );

    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// DELETE EXPENSE
// ==========================
const deleteExpense = async (req, res) => {
  try {
    const deletedExpense = await expenseService.deleteExpense(req.params.id);

    if (!deletedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
      data: deletedExpense,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};