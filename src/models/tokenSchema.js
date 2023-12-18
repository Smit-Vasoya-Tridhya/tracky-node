const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    //createdAt: { type: Date, required: true, default: Date.now, expires: 3600 },
    email: {
      type: String,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
