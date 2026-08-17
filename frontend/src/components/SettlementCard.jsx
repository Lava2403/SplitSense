import { Clock } from "lucide-react";

function SettlementCard({ settlement }) {

  const pay = settlement.type === "pay";

  return (

    <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition duration-300">

      <div className="flex justify-between items-start">

        {/* Left */}

        <div className="flex gap-4">

          <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl font-bold">

            {settlement.person[0]}

          </div>

          <div>

            <h2 className="text-xl font-semibold">

              {settlement.person}

            </h2>

            <span className="inline-block mt-1 bg-emerald-100 text-emerald-700 text-sm px-3 py-1 rounded-full">

              {settlement.group}

            </span>

            <p
              className={`mt-4 text-lg font-semibold ${
                pay
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >

              {pay
                ? `You owe ₹${settlement.amount}`
                : `${settlement.person} owes you ₹${settlement.amount}`}

            </p>

            <div className="flex items-center gap-2 text-gray-400 text-sm mt-3">

              <Clock size={15} />

              Last activity 2 days ago

            </div>

          </div>

        </div>

        {/* Right */}

        <button
          className={`px-5 py-2 rounded-xl text-white font-medium transition ${
            pay
              ? "bg-red-500 hover:bg-red-600"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >

          {pay ? "Settle Up" : "Send Reminder"}

        </button>

      </div>

    </div>

  );

}

export default SettlementCard;