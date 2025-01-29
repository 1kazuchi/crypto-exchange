// const { PrismaClient } = require("@prisma/client");

// const prisma = new PrismaClient();

// async function getWalletBalance(req, res) {
//   try {
//     const userId = req.user.id; // Get userId from the authenticated user

//     // Fetch the wallet associated with the userId
//     const wallet = await prisma.wallet.findFirst({
//       where: {
//         userId: userId, // Find the wallet by userId
//       },
//     });

//     if (!wallet) {
//       return res.status(404).json({ error: "Wallet not found" });
//     }

//     res.status(200).json({ balance: wallet.balance });
//   } catch (error) {
//     res
//       .status(500)
//       .json({
//         error: "Failed to fetch wallet balance",
//         details: error.message,
//       });
//   }
// }

// async function depositToWallet(req, res) {
//   try {
//     const userId = req.user.id; // Get userId from the authenticated user
//     const depositAmount = 100000000; // Example deposit amount

//     // Check if the user already has a wallet
//     const wallet = await prisma.wallet.findFirst({
//       where: {
//         userId: userId, // Find wallet associated with the userId
//       },
//     });

//     if (wallet) {
//       // If wallet exists, update the balance
//       const updatedWallet = await prisma.wallet.update({
//         where: {
//           id: wallet.id, // Use the wallet's unique ID to update
//         },
//         data: {
//           balance: {
//             increment: depositAmount, // Add deposit to the balance
//           },
//         },
//       });

//       res.status(200).json({
//         message: "Wallet balance updated successfully",
//         wallet: updatedWallet,
//       });
//     } else {
//       // If wallet does not exist, create a new wallet for the user
//       const newWallet = await prisma.wallet.create({
//         data: {
//           userId: userId,
//           balance: depositAmount, // Set the initial balance
//         },
//       });

//       res.status(201).json({
//         message: "Wallet created and deposit successful",
//         wallet: newWallet,
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       error: "Failed to deposit to wallet",
//       details: error.message,
//     });
//   }
// }

// async function withdrawFromWallet(req, res) {
//   try {
//     const userId = req.user.id; // Get userId from the authenticated user
//     const withdrawalAmount = 50000; // Example withdrawal amount

//     // Fetch the user's wallet by userId
//     const wallet = await prisma.wallet.findFirst({
//       where: {
//         userId: userId, // Find wallet associated with the userId
//       },
//     });

//     if (!wallet) {
//       return res.status(404).json({
//         error: "Wallet not found",
//         details: "No wallet found for the user",
//       });
//     }

//     if (wallet.balance < withdrawalAmount) {
//       return res.status(400).json({
//         error: "Insufficient funds",
//         details: "The withdrawal amount exceeds the available balance",
//       });
//     }

//     // If wallet exists and balance is sufficient, proceed with withdrawal
//     const updatedWallet = await prisma.wallet.update({
//       where: {
//         id: wallet.id, // Use wallet's unique ID to update
//       },
//       data: {
//         balance: {
//           decrement: withdrawalAmount, // Subtract withdrawal amount from balance
//         },
//       },
//     });

//     res.status(200).json({
//       message: "Withdrawal successful",
//       wallet: updatedWallet,
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: "Failed to withdraw from wallet",
//       details: error.message,
//     });
//   }
// }

// module.exports = { getWalletBalance, depositToWallet, withdrawFromWallet };

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getWalletBalance(req, res) {
  try {
    const userId = req.user.id; // Get userId from the authenticated user

    // Fetch the wallet associated with the userId
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId: userId, // Find the wallet by userId
      },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    res.status(200).json({ balance: wallet.balance });
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
    const { depositAmount } = req.body; 

    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({
        error: "Invalid deposit amount",
        details: "Deposit amount must be a positive number",
      });
    }

    // Check if the user already has a wallet
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId: userId,
      },
    });

    if (wallet) {
      // If wallet exists, update the balance
      const updatedWallet = await prisma.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: {
            increment: depositAmount,
          },
        },
      });

      res.status(200).json({
        message: "Wallet balance updated successfully",
        wallet: updatedWallet,
      });
    } else {
      // If wallet does not exist, create a new wallet for the user
      const newWallet = await prisma.wallet.create({
        data: {
          userId: userId,
          balance: depositAmount,
        },
      });

      res.status(201).json({
        message: "Wallet created and deposit successful",
        wallet: newWallet,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to deposit to wallet",
      details: error.message,
    });
  }
}

async function withdrawFromWallet(req, res) {
  try {
    const userId = req.user.id; 
    const { withdrawalAmount } = req.body; 

    if (!withdrawalAmount || withdrawalAmount <= 0) {
      return res.status(400).json({
        error: "Invalid withdrawal amount",
        details: "Withdrawal amount must be a positive number",
      });
    }

    // Fetch the user's wallet by userId
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!wallet) {
      return res.status(404).json({
        error: "Wallet not found",
        details: "No wallet found for the user",
      });
    }

    if (wallet.balance < withdrawalAmount) {
      return res.status(400).json({
        error: "Insufficient funds",
        details: "The withdrawal amount exceeds the available balance",
      });
    }

    const updatedWallet = await prisma.wallet.update({
      where: {
        id: wallet.id, 
      },
      data: {
        balance: {
          decrement: withdrawalAmount, 
        },
      },
    });

    res.status(200).json({
      message: "Withdrawal successful",
      wallet: updatedWallet,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to withdraw from wallet",
      details: error.message,
    });
  }
}

module.exports = { getWalletBalance, depositToWallet, withdrawFromWallet };
