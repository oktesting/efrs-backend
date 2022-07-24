const { validateFire } = require('../models/fire');
const express = require('express');
const validate = require('../middlewares/validate');
const { array } = require('../middlewares/uploadToServer');
const validateObjectId = require('../middlewares/validateObjectId');
const isAuthenticated = require('../middlewares/isAuthenticated');
const { isSupervisor, isUser } = require('../middlewares/authorization');
const firesService = require('../services/fires.service');

const router = express.Router();

router.get('/', firesService.handleAlert);

router.get(
  '/change-status/:option/:id',
  [isAuthenticated, isSupervisor, validateObjectId],
  firesService.changeFireStatus
);
// const { Fire } = require("../models/fire");
// router.get("/:id", async (req, res) => {
//   const fire = await Fire.findById(req.params.id);

//   res.send(fire);
// });

router.post('/', [
  isAuthenticated,
  isUser,
  array('files', 3),
  validate(validateFire),
  firesService.addAlert
]);

router.put('/:id', [
  isAuthenticated,
  isUser,
  validateObjectId,
  array('files', 3),
  firesService.addEvidencesToCurrentAlert
]);

module.exports = router;
