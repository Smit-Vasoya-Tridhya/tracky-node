const catchAsyncError = require("../helpers/catchAsyncError");
const AppError = require("./../helpers/errorHandler");
const PitchService = require("../services/pitchService");
const pitchService = new PitchService();
const Pitch = require("../models/pitchGeneratorSchema");
const sendResponse = require("../utils/sendResponse");
const { returnMessage } = require("../utils/utils");

exports.pitchGenerator = catchAsyncError(async (req, res, next) => {
  const pitch = await pitchService.newPitch(req.body, req.user);

  if (typeof pitch === "string") return next(new AppError(pitch, 400));

  res.writeHead(200, {
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });

  let content = "";
  for await (const part of pitch.openai_chat) {
    if (part.choices[0].delta.content) {
      content += part.choices[0].delta.content;
      res.write(part.choices[0].delta.content);
    }
  }
  let history = pitch?.pitch?.history;
  history.push({ role: "assistant", content });
  await Pitch.findByIdAndUpdate(pitch?.pitch?._id, { history }, { new: true });
  res.end();
});

exports.continuePitch = catchAsyncError(async (req, res, next) => {
  const pitch = await pitchService.continuePitch(
    req.params.pitchId,
    req.body,
    req.user
  );

  if (typeof pitch === "string") return next(new AppError(pitch, 400));

  res.writeHead(200, {
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });

  let content = "";
  for await (const part of pitch.openai_chat) {
    if (part.choices[0].delta.content) {
      content += part.choices[0].delta.content;
      res.write(part.choices[0].delta.content);
    }
  }
  let history = pitch?.pitch?.history;
  history.push({ role: "assistant", content });
  await Pitch.findByIdAndUpdate(pitch?.pitch?._id, { history }, { new: true });
  res.end();
});

exports.getPitch = catchAsyncError(async (req, res, next) => {
  const pitch = await pitchService.getPitch(req.params.pitchId, req.user);

  if (typeof pitch === "string") return next(new AppError(pitch, 400));

  sendResponse(res, true, returnMessage("pitchFetch"), pitch, 200);
});

exports.updatePitch = catchAsyncError(async (req, res, next) => {
  const pitch = await pitchService.updatePitch(
    req.params.pitchId,
    req.body,
    req.user
  );

  if (typeof pitch === "string") return next(new AppError(pitch, 400));

  sendResponse(res, true, returnMessage("pitchUpdated"), {}, 200);
});

exports.getAllPitch = catchAsyncError(async (req, res, next) => {
  const pitches = await pitchService.getAllPitch(req.user);
  if (typeof pitches === "string") return next(new AppError(pitches, 400));
  sendResponse(res, true, undefined, pitches, 200);
});
