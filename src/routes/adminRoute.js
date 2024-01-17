const adminRoute = require("express").Router();
const {
  login,
  forgetPassword,
  resetPassword,
  resendEmail,
  getAdminById,
  editAdmin,
  StaffresetPassword,
} = require("../controllers/admin.controller");
const { Adminprotect } = require("../middlewares/adminMiddleware");

adminRoute.post("/login", login);
adminRoute.post("/forgetPassword", forgetPassword);
adminRoute.post("/resetPassword", resetPassword);
adminRoute.post("/StaffresetPassword", StaffresetPassword);
adminRoute.post("/resendEmail", resendEmail);
adminRoute.use(Adminprotect);
adminRoute.get("/fetch", getAdminById);
adminRoute.put("/edit", editAdmin);
module.exports = adminRoute;
