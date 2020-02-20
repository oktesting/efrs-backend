const crypto = require("crypto");
const nodemailer = require("nodemailer");
const config = require("config");
const { Token } = require("../models/token");

module.exports.sendConfirmationEmail = async user => {
  const confirmationToken = new Token({
    userId: user._id,
    token: crypto.randomBytes(16).toString("hex")
  });
  await confirmationToken.save();
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: config.get("email_user"),
      pass: config.get("email_pass")
    }
  });
  const mailOptions = {
    from: "no-reply@yourwebapplication.com",
    to: user.email,
    subject: "Account Verification Token",
    text:
      "Hello,\n\n" +
      "Please verify your account by clicking the link: \nhttp://" +
      config.get("base_url") +
      "/api/users/confirmation/" +
      confirmationToken.token +
      "\n"
  };
  await transporter.sendMail(mailOptions);
};
