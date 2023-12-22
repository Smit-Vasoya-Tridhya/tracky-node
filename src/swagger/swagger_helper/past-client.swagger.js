const addPastlient = {
  tags: ["Past Client"],
  description: "Past Client profile",
  summary: "Past Client profile",
  requestBody: {
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            company_name: {
              type: "string",
              descripition: "Enter your company name",
              required: true,
            },
            revenue_made: {
              type: "number",
              descripition: "Enter your  revenue made",
              required: true,
            },
            closing_rate: {
              type: "number",
              descripition: "Enter your closing rate",
              required: true,
            },
            user_approval: {
              type: "boolean",
              descripition: "Enter your user approval",
              required: true,
            },
            client_image: {
              type: "file",
              descripition: "Enter your client image",
              required: true,
            },
          },
        },
      },
    },
  },

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

const PastClientList = {
  tags: ["Past Client"],
  description: "Past Client list",
  summary: "Past Client list",
  parameters: [
    // {
    //   name: "token",
    //   description:
    //     "an authorization header, Please add Bearer keyword before token",
    //   in: "header",
    //   type: "string",
    //   required: true,
    //   example: "Bearer",
    // },
    // {
    //   name: "id",
    //   in: "params",
    //   description: "id",
    //   required: true,
    // },
  ],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            search: {
              type: "string",
              descripition: "Enter your search",
              required: true,
            },
            sortField: {
              type: "string",
              descripition: "Enter your sortField",
              required: true,
            },
            sortOrder: {
              type: "string",
              descripition: "Enter your sortOrder",
              required: true,
            },
            itemsPerPage: {
              type: "string",
              descripition: "Enter your itemsPerPage",
              required: true,
            },
            page: {
              type: "number",
              descripition: "Enter your page",
              required: true,
            },
          },
        },
      },
    },
  },
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

const getPastClient = {
  tags: ["Past Client"],
  description: "Get Past Client ",
  summary: "Get Past Client ",
  parameters: [
    // {
    //   name: "token",
    //   description:
    //     "an authorization header, Please add Bearer keyword before token",
    //   in: "header",
    //   type: "string",
    //   required: true,
    //   example: "Bearer",
    // },
    {
      name: "id",
      in: "path",
      description: "id",
      required: true,
    },
  ],

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

const editPastlient = {
  tags: ["Past Client"],
  description: "Edit Past Client profile",
  summary: "Edit Past Client profile",
  requestBody: {
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            company_name: {
              type: "string",
              descripition: "Enter your company name",
              required: true,
            },
            revenue_made: {
              type: "number",
              descripition: "Enter your  revenue made",
              required: true,
            },
            closing_rate: {
              type: "number",
              descripition: "Enter your closing rate",
              required: true,
            },
            user_approval: {
              type: "boolean",
              descripition: "Enter your user approval",
              required: true,
            },
            client_image: {
              type: "file",
              descripition: "Enter your client image",
              required: true,
            },
          },
        },
      },
    },
  },

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

const deletePastClient = {
  tags: ["Past Client"],
  description: "Delete Past Client ",
  summary: "Delete Past Client ",
  parameters: [
    // {
    //   name: "token",
    //   description:
    //     "an authorization header, Please add Bearer keyword before token",
    //   in: "header",
    //   type: "string",
    //   required: true,
    //   example: "Bearer",
    // },
    {
      name: "id",
      in: "path",
      description: "ID of the past client",
      required: true,
      // schema: {
      //   type: "string",
      // },
    },
  ],

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

const pastClientRoutes = {
  "/api/v1/past-client/add": {
    post: addPastlient,
  },
  "/api/v1/past-client/list": {
    post: PastClientList,
  },
  "/api/v1/past-client/fetch/{id}": {
    get: getPastClient,
  },
  "/api/v1/past-client/edit/{id}": {
    put: editPastlient,
  },
  "/api/v1/past-client/delete/{id}": {
    delete: deletePastClient,
  },
};

module.exports = pastClientRoutes;
