const { isAdmin } = require("../middleware/getRole");
const valdidateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const {
  Location,
  validateUserLocation,
  validateFireStation,
} = require("../models/location");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();

//add new fire station
router.post(
  "/fire-station",
  [auth, isAdmin, validate(validateFireStation)],
  async (req, res) => {
    const location = Location({ ...req.body, isFireStation: true });
    await location.save();
    return res.status(200).send(location);
  }
);

//add location for an user
router.post(
  "/:id",
  [auth, valdidateObjectId, validate(validateUserLocation)],
  async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User is not found");
    const location = Location(req.body);
    user.locations.push(location._id);
    await location.save();
    await user.save();
    return res.status(200).send(location);
  }
);
//get all fire station
router.get("/fire-station", [auth], async (req, res) => {
  return res
    .status(200)
    .send(await Location.find({ isFireStation: true }).select("-__v"));
});
//get all locations of an user
router.get("/:id", [auth, valdidateObjectId], async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("User is not found");
  let locations = new Array(0);
  for (const id of user.locations) {
    locations.push(await Location.findById(id).select("-__v"));
  }
  return res.status(200).send(locations);
});

router.delete("/:id", [auth, valdidateObjectId], async (req, res) => {
  const location = await Location.findByIdAndRemove(req.params.id, {
    useFindAndModify: false,
  });
  if (!location) return res.status(404).send("Location is not found");
  res.status(200).send("Location is deleted");
});

module.exports = router;
