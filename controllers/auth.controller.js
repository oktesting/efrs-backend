const validate = require('../middlewares/validate');
const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const { validateAuthentication } = require('../models/account');

router.post('/', validate(validateAuthentication), authService.login);

module.exports = router;
