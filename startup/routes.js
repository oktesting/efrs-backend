//route endpoint
const fires = require('../controllers/fires.controller');
const auth = require('../controllers/auth.controller');
const accounts = require('../controllers/accounts.controller');
const supervisors = require('../controllers/supervisors.controller');
const users = require('../controllers/users.controller');
const locations = require('../controllers/locations.controller');
const emergencyAlerts = require('../controllers/emergencyAlerts.controller');
const firesHisotry = require('../controllers/firesHistory.controller');
const reports = require('../controllers/reports.controller');

//error is express's middleware function that we implemented to handle error
const error = require('../middlewares/error');
const express = require('express');
module.exports = function (app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  //set uploads folder as public
  app.use('/uploads', express.static('uploads'));

  //api
  app.use('/api/fires', fires);
  app.use('/api/supervisors', supervisors);
  app.use('/api/users', users);
  app.use('/api/accounts', accounts);
  app.use('/api/auth', auth);
  app.use('/api/locations', locations);
  app.use('/api/emergency-alerts', emergencyAlerts);
  app.use('/api/fires-history', firesHisotry);
  app.use('/api/reports', reports);

  app.use(
    '/ping',
    express.Router().get('/', (req, res) => res.status(200).send('pong'))
  );

  app.use(error); //handle error after all above middleware
};
