const cron = require("node-cron");

const pool = require("../../db");

const {
  sendMonthlySpendingEmail,
  sendOutstandingPaymentsEmail,
} = require("./emailService");




const getUsersWithEmails = async () => {
  const result = await pool.query(`
    SELECT
      id,
      name,
      email
    FROM users
    WHERE
      email IS NOT NULL
      AND TRIM(email) <> ''
  `);

  return result.rows;
};




const runDailyOutstandingPaymentEmails = async () => {
  console.log(
    "Starting daily outstanding-payment emails..."
  );

  try {
    const users = await getUsersWithEmails();

    for (const user of users) {
      try {
        await sendOutstandingPaymentsEmail(user);

        console.log(
          `Outstanding-payment email sent to ${user.email}`
        );
      } catch (error) {
        console.error(
          `Failed to send outstanding-payment email to ${user.email}:`,
          error.message
        );
      }
    }

    console.log(
      "Daily outstanding-payment emails completed."
    );
  } catch (error) {
    console.error(
      "Daily outstanding-payment email job failed:",
      error
    );
  }
};




const runMonthlySpendingEmails = async () => {
  console.log(
    "Starting monthly AI spending-summary emails..."
  );

  try {
    const users = await getUsersWithEmails();

    

    const now = new Date();

    const previousMonthDate = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const month =
      `${previousMonthDate.getFullYear()}-${String(
        previousMonthDate.getMonth() + 1
      ).padStart(2, "0")}`;

    console.log(
      `Generating monthly AI report for ${month}...`
    );

    for (const user of users) {
      try {
        await sendMonthlySpendingEmail(
          user,
          month
        );

        console.log(
          `Monthly AI spending email sent to ${user.email}`
        );
      } catch (error) {
        console.error(
          `Failed to send monthly AI spending email to ${user.email}:`,
          error.message
        );
      }
    }

    console.log(
      "Monthly AI spending-summary emails completed."
    );
  } catch (error) {
    console.error(
      "Monthly AI spending email job failed:",
      error
    );
  }
};




const startCronJobs = () => {

  

  cron.schedule(
    "0 8 * * *",
    () => {
      runDailyOutstandingPaymentEmails();
    },
    {
      timezone:
        process.env.CRON_TIMEZONE ||
        "Asia/Kolkata",
    }
  );


  
  cron.schedule(
    "0 9 1 * *",
    () => {
      runMonthlySpendingEmails();
    },
    {
      timezone:
        process.env.CRON_TIMEZONE ||
        "Asia/Kolkata",
    }
  );


  console.log("Cron jobs started.");

  console.log(
    "• Daily outstanding-payment email: 8:00 AM"
  );

  console.log(
    "• Monthly AI spending email: 9:00 AM on the 1st"
  );
};


module.exports = {
  startCronJobs,
};