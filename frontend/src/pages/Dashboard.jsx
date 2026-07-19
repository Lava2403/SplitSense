import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import SummaryCard from "../components/SummaryCard";
import ExpenseItem from "../components/ExpenseItem";
import { getExpenses } from "../api/expenseApi";
import { getStoredUser } from "../utils/auth";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const user = getStoredUser();

  useEffect(() => {
    async function loadExpenses() {
      const res = await getExpenses();
      setExpenses(res.data);
    }

    loadExpenses();
  }, []);

  return (
    <div className="flex bg-slate-100 min-h-screen">

      <Sidebar />

      <div className="flex-1 p-8">

        <div className="flex justify-between items-center mb-8">

          <div>

            <h1 className="text-3xl font-bold text-emerald-800">
              Welcome Back, {user?.name || "User"}
            </h1>

            <p className="text-gray-500">
              Here's your expense overview
            </p>

          </div>

          <img
            src="https://i.pravatar.cc/40"
            alt="profile"
            className="rounded-full"
          />

        </div>

        <div className="grid grid-cols-3 gap-6">

          <SummaryCard
            title="Total Expenses"
            value={expenses.length}
            color="text-green-600"
          />

          <SummaryCard
            title="Total Amount"
            value={`₹${expenses.reduce(
              (sum, expense) => sum + expense.amount,
              0
            )}`}
            color="text-blue-600"
          />

          <SummaryCard
            title="People Involved"
            value="7"
            color="text-red-500"
          />

        </div>

        <div className="bg-white rounded-xl shadow p-6 mt-10">

          <h2 className="text-2xl font-bold mb-6">

            Recent Expenses

          </h2>

          {expenses.map((expense) => (

            <ExpenseItem
              key={expense.id}
              title={expense.title}
              amount={expense.amount}
            />

          ))}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;