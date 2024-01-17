const { roleList, createRole } = require("../controllers/roleController");
const { protect } = require("../middlewares/authMiddleware");
const roleRoute = require("express").Router();
// roleRoute.use(protect);
roleRoute.get("/role", roleList);
roleRoute.post("/create", createRole);
module.exports = roleRoute;
