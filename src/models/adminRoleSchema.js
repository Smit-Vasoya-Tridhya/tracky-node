const mongoose = require("mongoose");

const adminRoleSchema = new mongoose.Schema(
  {
    admin_role: { type: String, required: true },

    permissions: [
      {
        section: { type: String },
        permissions: {
          read: { type: Boolean, default: false },
          write: { type: Boolean, default: false },
          notApplicable: { type: Boolean, default: false },
        },
      },
    ],

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
  },

  { timestamps: true }
);

const AdminRole = mongoose.model("AdminRole", adminRoleSchema);

module.exports = AdminRole;
