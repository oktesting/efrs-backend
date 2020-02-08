/*'express-async-errors' module will redirect from route handler 
middleware to error middleware when exception happens automatically*/
// require('express-async-errors');
//log the error to logfile.log
const winston = require("winston"); // this is deprecated version 2.4.0
//log the error to mongdb
//require('winston-mongodb');// this is alse deprecated version 3.0.0
module.exports = function() {
  //uncaughtException is standard exception in nodejs, work only with sync code
  // process.on('uncaughtException', (err) => {
  //     winston.error(err.message, err);
  //     process.exit(1);//1-failure, 0: success
  // });

  //winston way
  winston.handleExceptions(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: "uncaughtExceptions.log" })
  );

  //unhandledRejection is standard exception in nodejs, work only with async code
  process.on("unhandledRejection", err => {
    // winston.error(err.message, err);
    // process.exit(1);//1-failure, 0: success
    throw err;
  });

  winston.add(winston.transports.File, { filename: "logfile.log" });
  // winston.add(winston.transports.MongoDB,
  //     { db: 'mongodb://localhost/vidly', level: 'error' });
};
