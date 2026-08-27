const groupService = require("../services/groupService");

// ===============================
// GET ALL GROUPS FOR LOGGED-IN USER
// ===============================
const getGroups = async (req, res) => {
  try {
    const groups = await groupService.getAllGroups(req.user.id);

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET GROUP BY ID
// ===============================
const getGroupById = async (req, res) => {
  try {
    const group = await groupService.getGroupById(
      req.params.id,
      req.user.id
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found or you do not have access to it.",
      });
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// CREATE GROUP
// ===============================
const createGroup = async (req, res) => {
  try {
    const group = await groupService.createGroup({
      ...req.body,

      // Always use logged-in user as creator.
      // Never trust created_by from frontend.
      created_by: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Group created successfully.",
      data: group,
    });
  } catch (error) {
    console.error("Create group error:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// ADD MEMBER TO GROUP
// ===============================
const addMemberToGroup = async (req, res) => {
  try {
    const groupId = Number(req.params.id);
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Member email is required.",
      });
    }

    const member = await groupService.addMemberToGroup(
      groupId,
      email,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: "Member added successfully.",
      data: member,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// UPDATE GROUP
// ===============================
const updateGroup = async (req, res) => {
  try {
    const group = await groupService.updateGroup(
      req.params.id,
      req.body,
      req.user.id
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found or you do not have permission to update it.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Group updated successfully.",
      data: group,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// DELETE GROUP
// ===============================
const deleteGroup = async (req, res) => {
  try {
    const group = await groupService.deleteGroup(
      req.params.id,
      req.user.id
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found or you do not have permission to delete it.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Group deleted successfully.",
      data: group,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getGroups,
  getGroupById,
  createGroup,
  addMemberToGroup,
  updateGroup,
  deleteGroup,
};