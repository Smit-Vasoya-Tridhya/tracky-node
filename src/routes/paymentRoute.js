const { protect } = require("../middlewares/authMiddleware");
const express = require("express");

const paymentRoute = express.Router();
const {
  createPlan,
  getPlans,
  checkoutSession,
  webhook,
} = require("../controllers/paymentController");

paymentRoute.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhook
);

paymentRoute.use(protect);
paymentRoute.post("/create", createPlan);
paymentRoute.get("/", getPlans);
paymentRoute.post("/checkout", checkoutSession);

module.exports = paymentRoute;
