const { trackCsv } = require("../controllers/trackRecordController");
const { protect } = require("../middlewares/authMiddleware");
const trackRoute = require("express").Router();
// trackRoute.use(protect);
trackRoute.get("/download-csv/:id", trackCsv);
module.exports = trackRoute;
