const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    invoice_id: { type: String },
    plan_id: { type: String },
    interval: {
      type: String,
      required: true,
    },
    session_id: { type: String },
    subscription_id: { type: String },
    amount: { type: String },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("invoice", invoiceSchema);

module.exports = Invoice;
