const catchAsyncError = require("../helpers/catchAsyncError");
const StaffService = require("../services/staffService");
const staffService = new StaffService();
const AppError = require("./../helpers/errorHandler");
const sendResponse = require("../utils/sendResponse");
const { returnMessage } = require("../utils/utils");

exports.createStaff = catchAsyncError(async (req, res, next) => {
  const createStaff = await staffService.createStaff(req.body, req.user);

  if (typeof createStaff === "string")
    return next(new AppError(createStaff, 400));

  sendResponse(res, true, returnMessage("createRole"), createStaff, 200);
});

exports.deleteStaff = catchAsyncError(async (req, res, next) => {
  const deleteStaff = await staffService.deleteStaff(req.params.id, req.user);

  if (typeof deleteStaff === "string")
    return next(new AppError(deleteStaff, 400));

  sendResponse(res, true, returnMessage("deleteStaff"), deleteStaff, 200);
});

exports.staffList = catchAsyncError(async (req, res, next) => {
  const staffList = await staffService.staffList(req.body);

  if (typeof staffList === "string") return next(new AppError(staffList, 400));

  sendResponse(res, true, returnMessage("staffList"), staffList, 200);
});

exports.editStaff = catchAsyncError(async (req, res, next) => {
  const editStaff = await staffService.updateStaff(
    req.body,
    req.params.id,
    req.user
  );

  if (typeof editStaff === "string") return next(new AppError(editStaff, 400));

  sendResponse(res, true, returnMessage("editStaff"), editStaff, 200);
});
exports.editStatus = catchAsyncError(async (req, res, next) => {
  const editStatus = await staffService.updateStaffStatus(
    req.body,
    req.params.id,
    req.user
  );

  if (typeof editStatus === "string")
    return next(new AppError(editStatus, 400));

  sendResponse(res, true, returnMessage("editStatus"), editStatus, 200);
});

exports.getStaffById = catchAsyncError(async (req, res, next) => {
  const getStaffById = await staffService.getStaffById(req.params.id, req.user);

  if (typeof getStaffById === "string")
    return next(new AppError(staffList, 400));

  sendResponse(res, true, returnMessage("getStaffById"), getStaffById, 200);
});
