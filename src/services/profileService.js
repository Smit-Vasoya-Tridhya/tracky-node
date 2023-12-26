const profile = require("../models/profileSchema");
const User = require("../models/userSchema");
const logger = require("../logger");
const { returnMessage } = require("../utils/utils");

class ProfileService {
  createProfile = async (req, res) => {
    try {
      if (!req.body.user_id) return returnMessage("userIdNotExist");

      let profileExist = await profile.findOne({ user_id: req.body.user_id });
      if (profileExist) return returnMessage("profileExist");

      let profileImageFileName, trackRecordCsvFileName;
      if (req.files["profile_image"]) {
        profileImageFileName =
          "uploads/" + req.files["profile_image"][0]?.filename;
      } else {
        profileImageFileName = null;
      }
      if (req.files["track_record_csv"]) {
        trackRecordCsvFileName =
          "uploads/" + req.files["track_record_csv"][0]?.filename;
      } else {
        trackRecordCsvFileName = null;
      }

      const {
        profile_name,
        bio,
        user_id,
        roll,
        average_deal_size,
        track_record,
        plan,
      } = req.body;

      const newProfile = new profile({
        profile_name,
        bio,
        user_id,
        roll,
        average_deal_size,
        track_record,
        plan,
        profile_image: profileImageFileName,
        track_record_csv: trackRecordCsvFileName,
      });

      // Save the profile to the database
      await newProfile.save();

      if (newProfile) {
        await User.findByIdAndUpdate(
          { _id: user_id },
          { on_board: true },
          { new: true }
        );
        return { ...newProfile.toObject(), on_board: true };
      }

      return newProfile;
    } catch (error) {
      logger.error("Error while create Profile", error);
      return error.message;
    }
  };

  getProfilebyId = async (req, res) => {
    try {
      const user_id = req.params; // Assuming you pass the profile ID as a parameter

      let profileData = await profile.findById(user_id);
      if (!profileData) return returnMessage("profileNotExist");
      return profileData;
    } catch (error) {
      logger.error("Error while fetch Profile", error);
      return error.message;
    }
  };

  editProfile = async (req, res) => {
    try {
      const { user_id } = req.params;

      let profileToUpdate = await profile.findById(user_id);

      if (!profileToUpdate) {
        return returnMessage("ProfileNotFound");
      }

      profileToUpdate.profile_name =
        req.body.profile_name || profileToUpdate.profile_name;
      profileToUpdate.bio = req.body.bio || profileToUpdate.bio;
      profileToUpdate.role = req.body.role || profileToUpdate.role;
      profileToUpdate.language = req.body.language || profileToUpdate.language;
      profileToUpdate.skills = req.body.skills || profileToUpdate.skills;
      profileToUpdate.bound = req.body.bound || profileToUpdate.bound;
      profileToUpdate.skills = req.body.skills || profileToUpdate.skills;

      if (req.files["profile_image"]) {
        profileToUpdate.profile_image =
          "uploads/" + req.files["profile_image"][0]?.filename;
      }
      await profileToUpdate.save();

      return profileToUpdate;
    } catch (error) {
      logger.error("Error while updating profile", error);
      return error.message;
    }
  };
}

module.exports = ProfileService;
