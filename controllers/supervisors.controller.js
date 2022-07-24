const valdidateObjectId = require('../middlewares/validateObjectId');
const { single } = require('../middlewares/uploadToServer');
const { validateSupervisor } = require('../models/supervisor');
const validate = require('../middlewares/validate');
const isAuthenticated = require('../middlewares/isAuthenticated');
const { isAdmin, isSupervisor } = require('../middlewares/authorization');
const express = require('express');
const router = express.Router();
const supervisorsService = require('../services/supervisors.service');

router.get('/', [isAuthenticated, isAdmin], supervisorsService.getSupervisors);

router.get(
  '/:id',
  [isAuthenticated, valdidateObjectId],
  supervisorsService.getSupervisor
);

router.get(
  '/change-activation/:id',
  [isAuthenticated, isAdmin, valdidateObjectId],
  supervisorsService.changeActivation
);

//create new supervisor
router.post(
  '/',
  [isAuthenticated, validate(validateSupervisor)],
  supervisorsService.create
);

//update supervisor
router.put(
  '/',
  [isAuthenticated, isSupervisor, single('avatar'), validate(validateSupervisor)],
  supervisorsService.update
);
module.exports = router;
