// users login
const login = {
  tags: ["Users"],
  description: "User Login",
  summary: "User Login",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            email: {
              type: "string",
              descripition: "Enter your email",
              required: true,
            },
            password: {
              type: "string",
              descripition: "Enter your password",
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

const register = {
  tags: ["Users"],
  description: "User register",
  summary: "User register",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            first_name: {
              type: "string",
              descripition: "Enter your first name",
              required: true,
            },
            last_name: {
              type: "string",
              descripition: "Enter your last name",
              required: true,
            },
            email: {
              type: "string",
              descripition: "Enter your email",
              required: true,
            },
            country: {
              type: "string",
              descripition: "Enter your country",
              required: true,
            },
            password: {
              type: "string",
              descripition: "Enter your password",
              required: true,
            },
            terms_privacy_policy: {
              type: "boolean",
              descripition: "Enter your terms privacy policy",
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

const forgetPassword = {
  tags: ["Users"],
  description: "Forget Password",
  summary: "Forget Password",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            email: {
              type: "string",
              descripition: "Enter your email",
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

const resendEmail = {
  tags: ["Users"],
  description: "Resend Email",
  summary: "Resend Email",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            email: {
              type: "string",
              descripition: "Enter your email",
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

const resetPassword = {
  tags: ["Users"],
  description: "Reset Password",
  summary: "Reset Password",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            password: {
              type: "string",
              descripition: "Enter your password",
              required: true,
            },
            token: {
              type: "string",
              descripition: "Enter your token",
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

const profile = {
  tags: ["Users"],
  description: "User profile",
  summary: "User profile",
  requestBody: {
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            profile_name: {
              type: "string",
              descripition: "Enter your profile name",
              required: true,
            },
            bio: {
              type: "string",
              descripition: "Enter your bio",
              required: true,
            },
            user_id: {
              type: "string",
              descripition: "Enter your user id",
              required: true,
            },
            role: {
              type: "string",
              descripition: "Enter your role id",
              required: true,
            },
            track_record: {
              type: "boolean",
              descripition: "Enter your track record",
              required: true,
            },
            plan: {
              type: "string",
              descripition: "Enter yourplan",
            },
            track_record_csv: {
              type: "file",
              descripition: "Enter your csv",
            },
            profile_image: {
              type: "file",
              descripition: "Enter your profile image",
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

const editProfile = {
  tags: ["Users"],
  description: "Edit User profile",
  summary: "Edit User profile",
  requestBody: {
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            profile_name: {
              type: "string",
              descripition: "Enter your profile name",
              required: true,
            },
            bio: {
              type: "string",
              descripition: "Enter your bio",
              required: true,
            },
            user_id: {
              type: "string",
              descripition: "Enter your user id",
              required: true,
            },
            role: {
              type: "string",
              descripition: "Enter your role id",
              required: true,
            },
            track_record: {
              type: "boolean",
              descripition: "Enter your track record",
              required: true,
            },
            plan: {
              type: "string",
              descripition: "Enter yourplan",
            },
            language: {
              type: "string",
              descripition: "Enter your language",
            },
            skills: {
              type: "string",
              descripition: "Enter your skills",
            },
            bound: {
              type: "string",
              descripition: "Enter your bound",
            },
            profile_image: {
              type: "file",
              descripition: "Enter your  profile image",
            },
            time_zone: {
              type: "fistringe",
              descripition: "Enter your time zone",
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

const verifyEmail = {
  tags: ["Users"],
  description: "Verify Email",
  summary: "Verify Email",
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
      in: "query",
      description: "token",
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

const googleSignIn = {
  tags: ["Users"],
  description: "Google SignIn",
  summary: "Google SignIn",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            signupId: {
              type: "string",
              descripition: "Enter your token",
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
const usersRoutes = {
  "/api/v1/user/login": {
    post: login,
  },
  "/api/v1/user/register": {
    post: register,
  },
  "/api/v1/user/forgetPassword": {
    post: forgetPassword,
  },
  "/api/v1/user/resetPassword": {
    post: resetPassword,
  },
  "/api/v1/user/resendEmail": {
    post: resendEmail,
  },
  "/api/v1/user/profile": {
    post: profile,
  },
  "/api/v1/user/editProfile": {
    put: editProfile,
  },
  "/api/v1/user/verify": {
    get: verifyEmail,
  },
  "/api/v1/user/googleSignIn": {
    post: googleSignIn,
  },
};

module.exports = usersRoutes;
