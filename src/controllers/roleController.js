const catchAsyncError = require("../helpers/catchAsyncError");
const AppError = require("./../helpers/errorHandler");
const RoleService = require("../services/roleService");
const roleService = new RoleService();
const sendResponse = require("../utils/sendResponse");
const { returnMessage } = require("../utils/utils");

exports.roleList = catchAsyncError(async (req, res, next) => {
  const RoleList = await roleService.RoleList(req);

  if (typeof RoleList === "string") return next(new AppError(RoleList, 400));

  sendResponse(res, true, returnMessage("RoleList"), RoleList, 200);
});
