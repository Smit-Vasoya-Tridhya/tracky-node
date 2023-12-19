const { protect } = require("../middlewares/authMiddleware");

const paymentRoute = require("express").Router();
const { createPlan, getPlans } = require("../controllers/paymentController");

// paymentRoute.use(protect);
paymentRoute.post("/create", createPlan);
paymentRoute.get("/", getPlans);

module.exports = paymentRoute;
