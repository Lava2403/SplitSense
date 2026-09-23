import {
  X,
  Wallet,
  Smartphone,
  Landmark,
  Info,
} from "lucide-react";

function SettlementModal({
  settlement,
  paymentMethod,
  setPaymentMethod,
  amount,
  setAmount,
  transactionReference,
  setTransactionReference,
  onClose,
  onConfirm,
  loading,
}) {
  if (!settlement) {
    return null;
  }

  const maxAmount = Number(settlement.amount);

  const methods = [
    {
      value: "Cash",
      label: "Cash",
      icon: Wallet,
    },
    {
      value: "UPI",
      label: "UPI",
      icon: Smartphone,
    },
    {
      value: "Bank Transfer",
      label: "Bank Transfer",
      icon: Landmark,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/40  z-50 p-4  overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 relative mx-auto my-8">
        
        {/* Close */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800">
          Record Payment
        </h2>

        <p className="text-gray-500 mt-2">
          Record a payment to{" "}
          <span className="font-semibold text-gray-700">
            {settlement.receiver}
          </span>
        </p>

        {/* Important information */}
        <div className="mt-5 flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <Info
            size={20}
            className="text-blue-600 shrink-0 mt-0.5"
          />

          <div>
            <p className="text-sm font-semibold text-blue-800">
              No money will be transferred by SplitSense
            </p>

            <p className="text-sm text-blue-700 mt-1 leading-relaxed">
              SplitSense only records that you settled this amount.
              Any cash, UPI, or bank transfer payment must be completed
              outside the app.
            </p>
          </div>
        </div>

        {/* Outstanding amount */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mt-6">
          <p className="text-sm text-gray-500">
            Outstanding amount
          </p>

          <p className="text-3xl font-bold text-red-600 mt-1">
            ₹{maxAmount.toFixed(2)}
          </p>

          <p className="text-xs text-gray-400 mt-2">
            Group: {settlement.group}
          </p>
        </div>

        {/* Settlement amount */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount to record
          </label>

          <input
            type="number"
            min="0.01"
            max={maxAmount}
            step="0.01"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <p className="text-xs text-gray-400 mt-2">
            You can record a partial or full settlement.
          </p>
        </div>

        {/* Payment method */}
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-1">
            How was this settled?
          </p>

          <p className="text-xs text-gray-400 mb-3">
            Select the method you used outside SplitSense.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {methods.map((method) => {
              const Icon = method.icon;

              const selected =
                paymentMethod === method.value;

              return (
                <button
                  key={method.value}
                  type="button"
                  onClick={() =>
                    setPaymentMethod(method.value)
                  }
                  className={`border rounded-xl p-4 flex flex-col items-center gap-2 transition ${
                    selected
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <Icon size={22} />

                  <span className="text-sm font-medium">
                    {method.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reference */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Reference
            <span className="text-gray-400 font-normal">
              {" "}
              (Optional)
            </span>
          </label>

          <input
            type="text"
            value={transactionReference}
            onChange={(e) =>
              setTransactionReference(
                e.target.value
              )
            }
            placeholder="UPI ID / UTR / transaction ID / note"
            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-3 rounded-xl font-medium"
          >
            {loading
              ? "Recording..."
              : "Record Settlement"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettlementModal;