const { Fire } = require('../models/fire');
const { Report } = require('../models/report');
const moment = require('moment');

module.exports = {
  getReports: async (req, res) => {
    return res
      .status(200)
      .send(await Report.find().populate('fire', '-__v').select('-__v'));
  },
  getReport: async (req, res) => {
    const report = await Report.findById(req.params.id).populate('fire').select('-__v');
    if (!report) return res.status(404).send('Report is not found');
    return res.status(200).send(report);
  },
  create: async (req, res) => {
    //@todo: check whether the fire is exist
    let report = await Report.find({ fire: req.body.fire });
    //prevent submit another report for a fire
    if (report.length !== 0) {
      return res.status(400).send('There is already report for this fire');
    }
    report = Report(req.body);
    const receivedTime = moment(req.body.receivedTime);
    const finishedTime = moment(req.body.finishedTime);
    report.duration = `${finishedTime.diff(receivedTime, 'hours')} tiếng ${
      finishedTime.diff(receivedTime, 'minutes') % 60
    } phút`;
    await report.save();
    return res.status(200).send('Report is submitted');
  },
  delete: async (req, res) => {
    const report = await Report.findByIdAndRemove(req.params.id, {
      useFindAndModify: false
    });
    if (!report) return res.status(404).send('Report is not found');
    const fire = await Fire.findByIdAndRemove(report.fire, {
      useFindAndModify: false
    });
    if (!fire) return res.status(404).send('Fire is not found');
    return res.status(200).send('Report and its Fire are deleted');
  },
  update: async (req, res) => {
    //not modified these fields in db
    delete req.body.fire;
    delete req.body.receivedTime;
    delete req.body.finishedTime;
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      useFindAndModify: false
    });
    if (!report) return res.status(404).send('Report is not found');
    return res.status(200).send('Report is modified');
  }
};
