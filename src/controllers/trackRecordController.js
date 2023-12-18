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
      // Remove the "Total Call" field for closers
      data = data.filter((item) => item.id !== "total_calls");
    } else {
      // Remove the "Total Chat" field for appointment setters
      data = data.filter((item) => item.id !== "total_chat");
    }

    const csvWriter = createCsvWriter({
      path: "data.csv",
      header: data,
    });

    // Write data to the CSV file
    csvWriter
      .writeRecords(data)
      .then(() => {
        // Send the generated CSV file to the client
        res.download("data.csv", "data.csv", (err) => {
          // Delete the file after it has been sent
          if (!err) {
            const fs = require("fs");
            fs.unlinkSync("data.csv");
          }
        });

        sendResponse(res, true, returnMessage("csvfetch"), 200);
      })
      .catch((err) => {
        console.error("Error writing CSV:", err);
        res.status(500).send("Internal Server Error");
      });
  } catch (error) {
    // Handle any errors that occur during CSV generation or sending
    console.error("Error while processing CSV:", error);
    sendResponse(res, false, returnMessage("Error processing CSV"), null, 500);
  }
});
