const staffRoute = require("express").Router();
const {
  createStaff,
  deleteStaff,
  staffList,
  getStaffById,
  editStaff,
  editStatus,
} = require("../controllers/staff.controller");
const { Adminprotect } = require("../middlewares/adminMiddleware");

staffRoute.use(Adminprotect);

staffRoute.post("/create", createStaff);
staffRoute.post("/list", staffList);
staffRoute.delete("/delete/:id", deleteStaff);
staffRoute.put("/update/:id", editStaff);
staffRoute.put("/update-status/:id", editStatus);
staffRoute.get("/fetch/:id", getStaffById);

module.exports = staffRoute;
