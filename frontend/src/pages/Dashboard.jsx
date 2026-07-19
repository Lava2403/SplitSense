import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import SummaryCard from "../components/SummaryCard";
import ExpenseItem from "../components/ExpenseItem";
import { getExpenses } from "../api/expenseApi";
import { getStoredUser } from "../utils/auth";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();

  useEffect(() => {
    async function loadExpenses() {
      try {
        const res = await getExpenses();
        setExpenses(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadExpenses();
  }, []);

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">
              Welcome back, {user?.name || "User"}
            </h1>
            <p className="text-gray-500 mt-1">
              Here&apos;s your expense overview
            </p>
          </div>

          <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard
            title="Total Expenses"
            value={expenses.length}
            color="text-emerald-600"
          />
          <SummaryCard
            title="Total Amount"
            value={`₹${totalAmount}`}
            color="text-blue-600"
          />
          <SummaryCard
            title="Active Groups"
            value={new Set(expenses.map((e) => e.groupName)).size}
            color="text-violet-600"
          />
        </div>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mt-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">Recent Expenses</h2>

          {loading ? (
            <p className="text-gray-500">Loading expenses...</p>
          ) : expenses.length === 0 ? (
            <p className="text-gray-500">No expenses yet. Create a group to get started.</p>
          ) : (
            expenses.slice(0, 8).map((expense) => (
              <ExpenseItem
                key={`${expense.groupId}-${expense.id}`}
                title={expense.title}
                amount={expense.amount}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
