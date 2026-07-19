const groups = require("../data/groups");

// ==========================
// GET ALL GROUPS
// ==========================
const getAllGroups = async () => {
  return groups;
};

// ==========================
// GET GROUP BY ID
// ==========================
const getGroupById = async (id) => {
  return groups.find((group) => group.id === String(id));
};

// ==========================
// CREATE GROUP
// ==========================
const createGroup = async (groupData) => {
  const newGroup = {
    id: String(groups.length + 1),
    name: groupData.name,
    members: groupData.members || [],
    expenses: [],
  };

  groups.push(newGroup);

  return newGroup;
};

// ==========================
// UPDATE GROUP
// ==========================
const updateGroup = async (id, updatedData) => {
  const group = groups.find(
    (group) => group.id === String(id)
  );

  if (!group) return null;

  Object.assign(group, updatedData);

  return group;
};

// ==========================
// DELETE GROUP
// ==========================
const deleteGroup = async (id) => {
  const index = groups.findIndex(
    (group) => group.id === String(id)
  );

  if (index === -1) return null;

  return groups.splice(index, 1)[0];
};

module.exports = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
};