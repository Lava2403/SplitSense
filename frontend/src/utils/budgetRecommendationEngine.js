import {
  EXPENSE_CATEGORIES,
  isEssentialCategory,
  isFlexibleCategory,
} from "./expenseCategories";

/**
 * Rounds a monetary amount to a clean value.
 */
function roundAmount(amount) {
  return Math.round(Number(amount || 0));
}

/**
 * Makes sure percentages add up correctly.
 */
function calculatePercentage(amount, total) {
  if (!total || total <= 0) {
    return 0;
  }

  return (amount / total) * 100;
}

/**
 * Returns a minimum reasonable allocation for categories
 * that the user has selected but has no historical spending for.
 */
function getDefaultCategoryWeight(category) {
  const defaultWeights = {
    [EXPENSE_CATEGORIES.BILLS]: 0.25,
    [EXPENSE_CATEGORIES.GROCERIES]: 0.2,
    [EXPENSE_CATEGORIES.FOOD]: 0.15,
    [EXPENSE_CATEGORIES.TRANSPORT]: 0.1,
    [EXPENSE_CATEGORIES.ENTERTAINMENT]: 0.08,
    [EXPENSE_CATEGORIES.SHOPPING]: 0.08,
    [EXPENSE_CATEGORIES.EDUCATION]: 0.12,
    [EXPENSE_CATEGORIES.HEALTHCARE]: 0.1,
    [EXPENSE_CATEGORIES.TRAVEL]: 0.1,
    [EXPENSE_CATEGORIES.PERSONAL]: 0.07,
    [EXPENSE_CATEGORIES.OTHER]: 0.05,
  };

  return defaultWeights[category] || 0.05;
}

/**
 * Calculates how important a category is based on
 * the user's historical spending.
 */
function calculateHistoricalWeight(
  category,
  categoryData,
  totalHistoricalSpending
) {
  const historicalAmount =
    Number(categoryData?.total || 0);

  if (historicalAmount <= 0 || totalHistoricalSpending <= 0) {
    return getDefaultCategoryWeight(category);
  }

  return historicalAmount / totalHistoricalSpending;
}

/**
 * Adjusts category weight according to spending trend.
 *
 * Increasing spending -> slightly higher recommendation
 * Decreasing spending -> slightly lower recommendation
 */
function applyTrendAdjustment(weight, trendData) {
  if (!trendData) {
    return weight;
  }

  if (trendData.trend === "increasing") {
    return weight * 1.1;
  }

  if (trendData.trend === "decreasing") {
    return weight * 0.9;
  }

  return weight;
}

/**
 * Determines how much money should ideally be reserved
 * for a category based on historical behaviour.
 */
function getExpectedCategoryAmount(
  category,
  categoryData,
  fixedCategories
) {
  const historicalAmount =
    Number(categoryData?.total || 0);

  const fixedCategory = fixedCategories.find(
    (item) => item.category === category
  );

  if (fixedCategory) {
    return Math.max(
      historicalAmount,
      Number(fixedCategory.expectedAmount || 0)
    );
  }

  return historicalAmount;
}

/**
 * Generates a human-readable reason for the recommendation.
 */
function generateRecommendationReason({
  category,
  historicalAmount,
  recommendedAmount,
  trend,
  essential,
  fixed,
}) {
  if (fixed) {
    return `This category appears predictable based on your previous spending, so ₹${roundAmount(
      recommendedAmount
    )} is reserved for it first.`;
  }

  if (trend === "increasing") {
    return `Your spending in ${category.toLowerCase()} has recently increased, so the recommendation accounts for that trend.`;
  }

  if (trend === "decreasing") {
    return `Your spending in ${category.toLowerCase()} has been decreasing, so the allocation is slightly reduced compared with previous spending.`;
  }

  if (essential) {
    return `This is considered an essential category, so it receives priority in your budget.`;
  }

  if (historicalAmount > 0) {
    return `This recommendation is based on your previous spending pattern in this category.`;
  }

  return `You selected this category, but there is limited spending history, so a reasonable starting allocation has been suggested.`;
}

/**
 * Main budget recommendation function.
 *
 * Input:
 * - monthlyBudget: Total amount the user wants to spend
 * - selectedCategories: Categories the user wants in the plan
 * - spendingAnalysis: Result from analyzeSpending()
 *
 * Output:
 * - Smart category allocations
 * - Budget health
 * - Remaining/unallocated money
 * - Warnings and recommendations
 */
export function generateBudgetRecommendation({
  monthlyBudget,
  selectedCategories = [],
  spendingAnalysis,
}) {
  const budget = Number(monthlyBudget || 0);

  if (!budget || budget <= 0) {
    return {
      success: false,
      message: "Please enter a valid monthly budget.",
      allocations: [],
      summary: null,
      warnings: [],
    };
  }

  if (!selectedCategories.length) {
    return {
      success: false,
      message: "Please select at least one spending category.",
      allocations: [],
      summary: null,
      warnings: [],
    };
  }

  const categories =
    spendingAnalysis?.categories || {};

  const trends =
    spendingAnalysis?.trends || {};

  const fixedCategories =
    spendingAnalysis?.fixedCategories || [];

  const totalHistoricalSpending =
    Number(
      spendingAnalysis?.totalPersonalSpending || 0
    );

  const warnings = [];

  /**
   * ---------------------------------------------------
   * STEP 1
   * Reserve money for fixed and essential spending.
   * ---------------------------------------------------
   */

  let reservedAmount = 0;

  const preliminaryAllocations =
    selectedCategories.map((category) => {
      const categoryData = categories[category];

      const fixedCategory =
        fixedCategories.find(
          (item) => item.category === category
        );

      const historicalAmount =
        Number(categoryData?.total || 0);

      const expectedAmount =
        getExpectedCategoryAmount(
          category,
          categoryData,
          fixedCategories
        );

      const essential =
        isEssentialCategory(category);

      const fixed = Boolean(fixedCategory);

      let reserved = 0;

      /*
       * Fixed categories get their expected amount reserved.
       *
       * Essential categories with historical data also get
       * priority before flexible categories.
       */
      if (fixed) {
        reserved = expectedAmount;
      } else if (essential && historicalAmount > 0) {
        reserved = historicalAmount;
      }

      reservedAmount += reserved;

      return {
        category,
        historicalAmount,
        expectedAmount,
        essential,
        fixed,
        reserved,
      };
    });

  /**
   * ---------------------------------------------------
   * STEP 2
   * Handle the case where essential/fixed expenses
   * are already greater than the user's budget.
   * ---------------------------------------------------
   */

  if (reservedAmount > budget) {
    warnings.push(
      `Your historical essential and fixed spending is around ₹${roundAmount(
        reservedAmount
      )}, which is higher than your planned budget of ₹${roundAmount(
        budget
      )}.`
    );
  }

  /**
   * If required spending exceeds budget,
   * scale allocations proportionally.
   */
  const reservationScale =
    reservedAmount > budget && reservedAmount > 0
      ? budget / reservedAmount
      : 1;

  preliminaryAllocations.forEach((allocation) => {
    allocation.reserved =
      allocation.reserved * reservationScale;
  });

  const actualReservedAmount =
    preliminaryAllocations.reduce(
      (sum, allocation) =>
        sum + allocation.reserved,
      0
    );

  let remainingBudget =
    Math.max(
      0,
      budget - actualReservedAmount
    );

  /**
   * ---------------------------------------------------
   * STEP 3
   * Calculate weights for distributing the remaining
   * budget among all selected categories.
   * ---------------------------------------------------
   */

  const weightedCategories =
    preliminaryAllocations.map(
      (allocation) => {
        const category =
          allocation.category;

        const categoryData =
          categories[category];

        let weight =
          calculateHistoricalWeight(
            category,
            categoryData,
            totalHistoricalSpending
          );

        weight =
          applyTrendAdjustment(
            weight,
            trends[category]
          );

        /*
         * Essential categories get a small priority boost.
         */
        if (allocation.essential) {
          weight *= 1.1;
        }

        /*
         * Flexible categories receive a slightly lower
         * priority when distributing remaining money.
         */
        if (isFlexibleCategory(category)) {
          weight *= 0.9;
        }

        return {
          ...allocation,
          weight,
        };
      }
    );

  const totalWeight =
    weightedCategories.reduce(
      (sum, allocation) =>
        sum + allocation.weight,
      0
    );

  /**
   * ---------------------------------------------------
   * STEP 4
   * Distribute the remaining budget intelligently.
   * ---------------------------------------------------
   */

  const allocations =
    weightedCategories.map(
      (allocation) => {
        let additionalAmount = 0;

        if (
          remainingBudget > 0 &&
          totalWeight > 0
        ) {
          additionalAmount =
            remainingBudget *
            (allocation.weight / totalWeight);
        }

        /*
         * Categories that already had money reserved
         * get that amount plus their share of the
         * remaining budget.
         */
        const recommendedAmount =
          allocation.reserved +
          additionalAmount;

        const percentage =
          calculatePercentage(
            recommendedAmount,
            budget
          );

        const trend =
          trends[allocation.category]?.trend ||
          "stable";

        const reason =
          generateRecommendationReason({
            category: allocation.category,
            historicalAmount:
              allocation.historicalAmount,
            recommendedAmount,
            trend,
            essential:
              allocation.essential,
            fixed:
              allocation.fixed,
          });

        return {
          category:
            allocation.category,

          historicalAmount:
            roundAmount(
              allocation.historicalAmount
            ),

          recommendedAmount:
            roundAmount(
              recommendedAmount
            ),

          percentage:
            Number(
              percentage.toFixed(1)
            ),

          essential:
            allocation.essential,

          fixed:
            allocation.fixed,

          trend,

          reason,
        };
      }
    );

  /**
   * ---------------------------------------------------
   * STEP 5
   * Fix rounding differences.
   * ---------------------------------------------------
   */

  const allocatedTotal =
    allocations.reduce(
      (sum, allocation) =>
        sum + allocation.recommendedAmount,
      0
    );

  const roundingDifference =
    roundAmount(budget) -
    allocatedTotal;

  if (
    allocations.length > 0 &&
    roundingDifference !== 0
  ) {
    /*
     * Add/subtract rounding difference from the
     * largest recommended category.
     */
    const largestAllocation =
      allocations.reduce(
        (largest, current) =>
          current.recommendedAmount >
          largest.recommendedAmount
            ? current
            : largest
      );

    largestAllocation.recommendedAmount +=
      roundingDifference;

    largestAllocation.percentage =
      Number(
        calculatePercentage(
          largestAllocation.recommendedAmount,
          budget
        ).toFixed(1)
      );
  }

  /**
   * ---------------------------------------------------
   * STEP 6
   * Generate budget health information.
   * ---------------------------------------------------
   */

  const essentialRecommended =
    allocations
      .filter(
        (allocation) =>
          allocation.essential
      )
      .reduce(
        (sum, allocation) =>
          sum +
          allocation.recommendedAmount,
        0
      );

  const flexibleRecommended =
    allocations
      .filter(
        (allocation) =>
          !allocation.essential
      )
      .reduce(
        (sum, allocation) =>
          sum +
          allocation.recommendedAmount,
        0
      );

  let budgetStatus = "healthy";

  if (
    totalHistoricalSpending > budget
  ) {
    budgetStatus = "tight";

    warnings.push(
      `Your recent spending was approximately ₹${roundAmount(
        totalHistoricalSpending
      )}, which is higher than this budget. Some flexible categories may need to be reduced.`
    );
  }

  if (
    essentialRecommended > budget * 0.8
  ) {
    warnings.push(
      "A large portion of your budget is going toward essential expenses, leaving limited room for flexible spending."
    );
  }

  /**
   * Sort highest allocation first.
   */
  allocations.sort(
    (a, b) =>
      b.recommendedAmount -
      a.recommendedAmount
  );

  return {
    success: true,

    allocations,

    summary: {
      monthlyBudget:
        roundAmount(budget),

      historicalSpending:
        roundAmount(
          totalHistoricalSpending
        ),

      allocatedAmount:
        allocations.reduce(
          (sum, allocation) =>
            sum +
            allocation.recommendedAmount,
          0
        ),

      essentialAllocation:
        roundAmount(
          essentialRecommended
        ),

      flexibleAllocation:
        roundAmount(
          flexibleRecommended
        ),

      budgetStatus,

      analysisDays:
        spendingAnalysis?.analysisPeriod
          ?.days || 30,
    },

    warnings,
  };
}