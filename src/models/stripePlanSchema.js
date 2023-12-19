const mongoose = require("mongoose");

const stripePlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    plan_id: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "usd",
    },

    interval: {
      type: String,
      enum: ["day", "week", "month", "year"],
      required: true,
      default: "month",
    },
    sort_value: {
      type: Number,
    },
  },
  { timestamps: true }
);

const StripePlan = mongoose.model("StripePlan", stripePlanSchema);

module.exports = StripePlan;
