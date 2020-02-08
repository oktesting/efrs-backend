const mongoose = require("mongoose");
const Joi = require("joi");

const AppUser = mongoose.model(
  "AppUser",
  new mongoose.Schema({
    isVerified: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      required: true,
      maxlength: 50,
      minlength: 5
    },
    phone: {
      type: String,
      required: true,
      maxlength: 50,
      minlength: 5
    }
  })
);
module.exports.AppUser = AppUser;
module.exports.validateCustomer = customer => {
  const schema = {
    isVerified: Joi.boolean(),
    name: Joi.string()
      .max(50)
      .min(5)
      .required(),
    phone: Joi.string()
      .max(50)
      .min(5)
      .required()
  };
  return Joi.validate(customer, schema);
};
