const router = require("express").Router();

const profileRoute = require("./profileRoute");
const userRoute = require("./userRoute");
const paymentRoute = require("./paymentRoute");

router.use("/api/v1/user", userRoute);
router.use("/api/v1/profile", profileRoute);
router.use("/api/v1/payment", paymentRoute);

module.exports = router;
