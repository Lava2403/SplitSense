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

  return (
    <div
      onClick={() => navigate(`/group/${id}`)}
      className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
    >
      <h3 className="font-semibold text-lg">
        {name}
      </h3>

      <p className="text-gray-500 mt-1">
        {members} members
      </p>

      <p className="text-gray-500 font-medium mt-3">
        ₹{totalExpense} spent
      </p>

      {(youOwe !== undefined || youAreOwed !== undefined) && (
        <div className="mt-3 text-sm space-y-1">
          <p className="text-red-500">You owe ₹{Number(youOwe || 0).toFixed(0)}</p>
          <p className="text-emerald-600">
            You are owed ₹{Number(youAreOwed || 0).toFixed(0)}
          </p>
        </div>
      )}

      {expenseCount !== undefined && (
        <div className="mt-4">
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
            {expenseCount} Expenses
          </span>
        </div>
      )}
    </div>
  );
}

export default GroupCard;