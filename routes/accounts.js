const bcrypt = require("bcrypt");
const _ = require("lodash"); //provide utilities for manipulationg object
const express = require("express");
const { Account, validateAccount } = require("../models/account");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/admin");
const { sendConfirmationEmail } = require("../middleware/sendEmail");
const { Token } = require("../models/token");

const router = express.Router();
//getting the current logged in - authenticated user
//not using ':id' on the link to secure the account id
//instead extract account._id by using jwt
router.get("/me", [auth, isAdmin], async (req, res) => {
  //exclude password from being showed
  const account = await Account.findById(req.account._id).select("-password");
  res.send(account);
});

//register route
router.post("/", validate(validateAccount), async (req, res) => {
  let account = await Account.findOne({ email: req.body.email });
  if (account) return res.status(400).send("this email already registered");
  account = new Account(_.pick(req.body, ["name", "email", "password"]));
  salt = await bcrypt.genSalt();
  account.password = await bcrypt.hash(account.password, salt);
  await account.save();
  sendConfirmationEmail(account);
  const jwtToken = account.generateAuthToken();
  return (
    res
      .header("x-auth-token", jwtToken)
      //allow client to read the jwt in header
      .header("access-control-expose-headers", "x-auth-token")
      .send(_.pick(account, ["_id", "name", "email"]))
  );
});

//confirmation route
router.get("/confirmation/:token", async (req, res) => {
  const confirmationToken = await Token.findOne({ token: req.params.token });
  if (!confirmationToken)
    return res
      .status(404)
      .send("token is not found. your account is not verified");
  const account = await Account.findById(confirmationToken.accountId);
  if (!account) return res.status(404).send("account is not found");
  if (account.isVerified)
    return res.status(400).send("account is already verified");
  account.isVerified = true;
  await account.save();
  return res.status(200).send("account is now verified. please log in");
});

//resend confirmation email
router.get("/resend/:accountId", async (req, res) => {
  const account = await Account.findById(req.params.accountId);
  if (!account) return res.status(404).send("account is not found");
  if (account.isVerified)
    return res.status(400).send("account is already verified");
  sendConfirmationEmail(account);
  return res.status(200).send("an verification email is sent to your email");
});

module.exports = router;
