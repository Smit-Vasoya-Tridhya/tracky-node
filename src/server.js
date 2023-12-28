const express = require("express");
require("./config/connection");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 3000;
const errorHandler = require("./helpers/error");
const path = require("path");
const cors = require("cors");
const rootRoutes = require("./routes/index");
const logger = require("./logger");
const morgan = require("morgan");
const swagger = require("swagger-ui-express");
const http = require("http");
const { socket_connection } = require("./socket");
const server = http.createServer(app);
socket_connection(server);

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(
  "/email-template",
  express.static(path.join(__dirname, "public/email_template"))
);
app.use(rootRoutes);

// handling error from all of the route
app.use(errorHandler);

const swaggerDoc = require("./swagger/swagger.index");

app.use("/swagger-doc", swagger.serve);
app.use("/swagger-doc", swagger.setup(swaggerDoc));
server.listen(port, () => logger.info(`Server started at port:${port}`));
