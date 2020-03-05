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
  },
  gender: {
    type: String,
    default: "unknown",
    enum: ["unknown", "male", "female"]
  },
  avatar: {
    type: String,
    default: function() {
      if (this.gender === "female")
        return "https://efrs.s3-ap-southeast-1.amazonaws.com/common-assets/profile-avatar/female-avatar.png";
      else
        return "https://efrs.s3-ap-southeast-1.amazonaws.com/common-assets/profile-avatar/male-avatar.png";
    }
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
      .required(),
    gender: Joi.string().only(["unknown", "male", "female"])
  };
  return Joi.validate(supervisor, schema);
};
