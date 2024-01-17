const catchAsyncError = require("../helpers/catchAsyncError");
const RoleService = require("../services/roleService");
const roleService = new RoleService();
const AppError = require("./../helpers/errorHandler");
const sendResponse = require("../utils/sendResponse");
const { returnMessage } = require("../utils/utils");

exports.createRole = catchAsyncError(async (req, res, next) => {
  const createRole = await roleService.createRole(req.body, req.user);

  if (typeof createRole === "string")
    return next(new AppError(createRole, 400));

  sendResponse(res, true, returnMessage("createRole"), createRole, 200);
});

exports.updateRole = catchAsyncError(async (req, res, next) => {
  const updateRole = await roleService.updateRole(
    req.body,
    req.user,
    req.params.id
  );

  if (typeof updateRole === "string")
    return next(new AppError(updateRole, 400));

  sendResponse(res, true, returnMessage("updateRole"), updateRole, 200);
});

exports.deleteRole = catchAsyncError(async (req, res, next) => {
  const deleteRole = await roleService.deleteRole(
    req.body,
    req.user,
    req.params.id
  );

  if (typeof deleteRole === "string")
    return next(new AppError(deleteRole, 400));

  sendResponse(res, true, returnMessage("deleteRole"), deleteRole, 200);
});
