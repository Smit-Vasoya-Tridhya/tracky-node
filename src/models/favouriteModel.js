const mongoose = require("mongoose");
const favouriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: "User" },
    templateId: { type: mongoose.Schema.ObjectId, ref: "Template" },
    is_like: { type: Boolean },
  },
  { timestamps: true }
);

const Favourite = mongoose.model("Favourite", favouriteSchema);

module.exports = Favourite;
