const valdidateObjectId = require('../middlewares/validateObjectId');
const validate = require('../middlewares/validate');
const { single } = require('../middlewares/uploadToServer');
const isAuthenticated = require('../middlewares/isAuthenticated');
const { isSupervisor, isUser } = require('../middlewares/authorization');
const { validateUser } = require('../models/user');
const express = require('express');
const router = express.Router();
const usersService = require('../services/users.service');

router.get('/', [isAuthenticated, isSupervisor], usersService.getUsers);

router.get('/:id', [isAuthenticated, valdidateObjectId], usersService.getUser);

router.get(
  '/change-activation/:id',
  [isAuthenticated, isSupervisor, valdidateObjectId],
  usersService.changeActivation
);

router.post('/', [isAuthenticated, validate(validateUser)], usersService.create);

//update user
router.put(
  '/',
  [isAuthenticated, isUser, single('avatar'), validate(validateUser)],
  usersService.update
);

module.exports = router;
