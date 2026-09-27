<div align="center">

# 💸 SplitSense

**Know exactly who owes whom.**

SplitSense is a full-stack group expense-splitting app with AI-powered spending insights, smart budget planning, and automated settlement tracking — built to remove the friction (and awkwardness) from splitting bills with friends, roommates, and travel groups.

[🔗 Live Demo](https://split-sense-ten.vercel.app/) · [📂 Repository](https://github.com/Lava2403/SplitSense)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Why This Stack](#-why-this-stack)
- [Screenshots](#-screenshots)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧾 Overview

Managing shared expenses across groups — trips, apartments, dinners — usually turns into a mess of mental math and awkward "you still owe me" conversations. **SplitSense** centralizes group expenses, calculates who owes what, tracks settlements, and layers on AI-generated insights so users understand *where* their money is actually going, not just how much.

---

## ✨ Features

| Category | What it does |
|---|---|
| 👥 **Groups** | Create groups, add members, track group-wise spending and balances |
| 🧾 **Expense Tracking** | Log expenses, assign payers, split among participants |
| ⚖️ **Balance Calculation** | Automatically computes who owes whom, per group and overall |
| 🤝 **Settlements** | Record cash/UPI/bank-transfer settlements with reference notes and history |
| 📊 **Spending Analytics** | Monthly spending charts, category-wise breakdowns |
| 🧠 **AI Spending Insights** | Gemini-powered natural-language summaries of monthly spending trends |
| 💰 **Smart Budget Planner** | Suggests a realistic monthly budget based on historical spending patterns |
| 🔔 **Email Notifications** | Automated settlement/reminder emails via Nodemailer |
| ⏰ **Scheduled Jobs** | Cron-based background tasks (e.g. recurring reminders) |
| 🔐 **Authentication** | JWT-based auth with bcrypt password hashing, forgot/reset password flow |

---

## 🛠 Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **PostgreSQL** (`pg`) | Relational database for users, groups, expenses, settlements |
| **JWT** (`jsonwebtoken`) | Stateless authentication tokens |
| **bcrypt** | Password hashing |
| **node-cron** | Scheduled background jobs |
| **Nodemailer** | Transactional emails (settlement reminders, notifications) |
| **Google Gemini** (`@google/genai`) | AI-generated spending insights & summaries |
| **dotenv** | Environment variable management |
| **CORS** | Cross-origin request handling |

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite** | Dev server & build tool |
| **Tailwind CSS v4** | Utility-first styling |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **Recharts** | Spending charts & data visualizations |
| **Lucide React / React Icons** | Icon sets |
| **ESLint** | Code quality/linting |

### Deployment

| Layer | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render|
| Database | PostgreSQL (NeonDB) |

---

## 🤔 Why This Stack

| Choice | Reasoning |
|---|---|
| **PostgreSQL over NoSQL** | Expense-splitting is inherently relational — users, groups, expenses, and participant shares all reference each other. Postgres enforces referential integrity and makes balance calculations (joins/aggregates) far more reliable than a document store. |
| **Express 5** | Minimal, unopinionated, and battle-tested for building a clean REST API with a controller/service/route separation. |
| **JWT + bcrypt** | Stateless auth scales well without server-side session storage; bcrypt is the standard for secure password hashing. |
| **React + Vite** | Vite's fast HMR and modern build pipeline make development significantly faster than CRA-based setups, and React's component model fits the many reusable UI pieces (cards, modals, charts) this app needs. |
| **Tailwind CSS v4** | Enables fast, consistent UI iteration without hand-writing custom CSS for every component — especially useful for a data-dense dashboard UI. |
| **Recharts** | Native React charting library that integrates cleanly with component state, used for the monthly spending & category breakdown visualizations. |
| **Google Gemini API** | Powers the "AI Spending Insights" feature — turning raw transaction data into natural-language summaries and observations. |
| **node-cron** | Lightweight, dependency-free way to run scheduled tasks (e.g., settlement reminders) without needing a separate job queue system. |

---

## 📂 Project Structure

```
SplitSense/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── aiInsightController.js
│   │   │   ├── authController.js
│   │   │   ├── budgetController.js
│   │   │   ├── expenseController.js
│   │   │   ├── groupController.js
│   │   │   └── settlementController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── routes/
│   │   │   ├── aiInsightRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── budgetRoutes.js
│   │   │   └── expenseRoutes.js
│   │   └── services/
│   │       ├── aiInsightService.js
│   │       ├── analyticsService.js
│   │       ├── authService.js
│   │       ├── budgetService.js
│   │       ├── cronService.js
│   │       ├── emailService.js
│   │       ├── expenseService.js
│   │       ├── groupService.js
│   │       ├── settlementEmailHelper.js
│   │       └── settlementService.js
│   ├── .env.example
│   ├── db.js
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── BudgetPlanner.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ExpensesPage.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── GroupPage.jsx
│   │   │   ├── GroupsPage.jsx
│   │   │   ├── Insights.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── SettlementPage.jsx
│   │   │   └── Signup.jsx
│   │   ├── utils/
│   │   │   ├── auth.js
│   │   │   ├── balances.js
│   │   │   ├── budgetPlanner.js
│   │   │   ├── budgetRecommendationEngine.js
│   │   │   ├── expenseCategories.js
│   │   │   └── spendingAnalyzer.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
└── package.json
```

---

## 🗄 Database Schema

> Inferred from the app's core features. Update this to match your actual `db.js`/migration files if column names differ.

### `users`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR | |
| email | VARCHAR | Unique |
| password_hash | VARCHAR | bcrypt hash |
| created_at | TIMESTAMP | |

### `groups`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR | |
| description | VARCHAR | e.g. "Goa Vacation" |
| created_by | INT FK → users.id | |
| created_at | TIMESTAMP | |

### `group_members`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| group_id | INT FK → groups.id | |
| user_id | INT FK → users.id | |
| joined_at | TIMESTAMP | |

### `expenses`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| group_id | INT FK → groups.id | |
| paid_by | INT FK → users.id | |
| title | VARCHAR | e.g. "Dinner", "Bakery" |
| amount | DECIMAL | |
| category | VARCHAR | Food, Travel, Shopping, etc. |
| date | DATE | |

### `expense_participants`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| expense_id | INT FK → expenses.id | |
| user_id | INT FK → users.id | |
| share_amount | DECIMAL | Amount owed by this participant |

### `settlements`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| group_id | INT FK → groups.id | |
| paid_by | INT FK → users.id | |
| paid_to | INT FK → users.id | |
| amount | DECIMAL | |
| method | VARCHAR | Cash / UPI / Bank Transfer |
| reference | VARCHAR | Optional note |
| settled_at | TIMESTAMP | |

### `budgets`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | INT FK → users.id | |
| monthly_amount | DECIMAL | |
| categories | JSONB / TEXT[] | Selected categories (Food, Travel, etc.) |
| month | DATE | |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- PostgreSQL instance (local or hosted)
- A Google Gemini API key (for AI insights)

### 1. Clone the repository

    git clone https://github.com/Lava2403/SplitSense.git
    cd SplitSense

### 2. Backend Setup

    cd backend
    npm install
    cp .env.example .env
    npm run dev

### 3. Frontend Setup

    cd ../frontend
    npm install
    cp .env.example .env
    npm run dev

### 4. Open the app

[ https://split-sense-ten.vercel.app/]
---

## 🔑 Environment Variables

### `backend/.env`

    PORT=5000
    DATABASE_URL=postgresql://user:password@localhost:5432/splitsense
    JWT_SECRET=your_jwt_secret
    GEMINI_API_KEY=your_google_genai_key
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_app_password

### `frontend/.env`

    VITE_API_BASE_URL=http://localhost:5000/api

---

## 🔌 API Overview

| Route Prefix | Handles |
|---|---|
| `/api/auth` | Signup, login, forgot/reset password |
| `/api/groups` | Create/manage groups & members |
| `/api/expenses` | Add/edit/delete expenses |
| `/api/settlements` | Record and view settlements |
| `/api/budget` | Budget planner recommendations |
| `/api/ai-insights` | AI-generated spending summaries |

---


