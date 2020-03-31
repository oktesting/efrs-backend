const Joi = require("joi");
const mongoose = require("mongoose");

const Report = mongoose.model(
  "Report",
  new mongoose.Schema({
    location: { type: String, required: false },
    area: { type: Number, required: false },
    totalVehicle: { type: Number, required: false },
    totalFireman: { type: Number, required: false },
    totalDamageProperty: { type: Number, required: false },
    listDamageProperty: { type: String, required: false },
    totalDeath: { type: Number, required: false },
    totalInjury: { type: Number, required: false },
    investigation: { type: String, required: false },
    fireResult: { type: String, required: false },
    fireCause: { type: String, required: false },
    owner: { type: String, required: false },
    fireType: { type: String, required: false },
    usageType: { type: String, required: false },
    cadastral: { type: String, required: false },
    fireStationManagement: { type: String, required: false },
    travelDistance: { type: String, required: false },
    supervisorName: { type: String, required: false },
    waterSource: { type: String, required: false },
    summary: { type: String, required: false },
    assessmentAndClassification: { type: String, required: false },
    receivedTime: { type: Date, required: false },
    finishedTime: { type: Date, required: false },
    duration: { type: String, required: false },
    createdAt: { type: Date, default: Date.now, required: false },
    fire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fire",
      required: true
    }
  })
);

module.exports.Report = Report;
module.exports.validateReport = report => {
  const schema = {
    location: Joi.string(),
    area: Joi.number(),
    totalVehicle: Joi.number(),
    totalFireman: Joi.number(),
    totalDamageProperty: Joi.number(),
    listDamageProperty: Joi.string(),
    totalDeath: Joi.number(),
    totalInjury: Joi.number(),
    investigation: Joi.string(),
    fireResult: Joi.string(),
    fireCause: Joi.string(),
    owner: Joi.string(),
    fireType: Joi.string(),
    usageType: Joi.string(),
    cadastral: Joi.string(),
    fireStationManagement: Joi.string(),
    travelDistance: Joi.string(),
    supervisorName: Joi.string(),
    waterSource: Joi.string(),
    summary: Joi.string(),
    assessmentAndClassification: Joi.string(),
    receivedTime: Joi.date(),
    finishedTime: Joi.date(),
    fire: Joi.objectId().required()
  };
  return Joi.validate(report, schema);
};
