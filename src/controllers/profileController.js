const catchAsyncError = require("../helpers/catchAsyncError");
const AppError = require("./../helpers/errorHandler");
const ProfileService = require("../services/profileService");
const profileService = new ProfileService();
const sendResponse = require("../utils/sendResponse");
const { returnMessage } = require("../utils/utils");

exports.createProfile = catchAsyncError(async (req, res, next) => {
  const createProfile = await profileService.createProfile(req);

  if (typeof createProfile === "string")
    return next(new AppError(createProfile, 400));

  sendResponse(res, true, returnMessage("userRegisterd"), createProfile, 200);
});

exports.getProfilebyId = catchAsyncError(async (req, res, next) => {
  const getProfilebyId = await profileService.getProfilebyId(req);

  if (typeof getProfilebyId === "string")
    return next(new AppError(getProfilebyId, 400));

  sendResponse(res, true, returnMessage("userFetch"), getProfilebyId, 200);
});
