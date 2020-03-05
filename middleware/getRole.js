//check whether the authenticated client is authorized (isAdmin: true)
const config = require("config");

module.exports.isAdmin = function(req, res, next) {
  //disable "requiresAuth" to bybass the authentication
  // if (!config.get("requiresAuth")) return next();
  if (!req.account.isAdmin) {
    //401 unauthorized
    //403 authorized but the asset is FORBIDDEN

    return res.status(403).send("Forbidden");
  }
  next();
};

module.exports.isSupervisor = function(req, res, next) {
  if (!req.account.supervisor) {
    return res.status(403).send("Forbidden");
  }
  next();
};

module.exports.isUser = function(req, res, next) {
  if (!req.account.user) {
    return res.status(403).send("Forbidden");
  }
  next();
};
