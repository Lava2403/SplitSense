function SettlementSummaryCard({ title, amount, color, icon }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 hover:shadow-md transition">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <h2 className={`text-3xl font-bold mt-1 ${color}`}>
            ₹{Number(amount || 0).toFixed(0)}
          </h2>
        </div>

        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default SettlementSummaryCard;
