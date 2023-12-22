const catchAsyncError = require("../helpers/catchAsyncError");
const AppError = require("./../helpers/errorHandler");
const PastClient = require("../services/pastclientService");
const pastClient = new PastClient();
const sendResponse = require("../utils/sendResponse");
const { returnMessage } = require("../utils/utils");

exports.createClient = catchAsyncError(async (req, res, next) => {
  const createClient = await pastClient.createPastclient(
    req.body,
    req.file,
    req.user
  );
  if (typeof createClient === "string")
    return next(new AppError(createClient, 400));

  sendResponse(res, true, returnMessage("clientadded"), createClient, 200);
});

exports.clientList = catchAsyncError(async (req, res, next) => {
  const clientList = await pastClient.clientList(req.body, req.user);
  if (typeof clientList === "string")
    return next(new AppError(clientList, 400));

  sendResponse(res, true, returnMessage("clientList"), clientList, 200);
});

exports.getClientByID = catchAsyncError(async (req, res, next) => {
  const getClient = await pastClient.getClient(req.params);
  if (typeof getClient === "string") return next(new AppError(getClient, 400));
  sendResponse(res, true, returnMessage("getClient"), getClient, 200);
});

exports.deleteClientByID = catchAsyncError(async (req, res, next) => {
  const deleteClient = await pastClient.deleteClient(req.params);
  if (typeof deleteClient === "string")
    return next(new AppError(deleteClient, 400));

  sendResponse(res, true, returnMessage("deleteClient"), deleteClient, 200);
});

exports.editClient = catchAsyncError(async (req, res, next) => {
  const editClient = await pastClient.editClient(
    req.params,
    req.body,
    req.file
  );
  if (typeof editClient === "string")
    return next(new AppError(editClient, 400));

  sendResponse(res, true, returnMessage("editClient"), editClient, 200);
});
