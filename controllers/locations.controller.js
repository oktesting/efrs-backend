const { isAdmin } = require('../middlewares/authorization');
const valdidateObjectId = require('../middlewares/validateObjectId');
const validate = require('../middlewares/validate');
const isAuthenticated = require('../middlewares/isAuthenticated');
const { validateUserLocation, validateFireStation } = require('../models/location');
const express = require('express');
const router = express.Router();
const locationsService = require('../services/locations.service');

//add new fire station
router.post(
  '/fire-station',
  [isAuthenticated, isAdmin, validate(validateFireStation)],
  locationsService.addFireStation
);

//get all fire station
router.get('/fire-station', [isAuthenticated], locationsService.getFireStations);

//get all locations of an user
router.get(
  '/:id',
  [isAuthenticated, valdidateObjectId],
  locationsService.getUserLocations
);

router.delete(
  '/:id',
  [isAuthenticated, valdidateObjectId],
  locationsService.deleteLocation
);

//add location for an user
router.post(
  '/:id',
  [isAuthenticated, valdidateObjectId, validate(validateUserLocation)],
  locationsService.addLocationToUser
);

module.exports = router;
