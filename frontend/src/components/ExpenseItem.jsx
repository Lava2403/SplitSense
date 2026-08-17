function ExpenseItem({ title, amount, subtitle }) {
  return (
    <div className="flex justify-between py-3 border-b">
      <div>
        <span>{title}</span>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>

      <span className="font-semibold">
        ₹{amount}
      </span>
    </div>
  );
}

export default ExpenseItem;