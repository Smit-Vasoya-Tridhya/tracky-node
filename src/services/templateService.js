const Template = require("../models/templateSchema");
const logger = require("../logger");
const { returnMessage, paginationObject } = require("../utils/utils");
const mongoose = require("mongoose");

class TemplateService {
  createTemplate = async (payload, user) => {
    try {
      payload.user_id = user._id;
      const template = await Template.create(payload);
      return template;
    } catch (error) {
      logger.error("Error while create template", error);
      return error.message;
    }
  };

  updateTemplate = async (payload, id) => {
    try {
      const updates = payload.template;
      let result;

      for (const { key, value } of updates) {
        const templateDoc = await Template.findOne({ _id: id.id });

        if (
          !templateDoc ||
          !templateDoc.template ||
          !templateDoc.template.find((item) => item.key === key)
        ) {
          if (!templateDoc?.template) {
            result = await Template.insertOne({
              _id: id.id,
              template: [{ key, value }],
            });
          } else {
            result = await Template.findOneAndUpdate(
              { _id: id.id },
              { $addToSet: { template: { key, value } } },
              { new: true }
            );
          }
        } else {
          result = await Template.findOneAndUpdate(
            { _id: id.id, "template.key": key },
            { $set: { "template.$.value": value } },
            { new: true }
          );
        }
      }

      return result;
    } catch (error) {
      logger.error("Error while updating template", error);
      return error.message;
    }
  };

  templateList = async (searchObj, user) => {
    try {
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
          {
            "role_Data.key": {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
        ];
      }

      if (searchObj.filter === "setter") {
        queryObj["$and"] = [{ "role_Data.key": "setter" }];
      }

      if (searchObj.filter === "closer") {
        queryObj["$and"] = [{ "role_Data.key": "closer" }];
      }

      if (searchObj.filter === "favorites") {
        queryObj["$and"] = [{ "isFav.is_like": true }];
      }

      const aggregationPipeline = [
        {
          $lookup: {
            from: "roles",
            localField: "role",
            foreignField: "_id",
            as: "role_Data",
            pipeline: [{ $project: { key: 1, label: 1 } }],
          },
        },
        {
          $unwind: "$role_Data",
        },
        {
          $lookup: {
            from: "favourites",
            localField: "_id",
            foreignField: "templateId",
            as: "isFav",
          },
        },
        {
          $match: queryObj,
        },
        {
          $addFields: {
            isFav: {
              $cond: {
                if: { $eq: [{ $size: "$isFav" }, 0] },
                then: null,
                else: { $arrayElemAt: ["$isFav", 0] },
              },
            },
          },
        },
        {
          $project: {
            template: 1,
            key: 1,
            label: 1,
            role_Data: 1,
            createdAt: 1,
            updatedAt: 1,
            isFav: {
              $cond: {
                if: { $eq: ["$isFav", null] },
                then: null,
                else: {
                  $cond: {
                    if: {
                      $and: [
                        { $eq: ["$isFav.templateId", "$_id"] },
                        { $eq: ["$isFav.userId", user._id] },
                      ],
                    },
                    then: "$isFav",
                    else: null,
                  },
                },
              },
            },
          },
        },
      ];

      const templateData = await Template.aggregate(aggregationPipeline)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.resultPerPage);

      const templatecounts = await Template.aggregate(aggregationPipeline);

      return {
        templateData,
        pageCount:
          Math.ceil(templatecounts.length / pagination.resultPerPage) || 0,
      };
    } catch (error) {
      logger.error("Error while updating template", error);
      return error.message;
    }
  };

  templateListById = async (searchObj, params, user) => {
    try {
      const pagination = paginationObject(searchObj);
      const queryObj = { is_deleted: false };

      queryObj.user_id = new mongoose.Types.ObjectId(params.id);
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

          {
            "role_Data.key": {
              $regex: searchObj.search.toLowerCase(),
              $options: "i",
            },
          },
        ];
      }

      if (searchObj.filter === "setter") {
        queryObj["$and"] = [{ "role_Data.key": "setter" }];
      }

      if (searchObj.filter === "closer") {
        queryObj["$and"] = [{ "role_Data.key": "closer" }];
      }

      if (searchObj.filter === "favorites") {
        queryObj["$and"] = [{ "isFav.is_like": true }];
      }
      const aggregationPipeline = [
        {
          $lookup: {
            from: "roles",
            localField: "role",
            foreignField: "_id",
            as: "role_Data",
            pipeline: [{ $project: { key: 1, label: 1 } }],
          },
        },
        {
          $unwind: "$role_Data",
        },
        {
          $lookup: {
            from: "favourites",
            localField: "_id",
            foreignField: "templateId",
            as: "isFav",
          },
        },
        {
          $match: queryObj,
        },
        {
          $addFields: {
            isFav: {
              $cond: {
                if: { $eq: [{ $size: "$isFav" }, 0] },
                then: null,
                else: { $arrayElemAt: ["$isFav", 0] },
              },
            },
          },
        },
        {
          $project: {
            template: 1,
            key: 1,
            label: 1,
            role_Data: 1,
            createdAt: 1,
            updatedAt: 1,
            isFav: {
              $cond: {
                if: { $eq: ["$isFav", null] },
                then: null,
                else: {
                  $cond: {
                    if: {
                      $and: [
                        { $eq: ["$isFav.templateId", "$_id"] },
                        { $eq: ["$isFav.userId", user._id] },
                      ],
                    },
                    then: "$isFav",
                    else: null,
                  },
                },
              },
            },
          },
        },
      ];

      const templateData = await Template.aggregate(aggregationPipeline)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.resultPerPage);

      return templateData;
    } catch (error) {
      logger.error("Error while updating template", error);
      return error.message;
    }
  };
}

module.exports = TemplateService;
