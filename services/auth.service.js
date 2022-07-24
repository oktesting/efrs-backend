const bcrypt = require('bcryptjs');
const { Account } = require('../models/account');

module.exports = {
  login: async (req, res) => {
    let account = await Account.findOne({ email: req.body.email })
      .populate('user', '-__v')
      .populate({
        path: 'supervisor',
        populate: { path: 'location' }
      });
    if (!account) return res.status(400).send('Email or password is incorrect');
    const isValidPassword = await bcrypt.compare(req.body.password, account.password);
    if (isValidPassword) {
      if (!account.isVerified) {
        return res.status(401).send('Your account has not verified');
      }
      const jwtToken = account.generateAuthToken();
      return res.send(jwtToken);
    } else return res.status(400).send('Email or password is incorrect');
  }
};
