const valdidateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");
const { Account } = require("../models/account");
const { User, validateUser } = require("../models/user");
const express = require("express");
const router = express.Router();

router.post(
  "/:id",
  [valdidateObjectId, validate(validateUser)],
  async (req, res) => {
    let account = await Account.findById(req.params.id);
    if (!account) return res.status(404).send("account is not found");
    if (account.supervisor)
      return res.status(400).send("this account is already registered");

    //create user profile
    const user = User({
      fullname: req.body.fullname,
      phone: req.body.phone,
      age: req.body.age
    });

    //set account to associate to an user profile
    account.user = user._id;
    await account.save();
    await user.save();
    return res.status(200).send(user);
  }
);

module.exports = router;
