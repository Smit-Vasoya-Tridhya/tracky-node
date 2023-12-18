const role = require("../models/roleSchema");
const logger = require("../logger");
const { format } = require("fast-csv");
const createReadStream = require("fast-csv");
class trackRecord {
  getTrack = async (payload) => {
    try {
      const _id = payload.id;
      let trackData = await role.findById(_id).lean();
      if (!trackData) return returnMessage("trackNotExist");
      return trackData;
    } catch (error) {
      logger.error("Error while fetch role", error);
      return error.message;
    }
  };
}

module.exports = trackRecord;
