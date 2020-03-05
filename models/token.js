const mongoose = require("mongoose");
const tokenSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600
  }
});

module.exports.Token = mongoose.model("Token", tokenSchema);
