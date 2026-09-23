import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import CreateGroupModal from "../components/CreateGroupModal";
import GroupCard from "../components/GroupCard";
import { getStoredUser } from "../utils/auth";
import { getGroupTotals } from "../utils/balances";
import { getGroups, createGroup } from "../api/groupApi";
import { getPendingSettlements } from "../api/settlementApi";

function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const user = getStoredUser();

  const fetchGroups = async () => {
    try {
      setLoading(true);

      const [groupsRes, settlementRes] = await Promise.all([
        getGroups(),
        getPendingSettlements(),
      ]);

      setGroups(groupsRes.data || []);
      setSettlements(settlementRes.data || []);
    } catch (err) {
      console.error("Groups fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (groupData) => {
    await createGroup({
      ...groupData,
      created_by: user?.id,
      members: [user?.id, ...(groupData.members || [])],
    });

    await fetchGroups();
    setShowModal(false);
  };

  const balancesByGroup = useMemo(() => {
    const result = {};

    settlements.forEach((item) => {
      if (!result[item.groupId]) {
        result[item.groupId] = {
          youOwe: 0,
          youAreOwed: 0,
        };
      }

      if (item.type === "pay") {
        result[item.groupId].youOwe += Number(item.amount || 0);
      } else {
        result[item.groupId].youAreOwed += Number(item.amount || 0);
      }
    });

    return result;
  }, [settlements]);

  const filteredGroups = groups.filter((group) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    const memberNames = (group.members || []).join(" ").toLowerCase();

    return (
      group.name?.toLowerCase().includes(query) ||
      group.description?.toLowerCase().includes(query) ||
      memberNames.includes(query)
    );
  });

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

        <div className="flex-1 flex items-center justify-center text-slate-400">
          Loading groups...
        </div>
      </div>
    );
  }

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

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}
        <div
          className="rounded-2xl p-7 mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
          style={{
            background:
              "linear-gradient(120deg, #047857 0%, #123A3A 45%, #172033 100%)",
          }}
        >
          <div>
            <h1 className="text-4xl font-bold text-white">
              Your Groups
            </h1>

            <p className="mt-2 text-slate-200">
              Manage all your expense groups
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-lg font-semibold transition shadow-lg shadow-emerald-900/20"
          >
            + Create Group
          </button>
        </div>

        {/* =====================================================
            SEARCH
        ===================================================== */}
        <div className="mb-7">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search groups or members"
            className="
              w-full
              max-w-md
              border border-slate-300
              rounded-lg
              p-3
              bg-white
              text-slate-900
              placeholder-slate-400
              outline-none
              focus:border-emerald-500
              focus:ring-2
              focus:ring-emerald-100
            "
          />
        </div>

        {/* =====================================================
            GROUPS
        ===================================================== */}
        {filteredGroups.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
            {groups.length === 0
              ? "No groups yet. Create your first group to get started."
              : "No groups match your search."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredGroups.map((group) => {
              const totals = getGroupTotals(group, user?.name);

              const balance = balancesByGroup[group.id] || {
                youOwe: 0,
                youAreOwed: 0,
              };

              return (
                <GroupCard
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  members={totals.memberCount}
                  totalExpense={totals.totalExpense}
                  youOwe={balance.youOwe}
                  youAreOwed={balance.youAreOwed}
                  expenseCount={totals.expenseCount}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* =====================================================
          CREATE GROUP MODAL
      ===================================================== */}
      <CreateGroupModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateGroup}
      />
    </div>
  );
}

export default GroupsPage;