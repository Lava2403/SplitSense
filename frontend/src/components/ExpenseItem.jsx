function ExpenseItem({ title, amount }) {
  return (
    <div className="flex justify-between py-3 border-b">
      <span>{title}</span>

      <span className="font-semibold">
        ₹{amount}
      </span>
    </div>
  );
}

export default ExpenseItem;