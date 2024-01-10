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
    },
    reset_password_token: {
      type: String,
    },
    profile_image: {
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
      default: 0,
    },
    plan: {
      type: String,
    },
    language: {
      type: String,
    },
    skills: [{ type: String }],
    bound: {
      type: String,
    },
    time_zone: {
      type: String,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    last_session: {
      type: String,
    },
    subscription_id: {
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
    status: {
      type: String,
      enum: ["Active", "Deactive"],
      default: "Active",
    },
    authenticator_secret: {
      type: Object,
    },
    referral_code: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

userSchema.index({ referral_code: 1 });
userSchema.index({ email: 1 });

module.exports = User;
