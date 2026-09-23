const {
  generateMonthlyInsights,
} = require("../services/aiInsightService");

// ==========================
// GET MONTHLY AI INSIGHTS
// ==========================

const getMonthlyInsights = async (req, res) => {
  try {
    const month = req.query.month || undefined;

    const result = await generateMonthlyInsights(
      req.user.id,
      month
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("AI insights error:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Unable to generate AI insights.",
    });
  }
};

module.exports = {
  getMonthlyInsights,
};