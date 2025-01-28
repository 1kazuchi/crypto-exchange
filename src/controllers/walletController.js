const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getWalletBalance(req, res) {
  try {
    const userId = req.user.id; 
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    res.status(200).json({ balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wallet balance", details: error.message });
  }
}

async function depositToWallet(req, res) {
  const { amount } = req.body;

  try {
    const userId = req.user.id; 
    const wallet = await prisma.wallet.upsert({
      where: { userId },
      update: { balance: { increment: amount } },
      create: { userId, balance: amount },
    });

    res.status(200).json({ message: "Deposit successful", wallet });
  } catch (error) {
    res.status(500).json({ error: "Failed to deposit to wallet", details: error.message });
  }
}

async function withdrawFromWallet(req, res) {
  const { amount } = req.body;

  try {
    const userId = req.user.id;

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    });

    res.status(200).json({ message: "Withdrawal successful", wallet: updatedWallet });
  } catch (error) {
    res.status(500).json({ error: "Failed to withdraw from wallet", details: error.message });
  }
}

module.exports = { getWalletBalance, depositToWallet, withdrawFromWallet };
