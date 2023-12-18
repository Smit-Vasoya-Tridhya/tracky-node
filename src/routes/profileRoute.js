const {
  createProfile,
  getProfilebyId,
} = require("../controllers/profileController");
const { upload } = require("../helpers/multer");

const profileRoute = require("express").Router();

profileRoute.post(
  "/createProfile",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "track_record_csv", maxCount: 1 },
  ]),
  createProfile
);

profileRoute.get("/fetchProfile/:id", getProfilebyId);
module.exports = profileRoute;
