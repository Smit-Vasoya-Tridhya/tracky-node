const mongoose = require("mongoose");

const trackRecordSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, default: new Date() },
    average_deal_size: {
      type: Number,
      default: 0,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      require: true,
    },
    total_chat: {
      type: Number,
      default: 0,
    },
    total_calls: {
      type: Number,
      default: 0,
    },
    total_client: {
      type: Number,
      default: 0,
    },
    track_record_csv: {
      type: Number,
    },
    total_closed: {
      type: Number,
      default: 0,
    },
    total_lost: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const TrackRecord = mongoose.model("TrackRecord", trackRecordSchema);

module.exports = TrackRecord;
