const bcrypt = require("bcrypt");
const _ = require("lodash"); //provide utilities for manipulationg object
const express = require("express");
const { User, validateUser } = require("../models/user");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const { sendConfirmationEmail } = require("../middleware/sendEmail");
const { Token } = require("../models/token");

const router = express.Router();
//getting the current logged in - authenticated user
//not using ':id' on the link to secure the user id
//instead extract user._id by using jwt
router.get("/me", auth, async (req, res) => {
  //exclude password from being showed
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

//register route
router.post("/", validate(validateUser), async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("this email already registered");
  user = new User(_.pick(req.body, ["name", "email", "password"]));
  salt = await bcrypt.genSalt();
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  sendConfirmationEmail(user);
  const jwtToken = user.generateAuthToken();
  return (
    res
      .header("x-auth-token", jwtToken)
      //allow client to read the jwt in header
      .header("access-control-expose-headers", "x-auth-token")
      .send(_.pick(user, ["_id", "name", "email"]))
  );
});

//confirmation route
router.get("/confirmation/:token", async (req, res) => {
  const confirmationToken = await Token.findOne({ token: req.params.token });
  if (!confirmationToken)
    return res
      .status(404)
      .send("token is not found. your account is not verified");
  const user = await User.findById(confirmationToken.userId);
  if (!user) return res.status(404).send("user is not found");
  if (user.isVerified) return res.status(400).send("user is already verified");
  user.isVerified = true;
  await user.save();
  return res.status(200).send("user is now verified. please log in");
});

//resend confirmation email
router.get("/resend/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).send("user is not found");
  if (user.isVerified) return res.status(400).send("user is already verified");
  sendConfirmationEmail(user);
  return res.status(200).send("an verification email is sent to your email");
});

module.exports = router;
