# 💸 SplitSense

### AI-Powered Expense Sharing & Smart Settlement Platform

SplitSense is a full-stack expense sharing application inspired by Splitwise, designed to help friends, roommates, travel groups, and teams manage shared expenses effortlessly. It combines intelligent expense tracking with AI-powered features such as receipt scanning, natural language expense entry, spending analytics, and smart debt settlement.

---

## ✨ Features

### 👥 Group Management
- Create and manage expense groups
- Add and manage group members
- Track group-wise expenses and balances

### 💰 Expense Tracking
- Add expenses easily
- Equal, percentage, or custom expense splitting
- Track who paid and who owes

### 📊 Balance Dashboard
- View total amount owed and owed to you
- Group-wise and user-wise balance summaries
- Real-time expense calculations

### 🔄 Smart Settlement
- Minimize the number of transactions required to settle debts
- Graph-based debt simplification algorithm

### 🧾 AI Receipt Scanner
- Upload receipts and bills
- Automatically extract expense details using OCR and AI
- Auto-fill expense forms

### 💬 Natural Language Expense Entry
Create expenses using simple text:

> "I paid ₹2400 for dinner yesterday and split it among me, Riya and Ayush."

The system automatically extracts:
- Amount
- Participants
- Expense title
- Date

### 📈 AI Spending Insights
- Category-wise spending breakdown
- Monthly spending trends
- Highest spending categories
- Personalized financial summaries

### 📄 AI Monthly Reports
Generate intelligent summaries of spending patterns and expense trends.

### 🔍 Search & Filters
- Search expenses by keyword
- Filter by category, date, or group

### 📤 Export Reports
- PDF Reports
- Excel Reports

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Recharts

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL
- Prisma ORM

### Authentication
- JWT Authentication
- Google OAuth

### AI Integration
- OpenAI API / Gemini API
- OCR for receipt scanning

### Deployment
- Vercel
- Railway / Render
- Neon PostgreSQL

---

## 🏗️ System Architecture

```text
User
 │
 ▼
React Frontend
 │
 ▼
Express Backend
 │
 ├── PostgreSQL Database
 │
 ├── Authentication Service
 │
 ├── Expense Management Service
 │
 ├── Settlement Engine
 │
 └── AI Services
      ├── Receipt OCR
      ├── Expense Extraction
      └── Spending Insights
```

---

## 📂 Database Schema

### Users

```sql
id
name
email
password
```

### Groups

```sql
id
name
created_by
```

### Group Members

```sql
group_id
user_id
```

### Expenses

```sql
id
title
amount
paid_by
group_id
created_at
```

### Expense Shares

```sql
expense_id
user_id
share_amount
```

### Settlements

```sql
id
payer_id
receiver_id
amount
created_at
```

---

## 🚀 Future Enhancements

- Multi-currency support
- UPI integration
- Recurring expenses
- Mobile application
- Voice-based expense entry
- Expense forecasting using Machine Learning
- Real-time notifications

---

## 📸 Screenshots

_Add screenshots here once the project is complete._

| Dashboard | Group View |
|-----------|------------|
| Screenshot | Screenshot |

| AI Insights | Receipt Scanner |
|-------------|----------------|
| Screenshot | Screenshot |

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/splitsense.git
cd splitsense
```

### Install Dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### Configure Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=
JWT_SECRET=
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Run Application

```bash
# Frontend
npm run dev

# Backend
npm run dev
```

---

## 🎯 Learning Outcomes

- Full Stack Development using MERN-style architecture
- PostgreSQL Database Design
- Prisma ORM
- Authentication & Authorization
- REST API Development
- AI Integration
- OCR Processing
- Graph Algorithms for Debt Simplification
- Deployment & Production Setup

---

### 💡 Split expenses. Settle smarter. Powered by AI.
