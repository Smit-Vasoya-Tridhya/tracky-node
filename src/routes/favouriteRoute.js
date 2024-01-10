const {
  createlike,
  deletelike,
} = require("../controllers/favouriteController");
const { protect } = require("../middlewares/authMiddleware");
const favouriteRoute = require("express").Router();
favouriteRoute.use(protect);
favouriteRoute.post("/create", createlike);
favouriteRoute.delete("/delete/:id", deletelike);
module.exports = favouriteRoute;
