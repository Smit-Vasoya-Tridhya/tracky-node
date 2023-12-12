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
