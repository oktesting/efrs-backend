const Joi = require('joi');
// assign Joi.objectId() function to validate objectId
module.exports = function () {
    Joi.objectId = require('joi-objectid')(Joi);
}