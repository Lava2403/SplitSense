import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Sidebar from "../components/Sidebar";
import SummaryCard from "../components/SummaryCard";
import ExpenseItem from "../components/ExpenseItem";
import AIInsightSnapshot from "../components/AiInsightSnapshot";
import { getExpenses } from "../api/expenseApi";
import { getGroups } from "../api/groupApi";
import { getPendingSettlements } from "../api/settlementApi";
import { getStoredUser } from "../utils/auth";
import {
  formatAmount,
  getGroupTotals,
} from "../utils/balances";

function Dashboard() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = getStoredUser();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [expenseRes, groupRes, settlementRes] =
          await Promise.all([
            getExpenses(),
            getGroups(),
            getPendingSettlements(),
          ]);

        setExpenses(expenseRes.data || []);
        setGroups(groupRes.data || []);
        setSettlements(settlementRes.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const youOwe = settlements
    .filter((item) => item.type === "pay")
    .reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  const youAreOwed = settlements
    .filter((item) => item.type === "receive")
    .reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  const netBalance = youAreOwed - youOwe;

  const recentExpenses = expenses.slice(0, 5);
  const recentGroups = groups.slice(0, 3);

  const balanceRows = settlements.slice(0, 5);

  const monthlySpending = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const currentYear = new Date().getFullYear();

    const totals = months.map((month) => ({
      month,
      amount: 0,
    }));

    expenses.forEach((expense) => {
      const date = new Date(expense.date);

      if (
        Number.isNaN(date.getTime()) ||
        date.getFullYear() !== currentYear
      ) {
        return;
      }

      totals[date.getMonth()].amount += Number(
        expense.amount || 0
      );
    });

    return totals;
  }, [expenses]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#172554]">
        <Sidebar />

        <div className="flex-1 flex items-center justify-center text-slate-400">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen"
      style={{
        background:
          "radial-gradient(circle at 82% 8%, rgba(16,185,129,0.18), transparent 35%), linear-gradient(120deg, #0F172A 0%, #172033 38%, #1E293B 68%, #0F2B46 100%)",
      }}
    >
      <Sidebar />

      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">

          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
            <div>
              <h1 className="text-3xl font-bold text-emerald-400">
                Welcome back, {user?.name || "User"}
              </h1>

              <p className="text-slate-400 mt-1">
                Here's your expense overview
              </p>
            </div>

            <button
              onClick={() => navigate("/expenses")}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition"
            >
              View Expenses
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SummaryCard
              title="Net Balance"
              value={formatAmount(netBalance)}
              color={
                netBalance >= 0
                  ? "text-emerald-600"
                  : "text-red-500"
              }
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

          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-6">

            <section className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Your Balances
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Current outstanding balances
                  </p>
                </div>

                <button
                  onClick={() => navigate("/settlements")}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  View all
                </button>
              </div>

              {balanceRows.length === 0 ? (
                <p className="text-sm text-slate-500 py-6">
                  You're all settled up.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {balanceRows.map((item) => {
                    const pay = item.type === "pay";
                    const person = pay
                      ? item.receiver
                      : item.payer;

                    return (
                      <div
                        key={`${item.groupId}-${item.payerId}-${item.receiverId}`}
                        className="py-1.5 px-2 -mx-2 rounded-lg flex items-center justify-between gap-4 transition-all duration-200 hover:bg-emerald-50/40 hover:border hover:border-emerald-400 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">
                            {person}
                          </p>

                          <p className="text-sm text-slate-500 truncate">
                            {item.group}
                          </p>
                        </div>

                        <p
                          className={`text-sm font-semibold whitespace-nowrap ${
                            pay
                              ? "text-red-500"
                              : "text-emerald-600"
                          }`}
                        >
                          {pay ? "You owe " : "Owes you "}
                          {formatAmount(item.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Recent Groups
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Your latest expense groups
                  </p>
                </div>

                <button
                  onClick={() => navigate("/groups")}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  View all
                </button>
              </div>

              {recentGroups.length === 0 ? (
                <p className="text-sm text-slate-500 py-3">
                  Create a group to get started.
                </p>
              ) : (
                <div className="space-y-1">
                  {recentGroups.map((group) => {
                    const totals = getGroupTotals(
                      group,
                      user?.name
                    );

                    return (
                      <button
                        key={group.id}
                        onClick={() =>
                          navigate(`/group/${group.id}`)
                        }
                        className="w-full text-left px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-emerald-50/40 hover:border hover:border-emerald-400 hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-slate-800">
                            {group.name}
                          </p>

                          <p className="text-sm text-slate-500">
                            {totals.memberCount} members
                          </p>
                        </div>

                        <span className="text-sm text-slate-500">
                          {totals.expenseCount} expenses
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <section className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-5 mt-5">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3
                size={20}
                className="text-emerald-600"
              />

              <h2 className="text-xl font-semibold text-slate-900">
                Monthly Spending
              </h2>
            </div>

            <p className="text-sm text-slate-500 mb-5">
              Total recorded expenses by month
            </p>

            <div className="h-64">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={monthlySpending}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="month" />

                  <YAxis
                    tickFormatter={(value) =>
                      `₹${value}`
                    }
                  />

                  <Tooltip
                    formatter={(value) => [
                      `₹${Number(value).toFixed(0)}`,
                      "Spent",
                    ]}
                  />

                  <Bar
                    dataKey="amount"
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="mt-5">
            <AIInsightSnapshot />
          </div>

          <section className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-5 mt-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Recent Expenses
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Your latest recorded expenses
                </p>
              </div>

              <button
                onClick={() => navigate("/expenses")}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                View all
              </button>
            </div>

            {recentExpenses.length === 0 ? (
              <p className="text-slate-500">
                No expenses yet.
              </p>
            ) : (
              <div>
                {recentExpenses.map((expense) => (
                  <ExpenseItem
                    key={expense.id}
                    title={expense.title}
                    amount={Number(expense.amount).toFixed(2)}
                    subtitle={`${expense.groupName || "Group"} · Paid by ${expense.paidBy}`}
                  />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;