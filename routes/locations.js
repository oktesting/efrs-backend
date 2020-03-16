const valdidateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");
const {
  Location,
  validateUserLocation,
  validateFireStation
} = require("../models/location");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();

router.post("/fire-station", [
  validate(validateFireStation),
  async (req, res) => {
    const location = Location({ ...req.body, isFireStation: true });
    await location.save();
    return res.status(200).send(location);
  }
]);

//add location for an user
router.post(
  "/:id",
  [valdidateObjectId, validate(validateUserLocation)],
  async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("user is not found");
    const location = Location(req.body);
    user.locations.push(location._id);
    await location.save();
    await user.save();
    return res.status(200).send(location);
  }
);
//get all fire station
router.get("/fire-station", async (req, res) => {
  return res.status(200).send(await Location.find({ isFireStation: true }));
});
//get all locations of an user
router.get("/:id", [valdidateObjectId], async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("user is not found");
  let locations = new Array(0);
  for (const id of user.locations) {
    locations.push(await Location.findById(id));
  }
  return res.status(200).send(locations);
});

module.exports = router;
