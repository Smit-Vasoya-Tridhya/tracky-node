const role = require("../models/roleSchema");
const logger = require("../logger");
const { returnMessage } = require("../utils/utils");

class Role {
  RoleList = async (payload) => {
    try {
      const roles = await role.find();
      return roles;
    } catch (error) {
      logger.error("Error while fetching Role", error);
      return error.message;
    }
  };
}

module.exports = Role;
