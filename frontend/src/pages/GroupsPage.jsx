import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CreateGroupModal from "../components/CreateGroupModal";
import GroupCard from "../components/GroupCard";
import { getStoredUser } from "../utils/auth";
import { getGroupTotals } from "../utils/balances";

import {
  getGroups,
  createGroup,
} from "../api/groupApi";

function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const user = getStoredUser();

  const fetchGroups = async () => {
    try {
      const res = await getGroups();
      setGroups(res.data || []);
    } catch (err) {
      console.error(err);
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
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading Groups...
      </div>
    );
  }

  return (
    <div className="flex bg-slate-100 min-h-screen">

      <Sidebar />

      <div className="flex-1 p-8">

        <div className="flex justify-between items-center mb-10">

          <div>

            <h1 className="text-4xl font-bold text-emerald-700">
              Your Groups
            </h1>

            <p className="text-gray-500 mt-2">
              Manage all your expense groups
            </p>

          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg"
          >
            + Create Group
          </button>

        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search groups or members"
          className="w-full max-w-md mb-8 border rounded-lg p-3 bg-white"
        />

        {filteredGroups.length === 0 ? (
          <p className="text-gray-500">
            {groups.length === 0
              ? "No groups yet. Create your first group to get started."
              : "No groups match your search."}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {filteredGroups.map((group) => {
              const totals = getGroupTotals(group, user?.name);

              return (
                <GroupCard
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  members={totals.memberCount}
                  totalExpense={totals.totalExpense.toFixed(0)}
                  youOwe={totals.youOwe}
                  youAreOwed={totals.youAreOwed}
                  expenseCount={totals.expenseCount}
                />
              );
            })}
          </div>
        )}

      </div>

      <CreateGroupModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateGroup}
      />

    </div>
  );
}

export default GroupsPage;
