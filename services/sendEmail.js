const crypto = require("crypto");
const nodemailer = require("nodemailer");
const config = require("config");
const { Token } = require("../models/token");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: config.get("email_user"),
    pass: config.get("email_pass"),
  },
});

module.exports.sendConfirmationEmail = async (account) => {
  const confirmationToken = new Token({
    account: account._id,
    token: crypto.randomBytes(16).toString("hex"),
  });
  await confirmationToken.save();
  const mailOptions = {
    from: "no-reply@yourwebapplication.com",
    to: account.email,
    subject: "Account Verification Token",
    text:
      "Hello,\n\n" +
      "Please verify your account by clicking the link: \nhttp://" +
      config.get("base_url") +
      "/api/accounts/confirmation/" +
      confirmationToken.token +
      "\nThis token will be expires in one hours",
  };
  await transporter.sendMail(mailOptions);
};

module.exports.sendResetPasswordMail = async (account) => {
  const resetToken = new Token({
    account: account._id,
    token: crypto.randomBytes(16).toString("hex"),
  });
  await resetToken.save();
  const mailOptions = {
    from: "no-reply@yourwebapplication.com",
    to: account.email,
    subject: "Account Reset Password Token",
    text:
      "Hello,\n\n" +
      "Please reset your account's password by clicking the link: \nhttp://" +
      //url của trang front end đảm nhận form reset mk
      config.get("base_url") +
      "/api/accounts/reset/" +
      resetToken.token +
      "\nThis token will be expires in one hours",
  };
  await transporter.sendMail(mailOptions);
};
