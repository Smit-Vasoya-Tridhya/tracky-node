const usersRoutes = require("./swagger_helper/user.swagger");

const swaggerDoc = {
  openapi: "3.0.0",
  host: "",
  info: {
    title: "Tracky ",
    version: "0.0.1",
    description: "Swagger API Documentation ",
  },
  servers: [
    {
      url: `http://localhost:3000`,
      description: "Local server",
    },
  ],
  tags: [
    {
      name: "Users",
      description: "Users All API Route",
    },
  ],

  paths: {
    ...usersRoutes,
  },
};

module.exports = swaggerDoc;
