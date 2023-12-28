const mongoose = require("mongoose");

const referralHistorySchema = new mongoose.Schema(
  {
    referral_code: {
      type: String,
      required: true,
    },
    referred_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referred_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    email: { type: String },
    registered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ReferralHistory = mongoose.model(
  "Referral_history",
  referralHistorySchema
);

module.exports = ReferralHistory;
