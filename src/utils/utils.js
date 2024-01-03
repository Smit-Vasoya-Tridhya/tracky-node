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
exports.registerUserEmailTemplate = (link, user_name) => {
  const htmlData = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your email</title>
      <style>
      </style>
  </head>
  <body 
  style="background-color: #262626;
              color: #ffffff;
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;"
  >
      <table class="container"
      style=" max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #000000;
              border-radius: 10px;
              text-align: center;"
      >
          <tr >
              <td class="" style="text-align: center;">
                  <img src="${process.env.SERVER_URL}/email-template/logo_light.svg" alt="Tracky Logo" style="width: 100px;"/>
              </td>
          </tr>
          <tr>
              <td 
              style="margin-top: 20px;
              text-align: center;
              width: 100%;"
              >
                  <p style="font-size: 18px; font-weight: 600; color: #ffffff;">Hi,${user_name}</p>
                  <p style="font-size: 16px; line-height: 24px; color: #ffffff;">Exciting news! I'm part of 
                      <a href="#" style="font-weight: 600; font-style: italic; text-decoration: underline; color: #2EDE9F;"> 
                  www.tracky.com
                  </a>, a fantastic community for Pitch generator,Convo craft and many more.</p>
                  <p style="font-size: 16px; line-height: 24px; text-decoration: underline; color: #ffffff;">Below are few of glimpse of Tracky</p>
              </td>
          </tr>
         <tr>
          <td>
              <ul style="width: 300px; margin: 0 auto; list-style: none; border: 1px solid #2EDE9F; border-radius: 10px; 
              padding: 10px;">
                  <li style="border-bottom: 1px solid #848484; margin: 10px 0; padding-bottom: 10px;color: #ffffff;">
                      Profile Management
                  </li>
                  <li style="border-bottom: 1px solid #848484; margin: 10px 0; padding-bottom: 10px;color: #ffffff;">
                      Pitch Generator
                  </li>
                  <li style="border-bottom: 1px solid #848484; margin: 10px 0; padding-bottom: 10px;color: #ffffff;">
                      Convo Craft
                  </li>
                  <li style="border-bottom: 1px solid #848484; margin: 10px 0; padding-bottom: 10px; color: #ffffff;">
                      Templates with AI Generator
                  </li>
                  <li style=" margin: 10px 0; color: #2EDE9F; font-weight: 600;">
                      And many more...
                  </li>
              </ul>
          </td>
         </tr>
          <tr>
              <td  style="margin-top: 20px;
              text-align: center;
              width: 100%;">
                  <p style="color: #ffffff;">Please verify your email:</p>
                  <p style="color: #ffffff;"><a href="${link}" 
                      style="display: inline-block;
              padding: 10px 20px;
              background-color: #2EDE9F;
              color: #000000;
              text-decoration: none;
              border-radius: 5px;"
                      >Verify email</a></p>
                
              </td>
          </tr>
      </table>
  </body>
  </html>`;
  return htmlData;
};

exports.forgetPasswordUserEmailTemplate = (link, user_name) => {
  const htmlData = `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your email</title>
    <style></style>
  </head>
  <body
    style="
      background-color: #262626;
      color: #ffffff;
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 0;
    "
  >
    <table
      class="container"
      style="
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background-color: #000000;
        border-radius: 10px;
        text-align: center;
      "
    >
      <tr>
        <td class="" style="text-align: center">
          <img
            src="${process.env.SERVER_URL}/email-template/logo_light.svg"
            alt="Tracky Logo"
            style="width: 100px"
          />
        </td>
      </tr>
      <tr>
        <td style="margin-top: 20px; text-align: center; width: 100%">
          <p style="font-size: 18px;color: #ffffff; font-weight: 600">Hi,${user_name}</p>
        </td>
      </tr>
      <tr>
              <td>
                 <img src="${process.env.SERVER_URL}/email-template/dash_image.svg" alt="Dashboard image" style="width: 100%;"/> 
              </td>
          </tr>
          <tr>
      <tr>
        <td style="margin-top: 20px; text-align: center; width: 100%">
          <p style="color: #ffffff">
            Please reset your password by clicking below:
          </p>
          <p style="color: #ffffff">
            <a
              href="${link}"
              style="
                display: inline-block;
                padding: 10px 20px;
                background-color: #2ede9f;
                color: #000000;
                text-decoration: none;
                border-radius: 5px;
              "
              >Reset password</a
            >
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
  return htmlData;
};

exports.invitationEmailTemplate = (link, user_name) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Invitation to Tracky</title>
      <style>
      </style>
  </head>
  <body 
  style="background-color: #262626;
              color: #ffffff;
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;"
  >
      <table class="container"
      style=" max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #000000;
              border-radius: 10px;
              text-align: center;"
      >
          <tr >
              <td class="" style="text-align: center;">
                  <img src="${process.env.SERVER_URL}/email-template/logo_light.svg" alt="Tracky Logo" style="width: 100px;"/>
              </td>
          </tr>
          <tr>
              <td>
                 <img src="${process.env.SERVER_URL}/email-template/dash_image.svg" alt="Dashboard image" style="width: 100%;"/> 
              </td>
          </tr>
          <tr>
              <td 
              style="margin-top: 20px;
              text-align: center;
              width: 100%;"
              >
                  <p style="font-size: 18px; font-weight: 600;">Hi,</p>
                  <p style="font-size: 16px; line-height: 24px;">Exciting news! I'm part of 
                      <a href="#" style="font-weight: 600; font-style: italic; text-decoration: underline; color: #2EDE9F;"> 
                  www.tracky.com
                  </a>, a fantastic community for Pitch generator,Convo craft and many more.</p>
                  <p style="font-size: 16px; line-height: 24px; text-decoration: underline;">Below are few of glimpse of Tracky</p>
              </td>
          </tr>
         <tr>
          <td>
              <ul style="width: 300px; margin: 0 auto; list-style: none; border: 1px solid #2EDE9F; border-radius: 10px; 
              padding: 10px;">
                  <li style="border-bottom: 1px solid #848484; margin: 10px 0; padding-bottom: 10px;">
                      Profile Management
                  </li>
                  <li style="border-bottom: 1px solid #848484; margin: 10px 0; padding-bottom: 10px;">
                      Pitch Generator
                  </li>
                  <li style="border-bottom: 1px solid #848484; margin: 10px 0; padding-bottom: 10px;">
                      Convo Craft
                  </li>
                  <li style="border-bottom: 1px solid #848484; margin: 10px 0; padding-bottom: 10px;">
                      Templates with AI Generator
                  </li>
                  <li style=" margin: 10px 0; color: #2EDE9F; font-weight: 600;">
                      And many more...
                  </li>
              </ul>
          </td>
         </tr>
          <tr>
              <td  style="margin-top: 20px;
              text-align: center;
              width: 100%;">
                  <p style="color: #ffffff;">Join using my exclusive referral link:</p>
                  <p style="color: #ffffff;"><a href="${link}" 
                      style="display: inline-block;
              padding: 10px 20px;
              background-color: #2EDE9F;
              color: #000000;
              text-decoration: none;
              border-radius: 5px;"
                      >Join Tracky</a></p>
                  <p style="color: #ffffff;">🌟 Plus, when you sign up through my referral, we both enjoy special perks! It's a small token of
                      appreciation.</p>
                  <p style="color: #ffffff;">Come on board and let's explore Tracky together!</p>
                  <p style="color: #ffffff;">Cheers,<br>${user_name}</p>
              </td>
          </tr>
      </table>
  </body>
  </html>
  `;
};
