const catchAsyncError = require("../helpers/catchAsyncError");
const AppError = require("./../helpers/errorHandler");
const PastClient = require("../services/pastclientService");
const PastClient = new PastClient();
const sendResponse = require("../utils/sendResponse");
const { returnMessage } = require("../utils/utils");

exports.createClient = catchAsyncError(async (req, res, next) => {
  const createClient = await PastClient.createPastclient(req.body, req.files);
  if (typeof createClient === "string")
    return next(new AppError(createClient, 400));

  sendResponse(res, true, returnMessage("userRegisterd"), createClient, 200);
});
