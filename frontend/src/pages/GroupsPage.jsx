import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import CreateGroupModal from "../components/CreateGroupModal";

import {
  getGroups,
  createGroup,
} from "../api/groupApi";

function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      const res = await getGroups();
      setGroups(res.data);
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
    try {
      await createGroup(groupData);

      await fetchGroups();

      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create group");
    }
  };

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

        <div className="grid grid-cols-3 gap-6">

          {groups.map((group) => {

            const totalExpense = group.expenses.reduce(
              (sum, expense) => sum + expense.amount,
              0
            );

            return (

              <div
                key={group.id}
                onClick={() => navigate(`/group/${group.id}`)}
                className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer p-6"
              >

                <h2 className="text-2xl font-bold">
                  {group.name}
                </h2>

                <p className="text-gray-500 mt-2">
                  {group.members.length} Members
                </p>

                <p className="mt-6 text-lg font-semibold text-emerald-600">
                  ₹{totalExpense}
                </p>

                <p className="text-gray-400 text-sm">
                  Total Expenses
                </p>

                <div className="mt-6">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                    {group.expenses.length} Expenses
                  </span>
                </div>

              </div>

            );
          })}

        </div>

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