const router = require("express").Router();

const profileRoute = require("./profileRoute");
const userRoute = require("./userRoute");

router.use("/api/v1/user", userRoute);
router.use("/api/v1/profile", profileRoute);

module.exports = router;
