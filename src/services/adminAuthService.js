const Admin = require("../models/adminSchema");
const Staff = require("../models/staffSchema");
const logger = require("../logger");
const { returnMessage } = require("../utils/utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../helpers/sendEmail");
const utils = require("../utils/utils");

class AuthService {
  tokenGenerator = (payload) => {
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

  login = async (data) => {
    try {
      if (!data.email || !data.password)
        return returnMessage("emailPassNotFound");

      let user = await Admin.findOne({
        email: data.email,
        is_deleted: false,
      }).select("+password");

      let staff = await Staff.findOne({
        email: data.email,
        is_deleted: false,
        status: "Active",
      }).select("+password");

      let comparePassword;
      if (user) {
        comparePassword = await bcrypt.compare(data.password, user.password);
        if (!comparePassword) return returnMessage("incorrectEmailPassword");
        const { password, ...userDataWithoutPassword } = user.toObject();
        return this.tokenGenerator(userDataWithoutPassword);
      } else if (staff) {
        comparePassword = await bcrypt.compare(data.password, staff.password);
        if (!comparePassword) return returnMessage("incorrectEmailPassword");
        const { password, ...userDataWithoutPassword } = staff.toObject();
        return this.tokenGenerator(userDataWithoutPassword);
      } else {
        return returnMessage("userNotFound");
      }
    } catch (error) {
      logger.error("Error while login", error);
      return error.message;
    }
  };

  forgetPassword = async (payload) => {
    try {
      const { email } = payload;

      const existingAdmin = await Admin.findOne({
        email: email,
        is_deleted: false,
      });
      const existingStaff = await Staff.findOne({
        email: email,
        is_deleted: false,
      });

      if (existingAdmin) {
        if (!existingAdmin) return returnMessage("emailNotFound");
        const resetToken = crypto.randomBytes(32).toString("hex");

        let verifyUrl = `reset-password?token=${resetToken}`;
        existingAdmin.reset_password_token = crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");
        await existingAdmin.save();
        const message = utils.forgetPasswordAdminEmailTemplate(verifyUrl);
        const subject = "Forgot Password Email";
        sendEmail(email, message, subject);
        return true;
      } else if (existingStaff) {
        if (!existingStaff) return returnMessage("emailNotFound");
        const resetToken = crypto.randomBytes(32).toString("hex");

        let verifyUrl = `reset-password?token=${resetToken}`;
        existingStaff.reset_password_token = crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");
        await existingStaff.save();
        const message = utils.forgetPasswordAdminEmailTemplate(verifyUrl);
        const subject = "Forgot Password Email";
        sendEmail(email, message, subject);
        return true;
      } else {
        return returnMessage("emailNotFound");
      }
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

      let staff = await Staff.findOne({ reset_password_token: hashedToken });
      let admin = await Admin.findOne({ reset_password_token: hashedToken });
      if (staff) {
        const user = await Staff.findOneAndUpdate(
          { reset_password_token: hashedToken, is_deleted: false },
          {
            $set: {
              password: await bcrypt.hash(password, 12),
              reset_password_token: null,
            },
          },
          { new: true } // This option returns the updated document
        ).select("email password");
        if (!user) return returnMessage("invalidToken");
        return this.tokenGenerator(user);
      } else if (admin) {
        const user = await Admin.findOneAndUpdate(
          { reset_password_token: hashedToken, is_deleted: false },
          {
            $set: {
              password: await bcrypt.hash(password, 12),
              reset_password_token: null,
            },
          },
          { new: true } // This option returns the updated document
        ).select("email password");
        if (!user) return returnMessage("invalidToken");
        return this.tokenGenerator(user);
      }
    } catch (error) {
      logger.error("Error while resetPassword", error);
      return error.message;
    }
  };
}

module.exports = AuthService;
