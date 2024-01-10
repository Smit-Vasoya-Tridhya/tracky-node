const catchAsyncError = require("../helpers/catchAsyncError");
const AppError = require("./../helpers/errorHandler");
const TemplateService = require("../services/templateService");
const templateService = new TemplateService();
const sendResponse = require("../utils/sendResponse");
const { returnMessage } = require("../utils/utils");

exports.createTemplate = catchAsyncError(async (req, res, next) => {
  const createTemplate = await templateService.createTemplate(
    req.body,
    req.user
  );

  if (typeof createTemplate === "string")
    return next(new AppError(createTemplate, 400));

  sendResponse(res, true, returnMessage("createTemplate"), createTemplate, 200);
});

exports.updateTemplate = catchAsyncError(async (req, res, next) => {
  const updateTemplate = await templateService.updateTemplate(
    req.body,
    req.params
  );

  if (typeof updateTemplate === "string")
    return next(new AppError(updateTemplate, 400));

  sendResponse(res, true, returnMessage("updateTemplate"), updateTemplate, 200);
});

exports.templateList = catchAsyncError(async (req, res, next) => {
  const templateList = await templateService.templateList(req.body, req.user);

  if (typeof templateList === "string")
    return next(new AppError(templateList, 400));

  sendResponse(res, true, returnMessage("templateList"), templateList, 200);
});

exports.templateListById = catchAsyncError(async (req, res, next) => {
  const templateListById = await templateService.templateListById(
    req.body,
    req.params,
    req.user
  );

  if (typeof templateListById === "string")
    return next(new AppError(templateListById, 400));

  sendResponse(res, true, returnMessage("templateList"), templateListById, 200);
});
