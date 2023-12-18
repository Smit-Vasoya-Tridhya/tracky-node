const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timeseries: true }
);

const profile = mongoose.model("Profile", ProfileSchema);

module.exports = profile;
