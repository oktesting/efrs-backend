const mongoose = require("mongoose");
const tokenSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
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
