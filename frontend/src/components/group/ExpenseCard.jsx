function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  onSettle
}) {
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">

      <div className="flex justify-between items-start">

        {/* Left Side */}

        <div className="flex items-start gap-4">

          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">
            💸
          </div>

          <div>

            <h3 className="font-semibold text-xl">
              {expense.title}
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              Paid by {expense.paidBy}
            </p>

            <p className="text-gray-400 text-sm">
              {expense.date}
            </p>

            {expense.participants && (
              <p className="text-gray-500 text-sm mt-2">
                {expense.participants.length} participants
              </p>
            )}

          </div>

        </div>

        {/* Right Side */}

        <div className="text-right">

          <p className="font-bold text-2xl">
            ₹{expense.amount}
          </p>

          <div className="flex gap-2 mt-4 justify-end">

            <button
              onClick={onEdit}
              className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm"
            >
              Edit
            </button>

            <button
              onClick={onDelete}
              className="px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-sm"
            >
              Delete
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ExpenseCard;