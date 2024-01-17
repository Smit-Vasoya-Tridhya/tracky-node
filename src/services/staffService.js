const Staff = require("../models/staffSchema");
const logger = require("../logger");
const { returnMessage, paginationObject } = require("../utils/utils");
const bcrypt = require("bcrypt");
class staffService {
  createStaff = async (payload, user) => {
    try {
      const permission = user.permission;
      if (!permission) {
        return returnMessage("permissionDenied");
      }

      const {
        first_name,
        last_name,
        password,
        permissions,
        email,
        isPayment,
        isStaffManagement,
        isSupportTicket,
        isUsers,
        role,
      } = payload;

      const hashedPassword = await bcrypt.hash(password, 10);
      let name = payload.first_name + " " + payload.last_name;
      const newStaff = new Staff({
        first_name,
        last_name,
        password: hashedPassword,
        full_name: name,
        permissions,
        email,
        isPayment,
        isStaffManagement,
        isSupportTicket,
        isUsers,
        updatedBy: user._id,
        createdBy: user._id,
        role,
      });
      return await newStaff.save();
    } catch (error) {
      logger.error("Error while create staff", error);
      return error.message;
    }
  };

  updateStaff = async (payload, id, user) => {
    try {
      const permission = user.permission;
      if (!permission) {
        return returnMessage("permissionDenied");
      }
      const staffExist = await Staff.findById(id).lean();
      if (!staffExist) return returnMessage("StaffNotFound");
      const {
        first_name,
        last_name,
        password,
        permissions,
        email,
        isPayment,
        isStaffManagement,
        isSupportTicket,
        isUsers,
        status,
        role,
      } = payload;
      let hashedPassword;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }
      return await Staff.findByIdAndUpdate(
        id,
        {
          first_name,
          last_name,
          password: hashedPassword,
          permissions,
          email,
          isPayment,
          isStaffManagement,
          isSupportTicket,
          isUsers,
          status,
          role,
        },
        {
          new: true,
        }
      );
    } catch (error) {
      logger.error("Error while update staff", error);
      return error.message;
    }
  };

  deleteStaff = async (id, user) => {
    try {
      const permission = user.permission;
      if (!permission) {
        return returnMessage("permissionDenied");
      }
      const clientExist = await Staff.findById(id).lean();
      if (!clientExist) return returnMessage("StaffNotFound");

      return await Staff.findByIdAndUpdate(
        id,
        {
          is_deleted: true,
        },
        { new: true }
      );
    } catch (error) {
      logger.error("Error while deleting client", error);
      return error.message;
    }
  };

  staffList = async (searchObj) => {
    try {
      const pagination = paginationObject(searchObj);
      const queryObj = { is_deleted: false };

      if (searchObj.search && searchObj.search !== "") {
        queryObj["$or"] = [
          {
            email: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
          {
            user_name: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
        ];
      }

      const staffList = await Staff.find(queryObj)
        .select("-password")
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.resultPerPage)
        .lean();

      const staffData = await Staff.find(queryObj);

      return {
        staffList,
        pageCount: Math.ceil(staffData.length / pagination.resultPerPage) || 0,
      };
    } catch (error) {
      logger.error("Error while fetching list ", error);
      return error.message;
    }
  };

  updateStaffStatus = async (payload, id, user) => {
    try {
      const permission = user.permission;
      if (!permission) {
        return returnMessage("permissionDenied");
      }
      return await Staff.findByIdAndUpdate(id, payload, { new: true });
    } catch (error) {
      logger.error("Error while updating status", error);
      return error.message;
    }
  };

  getStaffById = async (id, user) => {
    try {
      let profileData = await Staff.findById(id).lean();
      if (!profileData) return returnMessage("profileNotExist");
      return profileData;
    } catch (error) {
      logger.error("Error while fetching Staff ", error);
      return error.message;
    }
  };
}
module.exports = staffService;
