const mongoose = require("mongoose");

const freeSubscriptionHistory = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan_id: {
      type: String,
      required: true,
    },
    interval: {
      type: String,
      default: "month",
    },
    subscription_id: { type: String, required: true },
  },
  { timestamps: true }
);

const FreeSubscriptionHistory = mongoose.model(
  "free_subscription_history",
  freeSubscriptionHistory
);

module.exports = FreeSubscriptionHistory;
