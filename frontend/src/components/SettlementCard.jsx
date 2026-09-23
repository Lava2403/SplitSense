import { Clock } from "lucide-react";

function SettlementCard({ settlement, onSettle }) {
  const pay = settlement.type === "pay";
  const person = pay ? settlement.receiver : settlement.payer;
  const initial = person?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-base font-semibold ${
              pay
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {initial}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-semibold text-slate-900 truncate">
                {person}
              </h2>
              <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">
                {settlement.group}
              </span>
            </div>

            <p
              className={`text-sm font-semibold mt-1 ${
                pay ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {pay
                ? `You owe ₹${Number(settlement.amount).toFixed(2)}`
                : `${person} owes you ₹${Number(settlement.amount).toFixed(2)}`}
            </p>

            <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1.5">
              <Clock size={13} />
              Pending settlement
            </div>
          </div>
        </div>

        <button
          onClick={() => pay && onSettle(settlement)}
          disabled={!pay}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
            pay
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-emerald-50 text-emerald-700 cursor-not-allowed"
          }`}
        >
          {pay ? "Record Payment" : "Awaiting Payment"}
        </button>
      </div>
    </div>
  );
}

export default SettlementCard;
