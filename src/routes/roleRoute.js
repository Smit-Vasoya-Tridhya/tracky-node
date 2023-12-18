const { roleList } = require("../controllers/roleController");
const { protect } = require("../middlewares/authMiddleware");
const roleRoute = require("express").Router();
roleRoute.use(protect);
roleRoute.get("/roles", roleList);
module.exports = roleRoute;
