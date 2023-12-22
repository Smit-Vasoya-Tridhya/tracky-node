const usersRoutes = require("./swagger_helper/user.swagger");
const roleRoutes = require("./swagger_helper/role.swagger");
const pastClientRoutes = require("./swagger_helper/past-client.swagger");
require("dotenv").config();

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
    {
      url: process.env.SERVER_URL,
      description: "Staging server",
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "apiKey",
        name: "token",
        in: "header",
        description:
          "An authorization header. Please add Bearer keyword before the token.",
      },
    },
  },
  tags: [
    {
      name: "Users",
      description: "Users All API Route",
    },
    {
      name: "Roles",
      description: "Roles All API Route",
    },
    {
      name: "Past Client",
      description: "Past Client All API Route",
    },
  ],
  paths: {
    ...usersRoutes,
    ...roleRoutes,
    ...pastClientRoutes,
  },
};

module.exports = swaggerDoc;
