const engMessage = require("../messages/en.json");

exports.returnMessage = (msg, language = "en") => {
  return engMessage[msg];
};

exports.validateEmail = (email) => {
  // email validator from https://github.com/manishsaraan/email-validator/blob/master/index.js
  const regex =
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

  if (!email) return false;
  const email_parts = email.split("@");

  if (email_parts.length !== 2) return false;

  const account = email_parts[0];
  const address = email_parts[1];

  if (account.length > 64) return false;
  else if (address.length > 255) return false;

  const domainParts = address.split(".");

  if (
    domainParts.some((part) => {
      return part.length > 63;
    })
  )
    return false;

  return regex.test(email);
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
            <p>We received a request to verify your email. Click the button below to verify it:</p>
            <a class="button" href="${process.env.REACT_APP_BASE_URL}/${link}">Verify Email</a>
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

exports.invitationEmailTemplate = (link, user_name) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Your Invitation to Tracky</title>
      <style>
        body {
          background-color: #262626;
          color: #ffffff;
          font-family: "Arial", sans-serif;
          margin: 0;
          padding: 0;
        }
        table.container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: #000000;
          border-radius: 10px;
          text-align: center;
        }
        td.logo {
          text-align: center;
        }
        td.logo img {
          width: 100px; /* Adjust the width as needed */
        }
        td.content {
          margin-top: 20px;
          text-align: center;
          width: 100%;
        }
        a.button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #2ede9f;
          color: #000000;
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <table class="container">
        <tr style="">
          <td class="">
            <img src=${process.env.SERVER_URL}/email-template/logo_light.svg
            alt="Tracky Logo"/>
          </td>
        </tr>
        <tr>
          <td>
            <img src=${process.env.SERVER_URL}/email-template/dash_image.svg
            alt="Dashboard image" style="width: 100%;"/>
          </td>
        </tr>
        <tr>
          <td class="content">
            <p style="font-size: 18px; font-weight: 600">Hi,</p>
            <p style="font-size: 16px; line-height: 24px">
              Exciting news! I'm part of
              <a
                href="#"
                style="
                  font-weight: 600;
                  font-style: italic;
                  text-decoration: underline;
                  color: #2ede9f;
                "
              >
                www.tracky.com </a
              >, a fantastic community for Pitch generator,Convo craft and many
              more.
            </p>
            <p
              style="
                font-size: 16px;
                line-height: 24px;
                text-decoration: underline;
              "
            >
              Below are few of glimpse of Tracky
            </p>
          </td>
        </tr>
        <tr>
          <td>
            <ul
              style="
                width: 300px;
                margin: 0 auto;
                list-style: none;
                border: 1px solid #2ede9f;
                border-radius: 10px;
                padding: 10px;
              "
            >
              <li
                style="
                  border-bottom: 1px solid #848484;
                  margin: 10px 0;
                  padding-bottom: 10px;
                "
              >
                Profile Management
              </li>
              <li
                style="
                  border-bottom: 1px solid #848484;
                  margin: 10px 0;
                  padding-bottom: 10px;
                "
              >
                Pitch Generator
              </li>
              <li
                style="
                  border-bottom: 1px solid #848484;
                  margin: 10px 0;
                  padding-bottom: 10px;
                "
              >
                Convo Craft
              </li>
              <li
                style="
                  border-bottom: 1px solid #848484;
                  margin: 10px 0;
                  padding-bottom: 10px;
                "
              >
                Templates with AI Generator
              </li>
              <li style="margin: 10px 0; color: #2ede9f; font-weight: 600">
                And many more...
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <td class="content">
            <p>Join using my exclusive referral link:</p>
            <p><a href=${link} class="button">Join Tracky</a></p>
            <p>
              🌟 Plus, when you sign up through my referral, we both enjoy special
              perks! It's a small token of appreciation.
            </p>
            <p>Come on board and let's explore Tracky together!</p>
            <p>Cheers,<br />${user_name}</p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};
