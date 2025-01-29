const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authMiddleware");
const {
  getCryptocurrencies
} = require("../controllers/cryptocurrencyController");

// use authenticateToken all routes
router.use(authenticateToken);

// get cryptocurrencies
router.get("/", getCryptocurrencies);

module.exports = router;
