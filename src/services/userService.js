const User = require("../models/userSchema");
const Role = require("../models/roleSchema");
const Track = require("../models/trackRecordSchema");
const logger = require("../logger");
const {
  returnMessage,
  validateEmail,
  invitationEmailTemplate,
} = require("../utils/utils");
const PaymentService = require("./paymentService");
const paymentService = new PaymentService();
const PaymentHistory = require("../models/paymentHistorySchema");
const ReferralHistory = require("../models/referralHistorySchema");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const fs = require("fs");
const sendEmail = require("../helpers/sendEmail");

class UserService {
  updateProfile = async (payload, files, user) => {
    try {
      if (!payload.role) return returnMessage("roleUndefined");
      if (!payload.track_record) return returnMessage("trackRecordNotDefine");

      let profileImageFileName, trackRecordCsvFileName;
      if (files["profile_image"]) {
        profileImageFileName = "uploads/" + files["profile_image"][0]?.filename;
      }

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

      if (
        files["track_record_csv"] &&
        fs.existsSync(files["track_record_csv"][0]?.path)
      ) {
        trackRecordCsvFileName =
          "uploads/" + files["track_record_csv"][0]?.filename;
        const bufferString = fs.readFileSync(
          files["track_record_csv"][0]?.path,
          "utf-8"
        );
        const role = await Role.findById(payload?.role).lean();
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

        fs.unlinkSync(files["track_record_csv"][0]?.path);
        await Track.deleteMany({ user_id: user._id });
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

  editProfile = async (payload, files, user) => {
    try {
      const {
        first_name,
        last_name,
        bio,
        role,
        language,
        skills,
        bound,
        time_zone,
        average_deal_size,
      } = payload;

      const update_data = {
        first_name,
        last_name,
        bio,
        role,
        language,
        skills,
        bound,
        time_zone,
        average_deal_size,
      };

      if (files?.fieldname === "profile_image") {
        update_data.profile_image = "uploads/" + files?.filename;
        if (fs.existsSync(`src/public/uploads/${user?.profile_image}`)) {
          fs.unlinkSync(`src/public/uploads/${user?.profile_image}`);
        }
      }

      return await User.findByIdAndUpdate(user._id, update_data, {
        new: true,
      });
    } catch (error) {
      logger.error("Error while updating profile", error);
      return error.message;
    }
  };

  deleteProfile = async (user) => {
    try {
      const user_exist = await User.findById(user._id).lean();
      if (!user_exist) return returnMessage("userIdNotExist");

      const promise_array = [
        User.findByIdAndUpdate(user_exist._id, {
          email_verified: false,
          on_board: false,
          is_deleted: true,
          plan_purchased: false,
          plan_purchased_type: null,
          authenticator_secret: {},
        }),
        PaymentHistory.updateMany(
          { user_id: user_exist._id },
          { active: false }
        ),
      ];

      if (user_exist?.subscription_id)
        promise_array.push(
          stripe.subscriptions.cancel(user_id?.subscription_id)
        );

      await Promise.all(promise_array);
      return true;
    } catch (error) {
      logger.error("Error while deleting the user", error);
      return error.message;
    }
  };

  sendInvitation = async (payload, user) => {
    try {
      const { email } = payload;
      if (!validateEmail(email)) return returnMessage("invalidEmail");
      const email_exist = await User.findOne({ email }).lean();
      if (email_exist) return returnMessage("emailExist");
      const link = `${process.env.REACT_APP_BASE_URL}/signup?referral=${user?.referral_code}`;
      const email_template = invitationEmailTemplate(
        link,
        user?.user_name ? user?.user_name : user?.first_name + user?.last_name
      );
      sendEmail(email, email_template, returnMessage("invitationEmailSubject"));

      await ReferralHistory.create({
        referral_code: user?.referral_code,
        referred_by: user?._id,
        email,
        registered: false,
      });
      return;
    } catch (error) {
      logger.error("Error while send an invitation", error);
      return error.message;
    }
  };

  referralStatus = async (user) => {
    try {
      const successful_signup = await ReferralHistory.countDocuments({
        referred_by: user?._id,
        registered: true,
        referral_code: user?.referral_code,
      });
      return { successful_signup };
    } catch (error) {
      logger.error(`Error while fetching referral status: ${error}`);
      return error.message;
    }
  };
}

module.exports = UserService;
