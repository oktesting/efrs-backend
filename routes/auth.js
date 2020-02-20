const validate = require("../middleware/validate");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");

//login route
router.post("/", validate(validateAuth), async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email or password is incorrect");
  const isValidPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (isValidPassword) {
    if (!user.isVerified) {
      return res.status(401).send("your account has not verified");
    }
    const jwtToken = user.generateAuthToken();
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
