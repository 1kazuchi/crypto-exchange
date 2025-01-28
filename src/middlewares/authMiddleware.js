const { verifyToken } = require("../utils/jwtHelper");


function authenticateToken(req, res, next) {
  const token = req.headers["authorization"].split(" ")[1];
  //console.log(token);

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const user = verifyToken(token);
    req.user = user; 
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

module.exports = authenticateToken;
