const catchAsyncError = require("../helpers/catchAsyncError");
const AppError = require("./../helpers/errorHandler");
const sendResponse = require("../utils/sendResponse");
const { returnMessage } = require("../utils/utils");
const PaymentService = require("../services/paymentService");
const paymentService = new PaymentService();

exports.createPlan = catchAsyncError(async (req, res, next) => {
  const plan = await paymentService.createPlan(req.body);

  if (typeof plan === "string") return next(new AppError(plan, 400));

  sendResponse(res, true, returnMessage("planCreated"), {}, 200);
});

exports.getPlans = catchAsyncError(async (req, res, next) => {
  const plans = await paymentService.getPlans();

  if (typeof plans === "string") return next(new AppError(plans, 400));

  sendResponse(res, true, returnMessage("planFetched"), plans, 200);
});
