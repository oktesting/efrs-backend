const valdidateObjectId = require('../middlewares/validateObjectId');
const isAuthenticated = require('../middlewares/isAuthenticated');
const { isSupervisor } = require('../middlewares/authorization');
const express = require('express');
const router = express.Router();
const fireHistoryService = require('../services/firesHistory.service');

router.get(
  '/user/:id',
  [isAuthenticated, isSupervisor, valdidateObjectId],
  fireHistoryService.getFires
);

router.get(
  '/:id',
  [isAuthenticated, isSupervisor, valdidateObjectId],
  fireHistoryService.getFire
);

module.exports = router;
