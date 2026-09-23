import { ArrowDownLeft, ArrowUpRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

function GroupCard({
  id,
  name,
  members,
  totalExpense,
  youOwe,
  youAreOwed,
  expenseCount,
}) {
  const navigate = useNavigate();
  const owe = Number(youOwe || 0);
  const owed = Number(youAreOwed || 0);

  return (
    <button
      onClick={() => navigate(`/group/${id}`)}
      className="w-full text-left bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Users size={19} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{name}</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {members} {members === 1 ? "member" : "members"}
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-400 whitespace-nowrap">
          {expenseCount} {expenseCount === 1 ? "expense" : "expenses"}
        </span>
      </div>

      <p className="text-slate-600 font-medium mt-5">
        ₹{Number(totalExpense || 0).toFixed(0)} spent
      </p>

      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-sm">
        <p className={`flex items-center gap-1.5 ${owe > 0 ? "text-red-500" : "text-slate-400"}`}>
          <ArrowUpRight size={15} />
          You owe ₹{owe.toFixed(0)}
        </p>
        <p className={`flex items-center gap-1.5 ${owed > 0 ? "text-emerald-600" : "text-slate-400"}`}>
          <ArrowDownLeft size={15} />
          You are owed ₹{owed.toFixed(0)}
        </p>
      </div>
    </button>
  );
}

export default GroupCard;
