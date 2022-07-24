const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Token } = require("../models/token");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.email_user,
    pass: process.env.email_pass,
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
      process.env.BASE_URL +
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
      "Please reset your account's password by clicking the link: \nhttps://" +
      //url của trang front end đảm nhận form reset mk
      process.env.FRONTEND_URL +
      "/reset-password/" +
      resetToken.token +
      "\nThis token will be expires in one hours",
  };
  await transporter.sendMail(mailOptions);
};
