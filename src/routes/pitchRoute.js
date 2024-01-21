const pitchRoute = require("express").Router();
const { protect } = require("../middlewares/authMiddleware");
const pitchController = require("../controllers/pitchController");

pitchRoute.use(protect);
pitchRoute.post("/new-pitch", pitchController.pitchGenerator);
pitchRoute.post("/continue-pitch/:pitchId", pitchController.continuePitch);
pitchRoute.get("/get-pitch/:pitchId", pitchController.getPitch);
pitchRoute.get("/", pitchController.getAllPitch);
pitchRoute.patch("/update/:pitchId", pitchController.updatePitch);

module.exports = pitchRoute;
