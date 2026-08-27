const pool = require("../../db");

const getBudgetSummary = async (userId, monthlyBudget) => {
  const budget = Number(monthlyBudget);

  if (!budget || budget <= 0) {
    const error = new Error("Please enter a valid monthly budget.");
    error.statusCode = 400;
    throw error;
  }

  /*
    Get the current month's expenses that belong to the
    logged-in user.

    A user is considered connected to an expense if:
    1. They paid for it
    OR
    2. They are included in its expense split
  */

  const result = await pool.query(
    `
    SELECT DISTINCT
      e.id,
      e.amount,
      e.expense_date
    FROM expenses e
    LEFT JOIN expense_splits es
      ON es.expense_id = e.id
    WHERE
      (
        e.paid_by = $1
        OR es.user_id = $1
      )
      AND DATE_TRUNC('month', e.expense_date)
          = DATE_TRUNC('month', CURRENT_DATE)
    `,
    [userId]
  );

  /*
    Calculate how much the user has personally spent.

    If the user paid for an expense, we should not automatically
    count the entire amount if other people owe them money.

    For the first version, we calculate the user's personal share
    from expense_splits.
  */

  const personalExpenseResult = await pool.query(
    `
    SELECT
      COALESCE(SUM(es.amount), 0) AS total_spent
    FROM expense_splits es
    JOIN expenses e
      ON e.id = es.expense_id
    WHERE
      es.user_id = $1
      AND DATE_TRUNC('month', e.expense_date)
          = DATE_TRUNC('month', CURRENT_DATE)
    `,
    [userId]
  );

  const totalSpent = Number(
    personalExpenseResult.rows[0].total_spent
  );

  const remainingBudget = budget - totalSpent;

  const today = new Date();

  const lastDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  );

  const daysRemaining = Math.max(
    1,
    lastDayOfMonth.getDate() - today.getDate() + 1
  );

  const dailyLimit =
    remainingBudget > 0
      ? remainingBudget / daysRemaining
      : 0;

  const percentageUsed =
    (totalSpent / budget) * 100;

  let status = "on-track";
  let message = "You are currently within your budget.";

  if (totalSpent > budget) {
    status = "over-budget";
    message =
      "You have exceeded your monthly budget. Try reducing your spending for the rest of the month.";
  } else if (percentageUsed >= 90) {
    status = "warning";
    message =
      "You are close to reaching your monthly budget. Spend carefully for the remaining days.";
  } else if (percentageUsed >= 75) {
    status = "caution";
    message =
      "You have used a significant portion of your budget. Keep an eye on your spending.";
  }

  return {
    monthlyBudget: budget,
    totalSpent,
    remainingBudget,
    daysRemaining,
    dailyLimit,
    percentageUsed: Number(
      percentageUsed.toFixed(2)
    ),
    status,
    message,
  };
};

module.exports = {
  getBudgetSummary,
};