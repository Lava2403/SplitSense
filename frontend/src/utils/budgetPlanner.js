const CATEGORY_KEYWORDS = {
  Food: [
    "food",
    "restaurant",
    "dinner",
    "lunch",
    "breakfast",
    "cafe",
    "coffee",
    "pizza",
    "burger",
    "meal",
    "snack",
    "swiggy",
    "zomato",
    "dine out",
    "dining",
  ],

  Travel: [
    "travel",
    "trip",
    "cab",
    "uber",
    "ola",
    "fuel",
    "petrol",
    "diesel",
    "train",
    "flight",
    "bus",
    "metro",
    "transport",
    "taxi",
    "auto",
  ],

  Shopping: [
    "shopping",
    "clothes",
    "clothing",
    "amazon",
    "flipkart",
    "dress",
    "shoes",
    "purchase",
    "myntra",
    "ajio",
  ],

  Entertainment: [
    "movie",
    "netflix",
    "concert",
    "party",
    "game",
    "gaming",
    "subscription",
    "spotify",
    "cinema",
    "club",
    "bowling",
  ],

  Groceries: [
    "grocery",
    "groceries",
    "supermarket",
    "vegetables",
    "vegetable",
    "milk",
    "ration",
    "mart",
    "blinkit",
    "zepto",
    "bigbasket",
    "fruit",
    "fruits",
  ],

  Bills: [
    "electricity",
    "wifi",
    "internet",
    "bill",
    "recharge",
    "mobile",
    "rent",
    "water",
    "gas",
    "maintenance",
    "utility",
    "broadband",
  ],

  Health: [
    "medicine",
    "doctor",
    "hospital",
    "medical",
    "gym",
    "health",
    "clinic",
    "pharmacy",
    "dentist",
  ],
};

export const DEFAULT_CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Entertainment",
  "Groceries",
  "Bills",
  "Health",
  "Other",
];

const ESSENTIAL_CATEGORIES = [
  "Bills",
  "Groceries",
  "Food",
  "Health",
];

const FLEXIBLE_CATEGORIES = [
  "Travel",
  "Shopping",
  "Entertainment",
  "Other",
];


/* ---------------------------------------------
   CATEGORY DETECTION
---------------------------------------------- */

export function getExpenseCategory(title = "") {
  const normalizedTitle = String(title)
    .toLowerCase()
    .trim();

  if (!normalizedTitle) {
    return "Other";
  }

  for (const [category, keywords] of Object.entries(
    CATEGORY_KEYWORDS
  )) {
    if (
      keywords.some((keyword) =>
        normalizedTitle.includes(keyword)
      )
    ) {
      return category;
    }
  }

  return "Other";
}


/* ---------------------------------------------
   PERSONAL SHARE
---------------------------------------------- */

export function getPersonalExpenseShare(
  expense,
  userName
) {
  const amount = Number(expense.amount || 0);

  if (amount <= 0) {
    return 0;
  }

  /*
    If participants are available, calculate
    the user's equal share.
  */

  if (
    Array.isArray(expense.participants) &&
    expense.participants.length > 0 &&
    userName
  ) {
    const normalizedUser = String(userName)
      .trim()
      .toLowerCase();

    const isParticipant =
      expense.participants.some(
        (person) =>
          String(person)
            .trim()
            .toLowerCase() === normalizedUser
      );

    if (!isParticipant) {
      return 0;
    }

    return amount / expense.participants.length;
  }

  /*
    If participant information is unavailable,
    use the expense amount.
  */

  return amount;
}


/* ---------------------------------------------
   DATE HELPERS
---------------------------------------------- */

function getExpenseDate(expense) {
  const value =
    expense.date ||
    expense.expense_date ||
    expense.created_at;

  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}


function getMonthKey(date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}


function getMonthLabel(date) {
  return date.toLocaleString("default", {
    month: "short",
    year: "numeric",
  });
}


/* ---------------------------------------------
   GET LAST N MONTHS
---------------------------------------------- */

export function getRecentExpenses(
  expenses = [],
  months = 6
) {
  const cutoff = new Date();

  cutoff.setMonth(
    cutoff.getMonth() - months
  );

  return expenses.filter((expense) => {
    const date = getExpenseDate(expense);

    if (!date) {
      return false;
    }

    return date >= cutoff;
  });
}


/* ---------------------------------------------
   MONTHLY CATEGORY ANALYSIS
---------------------------------------------- */

export function analyzeSpending(
  expenses = [],
  userName,
  months = 6
) {
  const recentExpenses =
    getRecentExpenses(expenses, months);

  const monthlyData = {};

  const categoryTotals = {};

  DEFAULT_CATEGORIES.forEach((category) => {
    categoryTotals[category] = 0;
  });

  recentExpenses.forEach((expense) => {
    const date = getExpenseDate(expense);

    if (!date) {
      return;
    }

    const personalShare =
      getPersonalExpenseShare(
        expense,
        userName
      );

    if (personalShare <= 0) {
      return;
    }

    const category =
      getExpenseCategory(
        expense.title ||
        expense.description ||
        ""
      );

    const monthKey =
      getMonthKey(date);

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        label: getMonthLabel(date),
        categories: {},
      };

      DEFAULT_CATEGORIES.forEach(
        (categoryName) => {
          monthlyData[
            monthKey
          ].categories[categoryName] = 0;
        }
      );
    }

    monthlyData[
      monthKey
    ].categories[category] += personalShare;

    categoryTotals[category] +=
      personalShare;
  });

  const sortedMonths =
    Object.entries(monthlyData)
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .map(([key, value]) => ({
        key,
        ...value,
      }));

  const monthsWithData =
    Math.max(
      1,
      sortedMonths.length
    );

  const categoryAnalysis = {};

  DEFAULT_CATEGORIES.forEach((category) => {
    const monthlyValues =
      sortedMonths.map(
        (month) =>
          Number(
            month.categories[
              category
            ] || 0
          )
      );

    const activeMonths =
      monthlyValues.filter(
        (value) => value > 0
      );

    const total =
      monthlyValues.reduce(
        (sum, value) =>
          sum + value,
        0
      );

    const average =
      total / monthsWithData;

    const activeMonthAverage =
      activeMonths.length > 0
        ? activeMonths.reduce(
            (sum, value) =>
              sum + value,
            0
          ) / activeMonths.length
        : 0;

    /*
      Calculate consistency.

      Lower variation means spending is
      more predictable.
    */

    let standardDeviation = 0;

    if (activeMonths.length > 1) {
      const variance =
        activeMonths.reduce(
          (sum, value) =>
            sum +
            Math.pow(
              value -
                activeMonthAverage,
              2
            ),
          0
        ) /
        activeMonths.length;

      standardDeviation =
        Math.sqrt(variance);
    }

    const variation =
      activeMonthAverage > 0
        ? standardDeviation /
          activeMonthAverage
        : 1;

    /*
      Compare recent months against older
      spending to detect direction.
    */

    const recentValues =
      monthlyValues.slice(-2);

    const olderValues =
      monthlyValues.slice(
        0,
        Math.max(
          0,
          monthlyValues.length - 2
        )
      );

    const recentAverage =
      recentValues.length > 0
        ? recentValues.reduce(
            (sum, value) =>
              sum + value,
            0
          ) / recentValues.length
        : average;

    const olderAverage =
      olderValues.length > 0
        ? olderValues.reduce(
            (sum, value) =>
              sum + value,
            0
          ) / olderValues.length
        : average;

    let trend = "stable";

    if (
      olderAverage > 0 &&
      recentAverage >
        olderAverage * 1.15
    ) {
      trend = "increasing";
    } else if (
      olderAverage > 0 &&
      recentAverage <
        olderAverage * 0.85
    ) {
      trend = "decreasing";
    }

    /*
      Fixed-cost detection.

      A category is likely fixed when:

      1. It occurs consistently.
      2. The amount does not vary much.

      Bills are given slightly more confidence.
    */

    const consistency =
      activeMonths.length /
      monthsWithData;

    const likelyFixed =
      activeMonths.length >= 2 &&
      consistency >= 0.6 &&
      variation <= 0.25;

    categoryAnalysis[category] = {
      category,

      total,

      average,

      activeMonthAverage,

      recentAverage,

      olderAverage,

      monthlyValues,

      activeMonths:
        activeMonths.length,

      consistency,

      variation,

      likelyFixed,

      trend,
    };
  });

  const totalSpent =
    Object.values(
      categoryTotals
    ).reduce(
      (sum, value) =>
        sum + value,
      0
    );

  const averageMonthlySpending =
    totalSpent /
    monthsWithData;

  return {
    totalSpent,

    averageMonthlySpending,

    expenseCount:
      recentExpenses.length,

    monthsAnalyzed:
      sortedMonths.length,

    categoryTotals,

    categoryAnalysis,

    monthlyData:
      sortedMonths,
  };
}


/* ---------------------------------------------
   CATEGORY IMPORTANCE
---------------------------------------------- */

function getPriority(category) {
  const priorities = {
    Bills: 1.5,
    Groceries: 1.35,
    Food: 1.25,
    Health: 1.2,
    Travel: 1,
    Shopping: 0.75,
    Entertainment: 0.65,
    Other: 0.7,
  };

  return priorities[category] || 0.7;
}


/* ---------------------------------------------
   SMART RECOMMENDED AMOUNT
---------------------------------------------- */

function calculateRecommendedAmount(
  data,
  category
) {
  if (
    !data ||
    data.average <= 0
  ) {
    return 0;
  }

  let recommendation =
    data.average;

  /*
    Use recent behavior more strongly
    than old behavior.
  */

  if (
    data.recentAverage > 0
  ) {
    recommendation =
      data.average * 0.4 +
      data.recentAverage * 0.6;
  }

  /*
    Add a controlled buffer depending
    on how predictable the category is.
  */

  if (
    ESSENTIAL_CATEGORIES.includes(
      category
    )
  ) {
    recommendation *= 1.08;
  } else if (
    data.trend === "increasing"
  ) {
    recommendation *= 1.05;
  } else {
    recommendation *= 1.02;
  }

  return recommendation;
}


/* ---------------------------------------------
   SMART BUDGET GENERATOR
---------------------------------------------- */

export function generateBudgetPlan({
  monthlyBudget,
  expenses = [],
  userName,
  selectedCategories = [],
}) {
  const budget =
    Number(monthlyBudget);

  if (!budget || budget <= 0) {
    return null;
  }

  const analysis =
    analyzeSpending(
      expenses,
      userName,
      6
    );

  const activeCategories =
    selectedCategories.length > 0
      ? selectedCategories
      : DEFAULT_CATEGORIES;

  /*
    Reserve a safety buffer.

    Tight budgets get a smaller buffer
    so that essentials are still funded.
  */

  let bufferRate = 0.1;

  if (
    analysis.averageMonthlySpending >
    budget
  ) {
    bufferRate = 0.05;
  }

  const safetyBuffer =
    budget * bufferRate;

  const planningBudget =
    budget - safetyBuffer;

  const categoryData =
    activeCategories.map(
      (category) => {
        const data =
          analysis.categoryAnalysis[
            category
          ];

        const historicalAverage =
          data?.average || 0;

        const recommended =
          calculateRecommendedAmount(
            data,
            category
          );

        const essential =
          ESSENTIAL_CATEGORIES.includes(
            category
          );

        const flexible =
          FLEXIBLE_CATEGORIES.includes(
            category
          );

        /*
          Bills with repeated, stable
          monthly amounts are treated
          as fixed costs.
        */

        const costType =
          data?.likelyFixed
            ? "Fixed"
            : "Variable";

        return {
          category,

          historicalAverage,

          recommended,

          suggested: 0,

          essential,

          flexible,

          costType,

          trend:
            data?.trend ||
            "stable",

          consistency:
            data?.consistency ||
            0,
        };
      }
    );


  /* -----------------------------------------
     STEP 1:
     Allocate fixed + essential spending first
  ------------------------------------------ */

  const priorityCategories =
    categoryData.filter(
      (item) =>
        item.costType === "Fixed" ||
        item.essential
    );

  const flexibleCategories =
    categoryData.filter(
      (item) =>
        !priorityCategories.includes(
          item
        )
    );

  const priorityDemand =
    priorityCategories.reduce(
      (sum, item) =>
        sum + item.recommended,
      0
    );

  /*
    If the planning budget can support
    priority spending, allocate it fully.
  */

  if (
    priorityDemand <=
    planningBudget
  ) {
    priorityCategories.forEach(
      (item) => {
        item.suggested =
          item.recommended;
      }
    );
  } else {
    /*
      Tight budget:
      distribute money based on
      category importance.
    */

    const weightedDemand =
      priorityCategories.reduce(
        (sum, item) =>
          sum +
          item.recommended *
            getPriority(
              item.category
            ),
        0
      );

    priorityCategories.forEach(
      (item) => {
        const weightedNeed =
          item.recommended *
          getPriority(
            item.category
          );

        item.suggested =
          planningBudget *
          (weightedNeed /
            weightedDemand);
      }
    );
  }


  let allocated =
    categoryData.reduce(
      (sum, item) =>
        sum + item.suggested,
      0
    );

  let remaining =
    Math.max(
      0,
      planningBudget - allocated
    );


  /* -----------------------------------------
     STEP 2:
     Allocate variable categories
  ------------------------------------------ */

  if (
    remaining > 0 &&
    flexibleCategories.length > 0
  ) {
    const flexibleDemand =
      flexibleCategories.reduce(
        (sum, item) =>
          sum + item.recommended,
        0
      );

    if (
      flexibleDemand > 0
    ) {
      /*
        If enough money exists,
        fund recommendations.
      */

      if (
        remaining >=
        flexibleDemand
      ) {
        flexibleCategories.forEach(
          (item) => {
            item.suggested =
              item.recommended;
          }
        );
      } else {
        /*
          Tight budget:
          distribute proportionally,
          while considering priority.
        */

        const weightedFlexibleDemand =
          flexibleCategories.reduce(
            (sum, item) =>
              sum +
              item.recommended *
                getPriority(
                  item.category
                ),
            0
          );

        flexibleCategories.forEach(
          (item) => {
            const weightedNeed =
              item.recommended *
              getPriority(
                item.category
              );

            item.suggested =
              remaining *
              (weightedNeed /
                weightedFlexibleDemand);
          }
        );
      }
    }
  }


  /* -----------------------------------------
     STEP 3:
     Round values
  ------------------------------------------ */

  categoryData.forEach(
    (item) => {
      item.suggested =
        Math.max(
          0,
          Math.round(
            item.suggested / 10
          ) * 10
        );

      item.recommended =
        Math.round(
          item.recommended
        );

      item.historicalAverage =
        Math.round(
          item.historicalAverage
        );
    }
  );


  const allocatedTotal =
    categoryData.reduce(
      (sum, item) =>
        sum + item.suggested,
      0
    );

  const actualRemaining =
    Math.max(
      0,
      budget - allocatedTotal
    );


  /* -----------------------------------------
     GENERATE INSIGHTS
  ------------------------------------------ */

  const insights = [];

  const increasingCategories =
    categoryData.filter(
      (item) =>
        item.trend === "increasing"
    );

  increasingCategories.forEach(
    (item) => {
      insights.push(
        `${item.category} spending has been increasing recently, so the recommendation accounts for that trend.`
      );
    }
  );

  const fixedCategories =
    categoryData.filter(
      (item) =>
        item.costType === "Fixed"
    );

  if (
    fixedCategories.length > 0
  ) {
    insights.push(
      `${fixedCategories
        .map(
          (item) =>
            item.category
        )
        .join(
          ", "
        )} appear to be recurring and predictable expenses, so they were prioritized.`
    );
  }

  if (
    actualRemaining > 0
  ) {
    insights.push(
      `₹${Math.round(
        actualRemaining
      ).toLocaleString()} remains unallocated as a safety buffer for unexpected expenses or savings.`
    );
  }

  if (
    analysis.averageMonthlySpending >
    budget
  ) {
    insights.push(
      `Your recent average monthly spending is higher than your target budget, so flexible categories were reduced first.`
    );
  }


  return {
    monthlyBudget: budget,

    planningBudget:
      Math.round(
        planningBudget
      ),

    safetyBuffer:
      Math.round(
        safetyBuffer
      ),

    allocatedTotal,

    remaining:
      Math.round(
        actualRemaining
      ),

    totalPastSpending:
      Math.round(
        analysis.totalSpent
      ),

    averageMonthlySpending:
      Math.round(
        analysis.averageMonthlySpending
      ),

    categories:
      categoryData,

    insights,

    analysis,
  };
}