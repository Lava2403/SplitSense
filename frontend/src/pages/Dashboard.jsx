import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import SummaryCard from "../components/SummaryCard";
import ExpenseItem from "../components/ExpenseItem";
import GroupCard from "../components/GroupCard";
import { getExpenses } from "../api/expenseApi";
import { getGroups } from "../api/groupApi";
import { getStoredUser } from "../utils/auth";
import {
  buildInsights,
  formatAmount,
  getGroupTotals,
  getUserBalances,
} from "../utils/balances";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const user = getStoredUser();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [expenseRes, groupRes] = await Promise.all([
          getExpenses(),
          getGroups(),
        ]);
        setExpenses(expenseRes.data || []);
        setGroups(groupRes.data || []);
      } catch (err) {
        console.error(err);
      }
    }

    loadDashboard();
  }, []);

  const { youOwe, youAreOwed } = getUserBalances(expenses, user?.name);
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );
  const recentExpenses = expenses.slice(0, 5);
  const recentGroups = groups.slice(0, 3);
  const insights = buildInsights({
    expenses,
    youOwe,
    youAreOwed,
    userName: user?.name,
  });

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
            value={formatAmount(totalAmount)}
            color="text-green-600"
          />

          <SummaryCard
            title="You Owe"
            value={formatAmount(youOwe)}
            color="text-red-500"
          />

          <SummaryCard
            title="You Are Owed"
            value={formatAmount(youAreOwed)}
            color="text-blue-600"
          />

        </div>

        <div className="grid grid-cols-3 gap-6 mt-10">

          <div className="col-span-2 bg-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-6">
              Recent Expenses
            </h2>

            {recentExpenses.length === 0 ? (
              <p className="text-gray-500">No expenses yet.</p>
            ) : (
              recentExpenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  title={expense.title}
                  amount={expense.amount}
                  subtitle={`${expense.groupName || "Group"} · Paid by ${expense.paidBy}`}
                />
              ))
            )}

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-4">
              AI Insights
            </h2>

            <div className="space-y-3">
              {insights.map((insight) => (
                <p
                  key={insight}
                  className="text-sm text-gray-600 bg-emerald-50 rounded-lg p-3"
                >
                  {insight}
                </p>
              ))}
            </div>

          </div>

        </div>

        <div className="mt-10">

          <h2 className="text-2xl font-bold mb-6">
            Recent Groups
          </h2>

          {recentGroups.length === 0 ? (
            <p className="text-gray-500">Create a group to get started.</p>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {recentGroups.map((group) => {
                const totals = getGroupTotals(group, user?.name);

                return (
                  <GroupCard
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    members={totals.memberCount}
                    totalExpense={totals.totalExpense.toFixed(0)}
                    youOwe={totals.youOwe}
                    youAreOwed={totals.youAreOwed}
                    expenseCount={totals.expenseCount}
                  />
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
