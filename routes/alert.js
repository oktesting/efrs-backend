const { validateFire } = require("../models/fire");
const express = require("express");
const {
  addAlert,
  handleAlert,
  addEvidencesToCurrentAlert
} = require("../middleware/handleAlert");
const validate = require("../middleware/validate");
const { array } = require("../middleware/uploadToServer");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

router.get("/", handleAlert);

// const { Fire } = require("../models/fire");
// router.get("/:id", async (req, res) => {
//   const fire = await Fire.findById(req.params.id);

//   res.send(fire);
// });

router.post("/", [array("files", 3), validate(validateFire), addAlert]);

router.put("/:id", [
  validateObjectId,
  array("files", 3),
  addEvidencesToCurrentAlert
]);

module.exports = router;
