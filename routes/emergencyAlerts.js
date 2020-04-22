const valdidateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const { isSupervisor } = require("../middleware/getRole");
const {
  EmergencyAlert,
  validateEmergencyAlert,
} = require("../models/emergencyAlert");
const { Location } = require("../models/location");
const { sendAlert } = require("../services/sendAlert");
const express = require("express");
const router = express.Router();

//post new emergency alert
router.post(
  "/",
  [auth, isSupervisor, validate(validateEmergencyAlert)],
  async (req, res) => {
    const alert = EmergencyAlert({
      radius: req.body.radius,
      lat: req.body.lat,
      lng: req.body.lng,
      message: req.body.message,
      title: req.body.title,
      supervisor: req.body.supervisor,
    });
    await alert.save();
    //get all locations in db except fire station and location without device
    const locations = await Location.find({
      isFireStation: false,
      device: { $ne: null },
    });

    //get all location within the range
    const filteredLocations = locations.filter(
      (location) =>
        getDistanceFrom2CoordinatesInKm(
          alert.lat,
          alert.lng,
          location.lat,
          location.lng
        ) <= alert.radius
    );

    //get array of token's device
    let registrationTokens = [];
    filteredLocations.forEach((location) => {
      registrationTokens.push(location.device.registrationToken);
    });

    //remove duplicated token
    registrationTokens = [...new Set(registrationTokens)];

    await sendAlert(alert, registrationTokens);

    return res.status(200).send(filteredLocations);
  }
);

function getDistanceFrom2CoordinatesInKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = router;
