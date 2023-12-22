const roles = {
  tags: ["Roles"],
  description: "Get Roles",
  summary: "Get Roles",
  responses: {
    200: {
      descripition: "ok",
      content: {
        "application/json": {
          schema: {
            type: "object",
          },
        },
      },
    },
  },
};

const roleRoutes = {
  "/api/v1/role/roles": {
    get: roles,
  },
};

module.exports = roleRoutes;
