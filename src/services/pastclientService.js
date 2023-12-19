const pastClient = require("../models/pastClientSchema");
const user = require("../models/userSchema");
const logger = require("../logger");
const { returnMessage } = require("../utils/utils");

class pastClient {
  createPastclient = async (payload, files) => {
    try {
      let clientImageFileName;
      if (files["client_image"]) {
        clientImageFileName = files["client_image"][0]?.filename;
      }

      const {
        Revenue_made,
        company_type,
        closing_rate,
        user_approval,
        user_id,
      } = payload;
      const newClient = new pastClient({
        Revenue_made,
        company_type,
        closing_rate,
        user_approval,
        user_id,
        client_image: clientImageFileName,
      });
      await newClient.save();
    } catch (error) {
      logger.error("Error while create Profile", error);
      return error.message;
    }
  };
}
module.exports = pastClient;
