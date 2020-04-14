const valdidateObjectId = require("../middleware/validateObjectId");
const { single } = require("../services/uploadToServer");
const { uploadAvatar } = require("../services/uploadToS3");
const { Account } = require("../models/account");
const { Supervisor, validateSupervisor } = require("../models/supervisor");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const { isAdmin } = require("../middleware/getRole");
const express = require("express");
const router = express.Router();

//get all supervisor
router.get("/", [auth, isAdmin], async (req, res) => {
  const accounts = await Account.find()
    .populate("supervisor", "-__v")
    .select("-__v -password");
  return res
    .status(200)
    .send(
      accounts.filter(
        (acc) => acc.supervisor !== undefined && acc.supervisor !== null
      )
    );
});

//change supervisor activation
router.get(
  "/change-activation/:id",
  [auth, isAdmin, valdidateObjectId],
  async (req, res) => {
    const supervisor = await Supervisor.findById(req.params.id);
    if (!supervisor) return res.status(404).send("Supervisor is not found");
    supervisor.isActivated = !supervisor.isActivated;
    await supervisor.save();
    return res.status(200).send("Supervisor activation is changed");
  }
);

//get one supervisor
router.get("/:id", [auth, valdidateObjectId], async (req, res) => {
  const acc = await Account.findById(req.params.id)
    .populate("supervisor", "-__v")
    .select("-__v -password");

  if (!acc || acc.supervisor === undefined || acc.supervisor === null)
    return res.status(404).send("Supervisor is not found");
  return res.status(200).send(acc);
});

//create new supervisor
router.post("/", [auth, validate(validateSupervisor)], async (req, res) => {
  let account = await Account.findById(req.account._id);
  if (!account) return res.status(404).send("Account is not found");
  if (account.supervisor)
    return res.status(400).send("This account is already registered");

  //create supervisor profile
  const supervisor = Supervisor(req.body);
  //set account to associate to an supervisor profile
  account.supervisor = supervisor._id;
  await account.save();
  await supervisor.save();
  account["supervisor"] = supervisor;
  const token = account.generateAuthToken();
  return (
    res
      .header("x-auth-token", token)
      //allow client to read the jwt in header
      .header("access-control-expose-headers", "x-auth-token")
      .send("Supervisor is created")
  );
});

//update supervisor
router.put(
  "/",
  [auth, single("avatar"), validate(validateSupervisor)],
  async (req, res) => {
    let account = await Account.findById(req.account._id);
    if (!account) return res.status(404).send("Account is not found");
    let supervisor = await Supervisor.findById(req.account.supervisor._id);
    if (!supervisor) return res.status(404).send("Supervisor is not found");
    const data = {
      location: req.body.location,
      fullname: req.body.fullname,
      phone: req.body.phone,
      gender: req.body.gender,
    };
    if (req.file) data["avatar"] = uploadAvatar(req.file, supervisor);
    supervisor = await Supervisor.findByIdAndUpdate(
      req.account.supervisor._id,
      data,
      {
        new: true,
        useFindAndModify: false,
      }
    );
    account["supervisor"] = supervisor;
    const token = account.generateAuthToken();
    return (
      res
        .header("x-auth-token", token)
        //allow client to read the jwt in header
        .header("access-control-expose-headers", "x-auth-token")
        .send("Supervisor is edited")
    );
  }
);
module.exports = router;
