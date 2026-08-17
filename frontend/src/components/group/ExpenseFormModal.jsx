import { useEffect, useState } from "react";

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
  const [paidBy, setPaidBy] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const memberIds = members.map((member) => String(member.id));
    const defaultPayer =
      expense?.paidById ||
      members.find((member) => member.name === expense?.paidBy)?.id ||
      currentUser?.id ||
      members[0]?.id ||
      "";

    setTitle(expense?.title || "");
    setAmount(expense?.amount ? String(expense.amount) : "");
    setDate(
      expense?.date
        ? new Date(expense.date).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10)
    );
    setPaidBy(String(defaultPayer));
    setSelectedParticipants(
      expense?.participantIds?.length
        ? expense.participantIds.map(String)
        : memberIds
    );
    setError("");
  }, [isOpen, expense, members, currentUser]);

  if (!isOpen) return null;

  const toggleParticipant = (memberId) => {
    const id = String(memberId);
    setSelectedParticipants((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!title.trim() || !amount || selectedParticipants.length === 0) {
      setError("Title, amount, and at least one participant are required.");
      return;
    }

    setSaving(true);

    try {
      await onSave({
        title: title.trim(),
        amount: Number(amount),
        expense_date: date,
        paid_by: Number(paidBy),
        participants: selectedParticipants.map(Number),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save expense.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-[480px] max-w-[90vw] shadow-xl">
        <h2 className="text-2xl font-bold mb-6">
          {expense ? "Edit Expense" : "Add Expense"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-medium">Title</label>
            <input
              className="w-full border rounded-lg p-3 mt-2"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="font-medium">Amount</label>
            <input
              type="number"
              min="1"
              step="0.01"
              className="w-full border rounded-lg p-3 mt-2"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="font-medium">Date</label>
            <input
              type="date"
              className="w-full border rounded-lg p-3 mt-2"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="font-medium">Paid by</label>
            <select
              className="w-full border rounded-lg p-3 mt-2"
              value={paidBy}
              onChange={(event) => setPaidBy(event.target.value)}
              required
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium">Split between</label>
            <div className="mt-2 space-y-2 max-h-40 overflow-auto">
              {members.map((member) => (
                <label key={member.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(String(member.id))}
                    onChange={() => toggleParticipant(member.id)}
                  />
                  <span>{member.name}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-70"
            >
              {saving ? "Saving..." : expense ? "Save changes" : "Add expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseFormModal;
