const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authMiddleware");
const {
  getCryptocurrencies
} = require("../controllers/cryptocurrencyController");

// get cryptocurrencies
router.get("/", getCryptocurrencies);

module.exports = router;
