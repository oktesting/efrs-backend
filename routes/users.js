const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash"); //provide utilities for manipulationg object
const express = require("express");
const router = express.Router();
const { User, validateUser } = require("../models/user");
const validate = require("../middleware/validate");

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
  const token = user.generateAuthToken();
  return (
    res
      .header("x-auth-token", token)
      //allow client to read the jwt in header
      .header("access-control-expose-headers", "x-auth-token")
      .send(_.pick(user, ["_id", "name", "email"]))
  );
});
module.exports = router;
