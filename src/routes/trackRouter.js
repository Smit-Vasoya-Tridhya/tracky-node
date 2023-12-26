const {
  trackCsv,
  updateTrack,
  fetchTrack,
} = require("../controllers/trackRecordController");
const { protect } = require("../middlewares/authMiddleware");
const trackRoute = require("express").Router();
trackRoute.get("/download-csv/:id", trackCsv);
trackRoute.use(protect);
trackRoute.put("/update", updateTrack);
trackRoute.get("/fetch", fetchTrack);
module.exports = trackRoute;
