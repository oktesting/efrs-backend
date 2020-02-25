//route endpoint
const alert = require("../routes/alert");
const auth = require("../routes/auth");
const accounts = require("../routes/accounts");
const supervisors = require("../routes/supervisors");
const users = require("../routes/users");

//error is express's middleware function that we implemented to handle error
const error = require("../middleware/error");
const express = require("express");
module.exports = function(app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  //set uploads folder as public
  app.use("/uploads", express.static("uploads"));

  //api
  app.use("/api/alert", alert);
  //   app.use("/api/customers", customers);
  app.use("/api/supervisors", supervisors);
  app.use("/api/users", users);
  app.use("/api/accounts", accounts);
  app.use("/api/auth", auth);
  // app.use("/api/returns", returns);

  app.use(error); //handle error after all above middleware
};
