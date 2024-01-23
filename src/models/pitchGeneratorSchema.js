const mongoose = require("mongoose");

const pitchSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    user_prompt: { type: String, required: true },
    selected_role: { type: String, enum: ["gatekeeper", "persona"] },
    name: { type: String, default: "New chat" },
    history: [
      {
        role: { type: String, required: true },
        content: { type: String, required: true },
        date: { type: Date, default: new Date() },
      },
    ],
  },
  { timestamps: true }
);

const Pitch = mongoose.model("pitch", pitchSchema);

module.exports = Pitch;
