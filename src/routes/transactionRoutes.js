const express = require("express");
const authenticateToken = require("../middlewares/authMiddleware");
const {
  getUserTransactions,
  getUserTransactionsById,
  buyCrypto,
  sellCrypto,
  getRemainingCryptocurrenciesByUserId,
  transferCrypto,
} = require("../controllers/transactionController");

const router = express.Router();

// use authenticateToken all routes
router.use(authenticateToken);

// fecth user transactions
router.get("/", getUserTransactions);
router.get("/:id", getUserTransactionsById);
router.get("/remaining/:id", getRemainingCryptocurrenciesByUserId);

//buy crypto
router.post("/buy", buyCrypto);

//sell crypto
router.post("/sell", sellCrypto);

//transfer crypto
router.post("/transfer", transferCrypto);

module.exports = router;
