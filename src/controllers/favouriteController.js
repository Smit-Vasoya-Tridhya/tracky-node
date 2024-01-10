const catchAsyncError = require("../helpers/catchAsyncError");
const AppError = require("./../helpers/errorHandler");
const FavouriteService = require("../services/favouriteService");
const favouriteService = new FavouriteService();
const sendResponse = require("../utils/sendResponse");
const { returnMessage } = require("../utils/utils");

exports.createlike = catchAsyncError(async (req, res, next) => {
  const createlike = await favouriteService.createFavourite(req.body, req.user);

  if (typeof createlike === "string")
    return next(new AppError(createlike, 400));

  sendResponse(res, true, returnMessage("createlike"), createlike, 200);
});

exports.deletelike = catchAsyncError(async (req, res, next) => {
  const deletelike = await favouriteService.deleteFavourite(req.params.id);

  if (typeof deletelike === "string")
    return next(new AppError(deletelike, 400));

  sendResponse(res, true, returnMessage("deletelike"), deletelike, 200);
});
