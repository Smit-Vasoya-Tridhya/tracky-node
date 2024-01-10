const User = require("../models/userSchema");
const logger = require("../logger");
const Token = require("../models/tokenSchema");
const { returnMessage } = require("../utils/utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../helpers/sendEmail");
const utils = require("../utils/utils");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const { eventEmitter } = require("../socket");
const ObjectId = require("mongoose").Types.ObjectId;
const ReferralHistory = require("../models/referralHistorySchema");

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

  signUp = async (payload) => {
    try {
      const user = await User.findOne({
        email: payload.email,
        is_deleted: false,
        status: "Acitve",
      }).lean();
      if (user) return returnMessage("userExists");

      payload.password = await bcrypt.hash(payload.password, 12);

      const newUser = await User.create(payload);

      let random = crypto.randomBytes(32).toString("hex");

      const link = `${process.env.REACT_APP_BASE_URL}/verifyemail?id=${random}`;
      const randomHash = crypto
        .createHash("sha256")
        .update(random)
        .digest("hex");
      const user_name = newUser?.first_name + " " + newUser?.last_name;
      const message = utils.registerUserEmailTemplate(link, user_name);
      const subject = "Verify your email";
      sendEmail(payload.email, message, subject);
      await Token.create({
        token: randomHash,
        email: payload.email,
      });

      if (!newUser) return returnMessage("default");

      if (payload?.referral_code) {
        const referral_registered = await this.referralSignUp({
          referral_code: payload?.referral_code,
          referred_to: newUser,
        });

        if (typeof referral_registered === "string") {
          await User.findByIdAndDelete(newUser._id);
          return referral_registered;
        }
      }
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
      sendEmail(email, message, subject);
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

      let user = await User.findOne({
        email: data.email,
        is_deleted: false,
      }).select("+password");
      if (!user) return returnMessage("userNotFound");
      if (!user.email_verified) return returnMessage("emailNotVerified");

      if (!user) return returnMessage("incorrectLogin");

      const comparePassword = await bcrypt.compare(
        data.password,
        user.password
      );
      if (!comparePassword) return returnMessage("incorrectEmailPassword");
      const { password, ...userDataWithoutPassword } = user.toObject();
      return this.tokenGenerator(userDataWithoutPassword);
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
      let tokens = await Token.findOne({ token: randomHash }).lean();
      if (!tokens) return returnMessage("invalidTokenLink");

      const reqToken = crypto
        .createHash("sha256")
        .update(payload.id)
        .digest("hex");

      if (reqToken === tokens.token) {
        const referral_code = await this.referralCodeGenerator();
        if (!referral_code) return returnMessage("default");

        const updateUser = await User.findOneAndUpdate(
          { email: tokens.email, is_deleted: false },
          { $set: { email_verified: true, referral_code } },
          { new: true }
        );
        const { password, ...userDataWithoutPassword } = updateUser.toObject();
        eventEmitter(
          "EMAIL_VERIFIED",
          { data: "Email verified successfully" },
          updateUser.id
        );
        await Token.findByIdAndDelete(tokens._id);
        return this.tokenGenerator(userDataWithoutPassword);
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

      let existingUser = await User.findOne({
        email: user.email,
        is_deleted: false,
      });

      if (!existingUser) {
        const referral_code = await this.referralCodeGenerator();
        if (!referral_code) return returnMessage("default");

        const newUser = {
          email: user.email,
          password: user.password,
          first_name: user.given_name,
          last_name: user.family_name,
          user_name: user.name,
          email_verified: true,
          google_sign_in: true,
          terms_privacy_policy: true,
          referral_code,
        };
        const createUser = await User.create(newUser);
        const userResponse = createUser.toObject({
          getters: true,
          virtuals: false,
        });
        delete userResponse.password;
        if (payload?.referral_code) {
          const referral_registered = await this.referralSignUp({
            referral_code: payload?.referral_code,
            referred_to: createUser,
          });

          if (typeof referral_registered === "string") {
            await User.findByIdAndDelete(createUser._id);
            return referral_registered;
          }
        }
        return this.tokenGenerator(userResponse);
      } else {
        return this.tokenGenerator(existingUser);
      }
    } catch (error) {
      logger.error("Error while google sign In", error);
      return error.message;
    }
  };

  forgetPassword = async (payload) => {
    try {
      const { email } = payload;

      const existingUser = await User.findOne({
        email: email,
        is_deleted: false,
      });
      if (!existingUser) return returnMessage("emailNotFound");
      const resetToken = crypto.randomBytes(32).toString("hex");

      let verifyUrl = `${process.env.REACT_APP_BASE_URL}/forget-password?token=${resetToken}`;
      existingUser.reset_password_token = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      await existingUser.save();
      const user_name =
        existingUser?.first_name + " " + existingUser?.last_name ||
        existingUser?.user_name;
      const message = utils.forgetPasswordUserEmailTemplate(
        verifyUrl,
        user_name
      );
      const subject = "Reset your password now";
      sendEmail(email, message, subject);
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

      const user = await User.findOneAndUpdate(
        { reset_password_token: hashedToken, is_deleted: false },
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
      return this.tokenGenerator(user);
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

      let existingUser = await User.findOne({
        email: decodedToken.email,
        is_deleted: false,
      }).lean();

      if (!existingUser) {
        const referral_code = await this.referralCodeGenerator();
        if (!referral_code) return returnMessage("default");

        const newUser = {
          email: decodedToken.email,
          email_verified: true,
          apple_sign_in: true,
          terms_privacy_policy: true,
          referral_code,
        };

        const createUser = await User.create(newUser);
        const userResponse = createUser.toObject({
          getters: true,
          virtuals: false,
        });
        delete userResponse.password;
        if (payload?.referral_code) {
          const referral_registered = await this.referralSignUp({
            referral_code: payload?.referral_code,
            referred_to: createUser,
          });

          if (typeof referral_registered === "string") {
            await User.findByIdAndDelete(createUser._id);
            return referral_registered;
          }
        }
        return this.tokenGenerator(userResponse);
      }
      return this.tokenGenerator(existingUser);
    } catch (error) {
      logger.error("Error while appleSign", error);
      return error.message;
    }
  };

  // This functions are used for the Google 2FA authenticatiors
  generateQr = async (user) => {
    try {
      const secret = speakeasy.generateSecret();
      const qr_image_url = await qrcode.toDataURL(secret.otpauth_url);
      await User.findByIdAndUpdate(user._id, {
        authenticator_secret: secret,
      });
      return { image_url: qr_image_url };
    } catch (error) {
      logger.error("Error while generating QR", error);
      return error.message;
    }
  };

  verify_2FA_otp = async (payload, user) => {
    try {
      const existingUser = await User.findById(user._id)
        .where("is_deleted")
        .equals(false)
        .lean();
      if (!existingUser?.authenticator_secret)
        return returnMessage("invalidAuthenticateCode");
      const { base32 } = existingUser?.authenticator_secret;
      const verified = speakeasy.totp.verify({
        secret: base32,
        encoding: "base32",
        token: payload?.token,
      });
      if (!verified) return returnMessage("invalidAuthenticateCode");

      const reset_email_password = await this.reset_email_password(
        {
          email: payload.email,
          old_password: payload.old_password,
          new_password: payload.new_password,
        },
        user
      );
      if (typeof reset_email_password === "string") return reset_email_password;
      return true;
    } catch (error) {
      logger.error("error while verifying 2 factor authenticator", error);
      return error.message;
    }
  };

  // this function is used for the change the email and password with the google authenticator
  reset_email_password = async (payload, user) => {
    try {
      const { email, old_password, new_password } = payload;
      const email_exist = await User.findOne({
        email,
        _id: { $ne: new ObjectId(user._id) },
      }).lean();
      if (email_exist) return returnMessage("emailExist");

      const existing_user = await User.findById(user._id).lean();
      const valid_old_password = bcrypt.compare(
        old_password,
        existing_user?.password
      );
      if (!valid_old_password) return returnMessage("invalidOldPassword");

      await User.findByIdAndUpdate(
        user._id,
        {
          email,
          password: await bcrypt.hash(new_password, 12),
          authenticator_secret: {},
        },
        { new: true }
      );
      return true;
    } catch (error) {
      logger.error("error while updating the email and password", error);
      return error.message;
    }
  };

  referralSignUp = async ({ referral_code, referred_to }) => {
    try {
      const referral_code_exist = await User.findOne({ referral_code })
        .select("referral_code")
        .lean();
      if (!referral_code_exist) return returnMessage("referralCodeNotFound");

      await ReferralHistory.deleteMany({
        referral_code,
        registered: false,
        referred_by: referral_code_exist._id,
        email: referred_to?.email,
      });

      await ReferralHistory.create({
        referral_code,
        referred_by: referral_code_exist._id,
        referred_to: referred_to._id,
        email: referred_to?.email,
        registered: true,
      });
      return;
    } catch (error) {
      logger.error("Error while referral SignUp", error);
      return error.message;
    }
  };

  referralCodeGenerator = async () => {
    try {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let referral_code = "";

      // Generate the initial code
      for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referral_code += characters.charAt(randomIndex);
      }

      const referral_code_exist = await User.findOne({ referral_code })
        .select("referral_code")
        .lean();
      if (referral_code_exist) return this.referralCodeGenerator();

      return referral_code;
    } catch (error) {
      logger.error("Error while generating the referral code", error);
      return false;
    }
  };
}

module.exports = AuthService;
