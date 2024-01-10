const PastClient = require("../models/pastClientSchema");
const user = require("../models/userSchema");
const logger = require("../logger");
const mongoose = require("mongoose");
const {
  returnMessage,
  paginationObject,
  getKeywordType,
} = require("../utils/utils");

class PastClientService {
  createPastclient = async (payload, files, user) => {
    try {
      let clientImageFileName;
      if (files.fieldname === "client_image") {
        clientImageFileName = "uploads/" + files?.filename;
      }

      const {
        company_name,
        revenue_made,
        company_type,
        closing_rate,
        user_approval,
      } = payload;
      const newClient = new PastClient({
        company_name,
        revenue_made,
        company_type,
        closing_rate,
        user_approval,
        user_id: user._id,
        client_image: clientImageFileName,
      });
      return newClient.save();
    } catch (error) {
      logger.error("Error while create Client", error);
      return error.message;
    }
  };

  clientList = async (searchObj, user) => {
    try {
      const pagination = paginationObject(searchObj);
      const queryObj = { is_deleted: false, user_id: user._id };

      if (searchObj.search && searchObj.search !== "") {
        queryObj["$or"] = [
          {
            company_name: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
          {
            company_type: {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
        ];

        const keywordType = getKeywordType(searchObj.search);
        if (keywordType === "number") {
          const numericKeyword = parseInt(searchObj.search);

          queryObj["$or"].push({
            revenue_made: numericKeyword,
          });
          queryObj["$or"].push({
            closing_rate: numericKeyword,
          });
        } else if (keywordType === "date") {
          const dateKeyword = new Date(searchObj.search);
          queryObj["$or"].push({ updatedAt: dateKeyword });
          queryObj["$or"].push({ lastSeen: dateKeyword });
        }
      }

      const clientList = await PastClient.find(queryObj)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.resultPerPage)
        .lean();

      const clientData = await PastClient.find(queryObj);

      return {
        clientList,
        pageCount: Math.ceil(clientData.length / pagination.resultPerPage) || 0,
      };
    } catch (error) {
      logger.error("Error while fetch list ", error);
      return error.message;
    }
  };

  getClient = async (payload) => {
    try {
      const fetchClient = await PastClient.findOne({
        _id: payload.id,
        is_deleted: false,
      });

      if (!fetchClient) return returnMessage("ClientDeleted");
      return fetchClient;
    } catch (error) {
      logger.error("Error while fetching client", error);
      return error.message;
    }
  };

  deleteClient = async (payload) => {
    try {
      const clientExist = await PastClient.findById(payload.id).lean();
      if (!clientExist) return returnMessage("ClientNotFound");

      return await PastClient.findByIdAndUpdate(
        payload.id,
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

  editClient = async (params, payload, files) => {
    try {
      const clientExist = await PastClient.findById(params.id).lean();
      if (!clientExist) return returnMessage("ClientNotFound");

      if (files?.fieldname === "client_image") {
        payload.client_image = "uploads/" + files?.filename;
      }
      const {
        company_name,
        revenue_made,
        company_type,
        closing_rate,
        user_approval,
        client_image,
      } = payload;
      return await PastClient.findByIdAndUpdate(
        params.id,
        {
          company_name,
          revenue_made,
          company_type,
          closing_rate,
          user_approval,
          client_image,
        },
        {
          new: true,
        }
      );
    } catch (error) {
      logger.error("Error while edit client", error);
      return error.message;
    }
  };
}
module.exports = PastClientService;
