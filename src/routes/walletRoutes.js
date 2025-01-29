const express = require("express");
const authenticateToken = require("../middlewares/authMiddleware");
const {
  getWalletBalances,
  getWalletBalanceById,
  depositToWallet,
  withdrawFromWallet,
} = require("../controllers/walletController");

const router = express.Router();

// use authenticateToken all routes
router.use(authenticateToken);

// get Balance Wallet
router.get("/", getWalletBalances);
router.get("/:id", getWalletBalanceById);

// deposit
router.post("/deposit", depositToWallet);

// withdraw
router.post("/withdraw", withdrawFromWallet);

module.exports = router;
