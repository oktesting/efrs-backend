const express = require('express');
const { validateAccount, validateResetPassword } = require('../models/account');
const validateOjectId = require('../middlewares/validateObjectId');
const validate = require('../middlewares/validate');
const isAuthenticated = require('../middlewares/isAuthenticated');
const accountsService = require('../services/accounts.service');

const router = express.Router();
router.get('/me', [isAuthenticated], accountsService.getUserInfo);

router.post('/', validate(validateAccount), accountsService.register);

router.get('/confirmation/:token', accountsService.verifyConfirmationToken);

router.get('/resend/:id', validateOjectId, accountsService.resendConfirmationEmail);

router.post('/forgot-password', accountsService.requestResetPassword);

router.post(
  '/reset',
  validate(validateResetPassword),
  accountsService.handleResetPassword
);

module.exports = router;
