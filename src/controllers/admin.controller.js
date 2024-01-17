const catchAsyncError = require("../helpers/catchAsyncError");
const AuthService = require("../services/adminAuthService");
const authService = new AuthService();
const AdminService = require("../services/adminService");
const adminService = new AdminService();
const AppError = require("./../helpers/errorHandler");
const sendResponse = require("../utils/sendResponse");
const { returnMessage } = require("../utils/utils");

exports.signUp = catchAsyncError(async (req, res, next) => {
  const registeredUser = await authService.signUp(req.body);

  if (typeof registeredUser === "string")
    return next(new AppError(registeredUser, 400));

  sendResponse(res, true, returnMessage("userRegisterd"), registeredUser, 200);
});

exports.login = catchAsyncError(async (req, res, next) => {
  const loggedInAdmin = await authService.login(req.body);
  if (typeof loggedInAdmin === "string")
    return next(new AppError(loggedInAdmin, 400));

  sendResponse(res, true, returnMessage("userLogin"), loggedInAdmin, 200);
});

exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  const forgetPassword = await authService.forgetPassword(req.body);
  if (typeof forgetPassword === "string")
    return next(new AppError(forgetPassword, 400));
  sendResponse(res, true, returnMessage("emailSend"), forgetPassword, 200);
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPassword = await authService.resetPassword(req.body);
  if (typeof resetPassword === "string")
    return next(new AppError(resetPassword, 400));
  sendResponse(res, true, returnMessage("resetPassword"), resetPassword, 200);
});
exports.StaffresetPassword = catchAsyncError(async (req, res, next) => {
  const StaffresetPassword = await authService.StaffresetPassword(req.body);
  if (typeof StaffresetPassword === "string")
    return next(new AppError(StaffresetPassword, 400));
  sendResponse(
    res,
    true,
    returnMessage("resetPassword"),
    StaffresetPassword,
    200
  );
});

exports.resendEmail = catchAsyncError(async (req, res, next) => {
  const resendEmail = await authService.resendEmail(req.body);
  if (typeof resendEmail === "string")
    return next(new AppError(resendEmail, 400));
  sendResponse(res, true, returnMessage("emailSend"), resendEmail, 200);
});

exports.getAdminById = catchAsyncError(async (req, res, next) => {
  const getAdminById = await adminService.getAdmin(req.user);
  if (typeof getAdminById === "string")
    return next(new AppError(getAdminById, 400));
  sendResponse(res, true, returnMessage("getAdminById"), getAdminById, 200);
});
exports.editAdmin = catchAsyncError(async (req, res, next) => {
  const editAdmin = await adminService.editAdmin(req.body, req.user);
  if (typeof editAdmin === "string") return next(new AppError(editAdmin, 400));
  sendResponse(res, true, returnMessage("editAdmin"), editAdmin, 200);
});
