const Role = require("../models/roleSchema");
const Track = require("../models/trackRecordSchema");
const logger = require("../logger");
const { format } = require("fast-csv");
const moment = require("moment");
const createReadStream = require("fast-csv");
const User = require("../models/userSchema");

class TrackRecordService {
  getTrack = async (payload) => {
    try {
      const _id = payload.id;
      let trackData = await Role.findById(_id).lean();
      if (!trackData) return returnMessage("trackNotExist");
      return trackData;
    } catch (error) {
      logger.error("Error while fetch role", error);
      return error.message;
    }
  };

  updateTrackRecord = async (payload, user) => {
    try {
      const parsedDate = moment(payload.date);
      const date = parsedDate.utc().startOf("day"); // Extract date and set time to 00:00:00
      const formattedDate = date.format();
      const existingData = await Track.findOne({ date: formattedDate });

      if (existingData) {
        return await Track.findByIdAndUpdate(
          existingData._id,
          { ...payload, date: formattedDate },
          { new: true }
        );
      } else {
        const createTrack = await Track.create({
          ...payload,
          date: date,
          user_id: user._id,
        });
        return createTrack;
      }
    } catch (error) {
      logger.error("Error while update track record", error);
      return error.message;
    }
  };

  getTrackRecord = async (user) => {
    try {
      let profileData = await User.findById(user._id)
        .select("-password -last_session")
        .populate("role")
        .lean();
      if (!profileData) return returnMessage("profileNotExist");

      let trackData = await Track.find({ user_id: user._id }).lean();
      const sumData = {};

      if (profileData?.role?.key === "setter") {
        sumData.total_chat = trackData.reduce(
          (sum, entry) => sum + entry.total_chat,
          0
        );
      } else if (profileData?.role?.key === "closer") {
        sumData.total_calls = trackData.reduce(
          (sum, entry) => sum + entry.total_calls,
          0
        );
      }

      sumData.total_client = trackData.reduce(
        (sum, entry) => sum + entry.total_client,
        0
      );
      sumData.total_closed = trackData.reduce(
        (sum, entry) => sum + entry.total_closed,
        0
      );
      sumData.total_lost = trackData.reduce(
        (sum, entry) => sum + entry.total_lost,
        0
      );

      const totalDealSize = trackData.reduce(
        (sum, entry) => sum + entry.average_deal_size,
        0
      );
      sumData.average_deal_size =
        trackData.length > 0 ? totalDealSize / trackData.length : 0;

      const currentYear = moment().year();
      const startOfYear = moment().startOf("year");
      const endOfYear = moment().endOf("year");

      const monthlyData = await Track.aggregate([
        {
          $match: {
            date: { $gte: startOfYear.toDate(), $lt: endOfYear.toDate() },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$date" }, year: { $year: "$date" } },
            totalClose: { $sum: "$total_closed" },
            totalCalls: { $sum: "$total_calls" },
          },
        },
        {
          $project: {
            _id: 0,
            month: "$_id.month",
            year: "$_id.year",
            totalClose: 1,
            totalCalls: 1,
            data: 1,
          },
        },
        {
          $sort: { month: 1 },
        },
      ]);

      // Now monthlyData contains the desired structure.

      return { sumData, monthlyData, profileData };
    } catch (error) {
      logger.error("Error while fetch track record", error);
      return error.message;
    }
  };

  getRecordByDate = async (params) => {
    try {
      const parsedDate = moment(params.date);
      const date = parsedDate.utc().startOf("day");
      const formattedDate = date.format();
      return await Track.findOne({ date: formattedDate }).lean();
    } catch (error) {
      logger.error("Error while fetch track record", error);
      return error.message;
    }
  };
}

module.exports = TrackRecordService;
