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

exports.checkoutSession = catchAsyncError(async (req, res, next) => {
  const session = await paymentService.checkoutSession(req.body, req.user);

  if (typeof session === "string") return next(new AppError(session, 400));

  sendResponse(res, true, returnMessage("sessionCreated"), session, 200);
});

exports.webhook = catchAsyncError(async (req, res, next) => {
  const success = await paymentService.webhookHandle(req.body);

  if (!success) return sendResponse(res, true, "", {}, 400);

  return sendResponse(res, true, "", {}, 200);
});

exports.paymentHistory = catchAsyncError(async (req, res, next) => {
  const payment_history = await paymentService.paymentHistory(req.body);

  if (typeof payment_history === "string")
    return next(new AppError(payment_history, 400));

  sendResponse(
    res,
    true,
    returnMessage("paymentHistoryFetched"),
    payment_history,
    200
  );
});
