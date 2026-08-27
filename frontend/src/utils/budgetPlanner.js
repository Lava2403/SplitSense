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


/*
  Categories where the planner should try to
  preserve spending instead of aggressively cutting it.
*/
const PROTECTED_CATEGORIES = [
  "Food",
  "Groceries",
  "Bills",
  "Health",
];


/*
  Categories that can usually be reduced more easily
  if the user's budget is limited.
*/
const FLEXIBLE_CATEGORIES = [
  "Travel",
  "Shopping",
  "Entertainment",
  "Other",
];


/*
  Automatically identify the category of an expense.
*/
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


/*
  Calculate how much of a group expense belongs
  to the current user.
*/
export function getPersonalExpenseShare(
  expense,
  userName
) {
  if (!expense.participants?.length || !userName) {
    return 0;
  }

  const isParticipant = expense.participants.some(
    (person) =>
      String(person).trim().toLowerCase() ===
      String(userName).trim().toLowerCase()
  );

  if (!isParticipant) {
    return 0;
  }

  return (
    Number(expense.amount || 0) /
    expense.participants.length
  );
}


/*
  Get expenses from the previous 30 days.
*/
export function getLastMonthExpenses(
  expenses = []
) {
  const oneMonthAgo = new Date();

  oneMonthAgo.setDate(
    oneMonthAgo.getDate() - 30
  );

  return expenses.filter((expense) => {
    if (!expense.date) {
      return false;
    }

    const expenseDate = new Date(expense.date);

    if (Number.isNaN(expenseDate.getTime())) {
      return false;
    }

    return expenseDate >= oneMonthAgo;
  });
}


/*
  Analyze the user's actual spending pattern.
*/
export function analyzeSpending(
  expenses = [],
  userName
) {
  const lastMonthExpenses =
    getLastMonthExpenses(expenses);

  const categoryTotals = {};

  DEFAULT_CATEGORIES.forEach((category) => {
    categoryTotals[category] = 0;
  });

  lastMonthExpenses.forEach((expense) => {
    const personalShare =
      getPersonalExpenseShare(
        expense,
        userName
      );

    if (personalShare <= 0) {
      return;
    }

    const category =
      getExpenseCategory(expense.title);

    categoryTotals[category] +=
      personalShare;
  });

  const totalSpent = Object.values(
    categoryTotals
  ).reduce(
    (sum, amount) => sum + amount,
    0
  );

  return {
    totalSpent,
    categoryTotals,
    expenseCount: lastMonthExpenses.length,
  };
}


/*
  Calculate category priority.

  Protected categories get higher priority because
  they are important or likely necessary expenses.
*/
function getCategoryPriority(category) {
  if (category === "Bills") {
    return 1.3;
  }

  if (category === "Groceries") {
    return 1.2;
  }

  if (category === "Food") {
    return 1.15;
  }

  if (category === "Health") {
    return 1.1;
  }

  if (category === "Travel") {
    return 0.85;
  }

  if (category === "Shopping") {
    return 0.7;
  }

  if (category === "Entertainment") {
    return 0.65;
  }

  return 0.75;
}


/*
  Calculate how much extra room a category should get.

  This gives some flexibility to categories that may
  naturally increase next month.
*/
function getHeadroom(category, pastAmount) {
  if (pastAmount <= 0) {
    return 0;
  }

  if (category === "Bills") {
    return pastAmount * 0.1;
  }

  if (category === "Groceries") {
    return pastAmount * 0.15;
  }

  if (category === "Food") {
    return pastAmount * 0.2;
  }

  if (category === "Health") {
    return pastAmount * 0.15;
  }

  if (category === "Travel") {
    return pastAmount * 0.1;
  }

  return pastAmount * 0.05;
}


/*
  MAIN SMART BUDGET PLANNER

  Strategy:

  1. Look at previous spending.

  2. Preserve important categories.

  3. Add headroom to categories like Food,
     Groceries and Bills.

  4. If the budget is too small, reduce flexible
     categories more aggressively.

  5. Do NOT force the entire budget to be allocated.

     Remaining money is kept as a safety buffer.
*/
export function generateBudgetPlan({
  monthlyBudget,
  expenses = [],
  userName,
  selectedCategories = [],
}) {
  const analysis = analyzeSpending(
    expenses,
    userName
  );

  const budget = Number(monthlyBudget || 0);

  const activeCategories =
    selectedCategories.length > 0
      ? selectedCategories
      : DEFAULT_CATEGORIES;


  /*
    STEP 1

    Calculate the user's historical spending
    in each active category.
  */
  const categoryData = activeCategories.map(
    (category) => {
      const pastSpent =
        Number(
          analysis.categoryTotals[category] || 0
        );

      const protectedCategory =
        PROTECTED_CATEGORIES.includes(category);

      const flexibleCategory =
        FLEXIBLE_CATEGORIES.includes(category);

      const headroom =
        getHeadroom(category, pastSpent);

      const idealAmount =
        pastSpent + headroom;

      return {
        category,
        pastSpent,
        protectedCategory,
        flexibleCategory,
        headroom,
        idealAmount,
        suggested: 0,
      };
    }
  );


  /*
    STEP 2

    Calculate the amount needed to maintain
    the historical pattern with some flexibility.
  */
  const totalIdealAmount =
    categoryData.reduce(
      (sum, item) =>
        sum + item.idealAmount,
      0
    );


  /*
    CASE 1

    The user's budget is enough to support
    their normal spending pattern.
  */
  if (budget >= totalIdealAmount) {
    categoryData.forEach((item) => {
      item.suggested = Math.round(
        item.idealAmount
      );
    });
  }


  /*
    CASE 2

    Budget is less than the ideal spending.

    Protected categories are preserved first.
  */
  else {
    const protectedCategories =
      categoryData.filter(
        (item) => item.protectedCategory
      );

    const flexibleCategories =
      categoryData.filter(
        (item) => item.flexibleCategory
      );

    const otherCategories =
      categoryData.filter(
        (item) =>
          !item.protectedCategory &&
          !item.flexibleCategory
      );


    /*
      Calculate weighted demand for protected
      categories.
    */
    const protectedDemand =
      protectedCategories.reduce(
        (sum, item) =>
          sum +
          item.idealAmount *
            getCategoryPriority(item.category),
        0
      );


    /*
      Reserve up to 75% of the budget for
      protected/important categories.
    */
    const protectedBudget =
      Math.min(
        budget * 0.75,
        budget
      );


    if (protectedDemand > 0) {
      protectedCategories.forEach((item) => {
        const weightedNeed =
          item.idealAmount *
          getCategoryPriority(item.category);

        item.suggested = Math.round(
          protectedBudget *
            (weightedNeed / protectedDemand)
        );
      });
    }


    let usedBudget =
      categoryData.reduce(
        (sum, item) =>
          sum + item.suggested,
        0
      );


    let remainingBudget =
      Math.max(
        0,
        budget - usedBudget
      );


    /*
      Flexible categories compete for the
      remaining amount based on their
      historical spending.
    */
    const flexiblePastTotal =
      flexibleCategories.reduce(
        (sum, item) =>
          sum + item.pastSpent,
        0
      );


    if (
      remainingBudget > 0 &&
      flexiblePastTotal > 0
    ) {
      flexibleCategories.forEach((item) => {
        const share =
          item.pastSpent /
          flexiblePastTotal;

        const allocation =
          remainingBudget * share;

        item.suggested = Math.round(
          allocation
        );
      });
    }


    /*
      Other categories get a small amount
      only if there is historical spending.
    */
    if (
      flexiblePastTotal === 0 &&
      remainingBudget > 0
    ) {
      const otherPastTotal =
        otherCategories.reduce(
          (sum, item) =>
            sum + item.pastSpent,
          0
        );

      if (otherPastTotal > 0) {
        otherCategories.forEach((item) => {
          item.suggested = Math.round(
            remainingBudget *
              (item.pastSpent /
                otherPastTotal)
          );
        });
      }
    }
  }


  /*
    STEP 3

    Calculate totals.
  */
  const allocatedTotal =
    categoryData.reduce(
      (sum, item) =>
        sum + item.suggested,
      0
    );


  /*
    We intentionally allow money to remain
    unallocated.

    This becomes the user's safety buffer,
    savings, or emergency flexibility.
  */
  const remaining =
    Math.max(
      0,
      budget - allocatedTotal
    );


  /*
    Create final category response.
  */
  const categories =
    categoryData.map((item) => {
      let trend = "stable";

      if (
        item.pastSpent >
        item.suggested * 1.1
      ) {
        trend = "high";
      } else if (
        item.pastSpent <
        item.suggested * 0.7
      ) {
        trend = "low";
      }

      return {
        category: item.category,

        pastSpent:
          Math.round(item.pastSpent),

        suggested:
          Math.round(item.suggested),

        headroom:
          Math.round(item.headroom),

        protected:
          item.protectedCategory,

        trend,
      };
    });


  return {
    monthlyBudget: budget,

    totalPastSpending:
      Math.round(
        analysis.totalSpent
      ),

    allocatedTotal:
      Math.round(allocatedTotal),

    remaining:
      Math.round(remaining),

    categories,

    analysis: {
      expenseCount:
        analysis.expenseCount,

      categoryTotals:
        analysis.categoryTotals,
    },
  };
}