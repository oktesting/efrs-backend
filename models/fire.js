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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  evidences: {
    type: Array,
    required: false
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "processing", "finished"]
  }
});

const Fire = mongoose.model("Fire", fireSchema);
module.exports.Fire = Fire;
module.exports.validateFire = fire => {
  const schema = {
    longtitude: Joi.number().required(),
    latitude: Joi.number().required(),
    user: Joi.objectId().required()
  };
  return Joi.validate(fire, schema);
};
