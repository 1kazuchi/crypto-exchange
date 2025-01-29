const express = require("express");
const authenticateToken = require("../middlewares/authMiddleware");
const {
  getUserTransactions,
  createTransaction,
  getUserTransactionsById,
} = require("../controllers/transactionController");

const router = express.Router();

// use authenticateToken all routes
router.use(authenticateToken);

// fecth user transactions
router.get("/", getUserTransactions);
router.get("/:id", getUserTransactionsById);

// create transaction
router.post("/", createTransaction);

module.exports = router;
