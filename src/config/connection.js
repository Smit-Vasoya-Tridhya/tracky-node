const mongoose = require("mongoose");
const logger = require("../logger");
require("dotenv").config();

// Connect MongoDb to Node Application
mongoose
  .connect(process.env.DB_URL)
  .then((data) =>
    logger.info(`Database connected Successfully at ${data.connection.host}`)
  )
  .catch((err) => logger.error("Database Connection Error", err));
