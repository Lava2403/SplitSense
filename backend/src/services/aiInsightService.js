const {
  getMonthlyAnalytics,
} = require("./analyticsService");

const MODEL_NAME =
  process.env.GEMINI_MODEL ||
  "gemini-3.6-flash";

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

const isTemporaryGeminiError = (error) => {
  const message =
    error?.message ||
    error?.response?.data?.message ||
    "";

  const status =
    error?.status ||
    error?.statusCode ||
    error?.response?.status;

  return (
    status === 503 ||
    status === 429 ||
    message.includes("503") ||
    message.includes("high demand") ||
    message.includes("UNAVAILABLE") ||
    message.includes("overloaded")
  );
};

const createFallbackInsights = (analytics) => {
  const totalSpent = Number(
    analytics?.totalSpent || 0
  );

  const previousMonthSpent = Number(
    analytics?.previousMonthSpent || 0
  );

  const changePercent =
    analytics?.changePercent;

  const topCategory =
    analytics?.topCategory;

  const categories =
    analytics?.categories || [];

  const positiveObservations = [];
  const actionableTips = [];
  const areasForImprovement = [];

  // Overall spending observation
  if (
    previousMonthSpent > 0 &&
    changePercent !== null &&
    changePercent !== undefined
  ) {
    if (changePercent < 0) {
      positiveObservations.push(
        `Your spending decreased by ${Math.abs(
          Number(changePercent)
        ).toFixed(1)}% compared with the previous month.`
      );
    } else if (changePercent > 0) {
      actionableTips.push(
        `Your spending increased by ${Number(
          changePercent
        ).toFixed(1)}% compared with the previous month. Reviewing the categories contributing to this increase may help you understand the change.`
      );
    } else {
      positiveObservations.push(
        "Your spending was unchanged compared with the previous month."
      );
    }
  }

  // Top category
  if (topCategory?.category) {
    const percentage =
      Number(
        topCategory.percentage || 0
      ).toFixed(1);

    areasForImprovement.push({
      category: topCategory.category,
      observation: `${topCategory.category} represents ${percentage}% of your spending for this month.`,
      suggestion: `Keep an eye on ${topCategory.category} spending and review individual expenses in this category when planning your monthly expenses.`,
    });
  }

  // Other category
  const otherCategory =
    categories.find(
      (category) =>
        category.category === "Other"
    );

  if (
    otherCategory &&
    Number(otherCategory.amount) > 0
  ) {
    areasForImprovement.push({
      category: "Other",
      observation: `You have ${otherCategory.expenseCount} expense${
        otherCategory.expenseCount === 1
          ? ""
          : "s"
      } categorized as Other, totaling ₹${Number(
        otherCategory.amount
      ).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}.`,
      suggestion:
        "Using more specific categories for these expenses can make your monthly spending patterns easier to understand.",
    });
  }

  // General useful tip
  if (totalSpent > 0) {
    actionableTips.push(
      "Review your largest spending categories regularly to understand where most of your monthly expense share is going."
    );
  }

  if (positiveObservations.length === 0) {
    positiveObservations.push(
      "Your monthly spending data is available for analysis and comparison."
    );
  }

  if (actionableTips.length === 0) {
    actionableTips.push(
      "Continue categorizing expenses consistently to make future spending analysis more useful."
    );
  }

  let summary;

  if (
    previousMonthSpent > 0 &&
    changePercent !== null &&
    changePercent !== undefined
  ) {
    const direction =
      Number(changePercent) < 0
        ? "decreased"
        : Number(changePercent) > 0
        ? "increased"
        : "remained unchanged";

    summary = `In ${analytics.month}, your share of spending was ₹${totalSpent.toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}. Your spending ${direction} by ${Math.abs(
      Number(changePercent)
    ).toFixed(1)}% compared with the previous month.`;

    if (topCategory?.category) {
      summary += ` ${topCategory.category} accounted for ${Number(
        topCategory.percentage || 0
      ).toFixed(1)}% of your total spending share.`;
    }
  } else {
    summary = `In ${analytics.month}, your share of spending was ₹${totalSpent.toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}.`;

    if (topCategory?.category) {
      summary += ` ${topCategory.category} was your largest spending category at ${Number(
        topCategory.percentage || 0
      ).toFixed(1)}% of your total share.`;
    }
  }

  const keyObservation = topCategory?.category
    ? `${topCategory.category} was the largest contributor to your spending this month, accounting for ${Number(
        topCategory.percentage || 0
      ).toFixed(1)}% of your total spending share.`
    : `Your total spending share for ${analytics.month} was ₹${totalSpent.toLocaleString(
        "en-IN",
        {
          maximumFractionDigits: 2,
        }
      )}.`;

  return {
    summary,
    keyObservation,
    areasForImprovement,
    positiveObservations,
    actionableTips,
  };
};

const generateMonthlyInsights = async (
  userId,
  month
) => {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error(
      "GEMINI_API_KEY is not configured."
    );

    error.statusCode = 500;
    throw error;
  }

  const analytics =
    await getMonthlyAnalytics(
      userId,
      month
    );

  const {
    GoogleGenAI,
  } = await import(
    "@google/genai"
  );

  const ai = new GoogleGenAI({
    apiKey:
      process.env.GEMINI_API_KEY,
  });

  const prompt = `
You are the financial insights assistant
inside SplitSense, a personal expense-sharing
application.

Analyze the user's monthly spending data.

IMPORTANT RULES:

1. Use ONLY the numerical data provided.
2. Do not invent transactions, amounts,
   categories, income, salary, or budgets.
3. Do not give investment, loan, tax, or
   other high-stakes financial advice.
4. Do not shame the user for spending.
5. Give practical and specific observations.
6. Clearly distinguish observations from
   suggestions.
7. If there is insufficient data, say so.
8. Percentages and amounts provided in the
   data are already calculated. Do not change
   them.
9. "totalSpent" represents the user's share
   of shared expenses, not necessarily the
   total amount paid by the user.
10. Compare with the previous month only when
    previous-month data exists.

The user wants:
- a concise monthly spending summary
- areas where spending could potentially be
  improved
- practical suggestions
- positive observations where appropriate

MONTHLY DATA:

${JSON.stringify(
  analytics,
  null,
  2
)}

Return JSON matching the requested schema.
`;

  let response = null;

  // Try Gemini twice.
  // This handles temporary 503/429 availability errors.
  for (
    let attempt = 1;
    attempt <= 2;
    attempt++
  ) {
    try {
      response =
        await ai.models.generateContent({
          model: MODEL_NAME,

          contents: prompt,

          config: {
            temperature: 0.4,

            responseMimeType:
              "application/json",

            responseSchema: {
              type: "object",

              properties: {
                summary: {
                  type: "string",
                  description:
                    "A concise 2-4 sentence summary of the user's monthly spending.",
                },

                keyObservation: {
                  type: "string",
                  description:
                    "The single most important spending observation supported by the data.",
                },

                areasForImprovement: {
                  type: "array",

                  items: {
                    type: "object",

                    properties: {
                      category: {
                        type: "string",
                        description:
                          "The spending category related to this observation.",
                      },

                      observation: {
                        type: "string",
                        description:
                          "What the spending data shows.",
                      },

                      suggestion: {
                        type: "string",
                        description:
                          "A practical, non-judgmental suggestion.",
                      },
                    },

                    required: [
                      "category",
                      "observation",
                      "suggestion",
                    ],
                  },
                },

                positiveObservations: {
                  type: "array",

                  items: {
                    type: "string",
                  },
                },

                actionableTips: {
                  type: "array",

                  items: {
                    type: "string",
                  },
                },
              },

              required: [
                "summary",
                "keyObservation",
                "areasForImprovement",
                "positiveObservations",
                "actionableTips",
              ],
            },
          },
        });

      break;
    } catch (error) {
      console.error(
        `Gemini attempt ${attempt} failed:`,
        error.message
      );

      if (
        !isTemporaryGeminiError(error) ||
        attempt === 2
      ) {
        response = null;
        break;
      }

      // Wait 1.5 seconds before retrying.
      await sleep(1500);
    }
  }

  // Gemini was unavailable.
  // Return analytics-based insights instead of
  // breaking the Dashboard with a 500 error.
  if (!response) {
    console.warn(
      "Gemini is temporarily unavailable. Using analytics fallback."
    );

    return {
      analytics,
      insights:
        createFallbackInsights(
          analytics
        ),
      model: "analytics-fallback",
    };
  }

  if (!response.text) {
    console.warn(
      "Gemini returned an empty response. Using analytics fallback."
    );

    return {
      analytics,
      insights:
        createFallbackInsights(
          analytics
        ),
      model: "analytics-fallback",
    };
  }

  let insights;

  try {
    insights = JSON.parse(
      response.text
    );
  } catch (error) {
    console.warn(
      "Gemini returned invalid JSON. Using analytics fallback."
    );

    return {
      analytics,
      insights:
        createFallbackInsights(
          analytics
        ),
      model: "analytics-fallback",
    };
  }

  return {
    analytics,
    insights,
    model: MODEL_NAME,
  };
};

module.exports = {
  generateMonthlyInsights,
};