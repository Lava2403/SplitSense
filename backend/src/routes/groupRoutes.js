const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMemberToGroup,
} = require("../controllers/groupController");

const router = express.Router();

// Every group route requires login
router.use(authenticate);

router.get("/", getGroups);
router.get("/:id", getGroupById);

router.post("/", createGroup);
router.post("/:id/members", addMemberToGroup);

router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);

module.exports = router;