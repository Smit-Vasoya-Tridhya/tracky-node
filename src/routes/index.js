const router = require("express").Router();

const profileRoute = require("./profileRoute");
const roleRoute = require("./roleRoute");
const trackRoute = require("./trackRouter");
const userRoute = require("./userRoute");
const paymentRoute = require("./paymentRoute");
const pastClientRoute = require("./pastClientRoute");
const templateRoute = require("./templateRoute");
const favouriteRoute = require("./favouriteRoute");

router.use("/api/v1/user", userRoute);
router.use("/api/v1/profile", profileRoute);
router.use("/api/v1/payment", paymentRoute);
router.use("/api/v1/role", roleRoute);
router.use("/api/v1/track", trackRoute);
router.use("/api/v1/past-client", pastClientRoute);
router.use("/api/v1/template", templateRoute);
router.use("/api/v1/favourite", favouriteRoute);

module.exports = router;
