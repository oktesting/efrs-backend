//check whether the authenticated client is authorized (isAdmin: true)
const config = require("config");
module.exports = function(req, res, next) {
  if (!config.get("requiresAuth")) return next();
  if (!req.user.isAdmin) {
    //401 unauthorized
    //403 authorized but the asset is FORBIDDEN

    //disable "requiresAuth" to bybass the authentication

    return res.status(403).send("Forbidden");
  }
  next();
};
