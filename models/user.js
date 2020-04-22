const mongoose = require("mongoose");
const Joi = require("joi");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    locations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: false,
      },
    ],
    isActivated: {
      type: Boolean,
      default: true,
    },
    fullname: {
      type: String,
      required: true,
      maxlength: 50,
      minlength: 5,
    },
    phone: {
      type: String,
      required: true,
      maxlength: 11,
      minlength: 10,
    },
    dob: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      default: "unknown",
      enum: ["unknown", "male", "female"],
    },
    avatar: {
      type: String,
      default: function () {
        if (this.gender === "female")
          return "https://efrs.s3-ap-southeast-1.amazonaws.com/common-assets/profile-avatar/female-avatar.png";
        else
          return "https://efrs.s3-ap-southeast-1.amazonaws.com/common-assets/profile-avatar/male-avatar.png";
      },
    },
  })
);
module.exports.User = User;
module.exports.validateUser = (user) => {
  const schema = {
    fullname: Joi.string().max(50).min(5).required(),
    phone: Joi.string().max(11).min(10).required(),
    dob: Joi.string()
      .regex(/^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i)
      .required(),
    gender: Joi.string().only(["unknown", "male", "female"]),
  };
  return Joi.validate(user, schema);
};
