import { CheckCircle2 } from "lucide-react";

function SettlementHistory({ item }) {

  return (

    <div className="flex items-center gap-4 py-4 border-b last:border-none">

      <CheckCircle2
        className="text-green-500"
        size={22}
      />

      <div>

        <p className="font-medium text-gray-700">

          {item.text}

        </p>

        <p className="text-sm text-gray-400">

          Completed recently

        </p>

      </div>

    </div>

  );

}

export default SettlementHistory;