import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ExpenseList from "../components/group/ExpenseList";
import ExpenseFormModal from "../components/group/ExpenseFormModal";
import Sidebar from "../components/Sidebar";
import { getGroup } from "../api/groupApi";
import { addExpense, deleteExpense, updateExpense } from "../api/expenseApi";
import { getStoredUser } from "../utils/auth";
import { formatAmount, getUserBalances } from "../utils/balances";

function GroupPage() {
  const { id } = useParams();
  const currentUser = getStoredUser();

  const [activeTab, setActiveTab] = useState("expenses");
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const fetchGroup = async () => {
    try {
      const res = await getGroup(id);
      setGroup(res.data);
    } catch (err) {
      console.error(err);
      setGroup(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">
          Loading...
        </h1>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">
          Group Not Found
        </h1>
      </div>
    );
  }

  const expenses = group.expenses || [];
  const members = group.memberDetails?.length
    ? group.memberDetails
    : (group.members || []).map((name, index) => ({ id: name, name }));

  const totalExpense = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const expenseCount = expenses.length;

  const largestExpense = expenses.length
    ? Math.max(...expenses.map((expense) => Number(expense.amount || 0)))
    : 0;

  const { youOwe, youAreOwed, balances, netBalance } = getUserBalances(
    expenses,
    currentUser?.name
  );

  const handleSaveExpense = async (expenseData) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, expenseData);
    } else {
      await addExpense({
        ...expenseData,
        group_id: Number(id),
      });
    }

    setEditingExpense(null);
    await fetchGroup();
  };

  const handleDeleteExpense = async (expenseId) => {
    const confirmed = window.confirm("Delete this expense?");
    if (!confirmed) return;
    await deleteExpense(expenseId);
    await fetchGroup();
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar />

      <div className="flex-1 p-6">

      <div className="rounded-2xl p-8 shadow mb-6 text-white bg-gradient-to-r from-emerald-700 to-slate-800">
        <h1 className="text-4xl font-bold">
          {group.name}
        </h1>

        <p className="mt-2">
          {members.length} Members
        </p>

        <p className="text-sm mt-1 opacity-80">
          {group.description || `Group ID: ${group.id}`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">

        <div className="bg-white p-4 rounded-xl shadow ">
          <p className="text-gray-500">
            Group Total
          </p>

          <h2 className="text-2xl font-bold">
            {formatAmount(totalExpense)}
          </h2>
        </div>


        <div className="bg-white p-4 rounded-xl shadow ">
          <p className="text-gray-500">
            Expenses Logged
          </p>

          <h2 className="text-2xl font-bold">
            {expenseCount}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow ">
          <p className="text-gray-500">
            Largest Expense
          </p>

          <h2 className="text-2xl font-bold">
            {formatAmount(largestExpense)}
          </h2>
        </div>

      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500">You Owe</p>
          <h2 className="text-2xl font-bold text-red-500">{formatAmount(youOwe)}</h2>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500">You Are Owed</p>
          <h2 className="text-2xl font-bold text-emerald-600">{formatAmount(youAreOwed)}</h2>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500">Your Net</p>
          <h2 className={`text-2xl font-bold ${netBalance >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {formatAmount(netBalance)}
          </h2>
        </div>
      </div>

      <div className="flex gap-4 mb-6">

        <button
          onClick={() => {
            setEditingExpense(null);
            setShowExpenseModal(true);
          }}
          className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800"
        >
          Add Expense  +
        </button>

      </div>

      <div className="bg-white rounded-xl shadow">

        <div className="flex gap-8 px-6 pt-4 border-b">

          <button
            onClick={() =>
              setActiveTab("expenses")
            }
            className={`pb-3 ${
              activeTab === "expenses"
                ? "text-emerald-600 border-b-2 border-emerald-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            Expense Log
          </button>

          <button
            onClick={() =>
              setActiveTab("balances")
            }
            className={`pb-3 ${
              activeTab === "balances"
                ? "text-emerald-600 border-b-2 border-emerald-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            Remaining Balances
          </button>

          <button
            onClick={() =>
              setActiveTab("members")
            }
            className={`pb-3 ${
              activeTab === "members"
                ? "text-emerald-600 border-b-2 border-emerald-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            Members
          </button>

        </div>

        <div className="p-6">

          {activeTab === "expenses" && (

            <div>

              <h2 className="text-xl font-semibold mb-4">
                Expenses
              </h2>

              <ExpenseList
                expenses={expenses}
                onEdit={(expense) => {
                  setEditingExpense(expense);
                  setShowExpenseModal(true);
                }}
                onDelete={handleDeleteExpense}
              />

            </div>

          )}

          {activeTab === "balances" && (

            <div>

              <h2 className="text-xl font-semibold mb-4">
                Balances
              </h2>

              <div className="space-y-3">

                {Object.entries(
                  balances
                ).map(
                  ([person, amount]) => (

                    <div
                      key={person}
                      className="bg-gray-50 p-4 rounded-lg flex justify-between items-center"
                    >

                      <span className="font-medium">
                        {person}
                      </span>

                      <span
                        className={
                          amount > 0
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >

                        {amount > 0
                          ? `${person} owes you ₹${amount.toFixed(
                              0
                            )}`
                          : `You owe ${person} ₹${Math.abs(
                              amount
                            ).toFixed(0)}`}

                      </span>

                    </div>

                  )
                )}

                {Object.keys(
                  balances
                ).length === 0 && (

                  <div className="text-gray-500">
                    No balances pending.
                  </div>

                )}

              </div>

            </div>

          )}

          {activeTab === "members" && (

            <div>

              <h2 className="text-xl font-semibold mb-4">
                Members
              </h2>

              <div className="space-y-3">

                {members.map(
                  (member) => (

                    <div
                      key={member.id || member.name || member}
                      className="bg-gray-50 p-3 rounded-lg"
                    >
                      <p className="font-medium">{member.name || member}</p>
                      {member.email && (
                        <p className="text-sm text-gray-500">{member.email}</p>
                      )}
                    </div>

                  )
                )}

              </div>

            </div>

          )}

        </div>

      </div>

      <ExpenseFormModal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        members={group.memberDetails || []}
        currentUser={currentUser}
        expense={editingExpense}
      />

      </div>
    </div>
  );
}

export default GroupPage;
