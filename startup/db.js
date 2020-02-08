const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");
module.exports = function() {
  mongoose
    .connect(config.get("db"), {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true
    })
    .then(() => winston.info(`Connected to database: ${config.get("db")}`));
  // .catch(error => console.error('could not connect to vidly database'));
};
