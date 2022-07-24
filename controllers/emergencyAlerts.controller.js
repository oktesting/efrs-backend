const validate = require('../middlewares/validate');
const isAuthenticated = require('../middlewares/isAuthenticated');
const { isSupervisor } = require('../middlewares/authorization');
const express = require('express');
const router = express.Router();
const alertService = require('../services/emergencyAlerts.service');
const { validateEmergencyAlert } = require('../models/emergencyAlert');

//post new emergency alert
router.post(
  '/',
  [isAuthenticated, isSupervisor, validate(validateEmergencyAlert)],
  alertService.issueAlert
);

module.exports = router;
