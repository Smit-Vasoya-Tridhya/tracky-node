const Admin = require("../models/adminSchema");
const Staff = require("../models/staffSchema");
const logger = require("../logger");
const { returnMessage } = require("../utils/utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../helpers/sendEmail");
const utils = require("../utils/utils");
const ObjectId = require("mongoose").Types.ObjectId;

class AdminService {
  getAdmin = async (user) => {
    try {
      const permission = user.permission;
      if (!permission) {
        return returnMessage("permissionDenied");
      }
      return await Admin.findById(user._id).lean();
    } catch (error) {
      logger.error("Error while fetch admin", error);
      return error.message;
    }
  };

  editAdmin = async (payload, user) => {
    try {
      const permission = user.permission;
      if (!permission) {
        return returnMessage("permissionDenied");
      }
      const { first_name, last_name, password } = payload;

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return await Admin.findByIdAndUpdate(
          user._id,
          {
            first_name,
            last_name,
            password: hashedPassword,
          },
          { new: true }
        );
      } else {
        return await Admin.findByIdAndUpdate(id, { first_name, last_name });
      }
    } catch (error) {
      logger.error("Error while update admin", error);
      return error.message;
    }
  };
}
module.exports = AdminService;
