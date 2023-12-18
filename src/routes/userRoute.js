const userRoute = require("express").Router();
const {
  signUp,
  login,
  verifyEmails,
  googleSignIn,
  forgetPassword,
  resetPassword,
  appleSignIn,
  resendEmail,
} = require("../controllers/userController");
userRoute.post("/register", signUp);
userRoute.post("/login", login);
userRoute.get("/verify", verifyEmails);
userRoute.post("/googleSignIn", googleSignIn);
userRoute.post("/forgetPassword", forgetPassword);
userRoute.post("/resetPassword", resetPassword);
userRoute.post("/appleSignIn", appleSignIn);
userRoute.post("/resendEmail", resendEmail);
module.exports = userRoute;
