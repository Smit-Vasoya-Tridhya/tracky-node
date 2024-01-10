const catchAsyncError = require("../helpers/catchAsyncError");
const UserService = require("../services/userService");
const userService = new UserService();
const AuthService = require("../services/authService");
const authService = new AuthService();
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
  const loggedInUser = await authService.login(req.body);
  if (typeof loggedInUser === "string")
    return next(new AppError(loggedInUser, 400));

  sendResponse(res, true, returnMessage("userLogin"), loggedInUser, 200);
});

exports.verifyEmails = catchAsyncError(async (req, res, next) => {
  const verify = await authService.verifyEmail(req.query);
  if (typeof verify === "string") return next(new AppError(verify, 400));
  sendResponse(res, true, returnMessage("userVerify"), verify, 200);
});

exports.googleSignIn = catchAsyncError(async (req, res, next) => {
  const googleSignIn = await authService.googleSign(req.body);
  if (typeof googleSignIn === "string")
    return next(new AppError(googleSignIn, 400));
  sendResponse(res, true, returnMessage("userLogin"), googleSignIn, 200);
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

exports.appleSignIn = catchAsyncError(async (req, res, next) => {
  const appleSignIn = await authService.appleSign(req.body);
  if (typeof appleSignIn === "string")
    return next(new AppError(appleSignIn, 400));
  sendResponse(res, true, returnMessage("userLogin"), appleSignIn, 200);
});

exports.resendEmail = catchAsyncError(async (req, res, next) => {
  const resendEmail = await authService.resendEmail(req.body);
  if (typeof resendEmail === "string")
    return next(new AppError(appleSresendEmailignIn, 400));
  sendResponse(res, true, returnMessage("emailSend"), resendEmail, 200);
});

exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const updateProfile = await userService.updateProfile(
    req.body,
    req.files,
    req.user
  );

  if (typeof updateProfile === "string")
    return next(new AppError(updateProfile, 400));

  sendResponse(res, true, returnMessage("userRegisterd"), updateProfile, 200);
});

exports.deleteProfile = catchAsyncError(async (req, res, next) => {
  const deletedProfile = await userService.deleteProfile(req.user);

  if (typeof deletedProfile === "string")
    return next(new AppError(deletedProfile, 400));

  sendResponse(res, true, returnMessage("userDeleted"), {}, 200);
});

exports.getProfilebyId = catchAsyncError(async (req, res, next) => {
  const getProfilebyId = await userService.getProfilebyId(req.user);

  if (typeof getProfilebyId === "string")
    return next(new AppError(getProfilebyId, 400));

  sendResponse(res, true, returnMessage("userFetch"), getProfilebyId, 200);
});

exports.generateQr = catchAsyncError(async (req, res, next) => {
  const generateQr = await authService.generateQr(req.user);
  if (typeof generateQr === "string")
    return next(new AppError(generateQr, 400));
  sendResponse(res, true, returnMessage("qrCodeGenerated"), generateQr, 200);
});

exports.verify_2FA_otp = catchAsyncError(async (req, res, next) => {
  const verify_2FA_otp = await authService.verify_2FA_otp(req.body, req.user);
  if (typeof verify_2FA_otp === "string")
    return next(new AppError(verify_2FA_otp, 400));
  sendResponse(
    res,
    true,
    returnMessage("2FactorVerified"),
    verify_2FA_otp,
    200
  );
});

exports.editProfile = catchAsyncError(async (req, res, next) => {
  const editProfile = await userService.editProfile(
    req.body,
    req.file,
    req.user
  );

  if (typeof editProfile === "string")
    return next(new AppError(editProfile, 400));

  sendResponse(res, true, returnMessage("updateProfile"), editProfile, 200);
});

exports.sendInvitation = catchAsyncError(async (req, res, next) => {
  const sendInvitation = await userService.sendInvitation(req.body, req.user);
  if (typeof sendInvitation === "string")
    return next(new AppError(sendInvitation, 400));
  sendResponse(res, true, returnMessage("invitationSend"), {}, 200);
});

exports.referralStatus = catchAsyncError(async (req, res, next) => {
  const referralStatus = await userService.referralStatus(req.user);
  if (typeof referralStatus === "string")
    return next(new AppError(referralStatus, 400));
  sendResponse(
    res,
    true,
    returnMessage("referralFetched"),
    referralStatus,
    200
  );
});

exports.shareProfile = catchAsyncError(async (req, res, next) => {
  const shareProfile = await userService.shareProfile(req.params, req.query);

  if (typeof shareProfile === "string")
    return next(new AppError(shareProfile, 400));

  sendResponse(res, true, returnMessage("shareProfile"), shareProfile, 200);
});

exports.sharePastClient = catchAsyncError(async (req, res, next) => {
  const sharePastClient = await userService.sharePastClient(
    req.body,
    req.params
  );

  if (typeof sharePastClient === "string")
    return next(new AppError(sharePastClient, 400));

  sendResponse(res, true, returnMessage("shareProfile"), sharePastClient, 200);
});
exports.userList = catchAsyncError(async (req, res, next) => {
  const userList = await userService.userList(req.body);

  if (typeof userList === "string") return next(new AppError(userList, 400));

  sendResponse(res, true, returnMessage("userList"), userList, 200);
});
exports.userView = catchAsyncError(async (req, res, next) => {
  const userView = await userService.getUserById(req.body, req.params.id);

  if (typeof userView === "string") return next(new AppError(userView, 400));

  sendResponse(res, true, returnMessage("userfetch"), userView, 200);
});
exports.userStatusUpdate = catchAsyncError(async (req, res, next) => {
  const userStatusUpdate = await userService.updateUserStatus(
    req.body,
    req.params.id
  );

  if (typeof userStatusUpdate === "string")
    return next(new AppError(userStatusUpdate, 400));

  sendResponse(res, true, returnMessage("userUpdated"), userStatusUpdate, 200);
});

exports.userdelete = catchAsyncError(async (req, res, next) => {
  const userdelete = await userService.deleteUser(req.params.id);

  if (typeof userdelete === "string")
    return next(new AppError(userdelete, 400));

  sendResponse(res, true, returnMessage("userdeleted"), userdelete, 200);
});
