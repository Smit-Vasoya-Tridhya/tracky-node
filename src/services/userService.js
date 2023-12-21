const User = require("../models/userSchema");
const Role = require("../models/roleSchema");
const Track = require("../models/trackRecordSchema");
const csvParser = require("csv-parser");
const logger = require("../logger");
const { returnMessage } = require("../utils/utils");
const PaymentService = require("./paymentService");
const paymentService = new PaymentService();

class UserService {
  updateProfile = async (payload, files, user) => {
    try {
      if (!payload.role) return returnMessage("RoleUndefined");

      let profileImageFileName, trackRecordCsvFileName;
      if (files["profile_image"]) {
        profileImageFileName = files["profile_image"][0]?.path;
      }
      // if (files["track_record_csv"]) {
      //   trackRecordCsvFileName = files["track_record_csv"][0]?.filename;
      // }

      await User.findByIdAndUpdate(
        user._id,
        {
          payload,
          profile_image: profileImageFileName,
          role: payload.role,
          bio: payload.bio,
        },
        { new: true }
      );

      if (files["track_record_csv"]) {
        trackRecordCsvFileName = files["track_record_csv"][0]?.filename;

        const buffer = files["track_record_csv"][0].buffer;
        const bufferString = buffer.toString("utf-8");
        const _id = payload.role;
        const role = await Role.findById(_id).lean();
        const data = [];
        let isFirstLine = true;

        bufferString.split("\n").forEach((line) => {
          if (isFirstLine) {
            isFirstLine = false;
            return;
          }

          const columns = line.split(",");
          if (columns.some((column) => column.trim() === "")) {
            logger.info("Skipping row with empty column");
            return;
          }

          if (role.key === "closer") {
            data.push({
              date: columns[0],
              total_call: parseInt(columns[1]),
              total_client: parseInt(columns[2]),
              total_closed: parseInt(columns[3]),
              total_lost: parseInt(columns[4]),
              average_deal_size: payload.average_deal_size,
              user_id: payload.user_id,
            });
          } else if (role.key === "appointment_setter") {
            data.push({
              date: columns[0],
              total_chat: parseInt(columns[1]),
              total_client: parseInt(columns[2]),
              total_closed: parseInt(columns[3]),
              total_lost: parseInt(columns[4]),
              average_deal_size: payload.average_deal_size,
              user_id: payload.user_id,
            });
          }
        });

        await Track.insertMany(data);
      }

      const checkoutLink = await paymentService.checkoutSession(
        {
          plan_id: payload?.plan_id,
          success_url: payload?.success_url,
          cancel_url: payload?.cancel_url,
        },
        user
      );
      if (typeof checkoutLink === "string") return checkoutLink;

      return checkoutLink;
    } catch (error) {
      logger.error("Error while update profile", error);
      return error.message;
    }
  };

  getProfilebyId = async (user) => {
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

      if (!profileData) return returnMessage("profileNotExist");
      return { profileData, sumData };
    } catch (error) {
      logger.error("Error while fetch Profile", error);
      return error.message;
    }
  };

  editProfile = async (payload, user) => {
    try {
      if (!user) return returnMessage("userNotFound");
      const _id = user._id;

      let profileToUpdate = await User.findByIdAndUpdate(_id, payload, {
        new: true,
      });

      if (!profileToUpdate) {
        return returnMessage("profileNotUpdated");
      }

      return profileToUpdate;
    } catch (error) {
      logger.error("Error while updating profile", error);
      return error.message;
    }
  };
}

module.exports = UserService;
