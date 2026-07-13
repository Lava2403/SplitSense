import { useState } from "react";
import groupBg from "../assets/pic.png";
import { groups } from "../data/groups";

function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [expandedExpense, setExpandedExpense] =
    useState(null);

  const currentUser = "Lavanya";

  function getExpenseStatus(expense) {
    const share =
      expense.amount / expense.participants.length;

    if (expense.paidBy === currentUser) {
      const debtors =
        expense.participants.filter(
          (person) => person !== currentUser
        );

      return {
        type: "owed",
        debtors,
        share,
        color: "text-green-600"
      };
    }

    if (
      expense.participants.includes(currentUser)
    ) {
      return {
        type: "owe",
        creditor: expense.paidBy,
        share,
        color: "text-red-600"
      };
    }

    return {
      type: "none",
      color: "text-gray-500"
    };
  }

  const expenses = groups.flatMap((group) =>
    group.expenses.map((expense) => ({
      ...expense,
      group: group.name
    }))
  );

  const filteredExpenses = expenses.filter(
    (expense) => {

      const status =
        getExpenseStatus(expense);

      const matchesSearch =
        expense.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        expense.group
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        status.type === statusFilter;

      const matchesGroup =
        groupFilter === "all" ||
        expense.group === groupFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesGroup
      );
    }
  );

  return (
    <div className="min-h-screen bg-slate-100 p-8">

      {/* Header */}

      <div
        className="rounded-2xl shadow mb-8 bg-cover bg-center p-8 text-white"
        style={{
          backgroundImage: `url(${groupBg})`
        }}
      >
        <h1 className="text-4xl font-bold">
          My Expenses
        </h1>

        <p className="mt-2 text-white/80">
          All your expenses across groups
        </p>
      </div>

      {/* Filters */}

      <div className="bg-white p-4 rounded-xl shadow mb-8">

        <div className="flex gap-4 flex-wrap">

          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="flex-1 border rounded-lg px-4 py-2"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">
              All Statuses
            </option>

            <option value="owe">
              I Owe
            </option>

            <option value="owed">
              Owe Me
            </option>

          </select>

          <select
            value={groupFilter}
            onChange={(e) =>
              setGroupFilter(e.target.value)
            }
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">
              All Groups
            </option>

            {groups.map((group) => (
              <option
                key={group.id}
                value={group.name}
              >
                {group.name}
              </option>
            ))}
          </select>

        </div>

      </div>

      {/* Expense List */}

      <div className="space-y-4">

        {filteredExpenses.length === 0 ? (

          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            No expenses found.
          </div>

        ) : (

          filteredExpenses.map((expense) => {

            const status =
              getExpenseStatus(expense);

            return (

              <div
                key={`${expense.group}-${expense.id}`}
                onClick={() =>
                  setExpandedExpense(
                    expandedExpense ===
                    `${expense.group}-${expense.id}`
                      ? null
                      : `${expense.group}-${expense.id}`
                  )
                }
                className="bg-white rounded-xl shadow p-5 hover:shadow-md transition cursor-pointer"
              >

                <div className="flex justify-between items-start">

                  <div>

                    <h3 className="font-semibold text-lg">
                      {expense.title}
                    </h3>

                    <p className="text-gray-500 text-sm">
                      {expense.group}
                    </p>

                    <p className="text-gray-400 text-sm mt-2">
                      {expense.date}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="font-bold text-lg">
                      ₹{expense.amount}
                    </p>

                    {status.type === "owe" && (
                      <p className="text-red-600 text-sm">
                        You owe{" "}
                        {status.creditor} ₹
                        {status.share.toFixed(0)}
                      </p>
                    )}

                    {status.type === "owed" &&
                      status.debtors.length ===
                        1 && (
                        <p className="text-green-600 text-sm">
                          {
                            status.debtors[0]
                          }{" "}
                          owes you ₹
                          {status.share.toFixed(
                            0
                          )}
                        </p>
                      )}

                    {status.type === "owed" &&
                      status.debtors.length >
                        1 && (
                        <p className="text-green-600 text-sm">
                          {
                            status.debtors.length
                          }{" "}
                          people owe you ₹
                          {status.share.toFixed(
                            0
                          )}{" "}
                          each
                        </p>
                      )}

                  </div>

                </div>

                {/* Expanded Details */}

                {expandedExpense ===
                  `${expense.group}-${expense.id}` &&
                  status.type === "owed" &&
                  status.debtors.length >
                    1 && (

                    <div className="mt-4 pt-4 border-t">

                      <p className="font-medium mb-2">
                        Details
                      </p>

                      {status.debtors.map(
                        (person) => (
                          <p
                            key={person}
                            className="text-green-600 text-sm"
                          >
                            {person} owes you ₹
                            {status.share.toFixed(
                              0
                            )}
                          </p>
                        )
                      )}

                    </div>

                  )}

              </div>

            );
          })

        )}

      </div>

    </div>
  );
}

export default ExpensesPage;