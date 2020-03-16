const valdidateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");
const {
  EmergencyAlert,
  validateEmergencyAlert
} = require("../models/emergencyAlert");
const express = require("express");
const router = express.Router();

//post new emergency alert
router.post("/", [validate(validateEmergencyAlert)], async (req, res) => {
  const alert = EmergencyAlert({
    radius: req.body.radius,
    lat: req.body.lat,
    lng: req.body.lng,
    message: req.body.message,
    title: req.body.title,
    supervisor: req.body.supervisor
  });
  return res.status(200).send(await alert.save());
  // viết logic notify tất cả user nằm trong vùng bán kính ở đây
});

module.exports = router;
