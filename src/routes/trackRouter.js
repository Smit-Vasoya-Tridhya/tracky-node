const {
  trackCsv,
  updateTrack,
  fetchTrack,
  getTrackRecordByDate,
  getMonthlyData,
} = require("../controllers/trackRecordController");
const { protect } = require("../middlewares/authMiddleware");
const trackRoute = require("express").Router();
trackRoute.get("/download-csv/:id", trackCsv);
trackRoute.use(protect);
trackRoute.put("/update", updateTrack);
trackRoute.get("/fetch", fetchTrack);
trackRoute.get("/monthly-data", getMonthlyData);
trackRoute.get("/fetchdate/:date", getTrackRecordByDate);
module.exports = trackRoute;
