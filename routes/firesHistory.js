const valdidateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const { Fire } = require("../models/fire");
const express = require("express");
const router = express.Router();
// const { Account } = require("../models/account");
// const { User, validateUser } = require("../models/user");

//get all fires of an users
router.get("/user/:id", [auth, valdidateObjectId], async (req, res) => {
  const fires = await Fire.find({ user: req.params.id }).select("-__v");
  return res.status(200).send(fires);
});

//get one fire
router.get("/:id", [auth, valdidateObjectId], async (req, res) => {
  const fire = await Fire.findById(req.params.id)
    .populate("user", "-__v")
    .select(" -__v");
  if (!fire) return res.status(404).send("Fire is not found");
  return res.status(200).send(fire);
});

module.exports = router;
