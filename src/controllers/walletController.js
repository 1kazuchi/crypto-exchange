const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const axios = require("axios");

const EXCHANGE_API_URL = process.env.EXCHANGE_API_URL;

async function getExchangeRates() {
  try {
    const response = await axios.get(EXCHANGE_API_URL);
    return response.data.rates; 
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return null; 
  }
}

async function getWalletBalances(req, res) {
  try {
    // Fetch all wallets associated with users
    const wallets = await prisma.wallet.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (wallets.length === 0) {
      return res.status(404).json({ error: "No wallets found" });
    }

    // Map the wallet data to include user info and balance
    const walletBalances = wallets.map(wallet => ({
      userId: wallet.userId,
      username: wallet.user.username,
      email: wallet.user.email,
      currency: wallet.currency,
      balance: parseFloat((wallet.balance).toFixed(2)),
    }));

    res.status(200).json(walletBalances);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch wallet balances",
      details: error.message,
    });
  }
}

async function getWalletBalanceById(req, res) {
  try {
    const { id } = req.params; 

    // Fetch the wallet associated with the userId
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId: parseInt(id), 
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found for this user" });
    }

    res.status(200).json({
      userId: wallet.userId,
      username: wallet.user.username,
      email: wallet.user.email,
      balance: parseFloat((wallet.balance).toFixed(2)),
      currency: wallet.currency,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch wallet balance",
      details: error.message,
    });
  }
}

async function depositToWallet(req, res) {
  try {
    const userId = req.user.id;
    const { depositAmount, currency } = req.body;

    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({
        error: "Invalid deposit amount",
        details: "Deposit amount must be a positive number",
      });
    }

    let convertedAmount = depositAmount;

    if (currency === "THB") {
      const rates = await getExchangeRates();
      if (!rates) {
        return res.status(500).json({
          error: "Exchange rate service unavailable",
          details: "Unable to fetch exchange rates",
        });
      }
      convertedAmount = parseFloat((depositAmount / rates.THB).toFixed(2));
    }

    const wallet = await prisma.wallet.findFirst({ where: { userId } });

    if (wallet) {
      const updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: convertedAmount } },
      });

      res.status(200).json({
        message: "Deposit successful",
        wallet: { ...updatedWallet, balance: parseFloat(updatedWallet.balance.toFixed(2)) },
        depositAmount,
        convertedAmount,
        currency: "USD",
      });
    } else {
      const newWallet = await prisma.wallet.create({
        data: { userId, balance: convertedAmount },
      });

      res.status(201).json({
        message: "Wallet created and deposit successful",
        wallet: { ...newWallet, balance: parseFloat(newWallet.balance.toFixed(2)) },
        depositAmount,
        convertedAmount,
        currency: "USD",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to deposit to wallet", details: error.message });
  }
}

async function withdrawFromWallet(req, res) {
  try {
    const userId = req.user.id;
    const { withdrawalAmount, currency } = req.body;

    if (!withdrawalAmount || withdrawalAmount <= 0) {
      return res.status(400).json({
        error: "Invalid withdrawal amount",
        details: "Withdrawal amount must be a positive number",
      });
    }

    let convertedAmount = withdrawalAmount;

    if (currency === "THB") {
      const rates = await getExchangeRates();
      if (!rates) {
        return res.status(500).json({
          error: "Exchange rate service unavailable",
          details: "Unable to fetch exchange rates",
        });
      }
      convertedAmount = parseFloat((withdrawalAmount / rates.THB).toFixed(2));
    }

    const wallet = await prisma.wallet.findFirst({ where: { userId } });

    if (!wallet) {
      return res.status(404).json({
        error: "Wallet not found",
        details: "No wallet found for the user",
      });
    }

    if (wallet.balance < convertedAmount) {
      return res.status(400).json({
        error: "Insufficient funds",
        details: "The withdrawal amount exceeds the available balance",
      });
    }

    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: convertedAmount } },
    });

    res.status(200).json({
      message: "Withdrawal successful",
      wallet: { ...updatedWallet, balance: parseFloat(updatedWallet.balance.toFixed(2)) },
      withdrawalAmount,
      convertedAmount,
      currency: "USD",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to withdraw from wallet", details: error.message });
  }
}

module.exports = { getWalletBalances,getWalletBalanceById ,depositToWallet, withdrawFromWallet };
