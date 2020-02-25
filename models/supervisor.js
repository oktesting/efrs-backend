const mongoose = require("mongoose");
const Joi = require("joi");

const supervisorSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    maxlength: 50,
    minlength: 5
  },
  isActivated: {
    type: Boolean,
    default: false
  },
  unitName: {
    type: String,
    required: true
  },
  // coordinate of supervisor's unit, contains 2 elements [lat,long]
  unitCoordinate: {
    type: Array,
    required: true
  },
  phone: {
    type: String,
    required: true,
    maxlength: 11,
    minlength: 10
  }
});

module.exports.Supervisor = mongoose.model("Supervisor", supervisorSchema);
module.exports.validateSupervisor = supervisor => {
  const schema = {
    fullname: Joi.string()
      .max(50)
      .min(5)
      .required(),
    unitName: Joi.string()
      .max(50)
      .min(5)
      .required(),
    unitCoordinate: Joi.array()
      .items(Joi.number())
      .length(2)
      .required(),
    phone: Joi.string()
      .max(11)
      .min(10)
      .required()
  };
  return Joi.validate(supervisor, schema);
};
