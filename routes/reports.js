const validate = require("../middleware/validate");
const valdidateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const { isSupervisor } = require("../middleware/getRole");
const { Fire } = require("../models/fire");
const { Report, validateReport } = require("../models/report");
const express = require("express");
const router = express.Router();
const moment = require("moment");

//get all reports
router.get("/", [auth, isSupervisor], async (req, res) => {
  return res
    .status(200)
    .send(await Report.find().populate("fire", "-__v").select("-__v"));
});

//get one report
router.get(
  "/:id",
  [auth, isSupervisor, valdidateObjectId],
  async (req, res) => {
    const report = await Report.findById(req.params.id)
      .populate("fire")
      .select("-__v");
    if (!report) return res.status(404).send("Report is not found");
    return res.status(200).send(report);
  }
);

router.post(
  "/",
  [auth, isSupervisor, validate(validateReport)],
  async (req, res) => {
    //@todo: check whether the fire is exist
    let report = await Report.find({ fire: req.body.fire });
    //prevent submit another report for a fire
    if (report.length !== 0) {
      return res.status(400).send("There is already report for this fire");
    }
    report = Report(req.body);
    const receivedTime = moment(req.body.receivedTime);
    const finishedTime = moment(req.body.finishedTime);
    report.duration = `${finishedTime.diff(receivedTime, "hours")} tiếng ${
      finishedTime.diff(receivedTime, "minutes") % 60
    } phút`;
    await report.save();
    return res.status(200).send("Report is submitted");
  }
);

//delete one report
router.delete(
  "/:id",
  [auth, isSupervisor, valdidateObjectId],
  async (req, res) => {
    const report = await Report.findByIdAndRemove(req.params.id, {
      useFindAndModify: false,
    });
    if (!report) return res.status(404).send("Report is not found");
    const fire = await Fire.findByIdAndRemove(report.fire, {
      useFindAndModify: false,
    });
    if (!fire) return res.status(404).send("Fire is not found");
    return res.status(200).send("Report and its Fire are deleted");
  }
);

//edit a report
router.put(
  "/:id",
  [auth, isSupervisor, valdidateObjectId, validate(validateReport)],
  async (req, res) => {
    //not modified these fields in db
    delete req.body.fire;
    delete req.body.receivedTime;
    delete req.body.finishedTime;
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      useFindAndModify: false,
    });
    if (!report) return res.status(404).send("Report is not found");
    return res.status(200).send("Report is modified");
  }
);

module.exports = router;
