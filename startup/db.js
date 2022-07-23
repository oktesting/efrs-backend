const winston = require("winston");
const mongoose = require("mongoose");
module.exports = function() {
  mongoose
    .connect(process.env.DB_CONNECTION_STRING, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true
    })
    .then(() => winston.info(`Connected to database: ${process.env.DB_CONNECTION_STRING}`))
    .catch(error => console.error('could not connect to efrs database', error));
};
