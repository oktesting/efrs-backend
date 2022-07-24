const validate = require('../middlewares/validate');
const valdidateObjectId = require('../middlewares/validateObjectId');
const isAuthenticated = require('../middlewares/isAuthenticated');
const { isSupervisor } = require('../middlewares/authorization');
const { validateReport } = require('../models/report');
const express = require('express');
const router = express.Router();
const reportsService = require('../services/reports.service');

router.get('/', [isAuthenticated, isSupervisor], reportsService.getReports);

router.get(
  '/:id',
  [isAuthenticated, isSupervisor, valdidateObjectId],
  reportsService.getReport
);

router.post(
  '/',
  [isAuthenticated, isSupervisor, validate(validateReport)],
  reportsService.create
);

router.delete(
  '/:id',
  [isAuthenticated, isSupervisor, valdidateObjectId],
  reportsService.delete
);

router.put(
  '/:id',
  [isAuthenticated, isSupervisor, valdidateObjectId, validate(validateReport)],
  reportsService.update
);

module.exports = router;
