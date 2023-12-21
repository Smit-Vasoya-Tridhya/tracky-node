const engMessage = require("../messages/en.json");

exports.returnMessage = (msg, language = "en") => {
  return engMessage[msg];
};

exports.paginationObject = (paginationObject) => {
  const page = paginationObject.page || 1;
  const resultPerPage = paginationObject.itemsPerPage || 10;
  const skip = resultPerPage * (page - 1);
  const sortOrder = paginationObject.sortOrder === "asc" ? 1 : -1;
  const sortField =
    paginationObject.sortField !== ""
      ? paginationObject.sortField
      : "createdAt";
  const sort = {};
  sort[sortField] = sortOrder;

  return { page, skip, resultPerPage, sort };
};

exports.getKeywordType = (keyword) => {
  if (!isNaN(keyword)) {
    return "number";
  } else if (Date.parse(keyword)) {
    return "date";
  } else {
    return "string";
  }
};
exports.registerUserEmailTemplate = (link) => {
  const htmlData = `
    <html>
      <head>
        <style>
          /* Styles for the email template */
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #4caf50;
            color: white;
            text-align: center;
            padding: 10px;
            border-radius: 10px 10px 0 0;
          }
          .content {
            padding: 20px;
          }
          .button {
            background-color: #4caf50;
            color: white;
            border: none;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify email</h1>
          </div>
          <div class="content">
            <p>We received a request to verify your email. Click the button below to reset it:</p>
            <a class="button" href="${process.env.REACT_APP_BASE_URL}/${link}">Reset Password</a>
            <p>If you didn't request a verify your email, please ignore this email.</p>
            <p>Best regards,<br>Your Company Name</p>
          </div>
        </div>
      </body>
    </html>`;
  return htmlData;
};

exports.forgetPasswordUserEmailTemplate = (verifyUrl) => {
  const htmlData = `
  <html>
    <head>
      <style>
        /* Styles for the email template */
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #4caf50;
          color: white;
          text-align: center;
          padding: 10px;
          border-radius: 10px 10px 0 0;
        }
        .content {
          padding: 20px;
        }
        .button {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Password</h1>
        </div>
        <div class="content">
          <p>We received a request to verify your email. Click the button below to reset it:</p>
          <a class="button" href="${process.env.REACT_APP_BASE_URL}/${verifyUrl}">Reset Password</a>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <p>Best regards,<br>Your Company Name</p>
        </div>
      </div>
    </body>
  </html>`;
  return htmlData;
};
