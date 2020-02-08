const { addAlert, handleAlert } = require("../middleware/handleAlert");

const express = require("express");
const router = express.Router();

router.get("/", handleAlert);

router.post("/", addAlert);

module.exports = router;
