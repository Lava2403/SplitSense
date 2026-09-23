const pool = require("../../db");

const getMonthRange = (month) => {
  let year;
  let monthNumber;

  if (month) {
    const match = /^(\d{4})-(\d{2})$/.exec(month);

    if (!match) {
      const error = new Error(
        "Month must be in YYYY-MM format."
      );

      error.statusCode = 400;
      throw error;
    }

    year = Number(match[1]);
    monthNumber = Number(match[2]);

    if (monthNumber < 1 || monthNumber > 12) {
      const error = new Error(
        "Invalid month."
      );

      error.statusCode = 400;
      throw error;
    }
  } else {
    const now = new Date();

    year = now.getFullYear();
    monthNumber = now.getMonth() + 1;
  }

  const currentStart = `${year}-${String(
    monthNumber
  ).padStart(2, "0")}-01`;

  const nextMonthDate = new Date(
    year,
    monthNumber,
    1
  );

  const nextStart = `${nextMonthDate.getFullYear()}-${String(
    nextMonthDate.getMonth() + 1
  ).padStart(2, "0")}-01`;

  const previousMonthDate = new Date(
    year,
    monthNumber - 2,
    1
  );

  const previousStart = `${previousMonthDate.getFullYear()}-${String(
    previousMonthDate.getMonth() + 1
  ).padStart(2, "0")}-01`;

  return {
    year,
    monthNumber,
    currentStart,
    nextStart,
    previousStart,
  };
};


const getMonthlyAnalytics = async (
  userId,
  month
) => {
  const {
    year,
    monthNumber,
    currentStart,
    nextStart,
    previousStart,
  } = getMonthRange(month);


  const currentTotalResult =
    await pool.query(
      `
        SELECT
          COALESCE(
            SUM(es.amount),
            0
          ) AS total_spent,

          COUNT(DISTINCT e.id)
            AS expense_count

        FROM expense_splits es

        JOIN expenses e
          ON e.id = es.expense_id

        WHERE es.user_id = $1
          AND e.expense_date >= $2::date
          AND e.expense_date < $3::date
      `,
      [
        userId,
        currentStart,
        nextStart,
      ]
    );


  const previousTotalResult =
    await pool.query(
      `
        SELECT
          COALESCE(
            SUM(es.amount),
            0
          ) AS total_spent,

          COUNT(DISTINCT e.id)
            AS expense_count

        FROM expense_splits es

        JOIN expenses e
          ON e.id = es.expense_id

        WHERE es.user_id = $1
          AND e.expense_date >= $2::date
          AND e.expense_date < $3::date
      `,
      [
        userId,
        previousStart,
        currentStart,
      ]
    );


  const categoryResult =
    await pool.query(
      `
        SELECT
          COALESCE(
            e.category,
            'Other'
          ) AS category,

          ROUND(
            SUM(es.amount)::numeric,
            2
          ) AS amount,

          COUNT(DISTINCT e.id)
            AS expense_count

        FROM expense_splits es

        JOIN expenses e
          ON e.id = es.expense_id

        WHERE es.user_id = $1
          AND e.expense_date >= $2::date
          AND e.expense_date < $3::date

        GROUP BY
          COALESCE(
            e.category,
            'Other'
          )

        ORDER BY
          amount DESC
      `,
      [
        userId,
        currentStart,
        nextStart,
      ]
    );

  
  const previousCategoryResult =
    await pool.query(
      `
        SELECT
          COALESCE(
            e.category,
            'Other'
          ) AS category,

          ROUND(
            SUM(es.amount)::numeric,
            2
          ) AS amount

        FROM expense_splits es

        JOIN expenses e
          ON e.id = es.expense_id

        WHERE es.user_id = $1
          AND e.expense_date >= $2::date
          AND e.expense_date < $3::date

        GROUP BY
          COALESCE(
            e.category,
            'Other'
          )
      `,
      [
        userId,
        previousStart,
        currentStart,
      ]
    );


  const dailyResult =
    await pool.query(
      `
        SELECT
          e.expense_date AS date,

          ROUND(
            SUM(es.amount)::numeric,
            2
          ) AS amount

        FROM expense_splits es

        JOIN expenses e
          ON e.id = es.expense_id

        WHERE es.user_id = $1
          AND e.expense_date >= $2::date
          AND e.expense_date < $3::date

        GROUP BY
          e.expense_date

        ORDER BY
          e.expense_date
      `,
      [
        userId,
        currentStart,
        nextStart,
      ]
    );

  const totalSpent = Number(
    currentTotalResult.rows[0]
      ?.total_spent || 0
  );

  const previousTotal = Number(
    previousTotalResult.rows[0]
      ?.total_spent || 0
  );

  const expenseCount = Number(
    currentTotalResult.rows[0]
      ?.expense_count || 0
  );

  const previousExpenseCount =
    Number(
      previousTotalResult.rows[0]
        ?.expense_count || 0
    );


  const previousCategoryMap =
    new Map();

  for (
    const row of previousCategoryResult.rows
  ) {
    previousCategoryMap.set(
      row.category,
      Number(row.amount)
    );
  }

  const categories =
    categoryResult.rows.map((row) => {
      const amount = Number(row.amount);

      const previousAmount =
        previousCategoryMap.get(
          row.category
        ) || 0;

      const percentage =
        totalSpent > 0
          ? (amount / totalSpent) * 100
          : 0;

      const changePercent =
        previousAmount > 0
          ? ((amount - previousAmount) /
              previousAmount) *
            100
          : amount > 0
          ? null
          : 0;

      return {
        category: row.category,

        amount: Number(
          amount.toFixed(2)
        ),

        percentage: Number(
          percentage.toFixed(1)
        ),

        previousAmount: Number(
          previousAmount.toFixed(2)
        ),

        changePercent:
          changePercent === null
            ? null
            : Number(
                changePercent.toFixed(1)
              ),

        expenseCount: Number(
          row.expense_count
        ),
      };
    });


  let changePercent = 0;

  if (previousTotal > 0) {
    changePercent =
      ((totalSpent - previousTotal) /
        previousTotal) *
      100;
  } else if (totalSpent > 0) {
    changePercent = null;
  }

  
  const topCategory =
    categories.length > 0
      ? categories[0]
      : null;

  return {
    month: `${year}-${String(
      monthNumber
    ).padStart(2, "0")}`,

    totalSpent: Number(
      totalSpent.toFixed(2)
    ),

    previousMonthSpent: Number(
      previousTotal.toFixed(2)
    ),

    changePercent:
      changePercent === null
        ? null
        : Number(
            changePercent.toFixed(1)
          ),

    expenseCount,

    previousExpenseCount,

    topCategory,

    categories,

    dailySpending:
      dailyResult.rows.map((row) => ({
        date: row.date,
        amount: Number(
          Number(row.amount).toFixed(2)
        ),
      })),

    spendingBasis:
      "User's share of expenses from expense_splits",
  };
};

module.exports = {
  getMonthlyAnalytics,
};