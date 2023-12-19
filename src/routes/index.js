const router = require("express").Router();

const profileRoute = require("./profileRoute");
const roleRoute = require("./roleRoute");
const trackRoute = require("./trackRouter");
const userRoute = require("./userRoute");
const paymentRoute = require("./paymentRoute");

router.use("/api/v1/user", userRoute);
router.use("/api/v1/profile", profileRoute);
<<<<<<< HEAD
router.use("/api/v1/payment", paymentRoute);
=======
router.use("/api/v1/role", roleRoute);
router.use("/api/v1/track", trackRoute);
>>>>>>> 183628d8736aa7c7e7e0446e9c259a00de138465

module.exports = router;
