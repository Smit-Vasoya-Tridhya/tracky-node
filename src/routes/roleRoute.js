const { roleList, createRole } = require("../controllers/roleController");
const roleRoute = require("express").Router();
// roleRoute.use(protect);
roleRoute.get("/roles", roleList);
roleRoute.post("/create", createRole);
module.exports = roleRoute;
