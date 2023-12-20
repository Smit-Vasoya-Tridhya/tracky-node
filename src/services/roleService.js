const Role = require("../models/roleSchema");
const logger = require("../logger");
const { returnMessage } = require("../utils/utils");

class RoleService {
  RoleList = async (payload) => {
    try {
      return await Role.find().lean();
    } catch (error) {
      logger.error("Error while fetching Role", error);
      return error.message;
    }
  };
}

module.exports = RoleService;
