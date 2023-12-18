const mongoose = require("mongoose");

const pastClient = new mongoose.Schema(
  {
    company_Name: { type: String, required: true },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    //createdAt: { type: Date, required: true, default: Date.now, expires: 3600 },
    Revenue_made: {
      type: String,
      required: true,
    },
    company_type: {
      type: String,
      required: true,
    },
    closing_rate: {
      type: Number,
      required: true,
    },
    client_image: {
      type: String,
    },
    user_approval: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

const pastclient = mongoose.model("Token", pastClient);

module.exports = pastclient;
