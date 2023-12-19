const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema(
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
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    data: { type: Object },
  },
  { timestamps: true }
);

const PaymentHistory = mongoose.model("Payment_History", paymentHistorySchema);

module.exports = PaymentHistory;
