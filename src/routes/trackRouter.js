const {
  trackCsv,
  updateTrack,
  fetchTrack,
  getTrackRecordByDate,
} = require("../controllers/trackRecordController");
const { protect } = require("../middlewares/authMiddleware");
const trackRoute = require("express").Router();
trackRoute.get("/download-csv/:id", trackCsv);
trackRoute.use(protect);
trackRoute.put("/update", updateTrack);
trackRoute.get("/fetch", fetchTrack);
trackRoute.get("/fetchdate/:date", getTrackRecordByDate);
module.exports = trackRoute;
