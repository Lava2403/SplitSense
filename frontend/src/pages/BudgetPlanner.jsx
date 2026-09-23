import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";

import {
  getExpenses,
} from "../api/expenseApi";

import {
  getStoredUser,
} from "../utils/auth";

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

  const [
    monthlyBudget,
    setMonthlyBudget,
  ] = useState("");

  const [
    selectedCategories,
    setSelectedCategories,
  ] = useState([
    "Food",
    "Travel",
    "Shopping",
    "Entertainment",
    "Groceries",
    "Bills",
  ]);

  const [plan, setPlan] =
    useState(null);

  const user =
    getStoredUser();


  /* -----------------------------------------
     LOAD EXPENSES
  ------------------------------------------ */

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


  /* -----------------------------------------
     SPENDING ANALYSIS
  ------------------------------------------ */

  const analysis =
    useMemo(() => {
      return analyzeSpending(
        expenses,
        user?.name,
        6
      );
    }, [
      expenses,
      user?.name,
    ]);


  /* -----------------------------------------
     CATEGORY TOGGLE
  ------------------------------------------ */

  const toggleCategory =
    (category) => {
      setSelectedCategories(
        (current) => {
          if (
            current.includes(
              category
            )
          ) {
            return current.filter(
              (item) =>
                item !== category
            );
          }

          return [
            ...current,
            category,
          ];
        }
      );
    };


  /* -----------------------------------------
     GENERATE PLAN
  ------------------------------------------ */

  const handleGeneratePlan =
    () => {
      const budget =
        Number(
          monthlyBudget
        );

      if (
        !budget ||
        budget <= 0
      ) {
        alert(
          "Please enter a valid monthly budget."
        );

        return;
      }

      if (
        selectedCategories.length ===
        0
      ) {
        alert(
          "Please select at least one category."
        );

        return;
      }

      const newPlan =
        generateBudgetPlan({
          monthlyBudget:
            budget,

          expenses,

          userName:
            user?.name,

          selectedCategories,
        });

      setPlan(newPlan);
    };


  if (loading) {
    return (
      <div
  className="flex min-h-screen"
  style={{
    background:
      "radial-gradient(circle at 82% 8%, rgba(16,185,129,0.18), transparent 35%), linear-gradient(120deg, #0F172A 0%, #172033 38%, #1E293B 68%, #0F2B46 100%)"
  }}
>
        Analyzing your spending habits...
      </div>
    );
  }


  const biggestCategory =
    Object.entries(
      analysis.categoryAnalysis
    )
      .sort(
        (a, b) =>
          b[1].average -
          a[1].average
      )[0];


  return (
    <div
  className="flex min-h-screen"
  style={{
    background:
      "radial-gradient(circle at 82% 8%, rgba(16,185,129,0.18), transparent 35%), linear-gradient(120deg, #0F172A 0%, #172033 38%, #1E293B 68%, #0F2B46 100%)"
  }}
>

      <Sidebar />

      <main className="flex-1 p-8">

        {/* HEADER */}

        <div className="rounded-2xl shadow mb-8 p-8 text-white bg-gradient-to-r from-emerald-700 to-slate-800">

          <h1 className="text-4xl font-bold">
            Smart Budget Planner
          </h1>

          <p className="mt-2 text-white/80">
            A realistic budget based on your
            past spending habits, recurring
            costs, and current priorities.
          </p>

        </div>


        {/* ANALYSIS CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-gray-500">
              Average Monthly Spending
            </p>

            <h2 className="text-3xl font-bold text-emerald-700 mt-2">
              ₹
              {analysis.averageMonthlySpending
                .toFixed(0)
                .toLocaleString()}
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              Based on up to 6 months
              of spending history
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
              Across
              {" "}
              {analysis.monthsAnalyzed || 0}
              {" "}
              months of available data
            </p>

          </div>


          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-gray-500">
              Biggest Spending Area
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-3">

              {biggestCategory
                ? biggestCategory[0]
                : "No data"}

            </h2>

            <p className="text-sm text-gray-400 mt-2">

              {biggestCategory
                ? `Average ₹${Math.round(
                    biggestCategory[1].average
                  ).toLocaleString()} per month`
                : "Add expenses to build insights"}

            </p>

          </div>

        </div>


        {/* BUDGET INPUT */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <h2 className="text-2xl font-bold text-slate-800">
            Create Your Budget
          </h2>

          <p className="text-gray-500 mt-1">
            Enter the amount you realistically
            have available this month.
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


          {/* CATEGORY SELECTION */}

          <div className="mt-8">

            <h3 className="font-semibold text-lg">
              What will you spend on?
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              Select the categories relevant
              to your upcoming month.
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

                      {selected
                        ? "✓ "
                        : ""}

                      {category}

                    </button>
                  );
                }
              )}

            </div>

          </div>


          <button
            onClick={
              handleGeneratePlan
            }
            className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Generate Smart Budget
          </button>

        </div>


        {/* GENERATED PLAN */}

        {plan && (

          <div className="space-y-8">

            {/* SUMMARY */}

            <div className="bg-white rounded-2xl shadow p-8">

              <div className="flex flex-col md:flex-row md:justify-between gap-6">

                <div>

                  <h2 className="text-2xl font-bold">
                    Your Recommended Budget
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Fixed and essential costs
                    are prioritized before
                    flexible spending.
                  </p>

                </div>


                <div className="grid grid-cols-2 gap-6">

                  <div>

                    <p className="text-sm text-gray-500">
                      Budget
                    </p>

                    <p className="text-xl font-bold">
                      ₹
                      {plan.monthlyBudget
                        .toLocaleString()}
                    </p>

                  </div>


                  <div>

                    <p className="text-sm text-gray-500">
                      Safety Buffer
                    </p>

                    <p className="text-xl font-bold text-emerald-600">
                      ₹
                      {plan.remaining
                        .toLocaleString()}
                    </p>

                  </div>

                </div>

              </div>


              {/* CATEGORY CARDS */}

              <div className="space-y-4 mt-8">

                {plan.categories.map(
                  (item) => {

                    const percentage =
                      plan.monthlyBudget > 0
                        ? (
                            item.suggested /
                            plan.monthlyBudget
                          ) * 100
                        : 0;

                    return (

                      <div
                        key={item.category}
                        className="border rounded-xl p-5"
                      >

                        <div className="flex flex-col md:flex-row md:justify-between gap-4">

                          <div>

                            <div className="flex items-center gap-2">

                              <h3 className="font-semibold text-lg">
                                {item.category}
                              </h3>

                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  item.costType ===
                                  "Fixed"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {item.costType}
                              </span>

                            </div>


                            <p className="text-sm text-gray-500 mt-2">

                              Historical average:
                              {" "}
                              ₹
                              {item.historicalAverage
                                .toLocaleString()}

                            </p>


                            <p className="text-sm text-gray-400">

                              Trend:
                              {" "}

                              <span className="capitalize">
                                {item.trend}
                              </span>

                            </p>

                          </div>


                          <div className="text-left md:text-right">

                            <p className="text-2xl font-bold text-emerald-700">

                              ₹
                              {item.suggested
                                .toLocaleString()}

                            </p>

                            <p className="text-xs text-gray-500">
                              Recommended budget
                            </p>

                          </div>

                        </div>


                        <div className="w-full bg-slate-200 rounded-full h-2 mt-4">

                          <div
                            className="bg-emerald-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                percentage,
                                100
                              )}%`,
                            }}
                          />

                        </div>


                        {item.trend ===
                          "increasing" && (

                          <p className="text-sm text-orange-600 mt-3">

                            Your spending has been
                            increasing recently, so
                            this recommendation has
                            been adjusted upward.

                          </p>

                        )}


                        {item.costType ===
                          "Fixed" && (

                          <p className="text-sm text-blue-600 mt-3">

                            This looks like a
                            recurring and relatively
                            predictable expense.

                          </p>

                        )}

                      </div>

                    );
                  }
                )}

              </div>

            </div>


            {/* SMART INSIGHTS */}

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8">

              <h2 className="text-xl font-bold text-emerald-900">
                Smart Insights
              </h2>

              <p className="text-sm text-emerald-700 mt-1">
                Recommendations generated from
                your actual spending pattern.
              </p>


              <div className="space-y-3 mt-5">

                {plan.insights.length > 0 ? (

                  plan.insights.map(
                    (insight, index) => (

                      <div
                        key={index}
                        className="bg-white/70 rounded-xl p-4 text-emerald-900"
                      >
                        💡
                        {" "}
                        {insight}
                      </div>

                    )
                  )

                ) : (

                  <div className="bg-white/70 rounded-xl p-4 text-emerald-900">

                    Add more expense history to
                    receive more personalised
                    recommendations.

                  </div>

                )}

              </div>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default BudgetPlanner;