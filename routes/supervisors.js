const valdidateObjectId = require("../middleware/validateObjectId");
const { single } = require("../middleware/uploadToServer");
const { uploadAvatar } = require("../middleware/uploadToS3");
const { Account } = require("../models/account");
const { Supervisor, validateSupervisor } = require("../models/supervisor");
const validate = require("../middleware/validate");
const express = require("express");
const router = express.Router();

//create new supervisor
router.post(
  "/:id",
  [valdidateObjectId, validate(validateSupervisor)],
  async (req, res) => {
    let account = await Account.findById(req.params.id);
    if (!account) return res.status(404).send("account is not found");
    if (account.supervisor)
      return res.status(400).send("this account is already registered");

    //create supervisor profile
    const supervisor = Supervisor({
      unitCoordinate: req.body.unitCoordinate,
      unitName: req.body.unitName,
      fullname: req.body.fullname,
      phone: req.body.phone,
      gender: req.body.gender
    });

    //set account to associate to an supervisor profile
    account.supervisor = supervisor._id;
    await account.save();
    await supervisor.save();
    return res.status(200).send(supervisor);
  }
);

//update supervisor
router.put(
  "/:id",
  [valdidateObjectId, single("avatar"), validate(validateSupervisor)],
  async (req, res) => {
    let supervisor = await Supervisor.findById(req.params.id);
    if (!supervisor) return res.status(404).send("supervisor is not found");
    const data = {
      unitCoordinate: req.body.unitCoordinate,
      unitName: req.body.unitName,
      fullname: req.body.fullname,
      phone: req.body.phone,
      gender: req.body.gender
    };
    if (req.file) data["avatar"] = uploadAvatar(req.file, supervisor);
    supervisor = await Supervisor.findByIdAndUpdate(req.params.id, data, {
      new: true,
      useFindAndModify: false
    });
    res.status(200).send(supervisor);
  }
);
module.exports = router;
