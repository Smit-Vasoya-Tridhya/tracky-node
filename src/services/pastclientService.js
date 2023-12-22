const pastClient = require("../models/pastClientSchema");
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
        clientImageFileName = files?.path;
      }

      const {
        company_name,
        revenue_made,
        company_type,
        closing_rate,
        user_approval,
      } = payload;
      const newClient = new pastClient({
        company_name,
        revenue_made,
        company_type,
        closing_rate,
        user_approval,
        user_id: user._id,
        client_image: clientImageFileName,
      });
      await newClient.save();
      return newClient;
    } catch (error) {
      logger.error("Error while create Profile", error);
      return error.message;
    }
  };

  clientList = async (searchObj, user) => {
    try {
      if (!user) return returnMessage("userNotFound");

      const pagination = paginationObject(searchObj);
      const queryObj = { is_deleted: false };

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
            closing_rate: numericKeyword,
          });
        } else if (keywordType === "date") {
          const dateKeyword = new Date(searchObj.search);
          queryObj["$or"].push({ updatedAt: dateKeyword });
          queryObj["$or"].push({ lastSeen: dateKeyword });
        }
      }

      const clientList = await pastClient
        .find(queryObj)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.resultPerPage)
        .lean();

      const clientData = await pastClient.find(queryObj);

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
      const _id = payload.id;
      if (!_id) return returnMessage("ClientNotFound");
      // const fetchClient = await pastClient.findById(_id, { is_deleted: false });
      const fetchClient = await pastClient.findOne({ _id, is_deleted: false });

      if (!fetchClient) return returnMessage("ClientDeleted");
      return fetchClient;
    } catch (error) {
      logger.error("Error while fetching client", error);
      return error.message;
    }
  };

  deleteClient = async (payload) => {
    try {
      const _id = payload.id;
      if (!_id) return returnMessage("ClientNotFound");

      const deleteClient = await pastClient.findByIdAndUpdate(
        _id,
        {
          is_deleted: true,
        },
        { new: true }
      );

      return deleteClient;
    } catch (error) {
      logger.error("Error while fetching client", error);
      return error.message;
    }
  };

  editClient = async (id, payload, files) => {
    try {
      const _id = id.id;
      if (!_id) return returnMessage("ClientNotFound");

      let clientImageFileName;
      if (files.fieldname === "client_image") {
        clientImageFileName = files?.path;
      }
      const updateObject = {
        ...payload, // Assuming payload is an object with client data
      };

      if (clientImageFileName) {
        updateObject.client_image = clientImageFileName;
      }

      // Use findByIdAndUpdate to update the client
      const editedClient = await pastClient.findByIdAndUpdate(
        _id,
        updateObject,
        { new: true }
      );

      return editedClient;
    } catch (error) {
      logger.error("Error while edit client", error);
      return error.message;
    }
  };
}
module.exports = PastClientService;
