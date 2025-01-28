const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY; 
function generateToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

module.exports = { generateToken, verifyToken };
