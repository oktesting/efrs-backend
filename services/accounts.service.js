const bcrypt = require('bcryptjs');
const _ = require('lodash'); //provide utilities for manipulationg object
const { Account } = require('../models/account');
const {
  // sendConfirmationEmail,
  // sendResetPasswordMail,
} = require('../utils/sendEmail');
const { Token } = require('../models/token');

module.exports = {
  //getting the current logged in - authenticated user
  //not using ':id' on the link to secure the account id
  //instead extract account._id by using jwt
  getUserInfo: async (req, res) => {
    //exclude password from being showed
    return res
      .status(200)
      .send(
        await Account.findById(req.account._id)
          .populate('user', '-__v')
          .populate('supervisor', '-__v')
          .select('-password -__v')
      );
  },
  register: async (req, res) => {
    let account = await Account.findOne({ email: req.body.email });
    if (account) return res.status(400).send('This email already registered');
    account = new Account(_.pick(req.body, ['name', 'email', 'password']));
    const salt = await bcrypt.genSalt();
    account.password = await bcrypt.hash(account.password, salt);
    await account.save();
    // sendConfirmationEmail(account);
    // const jwtToken = account.generateAuthToken();
    return res.status(200).send(account._id);
    // res
    //   .header("x-auth-token", jwtToken)
    //   //allow client to read the jwt in header
    //   .header("access-control-expose-headers", "x-auth-token")
    //   .send(_.pick(account, ["_id", "name", "email"]));
  },
  verifyConfirmationToken: async (req, res) => {
    const confirmationToken = await Token.findOne({ token: req.params.token });
    if (!confirmationToken)
      return res.status(404).send('Verification token is invalid or expired');
    const account = await Account.findById(confirmationToken.account);
    if (!account) return res.status(404).send('Account is not found');
    if (account.isVerified) return res.status(400).send('Account is already verified');
    account.isVerified = true;
    await account.save();
    return res.status(200).send('Account is now verified. please log in');
  },
  resendConfirmationEmail: async (req, res) => {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).send('Account is not found');
    if (account.isVerified) return res.status(400).send('Account is already verified');
    // sendConfirmationEmail(account);
    return res.status(200).send('An verification email is sent to your email');
  },
  requestResetPassword: async (req, res) => {
    if (!req.body.email) return res.status(400).send('Email must be provided');
    const account = await Account.findOne({ email: req.body.email });
    if (!account) return res.status(404).send('account is not found');
    // sendResetPasswordMail(account);
    return res.status(200).send('Reset password email is sent to your email');
  },
  handleResetPassword: async (req, res) => {
    const resetToken = await Token.findOne({ token: req.body.token });
    if (!resetToken) return res.status(404).send('Reset token is invalid or expired');

    let account = await Account.findById(resetToken.account);
    if (!account) return res.status(404).send('Account is not found');

    const salt = await bcrypt.genSalt();
    account.password = await bcrypt.hash(req.body.newPassword, salt);
    await account.save();
    return res.status(200).send('Password is changed successfully');
  }
};
