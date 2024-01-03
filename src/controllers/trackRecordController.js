const catchAsyncError = require("../helpers/catchAsyncError");
const AppError = require("./../helpers/errorHandler");
const trackReacordervice = require("../services/trackRecordService");
const trackService = new trackReacordervice();
const sendResponse = require("../utils/sendResponse");
const { returnMessage } = require("../utils/utils");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

exports.trackCsv = catchAsyncError(async (req, res, next) => {
  try {
    let track = await trackService.getTrack(req.params);

    let data = [
      { id: "date", title: "Date" },
      { id: "total_chat", title: "Total Chat" },
      { id: "total_calls", title: "Total Call" },
      { id: "total_client", title: "Total Client" },
      { id: "total_closed", title: "Total Closed" },
      { id: "total_lost", title: "Total Lost" },
    ];
    if (track.key === "closer") {
      data = data.filter((item) => item.id !== "total_calls");
    } else {
      data = data.filter((item) => item.id !== "total_chat");
    }

    const csvWriter = createCsvWriter({
      path: "data.csv",
      header: data,
    });

    csvWriter
      .writeRecords(data)
      .then(() => {
        res.download("data.csv", "data.csv", (err) => {
          if (!err) {
            const fs = require("fs");
            fs.unlinkSync("data.csv");
          }
        });
      })
      .catch((err) => {
        console.error("Error writing CSV:", err);
        res.status(500).send("Internal Server Error");
      });
  } catch (error) {
    console.error("Error while processing CSV:", error);
    sendResponse(res, false, returnMessage("Error processing CSV"), null, 500);
  }
});

exports.updateTrack = catchAsyncError(async (req, res, next) => {
  const updateTrack = await trackService.updateTrackRecord(req.body, req.user);

  if (typeof updateTrack === "string")
    return next(new AppError(updateTrack, 400));

  sendResponse(res, true, returnMessage("updateTrack"), updateTrack, 200);
});

exports.fetchTrack = catchAsyncError(async (req, res, next) => {
  const fetchTrack = await trackService.getTrackRecord(req.user);

  if (typeof fetchTrack === "string")
    return next(new AppError(fetchTrack, 400));

  sendResponse(res, true, returnMessage("fetchTrack"), fetchTrack, 200);
});

exports.getTrackRecordByDate = catchAsyncError(async (req, res, next) => {
  const getTrackRecordByDate = await trackService.getRecordByDate(
    req.params,
    req.user
  );

  if (typeof getTrackRecordByDate === "string")
    return next(new AppError(getTrackRecordByDate, 400));

  sendResponse(
    res,
    true,
    returnMessage("fetchTrack"),
    getTrackRecordByDate,
    200
  );
});
exports.getMonthlyData = catchAsyncError(async (req, res, next) => {
  const getTrackMonthlyData = await trackService.getMonthlyData(
    req.query,
    req.user
  );

  if (typeof getTrackMonthlyData === "string")
    return next(new AppError(getTrackMonthlyData, 400));

  sendResponse(
    res,
    true,
    returnMessage("fetchTrack"),
    getTrackMonthlyData,
    200
  );
});
