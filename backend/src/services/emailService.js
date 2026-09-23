const nodemailer = require("nodemailer");

const pool = require("../../db");

const {
  generateMonthlyInsights,
} = require("./aiInsightService");



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});



const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatMonthName = (month) => {
  const [year, monthNumber] = month.split("-");

  return new Date(
    Number(year),
    Number(monthNumber) - 1,
    1
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};


const emailLayout = ({
  title,
  subtitle,
  content,
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <style>
    body {
      margin: 0;
      padding: 0;
      background: #f1f5f9;
      font-family: Arial, Helvetica, sans-serif;
      color: #172033;
    }

    .wrapper {
      width: 100%;
      padding: 32px 0;
    }

    .container {
      max-width: 700px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
    }

    .header {
      background: linear-gradient(
        120deg,
        #047857 0%,
        #123a3a 55%,
        #172033 100%
      );
      padding: 30px;
      color: white;
    }

    .logo {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 18px;
    }

    .title {
      font-size: 26px;
      font-weight: 700;
      margin: 0;
    }

    .subtitle {
      margin-top: 8px;
      color: #d1fae5;
      font-size: 14px;
    }

    .content {
      padding: 30px;
    }

    .section {
      margin-bottom: 30px;
    }

    .section-title {
      font-size: 17px;
      font-weight: 700;
      color: #172033;
      margin-bottom: 14px;
    }

    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .summary-value {
      font-size: 28px;
      font-weight: 700;
      color: #047857;
    }

    .summary-label {
      font-size: 13px;
      color: #64748b;
      margin-top: 5px;
    }

    .stats {
      width: 100%;
      border-collapse: collapse;
    }

    .stats td {
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .stats td:last-child {
      text-align: right;
      font-weight: 600;
    }

    table.data-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }

    .data-table th {
      background: #f8fafc;
      color: #475569;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }

    .data-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }

    .data-table tr:last-child td {
      border-bottom: none;
    }

    .amount {
      font-weight: 600;
      text-align: right;
    }

    .observation {
      background: #f8fafc;
      border-left: 4px solid #047857;
      padding: 16px;
      border-radius: 6px;
      color: #334155;
      line-height: 1.6;
    }

    .improvement {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
    }

    .improvement-category {
      font-weight: 700;
      color: #92400e;
      margin-bottom: 8px;
    }

    .improvement-text {
      color: #475569;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 6px;
    }

    .positive {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 8px;
      color: #065f46;
      font-size: 14px;
    }

    .tip {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 8px;
      color: #1e40af;
      font-size: 14px;
      line-height: 1.5;
    }

    .empty {
      color: #64748b;
      font-size: 14px;
      padding: 10px 0;
    }

    .footer {
      padding: 20px 30px;
      background: #f8fafc;
      color: #64748b;
      font-size: 12px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }

    @media only screen and (max-width: 600px) {
      .content,
      .header {
        padding: 22px;
      }

      .data-table th,
      .data-table td {
        padding: 9px;
      }
    }
  </style>
</head>

<body>

  <div class="wrapper">

    <div class="container">

      <div class="header">
        <div class="logo">
          SplitSense
        </div>

        <h1 class="title">
          ${escapeHtml(title)}
        </h1>

        <div class="subtitle">
          ${escapeHtml(subtitle)}
        </div>
      </div>

      <div class="content">
        ${content}
      </div>

      <div class="footer">
        This email was automatically generated by SplitSense.
        <br />
        Keep your spending visible. Spend with intention.
      </div>

    </div>

  </div>

</body>
</html>
`;
};



const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  if (!process.env.EMAIL_USER) {
    throw new Error("EMAIL_USER is not configured.");
  }

  if (!process.env.EMAIL_PASS) {
    throw new Error("EMAIL_PASS is not configured.");
  }

  return transporter.sendMail({
    from: `"SplitSense" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};


const sendMonthlySpendingEmail = async (
  user,
  month
) => {
  const result =
    await generateMonthlyInsights(
      user.id,
      month
    );

  const {
    analytics,
    insights,
  } = result;

  const monthName =
    formatMonthName(analytics.month);

  const changeText =
    analytics.changePercent === null
      ? "No previous-month comparison available"
      : `${
          analytics.changePercent >= 0
            ? "+"
            : ""
        }${analytics.changePercent}%`;

  

  const categoryRows =
    analytics.categories.length > 0
      ? analytics.categories
          .map(
            (category) => `
              <tr>
                <td>
                  ${escapeHtml(
                    category.category
                  )}
                </td>

                <td class="amount">
                  ${formatCurrency(
                    category.amount
                  )}
                </td>

                <td class="amount">
                  ${category.percentage}%
                </td>
              </tr>
            `
          )
          .join("")
      : `
          <tr>
            <td colspan="3" class="empty">
              No spending recorded this month.
            </td>
          </tr>
        `;

  

  const improvementHtml =
    insights.areasForImprovement
      ?.length > 0
      ? insights.areasForImprovement
          .map(
            (item) => `
              <div class="improvement">

                <div class="improvement-category">
                  ${escapeHtml(
                    item.category
                  )}
                </div>

                <div class="improvement-text">
                  <strong>What we noticed:</strong>
                  ${escapeHtml(
                    item.observation
                  )}
                </div>

                <div class="improvement-text">
                  <strong>Gentle suggestion:</strong>
                  ${escapeHtml(
                    item.suggestion
                  )}
                </div>

              </div>
            `
          )
          .join("")
      : `
          <div class="empty">
            No specific improvement areas were identified
            from the available spending data.
          </div>
        `;

  

  const positiveHtml =
    insights.positiveObservations
      ?.length > 0
      ? insights.positiveObservations
          .map(
            (item) => `
              <div class="positive">
                ✓ ${escapeHtml(item)}
              </div>
            `
          )
          .join("")
      : `
          <div class="empty">
            No additional positive observations were available.
          </div>
        `;

  
  const tipsHtml =
    insights.actionableTips
      ?.length > 0
      ? insights.actionableTips
          .map(
            (item) => `
              <div class="tip">
                ${escapeHtml(item)}
              </div>
            `
          )
          .join("")
      : `
          <div class="empty">
            No additional suggestions were generated.
          </div>
        `;

  

  const content = `

    <div class="section">

      <div class="section-title">
        Monthly Overview
      </div>

      <div class="summary-card">

        <div class="summary-value">
          ${formatCurrency(
            analytics.totalSpent
          )}
        </div>

        <div class="summary-label">
          Your share of expenses in ${escapeHtml(
            monthName
          )}
        </div>

      </div>

      <table class="stats">

        <tr>
          <td>Previous month</td>
          <td>
            ${formatCurrency(
              analytics.previousMonthSpent
            )}
          </td>
        </tr>

        <tr>
          <td>Month-over-month change</td>
          <td>
            ${escapeHtml(changeText)}
          </td>
        </tr>

        <tr>
          <td>Expenses</td>
          <td>
            ${analytics.expenseCount}
          </td>
        </tr>

        ${
          analytics.topCategory
            ? `
              <tr>
                <td>Top spending category</td>
                <td>
                  ${escapeHtml(
                    analytics.topCategory.category
                  )}
                </td>
              </tr>
            `
            : ""
        }

      </table>

    </div>


    <div class="section">

      <div class="section-title">
        Where Your Money Went
      </div>

      <table class="data-table">

        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Share</th>
          </tr>
        </thead>

        <tbody>
          ${categoryRows}
        </tbody>

      </table>

    </div>


    <div class="section">

      <div class="section-title">
        Key Observation
      </div>

      <div class="observation">
        ${escapeHtml(
          insights.keyObservation
        )}
      </div>

    </div>


    <div class="section">

      <div class="section-title">
        Areas for Improvement
      </div>

      ${improvementHtml}

    </div>


    <div class="section">

      <div class="section-title">
        What's Going Well
      </div>

      ${positiveHtml}

    </div>


    <div class="section">

      <div class="section-title">
        A Few Things to Try Next Month
      </div>

      ${tipsHtml}

    </div>

  `;

  return sendEmail({
    to: user.email,

    subject:
      `SplitSense — ${monthName} Spending Summary`,

    html: emailLayout({
      title: `${monthName} Spending Summary`,
      subtitle:
        "A quick look at your spending and personalized insights.",

      content,
    }),
  });
};




const sendOutstandingPaymentsEmail = async (
  user
) => {

  

  const result = await pool.query(
    `
      WITH expense_balances AS (

        SELECT
          e.id AS expense_id,

          e.paid_by,

          e.group_id,

          COALESCE(
            SUM(
              CASE
                WHEN es.user_id = $1
                THEN es.amount
                ELSE 0
              END
            ),
            0
          ) AS user_share,

          COALESCE(
            SUM(es.amount),
            0
          ) AS total_expense

        FROM expenses e

        JOIN expense_splits es
          ON es.expense_id = e.id

        GROUP BY
          e.id,
          e.paid_by,
          e.group_id
      ),

      user_group_balances AS (

        SELECT
          eb.group_id,

          SUM(
            CASE
              WHEN eb.paid_by = $1
              THEN eb.total_expense
              ELSE 0
            END
          )
          -
          SUM(eb.user_share) AS balance

        FROM expense_balances eb

        GROUP BY eb.group_id
      )

      SELECT
        g.id AS group_id,
        g.name AS group_name,
        u.name AS payer_name,
        u.email AS payer_email,

        ABS(
          ugb.balance
        ) AS amount

      FROM user_group_balances ugb

      JOIN groups g
        ON g.id = ugb.group_id

      JOIN users u
        ON u.id = g.created_by

      WHERE ugb.balance < 0

      ORDER BY amount DESC
    `,
    [user.id]
  );

 

  const {
    calculateUserOutstandingPayments,
  } = require("./settlementEmailHelper");

  const outstanding =
    await calculateUserOutstandingPayments(
      user.id
    );

  const rows =
    outstanding.length > 0
      ? outstanding
          .map(
            (item) => `
              <tr>
                <td>
                  ${escapeHtml(
                    item.recipientName
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    item.groupName
                  )}
                </td>

                <td class="amount">
                  ${formatCurrency(
                    item.amount
                  )}
                </td>
              </tr>
            `
          )
          .join("")
      : `
          <tr>
            <td colspan="3" class="empty">
              You have no outstanding payments right now.
            </td>
          </tr>
        `;

  const totalOutstanding =
    outstanding.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  const content = `

    <div class="section">

      <div class="section-title">
        Outstanding Payments
      </div>

      <div class="summary-card">

        <div class="summary-value">
          ${formatCurrency(
            totalOutstanding
          )}
        </div>

        <div class="summary-label">
          Total amount currently owed by you
        </div>

      </div>

      <table class="data-table">

        <thead>
          <tr>
            <th>Recipient</th>
            <th>Group</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>

      </table>

    </div>

    ${
      outstanding.length > 0
        ? `
          <div class="section">

            <div class="observation">
              Keeping up with small outstanding payments
              can make group expenses easier to manage.
            </div>

          </div>
        `
        : `
          <div class="section">

            <div class="observation">
              You're all caught up. No outstanding
              payments were found.
            </div>

          </div>
        `
    }

  `;

  return sendEmail({
    to: user.email,

    subject:
      outstanding.length > 0
        ? `SplitSense — ${formatCurrency(
            totalOutstanding
          )} Outstanding`
        : "SplitSense — You're All Caught Up",

    html: emailLayout({
      title: "Outstanding Payments",
      subtitle:
        "Your current unsettled balances.",

      content,
    }),
  });
};


module.exports = {
  sendEmail,
  sendMonthlySpendingEmail,
  sendOutstandingPaymentsEmail,
};