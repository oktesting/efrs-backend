const valdidateObjectId = require("../middleware/validateObjectId");
const { single } = require("../middleware/uploadToServer");
const { uploadAvatar } = require("../middleware/uploadToS3");
const { Account } = require("../models/account");
const { Supervisor, validateSupervisor } = require("../models/supervisor");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.get("/", [auth], async (req, res) => {
  const supervisor = await Supervisor.findById(
    req.account.supervisor._id
  ).select("-__v");
  if (!supervisor) return res.status(404).send("supervisor is not found");
  return res.status(200).send(supervisor);
});

//create new supervisor
router.post("/", [auth, validate(validateSupervisor)], async (req, res) => {
  let account = await Account.findById(req.account._id);
  if (!account) return res.status(404).send("account is not found");
  if (account.supervisor)
    return res.status(400).send("this account is already registered");

  //create supervisor profile
  const supervisor = Supervisor(req.body);
  //set account to associate to an supervisor profile
  account.supervisor = supervisor._id;
  await account.save();
  await supervisor.save();
  return res.status(200).send(supervisor);
});

//update supervisor
router.put(
  "/",
  [auth, single("avatar"), validate(validateSupervisor)],
  async (req, res) => {
    let supervisor = await Supervisor.findById(req.account.supervisor._id);
    if (!supervisor) return res.status(404).send("Supervisor is not found");
    const data = {
      location: req.body.location,
      fullname: req.body.fullname,
      phone: req.body.phone,
      gender: req.body.gender
    };
    if (req.file) data["avatar"] = uploadAvatar(req.file, supervisor);
    supervisor = await Supervisor.findByIdAndUpdate(
      req.account.supervisor._id,
      data,
      {
        new: true,
        useFindAndModify: false
      }
    );
    res.status(200).send(supervisor);
  }
);
module.exports = router;
