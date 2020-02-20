//check whether the authenticated client is authorized (isAdmin: true)
const config = require("config");
module.exports = function(req, res, next) {
  //disable "requiresAuth" to bybass the authentication
  // if (!config.get("requiresAuth")) return next();
  if (!req.account.isAdmin) {
    //401 unauthorized
    //403 authorized but the asset is FORBIDDEN

    return res.status(403).send("Forbidden");
  }
  next();
};
