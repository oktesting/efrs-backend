const valdidateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");
const { single } = require("../services/uploadToServer");
const { uploadAvatar } = require("../services/uploadToS3");
const auth = require("../middleware/auth");
const { isSupervisor } = require("../middleware/getRole");
const { Account } = require("../models/account");
const { User, validateUser } = require("../models/user");
const express = require("express");
const router = express.Router();

//get all users
router.get("/", [auth, isSupervisor], async (req, res) => {
  const accounts = await Account.find()
    .populate("user", "-__v")
    .select("-__v -password");
  return res
    .status(200)
    .send(
      accounts.filter((acc) => acc.user !== undefined && acc.user !== null)
    );
});

//get one user
router.get("/:id", [auth, valdidateObjectId], async (req, res) => {
  const acc = await Account.findById(req.params.id)
    .populate("user", "-__v")
    .select("-password -__v");
  if (!acc || acc.user === undefined || acc.user === null)
    return res.status(404).send("User is not found");
  return res.status(200).send(acc);
});
//change activation of user
router.get(
  "/change-activation/:id",
  [auth, isSupervisor, valdidateObjectId],
  async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User is not found");
    user.isActivated = !user.isActivated;
    await user.save();
    return res.status(200).send("User activation is changed");
  }
);

//create new user
router.post("/", [auth, validate(validateUser)], async (req, res) => {
  let account = await Account.findById(req.account._id);
  if (!account) return res.status(404).send("Account is not found");
  if (account.user)
    return res.status(400).send("This account is already registered");

  //create user profile
  const user = User({
    fullname: req.body.fullname,
    phone: req.body.phone,
    age: req.body.age,
    gender: req.body.gender,
  });

  //set account to associate to an user profile
  account.user = user._id;
  await account.save();
  await user.save();

  account["user"] = user;
  const token = account.generateAuthToken();
  return (
    res
      .header("x-auth-token", token)
      //allow client to read the jwt in header
      .header("access-control-expose-headers", "x-auth-token")
      .send("User is created")
  );
});

//update user
router.put(
  "/",
  [auth, single("avatar"), validate(validateUser)],
  async (req, res) => {
    let account = await Account.findById(req.account._id);
    if (!account) return res.status(404).send("Account is not found");
    let user = await User.findById(req.account.user._id);
    if (!user) return res.status(404).send("User is not found");
    const data = {
      fullname: req.body.fullname,
      phone: req.body.phone,
      age: req.body.age,
      gender: req.body.gender,
    };
    if (req.file) data["avatar"] = uploadAvatar(req.file, user);
    user = await User.findByIdAndUpdate(req.account.user._id, data, {
      new: true,
      useFindAndModify: false,
    });
    account["user"] = user;
    const token = account.generateAuthToken();
    return (
      res
        .header("x-auth-token", token)
        //allow client to read the jwt in header
        .header("access-control-expose-headers", "x-auth-token")
        .send("User is edited")
    );
  }
);

module.exports = router;
