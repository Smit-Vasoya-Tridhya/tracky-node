const Users = require("../models/userSchema");
const Track = require("../models/trackRecordSchema");
const csvParser = require("csv-parser");
const logger = require("../logger");
const { returnMessage } = require("../utils/utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../helpers/sendEmail");
const utils = require("../utils/utils");
const Token = require("../models/tokenSchema");
const dotenv = require("dotenv");
const Role = require("../models/roleSchema");
const fs = require("fs");
dotenv.config();
class User {
  tokenGenerator = async (payload) => {
    try {
      const token = jwt.sign({ id: payload._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      return { token, user: payload };
    } catch (error) {
      logger.error("Error while token generate", error);
      return error.message;
    }
  };

  signUp = async (payload) => {
    try {
      const user = await Users.findOne({ email: payload.email }).lean();
      if (user) return returnMessage("userExists");

      payload.password = await bcrypt.hash(payload.password, 12);

      const newUser = await Users.create(payload);

      let random = crypto.randomBytes(32).toString("hex");

      const link = `verifyemail?id=${random}`;
      const randomHash = crypto
        .createHash("sha256")
        .update(random)
        .digest("hex");

      const message = utils.registerUserEmailTemplate(link);
      const subject = "Verify Email";
      sendEmail(payload.email, message, subject);
      await Token.create({
        token: randomHash,
        email: payload.email,
      });

      if (!newUser) return returnMessage("default");

      return newUser;
    } catch (error) {
      logger.error("Error while signup", error);
      return error.message;
    }
  };

  resendEmail = async (payload) => {
    try {
      const { email } = payload;

      let random = crypto.randomBytes(32).toString("hex");
      const link = `verifyemail?id=${random}`;
      const randomHash = crypto
        .createHash("sha256")
        .update(random)
        .digest("hex");

      const message = utils.registerUserEmailTemplate(link);
      const subject = "Verify Email";
      const result = sendEmail(email, message, subject);
      await Token.create({
        token: randomHash,
        email: payload.email,
      });
    } catch (error) {
      logger.error("Error while resend Email", error);
      return error.message;
    }
  };

  login = async (data) => {
    try {
      if (!data.email || !data.password)
        return returnMessage("emailPassNotFound");

      let user = await Users.findOne({
        email: data.email,
        is_deleted: false,
      }).select("+password");
      if (!user) return returnMessage("userNotFound");
      if (!user.email_verified) return returnMessage("emailNotVerified");

      if (!user) return returnMessage("IncorrectLogin");

      const comparePassword = await bcrypt.compare(
        data.password,
        user.password
      );
      if (!comparePassword) return returnMessage("incorrectEmailPassword");
      const { password, ...userDataWithoutPassword } = user.toObject();
      const resData = this.tokenGenerator(userDataWithoutPassword);

      return resData;
    } catch (error) {
      logger.error("Error while login", error);
      return error.message;
    }
  };

  verifyEmail = async (payload) => {
    try {
      const randomHash = crypto
        .createHash("sha256")
        .update(payload.id)
        .digest("hex");
      let tokens = await Token.findOne({ token: randomHash });
      if (!tokens) return returnMessage("InvalidTokenLink");

      const reqToken = crypto
        .createHash("sha256")
        .update(payload.id)
        .digest("hex");

      if (reqToken === tokens.token) {
        const updateUser = await Users.findOneAndUpdate(
          { email: tokens.email },
          { $set: { email_verified: true } },
          { new: true }
        );
        const { password, ...userDataWithoutPassword } = updateUser.toObject();
        const resData = this.tokenGenerator(userDataWithoutPassword);
        return resData;
      } else {
        returnMessage("invalidtoken");
      }
    } catch (error) {
      logger.error("Error while verifyEmail", error);
      return error.message;
    }
  };

  googleSign = async (payload) => {
    try {
      const { signupId } = payload;
      if (!signupId) return returnMessage("googelAuthTokenNotFound");
      const user = jwt.decode(signupId);

      let existingUser = await Users.findOne({ email: user.email });

      if (!existingUser) {
        const newUser = {
          email: user.email,
          password: user.password,
          first_name: user.given_name,
          last_name: user.family_name,
          user_name: user.name,
          email_verified: true,
          google_sign_in: true,
          terms_privacy_policy: true,
        };
        const createUser = await Users.create(newUser);
        const userResponse = createUser.toObject({
          getters: true,
          virtuals: false,
        });
        delete userResponse.password;
        const res = await this.tokenGenerator(userResponse);
        return res;
      } else {
        const res = await this.tokenGenerator(existingUser);
        return res;
      }
    } catch (error) {
      logger.error("Error while google sign In", error);
      return error.message;
    }
  };

  forgetPassword = async (payload) => {
    try {
      const { email } = payload;

      const existingUser = await Users.findOne({ email: email });
      if (!existingUser) return returnMessage("EmailNotFound");
      const resetToken = crypto.randomBytes(32).toString("hex");

      let verifyUrl = `forget-password?token=${resetToken}`;
      existingUser.reset_password_token = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      await existingUser.save();
      const message = utils.forgetPasswordUserEmailTemplate(verifyUrl);
      const subject = "Forgot Password Email";
      const result = sendEmail(email, message, subject);
      return true;
    } catch (error) {
      logger.error("Error while forgetPassword", error);
      return error.message;
    }
  };

  resetPassword = async (payload) => {
    try {
      const { token, password } = payload;

      if (!token || !password) return returnMessage("tokenOrPasswordMissing");

      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await Users.findOneAndUpdate(
        { reset_password_token: hashedToken },
        {
          $set: {
            password: await bcrypt.hash(password, 12),
            reset_password_token: null,
            // passwordResetExpires: undefined,
          },
        },
        { new: true } // This option returns the updated document
      ).select("email password");

      if (!user) return returnMessage("invalidToken");
      const res = await this.tokenGenerator(user);
      // No need to explicitly call user.save() as the document is already updated in the databas
      return res;
    } catch (error) {
      logger.error("Error while resetPassword", error);
      return error.message;
    }
  };

  appleSign = async (payload) => {
    try {
      const { idToken } = payload;
      // Validate that idToken is present
      if (!idToken) return returnMessage("idTokenNotFound");
      const decodedToken = jwt.decode(idToken);

      let existingUser = await Users.findOne({
        email: decodedToken.email,
      }).lean();

      if (!existingUser) {
        const newUser = {
          email: decodedToken.email,
          email_verified: true,
          apple_sign_in: true,
          terms_privacy_policy: true,
        };

        const createUser = await Users.create(newUser);
        const userResponse = createUser.toObject({
          getters: true,
          virtuals: false,
        });
        delete userResponse.password;
        return await this.tokenGenerator(userResponse);
      }
      return await this.tokenGenerator(existingUser);
    } catch (error) {
      logger.error("Error while appleSign", error);
      return error.message;
    }
  };

  updateProfile = async (payload, files, user) => {
    try {
      if (!payload.role) return returnMessage("RoleUndefine");

      let profileImageFileName, trackRecordCsvFileName;
      if (files["profile_image"]) {
        profileImageFileName = files["profile_image"][0]?.filename;
      }
      // if (files["track_record_csv"]) {
      //   trackRecordCsvFileName = files["track_record_csv"][0]?.filename;
      // }

      const updateUser = await Users.findByIdAndUpdate(
        user._id,
        {
          payload,
          profile_image: profileImageFileName,
          role: payload.role,
          bio: payload.bio,
        },
        { new: true }
      ).populate("role");

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
            console.log("Skipping row with empty column");
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
      return updateUser;
    } catch (error) {
      logger.error("Error while update profile", error);
      return error.message;
    }
  };

  getProfilebyId = async (user) => {
    try {
      const _id = user.id;
      let profileData = await Users.findById(_id).select("-password");
      let trackData = await Track.find({ user_id: _id });
      let role = await Role.findById({ _id: profileData.role });
      const sumData = {};

      if (!profileData) return returnMessage("profileNotExist");

      if (role.key === "settler") {
        sumData.total_chat = trackData.reduce(
          (sum, entry) => sum + entry.total_chat,
          0
        );
      } else if (role.key === "closer") {
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
      return { profileData, sumData, role };
    } catch (error) {
      logger.error("Error while fetch Profile", error);
      return error.message;
    }
  };

  editProfile = async (user) => {
    try {
      const _id = user.id;
      let profileToUpdate = await Users.findById(_id);

      if (!profileToUpdate) {
        return returnMessage("ProfileNotFound");
      }

      profileToUpdate.profile_name =
        req.body.profile_name || profileToUpdate.profile_name;
      profileToUpdate.bio = req.body.bio || profileToUpdate.bio;
      profileToUpdate.role = req.body.role || profileToUpdate.role;
      profileToUpdate.language = req.body.language || profileToUpdate.language;
      profileToUpdate.skills = req.body.skills || profileToUpdate.skills;
      profileToUpdate.bound = req.body.bound || profileToUpdate.bound;
      profileToUpdate.skills = req.body.skills || profileToUpdate.skills;

      if (req.files["profile_image"]) {
        profileToUpdate.profile_image = req.files["profile_image"][0]?.filename;
      }
      // await avgdeal  = await  Track.
      await profileToUpdate.save();

      return profileToUpdate;
    } catch (error) {
      logger.error("Error while updating profile", error);
      return error.message;
    }
  };
}

module.exports = User;
