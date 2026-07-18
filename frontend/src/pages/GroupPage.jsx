import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ExpenseList from "../components/group/ExpenseList";
import groupBg from "../assets/pic.png";
import { getGroup } from "../api/groupApi";

function GroupPage() {
  const { id } = useParams();

  const [activeTab, setActiveTab] =
    useState("expenses");

  const currentUser = "Lavanya";

  const [group, setGroup] = useState(null);

useEffect(() => {
  async function fetchGroup() {
    try {
      const res = await getGroup(id);
      setGroup(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  fetchGroup();
}, [id]);

  if (group === null) {
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

  // -----------------------------------
  // GROUP STATS
  // -----------------------------------

  const totalExpense =
    group.expenses.reduce(
      (sum, expense) =>
        sum + expense.amount,
      0
    );

  const expenseCount =
    group.expenses.length;

  const largestExpense =
    Math.max(
      ...group.expenses.map(
        (expense) => expense.amount
      )
    );

  // -----------------------------------
  // BALANCE CALCULATION
  // -----------------------------------

  let youOwe = 0;
  let youAreOwed = 0;

  const balances = {};

  group.expenses.forEach((expense) => {

    const share =
      expense.amount /
      expense.participants.length;

    if (
      expense.paidBy === currentUser
    ) {

      expense.participants.forEach(
        (person) => {

          if (
            person !== currentUser
          ) {

            balances[person] =
              (balances[person] || 0)
              + share;

            youAreOwed += share;
          }
        }
      );
    }

    else if (
      expense.participants.includes(
        currentUser
      )
    ) {

      balances[
        expense.paidBy
      ] =
        (balances[
          expense.paidBy
        ] || 0)
        - share;

      youOwe += share;
    }

  });

  const netBalance =
    youAreOwed - youOwe;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}

      <div
        className="rounded-2xl p-8 shadow mb-6 text-white bg-cover bg-center"
        style={{
          backgroundImage: `url(${groupBg})`
        }}
      >
        <h1 className="text-4xl font-bold">
          {group.name}
        </h1>

        <p className="mt-2">
          {group.members.length} Members
        </p>

        <p className="text-sm mt-1 opacity-80">
          Group ID: {group.id}
        </p>
      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-3 gap-4 mb-6">

        <div className="bg-white p-4 rounded-xl shadow ">
          <p className="text-gray-500">
            Group Total
          </p>

          <h2 className="text-2xl font-bold">
            ₹{totalExpense}
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
            ₹{largestExpense}
          </h2>
        </div>

      </div>

      {/* Action Buttons */}

      <div className="flex gap-4 mb-6">

        <button className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800">
          Add Expense  +
        </button>

      </div>

      {/* Tabs */}

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

          {/* Expenses */}

          {activeTab === "expenses" && (

            <div>

              <h2 className="text-xl font-semibold mb-4">
                Expenses
              </h2>

              <ExpenseList
                expenses={group.expenses}
              />

            </div>

          )}

          {/* Balances */}

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

          {/* Members */}

          {activeTab === "members" && (

            <div>

              <h2 className="text-xl font-semibold mb-4">
                Members
              </h2>

              <div className="space-y-3">

                {group.members.map(
                  (member) => (

                    <div
                      key={member}
                      className="bg-gray-50 p-3 rounded-lg"
                    >
                      {member}
                    </div>

                  )
                )}

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default GroupPage;