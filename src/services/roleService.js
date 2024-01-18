const Role = require("../models/roleSchema");
const logger = require("../logger");
const { returnMessage } = require("../utils/utils");
const AdminRole = require("../models/adminRoleSchema");

class RoleService {
  RoleList = async () => {
    try {
      return await Role.find().lean();
    } catch (error) {
      logger.error("Error while fetching Role", error);
      return error.message;
    }
  };

  createRole = async (payload, user) => {
    try {
      // const permissions = user.permission;
      // if (!permissions.Admin.write) {
      //   return returnMessage("permissionDenied");
      // }

      let roleValidate = await AdminRole.find({
        role: payload.role,
        is_deleted: false,
      });

      if (roleValidate.length !== 0) {
        return returnMessage("roleExist");
      }

      // payload.createdBy = user._id;
      // payload.updatedBy = user._id;
      let newRole = new AdminRole(payload);

      return newRole.save();
    } catch (error) {
      logger.error("Error while creating role ", error);
      return error.message;
    }
  };
}

module.exports = RoleService;
