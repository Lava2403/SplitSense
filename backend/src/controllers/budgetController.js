const budgetService = require("../services/budgetService");

const getBudgetSummary = async (req, res) => {
  try {
    const { monthlyBudget } = req.query;

    const summary =
      await budgetService.getBudgetSummary(
        req.user.id,
        monthlyBudget
      );

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getBudgetSummary,
};