import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMonthlyInsights } from "../api/aiInsightsApi";

function AIInsightSnapshot() {
  const navigate = useNavigate();

  const hasLoaded = useRef(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasLoaded.current) {
      return;
    }

    hasLoaded.current = true;

    const loadInsights = async () => {
      try {
        setLoading(true);
        setError("");

        const now = new Date();

        const month = `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}`;

        const response = await getMonthlyInsights(month);

        if (response?.success && response?.data) {
          setData(response.data);
        } else {
          setError(
            response?.message ||
              "Unable to load spending insights."
          );
        }
      } catch (err) {
        console.error(
          "Unable to load AI snapshot:",
          err
        );

        console.error(
          "Backend response:",
          err.response?.data
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load spending insights."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  if (loading) {
    return (
      <section className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 text-lg">
            ✦
          </span>

          <h2 className="text-xl font-semibold text-slate-900">
            AI Spending Insights
          </h2>
        </div>

        <p className="text-sm text-slate-500 mt-1">
          Analyzing your spending...
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="h-20 bg-white rounded-lg animate-pulse" />
          <div className="h-20 bg-white rounded-lg animate-pulse" />
          <div className="h-20 bg-white rounded-lg animate-pulse" />
        </div>

        <div className="h-16 bg-white rounded-lg mt-4 animate-pulse" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 text-lg">
            ✦
          </span>

          <h2 className="text-xl font-semibold text-slate-900">
            AI Spending Insights
          </h2>
        </div>

        <p className="text-sm text-slate-500 mt-1">
          Your personalized spending analysis
        </p>

        <div className="mt-5 bg-white border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">
            Unable to load AI insights right now.
          </p>

          <p className="text-xs text-slate-400 mt-2 break-words">
            {error}
          </p>
        </div>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const { analytics, insights } = data;

  return (
    <section className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5">

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 text-lg">
                ✦
              </span>

              <h2 className="text-xl font-semibold text-slate-900">
                AI Spending Insights
              </h2>
            </div>

            <p className="text-sm text-slate-500 mt-1">
              A quick look at your spending this month
            </p>
          </div>

          <button
            onClick={() => navigate("/insights")}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 whitespace-nowrap"
          >
            View details →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">
              Total Spent
            </p>

            <p className="text-xl font-bold text-slate-900 mt-1">
              ₹
              {Number(
                analytics?.totalSpent || 0
              ).toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">
              Monthly Change
            </p>

            <p
              className={`text-xl font-bold mt-1 ${
                Number(
                  analytics?.changePercent || 0
                ) <= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {Number(
                analytics?.changePercent || 0
              ) > 0
                ? "+"
                : ""}
              {analytics?.changePercent ?? 0}%
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">
              Top Category
            </p>

            <p className="text-base font-bold text-slate-900 mt-1 truncate">
              {analytics?.topCategory?.category ||
                "None"}
            </p>
          </div>

        </div>

        <div className="mt-5 pt-5 border-t border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-1">
            AI Summary
          </p>

          <p className="text-sm text-slate-600 leading-6">
            {insights?.summary ||
              "No summary available."}
          </p>
        </div>

      </div>
    </section>
  );
}

export default AIInsightSnapshot;