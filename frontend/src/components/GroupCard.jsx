import { useNavigate } from "react-router-dom";

function GroupCard({ id, name, members, totalExpense }) {
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
    </div>
  );
}

export default GroupCard;