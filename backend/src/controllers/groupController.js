const groupService = require("../services/groupService");

// ===============================
// GET ALL GROUPS
// ===============================
const getGroups = async (req, res) => {
  try {
    const groups = await groupService.getAllGroups();

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    res.status(500).json({
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
    const group = await groupService.getGroupById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
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
      created_by: req.body.created_by || req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: group,
    });

  } catch (error) {
    console.error(error);

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
      req.body
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Group updated successfully",
      data: group,
    });
  } catch (error) {
    res.status(500).json({
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
    const group = await groupService.deleteGroup(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Group deleted successfully",
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
};