const Joi = require("joi");
const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  deviceName: { type: String, required: true },
  deviceId: { type: String, required: true },
  registrationToken: { type: String, required: true }
});

const Location = mongoose.model(
  "Location",
  new mongoose.Schema({
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    province: { type: String, required: true },
    district: { type: String, required: true },
    isFireStation: { type: Boolean, default: false },
    device: {
      type: deviceSchema
    }
  })
);

module.exports.Location = Location;
module.exports.validateUserLocation = location => {
  const schema = {
    address: Joi.string().required(),
    lat: Joi.number().required(),
    lng: Joi.number().required(),
    province: Joi.string().required(),
    district: Joi.string().required(),
    device: Joi.object({
      deviceName: Joi.string().required(),
      deviceId: Joi.string().required(),
      registrationToken: Joi.string().required()
    }).required()
  };
  return Joi.validate(location, schema);
};
module.exports.validateFireStation = location => {
  const schema = {
    address: Joi.string().required(),
    lat: Joi.number().required(),
    lng: Joi.number().required(),
    province: Joi.string().required(),
    district: Joi.string().required()
  };
  return Joi.validate(location, schema);
};
