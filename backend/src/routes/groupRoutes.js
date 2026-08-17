const express = require("express");
const { optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

const {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
} = require("../controllers/groupController");

// ======================================
// GET ALL GROUPS
// GET /api/groups
// ======================================
router.get("/", getGroups);

// ======================================
// GET SINGLE GROUP
// GET /api/groups/:id
// ======================================
router.get("/:id", getGroupById);

// ======================================
// CREATE GROUP
// POST /api/groups
// ======================================
router.post("/", optionalAuth, createGroup);

// ======================================
// UPDATE GROUP
// PUT /api/groups/:id
// ======================================
router.put("/:id", updateGroup);

// ======================================
// DELETE GROUP
// DELETE /api/groups/:id
// ======================================
router.delete("/:id", deleteGroup);

module.exports = router;