const router = require("express").Router();

const profileRoute = require("./profileRoute");
const roleRoute = require("./roleRoute");
const trackRoute = require("./trackRouter");
const userRoute = require("./userRoute");

router.use("/api/v1/user", userRoute);
router.use("/api/v1/profile", profileRoute);
router.use("/api/v1/role", roleRoute);
router.use("/api/v1/track", trackRoute);

module.exports = router;
