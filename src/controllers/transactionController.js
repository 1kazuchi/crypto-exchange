const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// fecth user transactions
async function getUserTransactions(req, res) {
  try {
    const userId = req.user.id; 
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        cryptocurrency: {
          select: { name: true, symbol: true },
        },
      },
    });

    res.status(200).json({ transactions });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch transactions", details: error.message });
  }
}

//fecth user transactions by id
async function getUserTransactionsById(req, res) {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" }); // Handle invalid ID
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        cryptocurrency: {
          select: { name: true, symbol: true },
        },
      },
    });

    res.status(200).json({ transactions });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch transactions", details: error.message });
  }
}

// // create transaction
// async function createTransaction(req, res) {
//   const { type, currency, amount, price } = req.body;

//   try {
//     const userId = req.user.id; // ดึง userId จาก token

//     // สร้าง transaction พร้อมเชื่อม user
//     const transaction = await prisma.transaction.create({
//       data: {
//         type,
//         currency,
//         amount,
//         price,
//         user: {
//           connect: { id: userId }, // เชื่อมกับ User ที่มีอยู่
//         },
//       },
//     });

//     res
//       .status(201)
//       .json({ message: "Transaction created successfully", transaction });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Failed to create transaction", details: error.message });
//   }
// }

// async function createTransaction(req, res) {
//   const { type, currency, amount, price, cryptocurrencyId } = req.body;

//   try {
//     const userId = req.user.id; // ดึง userId จาก token

//     // สร้าง transaction พร้อมเชื่อม user และ cryptocurrency
//     // const transaction = await prisma.transaction.create({
//     //   data: {
//     //     type,
//     //     currency,
//     //     amount,
//     //     price,
//     //     user: {
//     //       connect: { id: userId },
//     //     },
//     //     cryptocurrency: {
//     //       connect: { id: cryptocurrencyId },
//     //     },
//     //   },
//     // });
//     const transaction = await prisma.transaction.create({
//       data: {
//         type: "buy",
//         currency: "BTC",
//         amount: 0.1,
//         price: 25000,
//         user: {
//           connect: {
//             id: 1,
//           },
//         },
//         cryptocurrency: {
//           connect: {
//             id: 1, // use the cryptocurrency relation here
//           },
//         },
//       },
//     });

//     // อัปเดต wallet ของผู้ใช้
//     const wallet = await prisma.wallet.update({
//       where: { userId }, // ค้นหา wallet ของผู้ใช้
//       data: {
//         balance: {
//           increment: type === "buy" ? -amount * price : amount * price, // คำนวณ balance
//         },
//         price, // อัปเดตราคาล่าสุด
//       },
//     });

//     res.status(201).json({
//       message: "Transaction created successfully",
//       transaction,
//       wallet,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Failed to create transaction", details: error.message });
//   }
// }

async function createTransaction(req, res) {
  const { type, amount, walletId, cryptocurrencyId, currency } = req.body; // Ensure price is passed

  try {
    const userId = req.user.id; 

    // Fetch the user's wallet to check balance
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    // Check if the wallet exists
    if (!wallet) {
      return res.status(404).json({
        error: "Wallet not found",
        details: "No wallet found for the user",
      });
    }

    // Fetch the cryptocurrency to get its price and name
    const cryptocurrency = await prisma.cryptocurrency.findUnique({
      where: { id: cryptocurrencyId },
      select: { price: true, name: true, symbol: true }, // Fetch the price, name, and symbol
    });

    if (!cryptocurrency) {
      return res.status(404).json({
        error: "Cryptocurrency not found",
        details: "The specified cryptocurrency does not exist.",
      });
    }

    // Check if the balance is sufficient for a "buy" transaction
    if (wallet.balance < cryptocurrency.price * amount && type === "buy") {
      return res.status(400).json({
        error: "Insufficient funds",
        details: "The wallet balance is insufficient for this buy transaction.",
      });
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        transactionType: type, // 'buy' or 'sell'
        amount,
        price: cryptocurrency.price, // Pass the price from the cryptocurrency table
        wallet: {
          connect: { id: walletId },
        },
        cryptocurrency: {
          connect: { id: cryptocurrencyId },
        },
        user: {
          connect: { id: userId },
        },
        currency, // Pass the currency as part of the transaction
      },
    });

    // Update the user's wallet balance
    const updatedWallet = await prisma.wallet.update({
      where: { id: walletId },
      data: {
        balance: {
          increment:
            type === "buy"
              ? -amount * cryptocurrency.price
              : amount * cryptocurrency.price,
        },
      },
    });

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: {
        ...transaction,
        cryptocurrency: {
          name: cryptocurrency.name,
          symbol: cryptocurrency.symbol,
        },
      },
      updatedWallet,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create transaction",
      details: error.message,
    });
  }
}

module.exports = {
  getUserTransactions,
  getUserTransactionsById,
  createTransaction,
};
