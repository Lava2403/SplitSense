import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getExpenses } from "../api/expenseApi";
import { getStoredUser } from "../utils/auth";

import {
  DEFAULT_CATEGORIES,
  analyzeSpending,
  generateBudgetPlan,
} from "../utils/budgetPlanner";

function BudgetPlanner() {
  const [expenses, setExpenses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [monthlyBudget, setMonthlyBudget] =
    useState("");

  const [selectedCategories, setSelectedCategories] =
    useState([
      "Food",
      "Travel",
      "Shopping",
      "Entertainment",
      "Groceries",
    ]);

  const [plan, setPlan] =
    useState(null);

  const user =
    getStoredUser();

  useEffect(() => {
    async function loadExpenses() {
      try {
        const response =
          await getExpenses();

        setExpenses(
          response.data || []
        );
      } catch (error) {
        console.error(
          "Failed to load expenses:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadExpenses();
  }, []);

  const analysis = useMemo(() => {
    return analyzeSpending(
      expenses,
      user?.name
    );
  }, [expenses, user?.name]);

  const toggleCategory = (category) => {
    setSelectedCategories((current) => {
      if (current.includes(category)) {
        return current.filter(
          (item) =>
            item !== category
        );
      }

      return [
        ...current,
        category,
      ];
    });
  };

  const handleGeneratePlan = () => {
    const budget =
      Number(monthlyBudget);

    if (!budget || budget <= 0) {
      alert(
        "Please enter a valid monthly budget."
      );

      return;
    }

    if (
      selectedCategories.length === 0
    ) {
      alert(
        "Please select at least one spending category."
      );

      return;
    }

    const newPlan =
      generateBudgetPlan({
        monthlyBudget: budget,
        expenses,
        userName: user?.name,
        selectedCategories,
      });

    setPlan(newPlan);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading your spending data...
      </div>
    );
  }

  return (
    <div className="flex bg-slate-100 min-h-screen">

      <Sidebar />

      <main className="flex-1 p-8">

        <div className="rounded-2xl shadow mb-8 p-8 text-white bg-gradient-to-r from-emerald-700 to-slate-800">

          <h1 className="text-4xl font-bold">
            Smart Budget Planner
          </h1>

          <p className="mt-2 text-white/80">
            Build a monthly spending plan
            based on your actual habits.
          </p>

        </div>

        {/* PAST SPENDING */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-gray-500">
              Your Spending
            </p>

            <h2 className="text-3xl font-bold text-emerald-700 mt-2">
              ₹
              {analysis.totalSpent.toFixed(0)}
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              Based on the last 30 days
            </p>

          </div>

          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-gray-500">
              Expenses Analyzed
            </p>

            <h2 className="text-3xl font-bold text-slate-800 mt-2">
              {analysis.expenseCount}
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              Group expenses you participated in
            </p>

          </div>

          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-gray-500">
              Biggest Spending Area
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-3">
              {
                Object.entries(
                  analysis.categoryTotals
                ).sort(
                  (a, b) =>
                    b[1] - a[1]
                )[0]?.[0] || "No data"
              }
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              Based on your recent expenses
            </p>

          </div>

        </div>

        {/* BUDGET INPUT */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold text-slate-800">
            Plan Your Month
          </h2>

          <p className="text-gray-500 mt-1">
            Tell us your available monthly
            spending budget.
          </p>

          <div className="mt-6">

            <label className="block font-medium mb-2">
              Monthly Budget
            </label>

            <div className="relative max-w-md">

              <span className="absolute left-4 top-3 text-gray-500">
                ₹
              </span>

              <input
                type="number"
                min="0"
                placeholder="For example, 15000"
                value={monthlyBudget}
                onChange={(event) =>
                  setMonthlyBudget(
                    event.target.value
                  )
                }
                className="w-full border rounded-xl pl-8 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />

            </div>

          </div>

          <div className="mt-8">

            <h3 className="font-semibold text-lg">
              Where do you expect to spend?
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              Select the categories that are
              relevant to you this month.
            </p>

            <div className="flex flex-wrap gap-3 mt-4">

              {DEFAULT_CATEGORIES.map(
                (category) => {
                  const selected =
                    selectedCategories.includes(
                      category
                    );

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        toggleCategory(
                          category
                        )
                      }
                      className={`px-4 py-2 rounded-full border transition ${
                        selected
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-slate-600 hover:border-emerald-500"
                      }`}
                    >
                      {category}
                    </button>
                  );
                }
              )}

            </div>

          </div>

          <button
            onClick={handleGeneratePlan}
            className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Generate My Budget Plan
          </button>

        </div>

        {/* GENERATED PLAN */}

        {plan && (

          <div className="bg-white rounded-2xl shadow p-8">

            <div className="flex justify-between items-start mb-8">

              <div>

                <h2 className="text-2xl font-bold">
                  Your Recommended Budget
                </h2>

                <p className="text-gray-500 mt-1">
                  Based on your previous
                  spending behaviour.
                </p>

              </div>

              <div className="text-right">

                <p className="text-gray-500 text-sm">
                  Total Budget
                </p>

                <p className="text-2xl font-bold text-emerald-700">
                  ₹
                  {plan.monthlyBudget.toLocaleString()}
                </p>

              </div>

            </div>

            <div className="space-y-4">

              {plan.categories.map(
                (item) => {

                  const percentage =
                    plan.monthlyBudget > 0
                      ? (
                          item.suggested /
                          plan.monthlyBudget
                        ) *
                        100
                      : 0;

                  return (

                    <div
                      key={item.category}
                      className="border rounded-xl p-5"
                    >

                      <div className="flex justify-between">

                        <div>

                          <h3 className="font-semibold text-lg">
                            {item.category}
                          </h3>

                          <p className="text-sm text-gray-500">
                            Last month: ₹
                            {item.pastSpent.toLocaleString()}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-lg font-bold text-slate-800">
                            ₹
                            {item.suggested.toLocaleString()}
                          </p>

                          <p className="text-xs text-gray-500">
                            Suggested budget
                          </p>

                        </div>

                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-2 mt-4">

                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              percentage,
                              100
                            )}%`,
                          }}
                        />

                      </div>

                      {item.trend === "high" && (
                        <p className="text-sm text-red-500 mt-3">
                          Your recent spending in this category is higher than this suggested allocation.
                        </p>
                      )}

                      {item.trend === "low" && (
                        <p className="text-sm text-emerald-600 mt-3">
                          You usually spend relatively little in this category.
                        </p>
                      )}

                    </div>

                  );
                }
              )}

            </div>

            <div className="mt-8 p-5 bg-emerald-50 rounded-xl">

              <h3 className="font-semibold text-emerald-800">
                Smart Recommendation
              </h3>

              <p className="text-emerald-700 mt-2">

                Your recent personal spending was ₹
                {plan.totalPastSpending.toLocaleString()}.

                {plan.monthlyBudget >
                  plan.totalPastSpending
                  ? " Your new budget gives you additional room, so your allocations have been scaled based on your previous spending pattern."
                  : " Your selected budget is tighter than your recent spending, so you may need to reduce spending in your highest-spending categories."}

              </p>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default BudgetPlanner;