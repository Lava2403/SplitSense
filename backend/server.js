require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./db");
const auth = require("./middleware/auth");

const authRoutes =
  require("./src/routes/authRoutes");

const expenseRoutes =
  require("./src/routes/expenseRoutes");

const groupRoutes =
  require("./src/routes/groupRoutes");

const budgetRoutes =
  require("./src/routes/budgetRoutes");

const settlementRoutes =
  require("./src/routes/settlementRoutes");

const aiInsightRoutes = 
  require("./src/routes/aiInsightRoutes");

const {
  startCronJobs,
} = require("./src/services/cronService");


const app = express();

app.use(cors());

app.use(express.json());

// ==========================
// BASIC ROUTES
// ==========================

app.get("/", (req, res) => {
  res.send(
    "SplitSense Backend Running 🚀"
  );
});

app.get("/api/test", (req, res) => {
  res.json({
    message:
      "Hello from SplitSense Backend 🚀",
  });
});

app.get(
  "/api/db-test",
  async (req, res) => {
    try {
      const result =
        await pool.query(
          "SELECT NOW()"
        );

      res.json(result.rows);
    } catch (err) {
      console.error(
        "Database Error:",
        err
      );

      res.status(500).json({
        message: err.message,
      });
    }
  }
);

app.get(
  "/api/profile",
  auth,
  (req, res) => {
    res.json({
      message: "Protected route",
      user: req.user,
    });
  }
);

// ==========================
// APPLICATION ROUTES
// ==========================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/expenses",
  expenseRoutes
);

app.use(
  "/api/groups",
  groupRoutes
);

app.use(
  "/api/budget",
  budgetRoutes
);

app.use(
  "/api/settlements",
  settlementRoutes
);

app.use(
  "/api/ai-insights",
  aiInsightRoutes
);

// ==========================
// START SERVER
// ==========================

const PORT =
  process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  startCronJobs();
});