const Favourite = require("../models/favouriteModel");
const logger = require("../logger");
const { returnMessage } = require("../utils/utils");

class favouriteService {
  createFavourite = async (payload, user) => {
    try {
      const { templateId } = payload;

      const newFavourite = new Favourite({
        userId: user._id,
        templateId,
        is_like: true,
      });
      return newFavourite.save();
    } catch (error) {
      logger.error("Error while create favourite", error);
      return error.message;
    }
  };

  fetchFavourite = (user) => {
    try {
    } catch (error) {
      logger.error("Error while fetch favourite", error);
      return error.message;
    }
  };

  deleteFavourite = async (id) => {
    try {
      return await Favourite.findByIdAndDelete(id);
    } catch (error) {
      logger.error("Error while fetch favourite", error);
      return error.message;
    }
  };
}

module.exports = favouriteService;
