function GroupCard({ name, members, totalExpense }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
      <h3 className="font-semibold text-lg">
        {name}
      </h3>

      <p className="text-gray-500 mt-1">
        {members} members
      </p>

      <p className="text-gray-500 font-medium mt-3">
        ₹{totalExpense} spent
      </p>
    </div>
  );
}

export default GroupCard;