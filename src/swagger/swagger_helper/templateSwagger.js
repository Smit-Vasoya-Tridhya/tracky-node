const getTemplate = {
  tags: ["Template"],
  description: "Get Template ",
  summary: "Get Template ",
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

const templateList = {
  tags: ["Template"],
  description: "Template list",
  summary: "Template list",
  parameters: [
    //   {
    //     name: "token",
    //     description: "Add admin token",
    //     in: "header",
    //     type: "string",
    //     required: true,
    //     example: "Bearer",
    //   },
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
const templateListById = {
  tags: ["Template"],
  description: "Template list",
  summary: "Template list",
  parameters: [
    //   {
    //     name: "token",
    //     description: "Add admin token",
    //     in: "header",
    //     type: "string",
    //     required: true,
    //     example: "Bearer",
    //   },
    {
      name: "id",
      in: "params",
      description: "id",
      required: true,
    },
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
const createTemplate = {
  tags: ["Template"],
  description: " Create Template ",
  summary: "Create Template ",
  parameters: [
    //   {
    //     name: "token",
    //     description: "Add admin token",
    //     in: "header",
    //     type: "string",
    //     required: true,
    //     example: "Bearer",
    //   },
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
            template: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: { type: "string" },
                  value: { type: "string" },
                },
                required: ["key", "value"],
              },
              description: "Array of key-value pairs representing the template",
            },
            role: {
              type: "string",
              description: "ID of the role associated with the template",
              required: true,
            },
            template_type: {
              type: "string",
              descripition: "Enter your template type",
              required: true,
            },
            template_title: {
              type: "string",
              descripition: "Enter your template title",
              required: true,
            },
            selected_role: {
              type: "string",
              descripition: "Enter your selected role",
              required: true,
            },
            pitch_type: {
              type: "string",
              descripition: "Enter your pitch type",
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

const templateRoutes = {
  "/api/v1/template/templateById": {
    get: getTemplate,
  },
  "/api/v1/template/list": {
    post: templateList,
  },
  "/api/v1/template/listById": {
    post: templateListById,
  },
  "/api/v1/template/add": {
    post: createTemplate,
  },
};

module.exports = templateRoutes;
