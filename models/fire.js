const Joi = require("joi");
const mongoose = require("mongoose");

const fireSchema = new mongoose.Schema({
  longtitude: {
    type: Number,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  evidences: {
    type: Array,
    required: false
  }
});

const Fire = mongoose.model("Fire", fireSchema);
module.exports.Fire = Fire;
module.exports.validateFire = fire => {
  const schema = {
    longtitude: Joi.number().required(),
    latitude: Joi.number().required(),
    userId: Joi.objectId().required()
  };
  return Joi.validate(fire, schema);
};
