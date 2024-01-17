const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
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
    admin_name: {
      type: String,
    },
    reset_password_token: {
      type: String,
    },
    admin_image: {
      type: String,
    },
    admin_role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminRole",
    },
    language: {
      type: String,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
