const validate = require("../middleware/validate");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const { Account } = require("../models/account");

//login route
router.post("/", validate(validateAuth), async (req, res) => {
  let account = await Account.findOne({ email: req.body.email })
    .populate("user", "-__v")
    .populate("supervisor", "-__v");
  if (!account) return res.status(400).send("Email or password is incorrect");
  const isValidPassword = await bcrypt.compare(
    req.body.password,
    account.password
  );
  if (isValidPassword) {
    if (!account.isVerified) {
      return res.status(401).send("Your account has not verified");
    }
    const jwtToken = account.generateAuthToken();
    return res.send(jwtToken);
  } else return res.status(400).send("Email or password is incorrect");
});

function validateAuth(req) {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      .email()
      .required(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
  };
  return Joi.validate(req, schema);
}

module.exports = router;
