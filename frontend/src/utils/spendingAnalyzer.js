// src/utils/spendingAnalyzer.js

import {
  categorizeExpense,
  isEssentialCategory,
  EXPENSE_CATEGORIES,
} from "./expenseCategories";

/**
 * Converts a date into a valid JavaScript Date object.
 */
function parseExpenseDate(date) {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

/**
 * Gets the personal share of an expense for the current user.
 *
 * Example:
 * Total expense = ₹2000
 * Participants = 4
 *
 * User's spending = ₹500
 */
export function getPersonalExpenseAmount(expense, userName) {
  const amount = Number(expense.amount || 0);
  const participants = expense.participants || [];

  if (!participants.length || !userName) {
    return 0;
  }

  const isParticipant = participants.some(
    (participant) =>
      String(participant).trim().toLowerCase() ===
      String(userName).trim().toLowerCase()
  );

  if (!isParticipant) {
    return 0;
  }

  return amount / participants.length;
}

/**
 * Filters expenses that occurred within the given number of days.
 */
export function getExpensesWithinDays(expenses = [], days = 30) {
  const now = new Date();

  const startDate = new Date();
  startDate.setDate(now.getDate() - days);

  return expenses.filter((expense) => {
    const expenseDate = parseExpenseDate(expense.date);

    if (!expenseDate) {
      return false;
    }

    return expenseDate >= startDate && expenseDate <= now;
  });
}

/**
 * Creates category-wise spending data for a user.
 */
export function analyzeCategorySpending(expenses = [], userName) {
  const categoryData = {};

  expenses.forEach((expense) => {
    const category = categorizeExpense(expense.title);

    const personalAmount = getPersonalExpenseAmount(
      expense,
      userName
    );

    if (personalAmount <= 0) {
      return;
    }

    if (!categoryData[category]) {
      categoryData[category] = {
        category,
        total: 0,
        count: 0,
        expenses: [],
      };
    }

    categoryData[category].total += personalAmount;
    categoryData[category].count += 1;

    categoryData[category].expenses.push({
      id: expense.id,
      title: expense.title,
      amount: personalAmount,
      date: expense.date,
      originalAmount: Number(expense.amount || 0),
    });
  });

  return categoryData;
}

/**
 * Calculates statistics for each category.
 */
export function calculateCategoryStatistics(categoryData = {}) {
  const statistics = {};

  Object.entries(categoryData).forEach(
    ([category, data]) => {
      const amounts = data.expenses.map(
        (expense) => expense.amount
      );

      const total = data.total;

      const averagePerExpense =
        amounts.length > 0 ? total / amounts.length : 0;

      const minimum =
        amounts.length > 0 ? Math.min(...amounts) : 0;

      const maximum =
        amounts.length > 0 ? Math.max(...amounts) : 0;

      const variance =
        amounts.length > 0
          ? amounts.reduce(
              (sum, amount) =>
                sum +
                Math.pow(
                  amount - averagePerExpense,
                  2
                ),
              0
            ) / amounts.length
          : 0;

      const standardDeviation = Math.sqrt(variance);

      const variationRatio =
        averagePerExpense > 0
          ? standardDeviation / averagePerExpense
          : 0;

      let variation = "low";

      if (variationRatio > 0.6) {
        variation = "high";
      } else if (variationRatio > 0.3) {
        variation = "medium";
      }

      statistics[category] = {
        ...data,

        averagePerExpense,

        minimum,

        maximum,

        standardDeviation,

        variation,

        essential: isEssentialCategory(category),
      };
    }
  );

  return statistics;
}

/**
 * Calculates category spending for a specific date range.
 */
function getCategoryTotalForRange(
  expenses,
  userName,
  startDate,
  endDate
) {
  const totals = {};

  expenses.forEach((expense) => {
    const expenseDate = parseExpenseDate(expense.date);

    if (
      !expenseDate ||
      expenseDate < startDate ||
      expenseDate >= endDate
    ) {
      return;
    }

    const personalAmount = getPersonalExpenseAmount(
      expense,
      userName
    );

    if (personalAmount <= 0) {
      return;
    }

    const category = categorizeExpense(expense.title);

    totals[category] =
      (totals[category] || 0) + personalAmount;
  });

  return totals;
}

/**
 * Compares the most recent period with the previous period.
 *
 * Example:
 * Last 30 days vs the 30 days before that.
 */
export function calculateSpendingTrends(
  expenses = [],
  userName,
  days = 30
) {
  const now = new Date();

  const currentStart = new Date();
  currentStart.setDate(now.getDate() - days);

  const previousStart = new Date();
  previousStart.setDate(now.getDate() - days * 2);

  const currentTotals = getCategoryTotalForRange(
    expenses,
    userName,
    currentStart,
    now
  );

  const previousTotals = getCategoryTotalForRange(
    expenses,
    userName,
    previousStart,
    currentStart
  );

  const allCategories = new Set([
    ...Object.keys(currentTotals),
    ...Object.keys(previousTotals),
  ]);

  const trends = {};

  allCategories.forEach((category) => {
    const current = currentTotals[category] || 0;
    const previous = previousTotals[category] || 0;

    let percentageChange = 0;

    if (previous > 0) {
      percentageChange =
        ((current - previous) / previous) * 100;
    }

    let trend = "stable";

    if (percentageChange > 15) {
      trend = "increasing";
    } else if (percentageChange < -15) {
      trend = "decreasing";
    }

    trends[category] = {
      current,
      previous,
      percentageChange,
      trend,
    };
  });

  return trends;
}

/**
 * Detects categories that appear predictable/fixed.
 *
 * This is a preliminary detection method.
 * We will improve recurring expense detection later.
 */
export function detectFixedCategories(
  categoryStatistics = {}
) {
  const fixedCategories = [];

  Object.values(categoryStatistics).forEach((data) => {
    const category = data.category;

    const isBillCategory =
      category === EXPENSE_CATEGORIES.BILLS;

    const predictable =
      data.variation === "low" &&
      data.count >= 2;

    if (isBillCategory || predictable) {
      fixedCategories.push({
        category,
        expectedAmount: data.total,
        confidence: isBillCategory ? 0.8 : 0.6,
      });
    }
  });

  return fixedCategories;
}

/**
 * Main function.
 *
 * This is the function the Budget Planner will eventually call.
 */
export function analyzeSpending({
  expenses = [],
  userName,
  analysisDays = 30,
}) {
  const recentExpenses = getExpensesWithinDays(
    expenses,
    analysisDays
  );

  const categoryData = analyzeCategorySpending(
    recentExpenses,
    userName
  );

  const categoryStatistics =
    calculateCategoryStatistics(categoryData);

  const trends = calculateSpendingTrends(
    expenses,
    userName,
    analysisDays
  );

  const fixedCategories = detectFixedCategories(
    categoryStatistics
  );

  const totalPersonalSpending =
    Object.values(categoryStatistics).reduce(
      (sum, category) => sum + category.total,
      0
    );

  const essentialSpending =
    Object.values(categoryStatistics)
      .filter((category) => category.essential)
      .reduce(
        (sum, category) => sum + category.total,
        0
      );

  return {
    analysisPeriod: {
      days: analysisDays,
      expenseCount: recentExpenses.length,
    },

    totalPersonalSpending,

    essentialSpending,

    flexibleSpending:
      totalPersonalSpending - essentialSpending,

    categories: categoryStatistics,

    trends,

    fixedCategories,
  };
}