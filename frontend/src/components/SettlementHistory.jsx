import {
  CheckCircle2,
  Wallet,
  Smartphone,
  Landmark,
} from "lucide-react";

function SettlementHistory({ item }) {
  const amount = Number(item.amount || 0);

  const getMethodIcon = () => {
    if (item.paymentMethod === "Cash") {
      return <Wallet size={15} />;
    }

    if (item.paymentMethod === "UPI") {
      return <Smartphone size={15} />;
    }

    if (item.paymentMethod === "Bank Transfer") {
      return <Landmark size={15} />;
    }

    return null;
  };

  const isPaidByYou = item.type === "paid";

  const description = isPaidByYou
    ? `Recorded a settlement of ₹${amount.toFixed(
        2
      )} with ${item.receiver}`
    : `${item.payer} recorded a settlement of ₹${amount.toFixed(
        2
      )} with you`;

  return (
    <div className="flex items-start gap-4 py-4 border-b last:border-none">
      
      <div className="mt-1">
        <CheckCircle2
          className="text-green-500"
          size={22}
        />
      </div>

      <div className="flex-1">
        
        <p className="font-medium text-gray-700">
          {description}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-400">
          
          <span>
            Group: {item.group}
          </span>

          {item.paymentMethod && (
            <>
              <span>•</span>

              <span className="flex items-center gap-1">
                {getMethodIcon()}
                Recorded as {item.paymentMethod}
              </span>
            </>
          )}
        </div>

        {item.transactionReference && (
          <p className="text-xs text-gray-400 mt-1">
            Reference: {item.transactionReference}
          </p>
        )}

      </div>
    </div>
  );
}

export default SettlementHistory;