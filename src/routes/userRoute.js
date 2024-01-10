const userRoute = require("express").Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  signUp,
  login,
  verifyEmails,
  googleSignIn,
  forgetPassword,
  resetPassword,
  appleSignIn,
  resendEmail,
  updateProfile,
  getProfilebyId,
  editProfile,
  generateQr,
  verify_2FA_otp,
  deleteProfile,
  sendInvitation,
  referralStatus,
  shareProfile,
  sharePastClient,
  userList,
  userView,
  userStatusUpdate,
  userdelete,
} = require("../controllers/userController");
const { upload } = require("../helpers/multer");
userRoute.post("/register", signUp);
userRoute.post("/login", login);
userRoute.get("/verify", verifyEmails);
userRoute.post("/user-list", userList);
userRoute.get("/view/:id", userView);
userRoute.put("/status/:id", userStatusUpdate);
userRoute.delete("/delete-user/:id", userdelete);
userRoute.post("/googleSignIn", googleSignIn);
userRoute.post("/forgetPassword", forgetPassword);
userRoute.post("/resetPassword", resetPassword);
userRoute.post("/appleSignIn", appleSignIn);
userRoute.post("/resendEmail", resendEmail);
userRoute.get("/shareProfile/:_id", shareProfile);
userRoute.post("/sharePastClient/:_id", sharePastClient);
userRoute.use(protect);
userRoute.put(
  "/profile",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "track_record_csv", maxCount: 1 },
  ]),
  updateProfile
);
userRoute.get("/fetchProfile", getProfilebyId);
userRoute.put("/editProfile", upload.single("profile_image"), editProfile);
userRoute.delete("/", deleteProfile);

// this routes are used for the google authenticator and change password and email
userRoute.get("/qrGenerate", generateQr);
userRoute.post("/verify-2FA", verify_2FA_otp);

// this route is used for the referral programme
userRoute.post("/invitation", sendInvitation);
userRoute.get("/referral-status", referralStatus);

module.exports = userRoute;
