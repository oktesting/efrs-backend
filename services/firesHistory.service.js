const { Fire } = require('../models/fire');

module.exports = {
  //get all fires of an users
  getFires: async (req, res) => {
    const fires = await Fire.find({ user: req.params.id }).select('-__v');
    return res.status(200).send(fires);
  },

  //get one fire
  getFire: async (req, res) => {
    const fire = await Fire.findById(req.params.id)
      .populate('user', '-__v')
      .select(' -__v');
    if (!fire) return res.status(404).send('Fire is not found');
    return res.status(200).send(fire);
  }
};
