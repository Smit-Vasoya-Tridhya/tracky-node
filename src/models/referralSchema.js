const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    referral_code: {
      type: String,
      required: true,
    },
    referral_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    registered_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    registered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Referral = mongoose.model("Referral", referralSchema);

module.exports = Referral;
