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
      const {
        template_type,
        template_title,
        template_discription,
        selected_role,
        pitch_type,
      } = payload;
      let result;

      for (const { key, value, level } of updates) {
        const templateDoc = await Template.findOne({ _id: id.id });

        if (
          !templateDoc ||
          !templateDoc.template ||
          !templateDoc.template.find((item) => item.key === key)
        ) {
          if (!templateDoc?.template) {
            result = await Template.insertOne({
              _id: id.id,
              template: [{ key, value, level }],
              template_type,
              template_title,
              template_discription,
              selected_role,
              pitch_type,
            });
          } else {
            result = await Template.findOneAndUpdate(
              { _id: id.id },
              {
                $addToSet: { template: { key, value, level } },
                $set: {
                  template_type,
                  template_title,
                  template_discription,
                  selected_role,
                  pitch_type,
                },
              },
              { new: true }
            );
          }
        } else {
          result = await Template.findOneAndUpdate(
            { _id: id.id, "template.key": key },
            {
              $set: { "template.$.value": value, "template.$.level": level },
              template_type,
              template_title,
              template_discription,
              selected_role,
              pitch_type,
            },
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
      const queryObj = { is_deleted: false, template_type: "community" };

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
            template_title: {
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
          // { "isFav.userId": user._id },
        ];
      }

      if (searchObj.filter === "setter") {
        queryObj["$and"] = [{ "role_Data.key": "setter" }];
      }

      if (searchObj.filter === "closer") {
        queryObj["$and"] = [{ "role_Data.key": "closer" }];
      }

      if (searchObj.filter === "favorites") {
        queryObj["$and"] = [
          { "isFav.is_like": true },
          { "isFav.userId": user._id },
        ];
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
            let: { templateId: "$_id", userId: user._id },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$templateId", "$$templateId"] },
                      { $eq: ["$userId", "$$userId"] },
                    ],
                  },
                },
              },
            ],
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
            templateId: "$isFav.templateId",
            pitch_type: 1,
            template_title: 1,
            isFav: {
              $cond: {
                if: {
                  $and: [
                    { $ne: ["$isFav", null] },
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
      const queryObj = { is_deleted: false, template_type: "personal" };

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
            template_title: {
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
        queryObj["$and"] = [
          { "isFav.is_like": true },
          { "isFav.userId": user._id },
        ];
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
            let: { templateId: "$_id", userId: user._id },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$templateId", "$$templateId"] },
                      { $eq: ["$userId", "$$userId"] },
                    ],
                  },
                },
              },
            ],
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
            templateId: "$isFav.templateId",
            template_type: 1,
            pitch_type: 1,
            template_title: 1,
            isFav: {
              $cond: {
                if: {
                  $and: [
                    { $ne: ["$isFav", null] },
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
      // return templateData;
    } catch (error) {
      logger.error("Error while updating template", error);
      return error.message;
    }
  };

  templateById = async (id) => {
    try {
      let templateData = await Template.findById(id).lean();
      if (!templateData) return returnMessage("templateNotFound");
      return templateData;
    } catch (error) {
      logger.error("Error while getting  template", error);
      return error.message;
    }
  };

  templateUpdate = async (id, payload) => {
    try {
      let updatedTemplate = await Template.findByIdAndUpdate(id, payload, {
        new: true,
      });
      return updatedTemplate;
    } catch (error) {
      logger.error("Error while updating  template", error);
      return error.message;
    }
  };
}

module.exports = TemplateService;
