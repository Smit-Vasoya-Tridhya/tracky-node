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
