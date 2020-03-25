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
    totalDeath: { type: Number, required: false },
    totalInjury: { type: Number, required: false },
    createdAt: {
      type: Date,
      default: Date.now,
      required: false
    },
    receivedTime: {
      type: Date,
      required: false
    },
    finishedTime: {
      type: Date,
      required: false
    },
    duration: {
      type: String,
      required: false
    },
    summary: {
      type: String,
      required: false
    },
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
    totalDeath: Joi.number(),
    totalInjury: Joi.number(),
    receivedTime: Joi.date(),
    finishedTime: Joi.date(),
    summary: Joi.string(),
    fire: Joi.objectId().required()
  };
  return Joi.validate(report, schema);
};
