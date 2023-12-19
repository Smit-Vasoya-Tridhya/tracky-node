const catchAsyncError = require("../helpers/catchAsyncError");
const UserService = require("../services/userService");
const userService = new UserService();
const AppError = require("./../helpers/errorHandler");
const sendResponse = require("../utils/sendResponse");
const { returnMessage } = require("../utils/utils");

exports.signUp = catchAsyncError(async (req, res, next) => {
  const registeredUser = await userService.signUp(req.body);

  if (typeof registeredUser === "string")
    return next(new AppError(registeredUser, 400));

  sendResponse(res, true, returnMessage("userRegisterd"), registeredUser, 200);
});

exports.login = catchAsyncError(async (req, res, next) => {
  const loggedInUser = await userService.login(req.body);
  if (typeof loggedInUser === "string")
    return next(new AppError(loggedInUser, 400));

  sendResponse(res, true, returnMessage("userLogin"), loggedInUser, 200);
});

exports.verifyEmails = catchAsyncError(async (req, res, next) => {
  const verify = await userService.verifyEmail(req.query);
  if (typeof verify === "string") return next(new AppError(verify, 400));
  sendResponse(res, true, returnMessage("userVerify"), verify, 200);
});

exports.googleSignIn = catchAsyncError(async (req, res, next) => {
  const googleSignIn = await userService.googleSign(req.body);
  if (typeof googleSignIn === "string")
    return next(new AppError(googleSignIn, 400));
  sendResponse(res, true, returnMessage("userLogin"), googleSignIn, 200);
});

exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  const forgetPassword = await userService.forgetPassword(req.body);
  if (typeof forgetPassword === "string")
    return next(new AppError(forgetPassword, 400));
  sendResponse(res, true, returnMessage("Emailsend"), forgetPassword, 200);
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPassword = await userService.resetPassword(req.body);
  if (typeof resetPassword === "string")
    return next(new AppError(resetPassword, 400));
  sendResponse(res, true, returnMessage("resetPassword"), resetPassword, 200);
});

exports.appleSignIn = catchAsyncError(async (req, res, next) => {
  const appleSignIn = await userService.appleSign(req.body);
  if (typeof appleSignIn === "string")
    return next(new AppError(appleSignIn, 400));
  sendResponse(res, true, returnMessage("userLogin"), appleSignIn, 200);
});

exports.resendEmail = catchAsyncError(async (req, res, next) => {
  const resendEmail = await userService.resendEmail(req.body);
  if (typeof resendEmail === "string")
    return next(new AppError(appleSresendEmailignIn, 400));
  sendResponse(res, true, returnMessage("Emailsend"), resendEmail, 200);
});

exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const updateProfile = await userService.updateProfile(
    req.body,
    req.files,
    req.user
  );

  if (typeof updateProfile === "string")
    return next(new AppError(createProfile, 400));

  sendResponse(res, true, returnMessage("userRegisterd"), updateProfile, 200);
});

exports.getProfilebyId = catchAsyncError(async (req, res, next) => {
  const getProfilebyId = await userService.getProfilebyId(req.params);

  if (typeof getProfilebyId === "string")
    return next(new AppError(getProfilebyId, 400));

  sendResponse(res, true, returnMessage("userfetch"), getProfilebyId, 200);
});
