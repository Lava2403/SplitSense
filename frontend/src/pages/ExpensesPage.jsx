import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getExpenses } from "../api/expenseApi";
import { getGroups } from "../api/groupApi";
import { getPendingSettlements } from "../api/settlementApi";
import { getStoredUser } from "../utils/auth";

function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [expandedExpense, setExpandedExpense] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  const storedUser = getStoredUser();

  const currentUserId = Number(storedUser?.id);
  const currentUserName = storedUser?.name || "User";

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    async function loadData() {
      try {
        const [expensesRes, groupsRes, settlementRes] =
          await Promise.all([
            getExpenses(),
            getGroups(),
            getPendingSettlements(),
          ]);

        setExpenses(expensesRes.data || []);
        setGroups(groupsRes.data || []);
        setSettlements(settlementRes.data || []);
      } catch (err) {
        console.error("Failed to load expenses:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // =========================================================
  // HELPERS
  // =========================================================

  const getExpenseSplits = (expense) => {
    if (!Array.isArray(expense.splits)) {
      return [];
    }

    return expense.splits.map((split) => ({
      userId: Number(split.userId ?? split.user_id),
      amount: Number(split.amount || 0),
    }));
  };

  const getUserName = (expense, userId) => {
    const numericId = Number(userId);

    // Current user
    if (numericId === currentUserId) {
      return "You";
    }

    // Try finding the group
    const group = groups.find(
      (item) =>
        String(item.id) === String(expense.group_id)
    );

    // Try different possible member structures
    const members = group?.members || [];

    const member = members.find(
      (item) =>
        Number(item.id ?? item.user_id ?? item.userId) ===
        numericId
    );

    if (member) {
      return (
        member.name ||
        member.username ||
        member.email ||
        "Unknown"
      );
    }

    // Fallback:
    // participantIds and participants are returned from
    // the backend in corresponding arrays.
    const participantIndex =
      expense.participantIds?.findIndex(
        (id) => Number(id) === numericId
      );

    if (
      participantIndex !== undefined &&
      participantIndex >= 0 &&
      expense.participants?.[participantIndex]
    ) {
      return expense.participants[participantIndex];
    }

    return "Unknown";
  };

  // =========================================================
  // EXPENSE STATUS
  // =========================================================
  //
  // IMPORTANT:
  // We use expense.splits here.
  //
  // We DO NOT divide expense.amount by participants.length.
  //
  // Example:
  // ₹1000
  // Lavanya = ₹700
  // Nishant = ₹300
  //
  // The page will use exactly those amounts.
  // =========================================================

  const getExpenseStatus = (expense) => {
    const splits = getExpenseSplits(expense);

    if (!splits.length) {
      return {
        type: "none",
        color: "text-slate-400",
        label: "No split recorded",
      };
    }

    const paidById = Number(expense.paidById);

    // -------------------------------------------------------
    // CASE 1:
    // YOU PAID
    // -------------------------------------------------------

    if (
      paidById === currentUserId ||
      expense.paidBy === currentUserName
    ) {
      const debtors = splits
        .filter(
          (split) => split.userId !== currentUserId
        )
        .filter(
          (split) => split.amount > 0
        )
        .map((split) => ({
          name: getUserName(
            expense,
            split.userId
          ),
          amount: split.amount,
          userId: split.userId,
        }));

      if (!debtors.length) {
        return {
          type: "settled",
          color: "text-emerald-600",
          label: "✓ You paid your own share",
        };
      }

      const totalOwed = debtors.reduce(
        (sum, person) =>
          sum + Number(person.amount || 0),
        0
      );

      if (debtors.length === 1) {
        return {
          type: "owed",
          debtors,
          share: totalOwed,
          color: "text-green-600",
        };
      }

      return {
        type: "owedMultiple",
        debtors,
        share: totalOwed,
        color: "text-green-600",
      };
    }

    // -------------------------------------------------------
    // CASE 2:
    // SOMEONE ELSE PAID
    // -------------------------------------------------------

    const mySplit = splits.find(
      (split) =>
        Number(split.userId) === currentUserId
    );

    // You are not part of this expense
    if (!mySplit) {
      return {
        type: "none",
        color: "text-slate-400",
        label: "Not part of your balance",
      };
    }

    // You have no share
    if (Number(mySplit.amount) <= 0) {
      return {
        type: "settled",
        color: "text-emerald-600",
        label: "✓ No amount owed",
      };
    }

    return {
      type: "owe",
      creditor: expense.paidBy,
      share: Number(mySplit.amount),
      color: "text-red-600",
    };
  };

  // =========================================================
  // NORMALIZE EXPENSES
  // =========================================================

  const normalizedExpenses = expenses.map((expense) => ({
    ...expense,
    group: expense.groupName || "Group",
  }));

  // =========================================================
  // FILTER
  // =========================================================

  const filteredExpenses = useMemo(() => {
    return normalizedExpenses.filter((expense) => {
      const status = getExpenseStatus(expense);

      const query = search.toLowerCase();

      const matchesSearch =
        expense.title
          ?.toLowerCase()
          .includes(query) ||
        expense.group
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "owe" &&
          status.type === "owe") ||
        (statusFilter === "owed" &&
          ["owed", "owedMultiple"].includes(
            status.type
          )) ||
        (statusFilter === "settled" &&
          status.type === "settled");

      const matchesGroup =
        groupFilter === "all" ||
        expense.group === groupFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesGroup
      );
    });
  }, [
    normalizedExpenses,
    search,
    statusFilter,
    groupFilter,
    groups,
  ]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        className="flex min-h-screen"
        style={{
          background:
            "radial-gradient(circle at 82% 8%, rgba(16,185,129,0.18), transparent 35%), linear-gradient(120deg, #0F172A 0%, #172033 38%, #1E293B 68%, #0F2B46 100%)",
        }}
      >
        <Sidebar />

        <div className="flex-1 flex items-center justify-center text-slate-500">
          Loading expenses...
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div
      className="flex min-h-screen"
      style={{
        background:
          "radial-gradient(circle at 82% 8%, rgba(16,185,129,0.18), transparent 35%), linear-gradient(120deg, #0F172A 0%, #172033 38%, #1E293B 68%, #0F2B46 100%)",
      }}
    >
      <Sidebar />

      <main className="flex-1 p-6 lg:p-8">

        {/* HEADER */}
        <div className="rounded-2xl shadow-sm mb-6 px-7 py-6 text-white bg-gradient-to-r from-emerald-700 to-slate-800">
          <h1 className="text-3xl font-bold">
            My Expenses
          </h1>

          <p className="mt-1.5 text-sm text-white/80">
            All your expenses across groups
          </p>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="flex gap-3 flex-col lg:flex-row">

            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-white"
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

              <option value="settled">
                Settled
              </option>
            </select>

            <select
              value={groupFilter}
              onChange={(e) =>
                setGroupFilter(e.target.value)
              }
              className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-white"
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

        {/* EXPENSES */}
        <div className="space-y-3">

          {filteredExpenses.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
              No expenses found.
            </div>
          ) : (

            filteredExpenses.map((expense) => {

              const status =
                getExpenseStatus(expense);

              const key =
                `${expense.group}-${expense.id}`;

              return (
                <div
                  key={key}
                  onClick={() =>
                    setExpandedExpense(
                      expandedExpense === key
                        ? null
                        : key
                    )
                  }
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition cursor-pointer"
                >

                  {/* MAIN ROW */}
                  <div className="flex justify-between items-start gap-6">

                    {/* LEFT */}
                    <div className="min-w-0">

                      <h3 className="font-semibold text-lg text-slate-900">
                        {expense.title}
                      </h3>

                      <p className="text-slate-500 text-sm mt-0.5">
                        {expense.group}
                      </p>

                      <p className="text-slate-400 text-sm mt-2">
                        {new Date(
                          expense.date
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>

                      <p className="text-slate-400 text-sm mt-1">
                        Paid by{" "}
                        <span className="text-slate-600 font-medium">
                          {expense.paidBy}
                        </span>
                      </p>

                    </div>

                    {/* RIGHT */}
                    <div className="text-right shrink-0">

                      <p className="font-bold text-lg text-slate-900">
                        ₹
                        {Number(
                          expense.amount
                        ).toFixed(2)}
                      </p>

                      {/* YOU OWE */}
                      {status.type === "owe" && (
                        <p className="text-red-600 text-sm mt-1">
                          You owe{" "}
                          {status.creditor}{" "}
                          ₹
                          {status.share.toFixed(2)}
                        </p>
                      )}

                      {/* ONE PERSON OWES YOU */}
                      {status.type === "owed" && (
                        <p className="text-green-600 text-sm mt-1">
                          {status.debtors[0].name}{" "}
                          owes you ₹
                          {status.debtors[0].amount.toFixed(2)}
                        </p>
                      )}

                      {/* MULTIPLE PEOPLE */}
                      {status.type === "owedMultiple" && (
                        <p className="text-green-600 text-sm mt-1">
                          You are owed ₹
                          {status.share.toFixed(2)}
                        </p>
                      )}

                      {/* SETTLED */}
                      {status.type === "settled" && (
                        <p className="text-emerald-600 text-sm mt-1">
                          {status.label}
                        </p>
                      )}

                      {/* NOT PART */}
                      {status.type === "none" && (
                        <p className="text-slate-400 text-sm mt-1">
                          {status.label}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* EXPANDED DETAILS */}
                  {expandedExpense === key && (
                    <div className="mt-4 pt-4 border-t border-slate-100">

                      <p className="font-medium text-slate-700 mb-3">
                        Split details
                      </p>

                      <div className="space-y-2">

                        {getExpenseSplits(expense).map(
                          (split) => {

                            const name =
                              getUserName(
                                expense,
                                split.userId
                              );

                            const isCurrentUser =
                              split.userId ===
                              currentUserId;

                            return (
                              <div
                                key={split.userId}
                                className="flex justify-between items-center text-sm"
                              >

                                <span
                                  className={
                                    isCurrentUser
                                      ? "font-medium text-slate-800"
                                      : "text-slate-600"
                                  }
                                >
                                  {name}
                                  {isCurrentUser &&
                                    " (you)"}
                                </span>

                                <span className="font-semibold text-slate-800">
                                  ₹
                                  {split.amount.toFixed(
                                    2
                                  )}
                                </span>

                              </div>
                            );
                          }
                        )}

                      </div>

                      {/* TOTAL */}
                      <div className="flex justify-between mt-3 pt-3 border-t border-slate-100 text-sm font-semibold">
                        <span>
                          Total
                        </span>

                        <span>
                          ₹
                          {Number(
                            expense.amount
                          ).toFixed(2)}
                        </span>
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          )}

        </div>

      </main>
    </div>
  );
}

export default ExpensesPage;