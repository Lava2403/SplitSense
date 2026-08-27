// src/utils/expenseCategories.js

export const EXPENSE_CATEGORIES = {
  BILLS: "Bills",
  GROCERIES: "Groceries",
  FOOD: "Food & Dining",
  TRANSPORT: "Transport",
  ENTERTAINMENT: "Entertainment",
  SHOPPING: "Shopping",
  EDUCATION: "Education",
  HEALTHCARE: "Healthcare",
  TRAVEL: "Travel",
  PERSONAL: "Personal Care",
  OTHER: "Other",
};

// Keywords used to automatically identify the category of an expense.
const CATEGORY_KEYWORDS = {
  [EXPENSE_CATEGORIES.BILLS]: [
    "rent",
    "electricity",
    "water bill",
    "gas bill",
    "wifi",
    "internet",
    "broadband",
    "mobile bill",
    "phone bill",
    "recharge",
    "maintenance",
    "utility",
    "utilities",
    "subscription",
    "netflix",
    "spotify",
    "prime",
    "hotstar",
  ],

  [EXPENSE_CATEGORIES.GROCERIES]: [
    "grocery",
    "groceries",
    "supermarket",
    "mart",
    "bigbasket",
    "blinkit",
    "zepto",
    "dmart",
    "reliance fresh",
    "vegetables",
    "vegetable",
    "fruits",
    "fruit",
    "milk",
  ],

  [EXPENSE_CATEGORIES.FOOD]: [
    "food",
    "restaurant",
    "cafe",
    "coffee",
    "tea",
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    "snacks",
    "swiggy",
    "zomato",
    "dominos",
    "pizza",
    "burger",
    "mcdonald",
    "kfc",
    "starbucks",
    "eat",
    "meal",
  ],

  [EXPENSE_CATEGORIES.TRANSPORT]: [
    "uber",
    "ola",
    "rapido",
    "metro",
    "bus",
    "train",
    "taxi",
    "cab",
    "auto",
    "fuel",
    "petrol",
    "diesel",
    "parking",
    "transport",
  ],

  [EXPENSE_CATEGORIES.ENTERTAINMENT]: [
    "movie",
    "cinema",
    "concert",
    "game",
    "gaming",
    "party",
    "club",
    "event",
    "ticket",
    "fun",
    "bowling",
  ],

  [EXPENSE_CATEGORIES.SHOPPING]: [
    "shopping",
    "clothes",
    "clothing",
    "shirt",
    "shoes",
    "amazon",
    "flipkart",
    "myntra",
    "ajio",
    "dress",
    "bag",
    "accessories",
  ],

  [EXPENSE_CATEGORIES.EDUCATION]: [
    "college",
    "course",
    "book",
    "books",
    "udemy",
    "coursera",
    "fee",
    "fees",
    "tuition",
    "exam",
    "education",
    "stationery",
  ],

  [EXPENSE_CATEGORIES.HEALTHCARE]: [
    "doctor",
    "hospital",
    "medicine",
    "medical",
    "pharmacy",
    "health",
    "clinic",
    "dentist",
    "test",
  ],

  [EXPENSE_CATEGORIES.TRAVEL]: [
    "flight",
    "hotel",
    "trip",
    "travel",
    "vacation",
    "holiday",
    "airbnb",
    "booking",
  ],

  [EXPENSE_CATEGORIES.PERSONAL]: [
    "salon",
    "haircut",
    "hair",
    "spa",
    "skincare",
    "cosmetics",
    "makeup",
    "gym",
    "personal care",
  ],
};

/**
 * Automatically determines an expense category from its title.
 *
 * @param {string} title
 * @returns {string}
 */
export function categorizeExpense(title = "") {
  const normalizedTitle = String(title).toLowerCase().trim();

  if (!normalizedTitle) {
    return EXPENSE_CATEGORIES.OTHER;
  }

  for (const [category, keywords] of Object.entries(
    CATEGORY_KEYWORDS
  )) {
    const found = keywords.some((keyword) =>
      normalizedTitle.includes(keyword)
    );

    if (found) {
      return category;
    }
  }

  return EXPENSE_CATEGORIES.OTHER;
}

/**
 * Returns all available categories.
 */
export function getAllCategories() {
  return Object.values(EXPENSE_CATEGORIES);
}

/**
 * Checks whether a category is considered essential.
 */
export function isEssentialCategory(category) {
  return [
    EXPENSE_CATEGORIES.BILLS,
    EXPENSE_CATEGORIES.GROCERIES,
    EXPENSE_CATEGORIES.EDUCATION,
    EXPENSE_CATEGORIES.HEALTHCARE,
    EXPENSE_CATEGORIES.TRANSPORT,
  ].includes(category);
}

/**
 * Checks whether a category is generally flexible/reducible.
 */
export function isFlexibleCategory(category) {
  return [
    EXPENSE_CATEGORIES.FOOD,
    EXPENSE_CATEGORIES.ENTERTAINMENT,
    EXPENSE_CATEGORIES.SHOPPING,
    EXPENSE_CATEGORIES.TRAVEL,
    EXPENSE_CATEGORIES.PERSONAL,
  ].includes(category);
}