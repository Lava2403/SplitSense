function SettlementSummaryCard({
  title,
  amount,
  color,
  icon,
}) {
  return (

    <div className="bg-white rounded-2xl shadow-md border border-gray-200 px-5 py-4 hover:shadow-lg transition">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-gray-500 font-medium">

            {title}

          </p>

          <h2 className={`text-4xl font-bold mt-3 ${color}`}>

            ₹{amount}

          </h2>

        </div>

        <div className="bg-gray-100 rounded-full p-4">

          {icon}

        </div>

      </div>

    </div>

  );
}

export default SettlementSummaryCard;