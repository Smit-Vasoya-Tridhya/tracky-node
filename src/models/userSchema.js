const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
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
    terms_privacy_policy: {
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
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    track_record: {
      type: Boolean,
    },
    average_deal_size: {
      type: String,
      default: "n/a",
    },
    plan: {
      type: String,
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
    last_session: {
      type: String,
    },
    plan_purchased: {
      type: Boolean,
      default: false,
    },
    plan_purchased_type: {
      type: String,
      enum: ["year", "month", null],
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
