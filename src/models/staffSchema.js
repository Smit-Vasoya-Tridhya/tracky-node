const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },

    last_name: { type: String, require: true },

    email: { type: String, required: true },

    password: {
      type: String,
    },
    full_name: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "Deactive"],
      default: "Active",
    },
    // permissions: [{ type: String }],
    reset_password_token: { type: String },
    isStaffManagement: { type: Boolean, default: false },
    isPayment: { type: Boolean, default: false },
    isSupportTicket: { type: Boolean, default: false },
    isUsers: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    role: {
      type: String,
    },
  },

  { timestamps: true }
);

const Staff = mongoose.model("Staff", StaffSchema);

module.exports = Staff;
