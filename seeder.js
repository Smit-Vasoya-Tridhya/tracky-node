const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const path = require("path");
const Admin = require("./src/models/adminSchema");
const Role = require("./src/models/roleSchema");
const logger = require("./src/logger");
const bcrypt = require("bcrypt");
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const filePath = path.join(__dirname, "src", "seeds", "admin.json");
const createAdmin = JSON.parse(fs.readFileSync(filePath, "utf-8"));

exports.insertData = async () => {
  try {
    const existingAdmins = await Admin.findOne({});

    if (!existingAdmins) {
      const hashedAdminData = createAdmin.map((admin) => ({
        ...admin,
        password: bcrypt.hashSync(admin.password, 10),
      }));

      await Admin.create(hashedAdminData);
    } else {
      logger.error("Admin data already exists. No need to seed.");
    }
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};
