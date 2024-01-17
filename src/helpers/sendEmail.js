const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (email, message, subject) => {
  const transporter = nodemailer.createTransport({
    port: 465,
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.MAILPASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    html: message,
  };

  const data = await transporter.sendMail(mailOptions);
  return data;
};

module.exports = sendEmail;
