const validate = require("../middleware/validate");
const valdidateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const { Fire } = require("../models/fire");
const { Report, validateReport } = require("../models/report");
const express = require("express");
const router = express.Router();
const moment = require("moment");

//get all reports
router.get("/", [auth], async (req, res) => {
  return res.status(200).send(
    await Report.find()
      .populate("fire", "-__v")
      .select("-__v")
  );
});

//get one report
router.get("/:id", [auth, valdidateObjectId], async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate("fire")
    .select("-__v");
  if (!report) return res.status(404).send("Report is not found");
  return res.status(200).send(report);
});

router.post("/", [auth, validate(validateReport)], async (req, res) => {
  let report = await Report.find({ fire: req.body.fire });
  //prevent submit another report for a fire
  if (report.length !== 0) {
    return res.status(400).send("There is already report for this fire");
  }
  report = Report(req.body);
  const receivedTime = moment(req.body.receivedTime);
  const finishedTime = moment(req.body.finishedTime);
  report.duration = `${finishedTime.diff(
    receivedTime,
    "hours"
  )} hours and ${finishedTime.diff(receivedTime, "minutes") % 60} minutes`;
  await report.save();
  return res.status(200).send("Report is submitted");
});

module.exports = router;
