const pastClient = require("../models/pastClientSchema");
const user = require("../models/userSchema");
const logger = require("../logger");
const { returnMessage } = require("../utils/utils");

class pastClient {
  createPastclient = async (req, res) => {
    try {
      let clientImageFileName;
      if (req.files["client_image"]) {
        clientImageFileName = req.files["client_image"][0]?.filename;
      } else {
        clientImageFileName = null;
      }

      const {
        Revenue_made,
        company_type,
        closing_rate,
        user_approval,
        user_id,
      } = req.body;
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
