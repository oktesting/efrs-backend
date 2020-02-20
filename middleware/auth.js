const config = require("config");
const jwt = require("jsonwebtoken");

//check whether the client is authenticated
module.exports = function(req, res, next) {
  //disable "requiresAuth" to bybass the authentication
  // if (!config.get("requiresAuth")) return next();

  //extract token from header
  const token = req.header("x-auth-token");
  //no token - not authenticated - 401 access denied
  if (!token) return res.status(401).send("Access denied. no token provided");
  //get the payload from decoded token
  try {
    const decodedPayload = jwt.verify(token, config.get("jwtPrivateKey"));
    //set the user._id from payload to req
    req.user = decodedPayload;
    next();
  } catch (ex) {
    return res.status(400).send("invalid token");
  }
};
