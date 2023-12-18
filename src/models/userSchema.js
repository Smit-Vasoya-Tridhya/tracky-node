const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    country: {
      type: String,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    tems_privacy_policy: {
      type: Boolean,
      default: false,
    },
    google_sign_in: {
      type: Boolean,
      default: false,
    },
    apple_sign_in: {
      type: Boolean,
      default: false,
    },
    on_board: {
      type: Boolean,
      default: false,
    },
    user_name: {
      type: String,
      unique: true,
    },
    reset_password_token: {
      type: String,
    },
    profile_image: {
      type: String,
    },
    profile_name: {
      type: String,
    },
    bio: {
      type: String,
    },
    roll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    track_record: {
      type: Boolean,
      require: true,
    },
    track_record_csv: {
      type: String,
    },
    plan: {
      type: String,
      required: true,
    },
    language: {
      type: String,
    },
    skills: {
      type: String,
    },
    bound: {
      type: String,
    },

    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
