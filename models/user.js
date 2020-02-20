const jwt = require("jsonwebtoken");
const config = require("config");
const Joi = require("joi");
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  },
  email: {
    type: String,
    unique: true,
    required: true,
    maxlength: 255,
    minlength: 5
  },
  password: {
    type: String,
    required: true,
    maxlength: 1024, //after hashed
    minlength: 5
  },
  isAdmin: Boolean,
  isVerified: {
    type: Boolean,
    default: false
  }
});
//adding an INSTANCE method to the class User
userSchema.methods.generateAuthToken = function() {
  //cannot use '=>' here bc of 'this._id'
  return jwt.sign(
    {
      _id: this._id,
      isAdmin: this.isAdmin,
      email: this.email,
      name: this.name
    },
    config.get("jwtPrivateKey")
  );
};
const User = mongoose.model("User", userSchema);

module.exports.User = User;
module.exports.validateUser = user => {
  const schema = {
    name: Joi.string()
      .min(5)
      .max(255)
      .required(),
    email: Joi.string()
      .min(5)
      .max(255)
      .email()
      .required(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
  };
  return Joi.validate(user, schema);
};
