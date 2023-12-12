const User = require("../models/userSchema");
const logger = require("../logger");
const { returnMessage } = require("../utils/utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
      const user = await User.findOne({ email: payload.email }).lean();
      if (user) return returnMessage("userExists");

      payload.password = bcrypt.hash(payload.password, 12);

      const newUser = await User.create(payload);

      if (!newUser) return returnMessage("default");

      return true;
    } catch (error) {
      logger.error("Error while signup", error);
      return error.message;
    }
  };
}

module.exports = User;
