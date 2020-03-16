const Joi = require("joi");
const mongoose = require("mongoose");

const EmergencyAlert = mongoose.model(
  "EmergencyAlert",
  new mongoose.Schema({
    radius: { type: Number, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    message: { type: String, required: true },
    title: { type: String, required: true },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supervisor",
      required: true
    }
  })
);

module.exports.EmergencyAlert = EmergencyAlert;
module.exports.validateEmergencyAlert = emergencyAlert => {
  const schema = {
    lat: Joi.number().required(),
    lng: Joi.number().required(),
    radius: Joi.number().required(),
    title: Joi.string().required(),
    message: Joi.string().required(),
    supervisor: Joi.objectId().required()
  };
  return Joi.validate(emergencyAlert, schema);
};
