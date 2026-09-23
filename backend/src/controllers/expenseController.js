const expenseService = require("../services/expenseService");

// ==========================
// GET ALL
// ==========================

const getExpenses = async (req, res) => {
  try {
    const expenses =
      await expenseService.getAllExpenses(
        req.user.id
      );

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// GET SINGLE
// ==========================

const getExpenseById = async (
  req,
  res
) => {
  try {
    const expense =
      await expenseService.getExpenseById(
        req.params.id,
        req.user.id
      );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// CREATE
// ==========================

const createExpense = async (
  req,
  res
) => {
  try {
    const newExpense =
      await expenseService.addExpense(
        req.body,
        req.user.id
      );

    res.status(201).json({
      success: true,
      message:
        "Expense added successfully.",
      data: newExpense,
    });
  } catch (error) {
    res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// UPDATE
// ==========================

const updateExpense = async (
  req,
  res
) => {
  try {
    const updatedExpense =
      await expenseService.updateExpense(
        req.params.id,
        req.body,
        req.user.id
      );

    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message:
          "Expense not found or access denied.",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Expense updated successfully.",
      data: updatedExpense,
    });
  } catch (error) {
    res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// DELETE
// ==========================

const deleteExpense = async (
  req,
  res
) => {
  try {
    const deletedExpense =
      await expenseService.deleteExpense(
        req.params.id,
        req.user.id
      );

    if (!deletedExpense) {
      return res.status(404).json({
        success: false,
        message:
          "Expense not found or access denied.",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Expense deleted successfully.",
      data: deletedExpense,
    });
  } catch (error) {
    res.status(
      error.statusCode || 500
    ).json({
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