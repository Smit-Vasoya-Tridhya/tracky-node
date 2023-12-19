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
    invoice_id: { type: String },
    session_id: { type: String },
    subscription_id: { type: String },
    data: { type: Object },
  },
  { timestamps: true }
);

const PaymentHistory = mongoose.model("Payment_History", paymentHistorySchema);

module.exports = PaymentHistory;
