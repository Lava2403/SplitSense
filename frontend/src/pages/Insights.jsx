import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getMonthlyInsights } from "../api/aiInsightsApi";

function Insights() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMonthlyInsights(month);

      if (!response.success) {
        throw new Error(response.message || "Unable to load insights.");
      }

      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load insights."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [month]);

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const formatMonth = (value) => {
    const date = new Date(`${value}-01`);
    return date.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar />

      <main
        className="flex-1 min-w-0 p-6 md:p-8"
        style={{
          background:
            "radial-gradient(circle at 82% 8%, rgba(16,185,129,0.12), transparent 35%), linear-gradient(120deg, #0F172A 0%, #172033 38%, #1E293B 68%, #0F2B46 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div
            className="rounded-2xl p-7 mb-7 text-white"
            style={{
              background:
                "linear-gradient(120deg, #047857 0%, #123A3A 45%, #172033 100%)",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <p className="text-emerald-300 text-sm font-semibold uppercase tracking-wider">
                  AI Powered
                </p>

                <h1 className="text-3xl md:text-4xl font-bold mt-1">
                  Spending Insights
                </h1>

                <p className="text-slate-200 mt-2">
                  Understand your spending patterns and get personalized
                  observations.
                </p>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-2">
                  Select month
                </label>

                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="bg-white text-slate-800 rounded-lg px-4 py-2.5 font-medium outline-none"
                />
              </div>
            </div>
          </div>

          {loading && (
            <div className="bg-white rounded-2xl p-10 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto" />
              <p className="text-slate-500 mt-4">
                Analyzing your spending...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">
              {error}
              <button
                onClick={fetchInsights}
                className="ml-4 underline font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Overview cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Total Spent</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {formatCurrency(data.analytics.totalSpent)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatMonth(data.analytics.month)}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Compared to Previous Month
                  </p>

                  <p
                    className={`text-2xl font-bold mt-2 ${
                      data.analytics.changePercent <= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {data.analytics.changePercent > 0 ? "+" : ""}
                    {data.analytics.changePercent}%
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Previous:{" "}
                    {formatCurrency(data.analytics.previousMonthSpent)}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Expenses</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {data.analytics.expenseCount}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Previous: {data.analytics.previousExpenseCount}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Top Category</p>
                  <p className="text-xl font-bold text-slate-900 mt-2">
                    {data.analytics.topCategory?.category || "None"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {data.analytics.topCategory
                      ? `${data.analytics.topCategory.percentage}% of spending`
                      : "No data"}
                  </p>
                </div>
              </div>

              {/* Category + AI summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-7">

                {/* Categories */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">
                    Spending by Category
                  </h2>

                  <p className="text-sm text-slate-500 mt-1 mb-6">
                    Where your money went this month.
                  </p>

                  <div className="space-y-5">
                    {data.analytics.categories.map((item) => (
                      <div key={item.category}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-slate-700">
                            {item.category}
                          </span>

                          <span className="text-sm font-semibold text-slate-900">
                            {formatCurrency(item.amount)} · {item.percentage}%
                          </span>
                        </div>

                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${Math.min(item.percentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}

                    {data.analytics.categories.length === 0 && (
                      <p className="text-slate-400 text-sm">
                        No category data available.
                      </p>
                    )}
                  </div>
                </div>

                {/* AI summary */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 text-lg">✦</span>
                    <h2 className="text-lg font-bold text-slate-900">
                      AI Summary
                    </h2>
                  </div>

                  <p className="text-slate-600 leading-7 mt-5">
                    {data.insights.summary}
                  </p>

                  <div className="border-t border-slate-100 mt-6 pt-5">
                    <p className="text-xs uppercase tracking-wider font-semibold text-emerald-600">
                      Key Observation
                    </p>

                    <p className="text-slate-700 mt-2 leading-6">
                      {data.insights.keyObservation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Areas + Positive */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-7">

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">
                    Areas for Improvement
                  </h2>

                  <div className="space-y-5 mt-5">
                    {data.insights.areasForImprovement?.length ? (
                      data.insights.areasForImprovement.map((item, index) => (
                        <div
                          key={`${item.category}-${index}`}
                          className="border-l-4 border-amber-400 pl-4"
                        >
                          <p className="font-semibold text-slate-800">
                            {item.category}
                          </p>

                          <p className="text-sm text-slate-600 mt-1">
                            {item.observation}
                          </p>

                          <p className="text-sm text-slate-500 mt-2">
                            <span className="font-semibold text-slate-700">
                              Suggestion:
                            </span>{" "}
                            {item.suggestion}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No specific improvement areas were identified.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">
                    Positive Observations
                  </h2>

                  <div className="space-y-3 mt-5">
                    {data.insights.positiveObservations?.map(
                      (observation, index) => (
                        <div
                          key={index}
                          className="flex gap-3 items-start"
                        >
                          <span className="text-emerald-600 font-bold">
                            ✓
                          </span>

                          <p className="text-sm text-slate-600 leading-6">
                            {observation}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-7">
                <h2 className="text-lg font-bold text-slate-900">
                  Actionable Tips
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  {data.insights.actionableTips?.map((tip, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                    >
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>

                        <p className="text-sm text-slate-600 leading-6">
                          {tip}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center pb-4">
                Insights are generated using SplitSense expense data.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Insights;