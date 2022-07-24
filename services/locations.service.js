const { Location } = require('../models/location');
const { User } = require('../models/user');
const { Supervisor } = require('../models/supervisor');

module.exports = {
  addFireStation: async (req, res) => {
    const location = Location({ ...req.body, isFireStation: true });
    await location.save();
    return res.status(200).send(location);
  },
  getFireStations: async (req, res) => {
    return res
      .status(200)
      .send(await Location.find({ isFireStation: true }).select('-__v'));
  },
  getUserLocations: async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User is not found');
    let locations = new Array(0);
    for (const id of user.locations) {
      locations.push(await Location.findById(id).select('-__v'));
    }
    return res.status(200).send(locations);
  },
  deleteLocation: async (req, res) => {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).send('Location is not found');

    const supervisors = await Supervisor.find({ location: location._id });
    if (supervisors.length === 0) {
      await location.remove();
      res.status(200).send('Location is deleted');
    } else res.status(400).send('Location could not be delete');
  },
  addLocationToUser: async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User is not found');
    const location = Location(req.body);
    user.locations.push(location._id);
    await location.save();
    await user.save();
    return res.status(200).send(location);
  }
};
