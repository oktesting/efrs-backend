const { addAlert, handleAlert } = require("../middleware/handleAlert");
const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

router.get("/", handleAlert);

const { Fire } = require("../models/fire");
router.get("/:id", async (req, res) => {
  const fire = await Fire.findById(req.params.id);

  res.send(fire);
});

router.post("/", [upload("file"), addAlert]);

module.exports = router;
