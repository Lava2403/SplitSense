function SummaryCard({ title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
      <p className="text-gray-500">
        {title}
      </p>

      <h2 className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </h2>
    </div>
  );
}

export default SummaryCard;