const mongoose = require("mongoose");
const Joi = require("joi");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    isActivated: {
      type: Boolean,
      default: true
    },
    fullname: {
      type: String,
      required: true,
      maxlength: 50,
      minlength: 5
    },
    phone: {
      type: String,
      required: true,
      maxlength: 11,
      minlength: 10
    },
    age: {
      type: Number,
      required: true,
      max: 100,
      min: 18
    }
  })
);
module.exports.User = User;
module.exports.validateUser = user => {
  const schema = {
    fullname: Joi.string()
      .max(50)
      .min(5)
      .required(),
    phone: Joi.string()
      .max(11)
      .min(10)
      .required(),
    age: Joi.number()
      .max(100)
      .min(18)
      .required()
  };
  return Joi.validate(user, schema);
};
