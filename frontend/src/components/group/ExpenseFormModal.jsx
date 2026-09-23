import { useEffect, useState } from "react";

const CATEGORIES = [
  "Food",
  "Groceries",
  "Travel",
  "Shopping",
  "Entertainment",
  "Rent & Bills",
  "Education",
  "Health",
  "Other",
];

const toCents = (value) => {
  return Math.round(Number(value) * 100);
};

const fromCents = (value) => {
  return value / 100;
};

function ExpenseFormModal({
  isOpen,
  onClose,
  onSave,
  members = [],
  currentUser,
  expense = null,
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Other");
  const [paidBy, setPaidBy] = useState("");

  const [selectedParticipants, setSelectedParticipants] =
    useState([]);

  const [splitType, setSplitType] = useState("equal");

  const [splitValues, setSplitValues] = useState({});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  if (!isOpen) return;

  const memberIds = members.map((member) =>
    String(member.id)
  );

  const defaultPayer =
    expense?.paidById ||
    members.find(
      (member) =>
        member.name === expense?.paidBy
    )?.id ||
    currentUser?.id ||
    members[0]?.id ||
    "";

  setTitle(expense?.title || "");

  setAmount(
    expense?.amount
      ? String(expense.amount)
      : ""
  );

  setDate(
    expense?.date
      ? new Date(expense.date)
          .toISOString()
          .slice(0, 10)
      : new Date()
          .toISOString()
          .slice(0, 10)
  );

  setCategory(
    expense?.category || "Other"
  );

  setPaidBy(String(defaultPayer));

  const existingParticipants =
    expense?.participantIds?.length
      ? expense.participantIds.map(String)
      : memberIds;

  setSelectedParticipants(
    existingParticipants
  );

  
  if (expense?.splits?.length) {
    const existingValues = {};

    expense.splits.forEach((split) => {
      existingValues[String(split.userId)] =
        String(split.amount);
    });

    setSplitValues(existingValues);

    


    const amounts = expense.splits.map(
      (split) => Number(split.amount)
    );

    const allEqual = amounts.every(
      (value) =>
        Math.abs(value - amounts[0]) <
        0.01
    );

    setSplitType(
      allEqual
        ? "equal"
        : "exact"
    );
  } else {
    

    setSplitValues({});
    setSplitType("equal");
  }

  setError("");
}, [
  isOpen,
  expense,
  members,
  currentUser,
]);

  if (!isOpen) return null;

  const toggleParticipant = (memberId) => {
    const id = String(memberId);

    setSelectedParticipants((current) => {
      if (current.includes(id)) {
        setSplitValues((values) => {
          const updated = { ...values };
          delete updated[id];
          return updated;
        });

        return current.filter(
          (value) => value !== id
        );
      }

      return [...current, id];
    });
  };

  const handleSplitValueChange = (
    memberId,
    value
  ) => {
    setSplitValues((current) => ({
      ...current,
      [String(memberId)]: value,
    }));
  };

  const calculateSplits = () => {
    if (!selectedParticipants.length) {
      throw new Error(
        "Select at least one participant."
      );
    }

    const totalCents = toCents(amount);

    if (!Number.isFinite(totalCents) || totalCents <= 0) {
      throw new Error(
        "Enter a valid expense amount."
      );
    }

    

    if (splitType === "equal") {
      const count =
        selectedParticipants.length;

      const baseCents = Math.floor(
        totalCents / count
      );

      const splits = selectedParticipants.map(
        (memberId, index) => {
          const cents =
            index === count - 1
              ? totalCents -
                baseCents * (count - 1)
              : baseCents;

          return {
            userId: Number(memberId),
            amount: fromCents(cents),
          };
        }
      );

      return splits;
    }

    
    if (splitType === "exact") {
      const splits = selectedParticipants.map(
        (memberId) => {
          const value =
            splitValues[String(memberId)];

          if (
            value === undefined ||
            value === ""
          ) {
            throw new Error(
              "Enter an amount for every participant."
            );
          }

          const cents = toCents(value);

          if (
            !Number.isFinite(cents) ||
            cents < 0
          ) {
            throw new Error(
              "Split amounts must be valid."
            );
          }

          return {
            userId: Number(memberId),
            amount: fromCents(cents),
          };
        }
      );

      const totalSplitCents =
        splits.reduce(
          (sum, split) =>
            sum + toCents(split.amount),
          0
        );

      if (totalSplitCents !== totalCents) {
        throw new Error(
          `Split amounts must add up to ₹${Number(
            amount
          ).toFixed(2)}.`
        );
      }

      return splits;
    }

    if (splitType === "percentage") {
      const percentages =
        selectedParticipants.map(
          (memberId) => {
            const value =
              splitValues[String(memberId)];

            if (
              value === undefined ||
              value === ""
            ) {
              throw new Error(
                "Enter a percentage for every participant."
              );
            }

            const percentage =
              Number(value);

            if (
              !Number.isFinite(percentage) ||
              percentage < 0
            ) {
              throw new Error(
                "Percentages must be valid positive numbers."
              );
            }

            return {
              userId: Number(memberId),
              percentage,
            };
          }
        );

      const totalPercentage =
        percentages.reduce(
          (sum, item) =>
            sum + item.percentage,
          0
        );

      if (
        Math.abs(totalPercentage - 100) >
        0.001
      ) {
        throw new Error(
          `Percentages must add up to 100%. Currently they add up to ${totalPercentage.toFixed(
            2
          )}%.`
        );
      }

      let assignedCents = 0;

      const splits = percentages.map(
        (item, index) => {
          let cents;

          if (
            index ===
            percentages.length - 1
          ) {
            cents =
              totalCents -
              assignedCents;
          } else {
            cents = Math.round(
              totalCents *
                (item.percentage / 100)
            );

            assignedCents += cents;
          }

          return {
            userId: item.userId,
            amount: fromCents(cents),
          };
        }
      );

      return splits;
    }

    throw new Error(
      "Invalid split type."
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !title.trim() ||
      !amount ||
      !category ||
      !paidBy ||
      selectedParticipants.length === 0
    ) {
      setError(
        "Title, amount, category, paid by, and at least one participant are required."
      );
      return;
    }

    setSaving(true);

    try {
      const splits = calculateSplits();

      await onSave({
        title: title.trim(),
        amount: Number(amount),
        category,
        expense_date: date,
        paid_by: Number(paidBy),

        participants:
          selectedParticipants.map(Number),

        splits,
      });

      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save expense."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-[480px] max-w-[90vw] shadow-xl max-h-[90vh] overflow-y-auto">

        <h2 className="text-2xl font-bold mb-6">
          {expense
            ? "Edit Expense"
            : "Add Expense"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div>
            <label className="font-medium">
              Title
            </label>

            <input
              type="text"
              className="w-full border rounded-lg p-3 mt-2"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Dinner, Uber, Groceries"
              required
            />
          </div>

          <div>
            <label className="font-medium">
              Amount
            </label>

            <input
              type="number"
              min="0.01"
              step="0.01"
              className="w-full border rounded-lg p-3 mt-2"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="Enter amount"
              required
            />
          </div>

          <div>
            <label className="font-medium">
              Category
            </label>

            <select
              className="w-full border rounded-lg p-3 mt-2 bg-white"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              required
            >
              {CATEGORIES.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium">
              Date
            </label>

            <input
              type="date"
              className="w-full border rounded-lg p-3 mt-2"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              required
            />
          </div>

          <div>
            <label className="font-medium">
              Paid by
            </label>

            <select
              className="w-full border rounded-lg p-3 mt-2 bg-white"
              value={paidBy}
              onChange={(event) =>
                setPaidBy(event.target.value)
              }
              required
            >
              <option
                value=""
                disabled
              >
                Select who paid
              </option>

              {members.map((member) => (
                <option
                  key={member.id}
                  value={member.id}
                >
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium">
              Split between
            </label>

            <div className="mt-2 space-y-2 max-h-40 overflow-auto border rounded-lg p-3">
              {members.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(
                      String(member.id)
                    )}
                    onChange={() =>
                      toggleParticipant(
                        member.id
                      )
                    }
                  />

                  <span>
                    {member.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="font-medium">
              Split type
            </label>

            <select
              className="w-full border rounded-lg p-3 mt-2 bg-white"
              value={splitType}
              onChange={(event) => {
                setSplitType(
                  event.target.value
                );
                setSplitValues({});
              }}
            >
              <option value="equal">
                Equal split
              </option>

              <option value="exact">
                Exact amounts
              </option>

              <option value="percentage">
                Percentage
              </option>
            </select>
          </div>

          {selectedParticipants.length > 0 &&
            splitType !== "equal" && (
              <div className="border rounded-lg p-4 space-y-3">

                <p className="text-sm text-gray-500">
                  {splitType === "exact"
                    ? "Enter how much each person owes."
                    : "Enter each person's percentage."}
                </p>

                {selectedParticipants.map(
                  (memberId) => {
                    const member =
                      members.find(
                        (item) =>
                          String(item.id) ===
                          String(memberId)
                      );

                    return (
                      <div
                        key={memberId}
                        className="flex items-center gap-3"
                      >
                        <span className="flex-1 font-medium">
                          {member?.name}
                        </span>

                        <div className="relative w-32">
                          <input
                            type="number"
                            min="0"
                            step={
                              splitType ===
                              "percentage"
                                ? "0.01"
                                : "0.01"
                            }
                            className="w-full border rounded-lg p-2 pr-8"
                            value={
                              splitValues[
                                String(memberId)
                              ] || ""
                            }
                            onChange={(event) =>
                              handleSplitValueChange(
                                memberId,
                                event.target.value
                              )
                            }
                            placeholder="0"
                          />

                          <span className="absolute right-3 top-2.5 text-gray-400 text-sm">
                            {splitType ===
                            "percentage"
                              ? "%"
                              : "₹"}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}

                <div className="pt-3 border-t text-sm">
                  {splitType === "exact" ? (
                    <p>
                      Total: ₹
                      {selectedParticipants
                        .reduce(
                          (sum, memberId) =>
                            sum +
                            Number(
                              splitValues[
                                String(
                                  memberId
                                )
                              ] || 0
                            ),
                          0
                        )
                        .toFixed(2)}
                      {" / "}
                      ₹
                      {Number(
                        amount || 0
                      ).toFixed(2)}
                    </p>
                  ) : (
                    <p>
                      Total:{" "}
                      {selectedParticipants
                        .reduce(
                          (sum, memberId) =>
                            sum +
                            Number(
                              splitValues[
                                String(
                                  memberId
                                )
                              ] || 0
                            ),
                          0
                        )
                        .toFixed(2)}
                      {" / 100%"}
                    </p>
                  )}
                </div>
              </div>
            )}

          {splitType === "equal" &&
            selectedParticipants.length > 0 &&
            amount && (
              <div className="border rounded-lg p-4 bg-slate-50">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Equal split
                </p>

                {(() => {
                  const totalCents =
                    toCents(amount);

                  const count =
                    selectedParticipants.length;

                  const base =
                    Math.floor(
                      totalCents / count
                    );

                  return selectedParticipants.map(
                    (memberId, index) => {
                      const member =
                        members.find(
                          (item) =>
                            String(item.id) ===
                            String(memberId)
                        );

                      const cents =
                        index === count - 1
                          ? totalCents -
                            base *
                              (count - 1)
                          : base;

                      return (
                        <div
                          key={memberId}
                          className="flex justify-between text-sm py-1"
                        >
                          <span>
                            {member?.name}
                          </span>

                          <span className="font-medium">
                            ₹
                            {fromCents(
                              cents
                            ).toFixed(2)}
                          </span>
                        </div>
                      );
                    }
                  );
                })()}
              </div>
            )}

          {error && (
            <p className="text-red-600 text-sm">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-70 transition"
            >
              {saving
                ? "Saving..."
                : expense
                ? "Save changes"
                : "Add expense"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default ExpenseFormModal;