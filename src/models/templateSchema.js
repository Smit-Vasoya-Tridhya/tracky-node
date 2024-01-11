const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    template: [
      {
        key: {
          type: String,
          required: true,
        },
        value: {
          type: String,
        },
      },
    ],
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    template_type: {
      enum: ["personal", "community"],
      type: String,
      default: "personal",
    },
    selected_role: { type: String },
  },
  { timestamps: true }
);

const Template = mongoose.model("Template", templateSchema);

module.exports = Template;
