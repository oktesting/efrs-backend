const { validateFire } = require("../models/fire");
const express = require("express");
const {
  addAlert,
  handleAlert,
  addEvidencesToCurrentAlert,
} = require("../middleware/handleAlert");
const validate = require("../middleware/validate");
const { array } = require("../services/uploadToServer");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const { isSupervisor, isUser } = require("../middleware/getRole");
const { Fire } = require("../models/fire");

const router = express.Router();

router.get("/", [auth, isSupervisor, handleAlert]);

router.get(
  "/change-status/:option/:id",
  [auth, isSupervisor, validateObjectId],
  async (req, res) => {
    const { option, id } = req.params;
    if (option != 1 && option != 2)
      return res.status(400).send("Option is invalid");
    let fire = await Fire.findById(id);
    if (!fire) return res.status(404).send("Fire is not found");
    if (option == 1) fire.status = "processing";
    else if (option == 2) fire.status = "finished";
    await fire.save();
    return res.status(200).send("Fire status is changed");
  }
);
// const { Fire } = require("../models/fire");
// router.get("/:id", async (req, res) => {
//   const fire = await Fire.findById(req.params.id);

//   res.send(fire);
// });

router.post("/", [
  auth,
  isUser,
  array("files", 3),
  validate(validateFire),
  addAlert,
]);

router.put("/:id", [
  auth,
  isUser,
  validateObjectId,
  array("files", 3),
  addEvidencesToCurrentAlert,
]);

module.exports = router;
