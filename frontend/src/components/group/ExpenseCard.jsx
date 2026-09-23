import { formatExpenseDate } from "../../utils/balances";

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

          

          <div>

            <h3 className="font-semibold text-xl">
              {expense.title}
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              Paid by {expense.paidBy}
            </p>

            <p className="text-gray-400 text-sm">
              {formatExpenseDate(expense.date)}
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
              className="px-3 py-1 rounded-lg bg-black text-white hover:bg-gray-600 text-sm"
            >
              Edit
            </button>

            <button
              onClick={onDelete}
              className="px-3 py-1 rounded-lg bg-black text-white hover:bg-gray-600 text-sm"
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