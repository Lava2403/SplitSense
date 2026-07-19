import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import groupBg from "../assets/pic.png";
import { getExpenses } from "../api/expenseApi";
import { getGroups } from "../api/groupApi";
import { getStoredUser } from "../utils/auth";

function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [expandedExpense, setExpandedExpense] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = getStoredUser()?.name || "User";

  useEffect(() => {
    async function loadData() {
      try {
        const [expensesRes, groupsRes] = await Promise.all([
          getExpenses(),
          getGroups(),
        ]);
        setExpenses(expensesRes.data);
        setGroups(groupsRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function getExpenseStatus(expense) {
    const share = expense.amount / expense.participants.length;

    if (expense.paidBy === currentUser) {
      return {
        type: "owed",
        debtors: expense.participants.filter((person) => person !== currentUser),
        share,
      };
    }

    if (expense.participants.includes(currentUser)) {
      return {
        type: "owe",
        creditor: expense.paidBy,
        share,
      };
    }

    return { type: "none" };
  }

  const normalizedExpenses = expenses.map((expense) => ({
    ...expense,
    group: expense.groupName,
  }));

  const filteredExpenses = normalizedExpenses.filter((expense) => {
    const status = getExpenseStatus(expense);
    const matchesSearch =
      expense.title.toLowerCase().includes(search.toLowerCase()) ||
      expense.group.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || status.type === statusFilter;
    const matchesGroup = groupFilter === "all" || expense.group === groupFilter;

    return matchesSearch && matchesStatus && matchesGroup;
  });

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <div
          className="rounded-2xl shadow mb-8 bg-cover bg-center p-8 text-white"
          style={{ backgroundImage: `linear-gradient(rgba(15,118,110,0.85), rgba(15,118,110,0.85)), url(${groupBg})` }}
        >
          <h1 className="text-4xl font-bold">My Expenses</h1>
          <p className="mt-2 text-white/90">Track and filter expenses across all groups</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[220px] border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-4 py-2.5"
            >
              <option value="all">All Statuses</option>
              <option value="owe">I Owe</option>
              <option value="owed">Owe Me</option>
            </select>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-4 py-2.5"
            >
              <option value="all">All Groups</option>
              {groups.map((group) => (
                <option key={group.id} value={group.name}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500">Loading expenses...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500">No expenses found.</div>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => {
              const status = getExpenseStatus(expense);
              const key = `${expense.group}-${expense.id}`;

              return (
                <article
                  key={key}
                  onClick={() => setExpandedExpense(expandedExpense === key ? null : key)}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800">{expense.title}</h3>
                      <p className="text-gray-500 text-sm">{expense.group}</p>
                      <p className="text-gray-400 text-sm mt-2">{expense.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-emerald-700">₹{expense.amount}</p>
                      {status.type === "owe" && (
                        <p className="text-red-600 text-sm">
                          You owe {status.creditor} ₹{status.share.toFixed(0)}
                        </p>
                      )}
                      {status.type === "owed" && status.debtors?.length === 1 && (
                        <p className="text-green-600 text-sm">
                          {status.debtors[0]} owes you ₹{status.share.toFixed(0)}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default ExpensesPage;
