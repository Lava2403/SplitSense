const settlementService =
  require("../services/settlementService");

// =====================================
// GET PENDING SETTLEMENTS
// =====================================

const getPendingSettlements = async (
  req,
  res
) => {
  try {
    const settlements =
      await settlementService.getPendingSettlements(
        req.user.id
      );

    res.status(200).json({
      success: true,
      count: settlements.length,
      data: settlements,
    });
  } catch (error) {
    console.error(
      "Get settlements error:",
      error
    );

    res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET SETTLEMENT SUMMARY
// =====================================

const getSettlementSummary = async (
  req,
  res
) => {
  try {
    const summary =
      await settlementService.getSettlementSummary(
        req.user.id
      );

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error(
      "Get settlement summary error:",
      error
    );

    res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// CREATE SETTLEMENT
// =====================================

const createSettlement = async (
  req,
  res
) => {
  try {
    const settlement =
      await settlementService.createSettlement(
        req.body,
        req.user.id
      );

    res.status(201).json({
      success: true,
      message:
        "Settlement recorded successfully.",
      data: settlement,
    });
  } catch (error) {
    console.error(
      "Create settlement error:",
      error
    );

    res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET SETTLEMENT HISTORY
// =====================================

const getSettlementHistory = async (
  req,
  res
) => {
  try {
    const history =
      await settlementService.getSettlementHistory(
        req.user.id
      );

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error(
      "Get settlement history error:",
      error
    );

    res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getPendingSettlements,
  getSettlementSummary,
  createSettlement,
  getSettlementHistory,
};