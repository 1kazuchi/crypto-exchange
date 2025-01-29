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

//-------------------------------------///
async function buyCrypto(req, res) {
  const { amount, walletId, cryptocurrencyId, currency } = req.body;

  try {
    const userId = req.user.id;

    // Fetch the user's wallet to check balance
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      return res.status(404).json({
        error: "Wallet not found",
        details: "No wallet found for the user",
      });
    }

    // Fetch the cryptocurrency to get its price and name
    const cryptocurrency = await prisma.cryptocurrency.findUnique({
      where: { id: cryptocurrencyId },
      select: { price: true, name: true, symbol: true },
    });

    if (!cryptocurrency) {
      return res.status(404).json({
        error: "Cryptocurrency not found",
        details: "The specified cryptocurrency does not exist.",
      });
    }

    // Get the wallet balance
    const walletBalance = wallet.balance;

    // Check if the balance is sufficient for the buy transaction
    if (walletBalance < cryptocurrency.price * amount) {
      return res.status(400).json({
        error: "Insufficient funds",
        details: "The wallet balance is insufficient for this buy transaction.",
      });
    }

    // Create the buy transaction
    const totalPrice = amount * cryptocurrency.price;
    const transaction = await prisma.transaction.create({
      data: {
        transactionType: "buy",
        amount,
        price: totalPrice,
        wallet: {
          connect: { id: walletId },
        },
        cryptocurrency: {
          connect: { id: cryptocurrencyId },
        },
        user: {
          connect: { id: userId },
        },
        currency,
      },
    });

    // Update the user's wallet balance after the buy operation
    await prisma.wallet.update({
      where: { id: walletId },
      data: {
        balance: {
          increment: -totalPrice,
        },
      },
    });

    // Now update the walletCryptocurrency table to reflect the amount of cryptocurrency bought
    const existingWalletCrypto = await prisma.walletCryptocurrency.findUnique({
      where: {
        walletId_cryptocurrencyId: {
          walletId,
          cryptocurrencyId,
        },
      },
    });

    if (existingWalletCrypto) {
      // If cryptocurrency already exists in the wallet, increment the amount
      await prisma.walletCryptocurrency.update({
        where: {
          walletId_cryptocurrencyId: {
            walletId,
            cryptocurrencyId,
          },
        },
        data: {
          amount: {
            increment: amount,
          },
        },
      });
    } else {
      // If cryptocurrency does not exist in the wallet, create a new record
      await prisma.walletCryptocurrency.create({
        data: {
          walletId,
          cryptocurrencyId,
          amount,
        },
      });
    }

    // Fetch updated wallet to return the new balance
    const updatedWallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    // Calculate remaining cryptocurrency amount
    const remainingCrypto = await prisma.walletCryptocurrency.findUnique({
      where: {
        walletId_cryptocurrencyId: {
          walletId,
          cryptocurrencyId,
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
      updatedWalletBalance: updatedWallet.balance, // Return the updated balance
      remainingCryptoAmount: remainingCrypto ? remainingCrypto.amount : 0, // Return remaining cryptocurrency amount
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create transaction",
      details: error.message,
    });
  }
}

//sell crypto
async function sellCrypto(req, res) {
  const { amount, walletId, cryptocurrencyId, currency } = req.body;

  try {
    const userId = req.user.id;

    // Fetch the user's wallet to check balance
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      return res.status(404).json({
        error: "Wallet not found",
        details: "No wallet found for the user",
      });
    }

    // Fetch the cryptocurrency to get its price and name
    const cryptocurrency = await prisma.cryptocurrency.findUnique({
      where: { id: cryptocurrencyId },
      select: { price: true, name: true, symbol: true },
    });

    if (!cryptocurrency) {
      return res.status(404).json({
        error: "Cryptocurrency not found",
        details: "The specified cryptocurrency does not exist.",
      });
    }

    // Check if the user has enough cryptocurrency to sell
    const userCryptoAmount = await prisma.walletCryptocurrency.findUnique({
      where: {
        walletId_cryptocurrencyId: {
          walletId,
          cryptocurrencyId,
        },
      },
    });

    if (!userCryptoAmount || userCryptoAmount.amount < amount) {
      return res.status(400).json({
        error: "Insufficient cryptocurrency",
        details: "You don't have enough cryptocurrency to sell.",
      });
    }

    // Create the sell transaction
    const totalPrice = amount * cryptocurrency.price;
    const transaction = await prisma.transaction.create({
      data: {
        transactionType: "sell",
        amount,
        price: totalPrice,
        wallet: {
          connect: { id: walletId },
        },
        cryptocurrency: {
          connect: { id: cryptocurrencyId },
        },
        user: {
          connect: { id: userId },
        },
        currency,
      },
    });

    // Update the user's wallet balance after the sell operation
    await prisma.wallet.update({
      where: { id: walletId },
      data: {
        balance: {
          increment: totalPrice,
        },
      },
    });

    // Update the walletCryptocurrency table to reflect the amount of cryptocurrency sold
    await prisma.walletCryptocurrency.update({
      where: {
        walletId_cryptocurrencyId: {
          walletId,
          cryptocurrencyId,
        },
      },
      data: {
        amount: {
          decrement: amount,
        },
      },
    });

    // Fetch updated wallet to return the new balance
    const updatedWallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    // Calculate remaining cryptocurrency amount
    const remainingCrypto = await prisma.walletCryptocurrency.findUnique({
      where: {
        walletId_cryptocurrencyId: {
          walletId,
          cryptocurrencyId,
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
      updatedWalletBalance: updatedWallet.balance, // Return the updated balance
      remainingCryptoAmount: remainingCrypto ? remainingCrypto.amount : 0, // Return remaining cryptocurrency amount
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create transaction",
      details: error.message,
    });
  }
}

async function transferCrypto(req, res) {
  const { receiverUserId, cryptocurrencyId, amount, currency } = req.body;
  const senderUserId = req.user.id; // Sender's user ID from session or token

  try {
    // Fetch sender's wallet
    const senderWallet = await prisma.wallet.findFirst({
      where: { userId: senderUserId },
    });

    console.log("Sender wallet:", senderWallet);
    console.log("Current User ID:", senderUserId);

    if (!senderWallet) {
      return res.status(404).json({
        error: "Sender wallet not found",
        details: "The sender wallet does not exist.",
      });
    }

    // Fetch receiver's wallet
    console.log("Fetching receiver wallet for user:", receiverUserId);
    const receiverWallet = await prisma.wallet.findFirst({
      where: { userId: receiverUserId },
    });

    if (!receiverWallet) {
      return res.status(404).json({
        error: "Receiver wallet not found",
        details: "The receiver wallet does not exist.",
      });
    }

    // Fetch cryptocurrency details (price, name, symbol)
    const cryptocurrency = await prisma.cryptocurrency.findUnique({
      where: { id: cryptocurrencyId },
      select: { price: true, name: true, symbol: true },
    });

    if (!cryptocurrency) {
      return res.status(404).json({
        error: "Cryptocurrency not found",
        details: "The specified cryptocurrency does not exist.",
      });
    }

    // Fetch the sender's current cryptocurrency balance
    const senderCryptoBalance = await prisma.walletCryptocurrency.findUnique({
      where: {
        walletId_cryptocurrencyId: {
          walletId: senderWallet.id,
          cryptocurrencyId,
        },
      },
    });

    if (!senderCryptoBalance || senderCryptoBalance.amount < amount) {
      return res.status(400).json({
        error: "Insufficient cryptocurrency",
        details: "You don't have enough cryptocurrency to transfer.",
      });
    }

    const transactionDate = new Date(); // Get current timestamp

    // Create the transfer transaction for sender (subtract from sender)
    await prisma.transaction.create({
      data: {
        transactionType: "transfer",
        amount: -amount, // Negative amount for sending
        price: cryptocurrency.price,
        wallet: { connect: { id: senderWallet.id } },
        cryptocurrency: { connect: { id: cryptocurrencyId } },
        user: { connect: { id: senderUserId } },
        currency,
        description: `Transfer out to user ${receiverUserId}`,
        createdAt: transactionDate, // Include createdAt timestamp
      },
    });

    // Create the transfer transaction for receiver (add to receiver)
    await prisma.transaction.create({
      data: {
        transactionType: "transfer",
        amount, // Positive amount for receiving
        price: cryptocurrency.price,
        wallet: { connect: { id: receiverWallet.id } },
        cryptocurrency: { connect: { id: cryptocurrencyId } },
        user: { connect: { id: receiverUserId } },
        currency,
        description: `Transfer in from user ${senderUserId}`,
        createdAt: transactionDate, // Ensure same timestamp for both transactions
      },
    });

    // Update the sender's wallet balance
    await prisma.walletCryptocurrency.update({
      where: {
        walletId_cryptocurrencyId: {
          walletId: senderWallet.id,
          cryptocurrencyId,
        },
      },
      data: {
        amount: senderCryptoBalance.amount - amount,
      },
    });

    // Update the receiver's wallet balance
    let receiverCryptoBalance = await prisma.walletCryptocurrency.findUnique({
      where: {
        walletId_cryptocurrencyId: {
          walletId: receiverWallet.id,
          cryptocurrencyId,
        },
      },
    });

    if (!receiverCryptoBalance) {
      // If the receiver doesn't already have this cryptocurrency, create an entry
      await prisma.walletCryptocurrency.create({
        data: {
          walletId: receiverWallet.id,
          cryptocurrencyId,
          amount,
        },
      });
    } else {
      // Otherwise, update the existing amount
      await prisma.walletCryptocurrency.update({
        where: {
          walletId_cryptocurrencyId: {
            walletId: receiverWallet.id,
            cryptocurrencyId,
          },
        },
        data: {
          amount: receiverCryptoBalance.amount + amount,
        },
      });
    }

    res.status(200).json({
      message: "Cryptocurrency transferred successfully",
      senderWallet: senderWallet.id,
      receiverWallet: receiverWallet.id,
      cryptocurrency: cryptocurrency.name,
      amount,
      currency,
      createdAt: transactionDate, // Include the transaction timestamp in the response
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to transfer cryptocurrency",
      details: error.message,
    });
  }
}


//fetch remaining cryptocurrencies
async function getRemainingCryptocurrenciesByUserId(req, res) {
  const userId = parseInt(req.params.id);

  try {
    const wallets = await prisma.wallet.findMany({
      where: { userId: userId },
      include: {
        transactions: {
          where: {
            OR: [{ transactionType: "buy" }, { transactionType: "sell" }, { transactionType: "transfer" }],
          },
          include: {
            cryptocurrency: true, 
          },
        },
      },
    });

    if (wallets.length === 0) {
      return res.status(404).json({
        error: "Wallet not found",
        details: `No wallet found for user with ID ${userId}`,
      });
    }

    const remainingCryptocurrenciesMap = {};

    wallets.forEach((wallet) => {
      wallet.transactions.forEach((transaction) => {
        const cryptoKey = transaction.cryptocurrency.symbol; // usecryptocurrency's symbol as key

        // check cryptocurrency
        if (!remainingCryptocurrenciesMap[cryptoKey]) {
          remainingCryptocurrenciesMap[cryptoKey] = {
            cryptocurrencyName: transaction.cryptocurrency.name,
            cryptocurrencySymbol: transaction.cryptocurrency.symbol,
            remainingAmount: 0,
          };
        }

        // buy transaction
        if (transaction.transactionType === "buy") {
          remainingCryptocurrenciesMap[cryptoKey].remainingAmount +=
            transaction.amount;
        }

        // sell transaction
        if (transaction.transactionType === "sell") {
          remainingCryptocurrenciesMap[cryptoKey].remainingAmount -=
            transaction.amount;
        }

        // transfer transaction
        if (transaction.transactionType === "transfer") {
          // Transfer out: Subtract from the sender's wallet
          if (transaction.amount < 0) {
            remainingCryptocurrenciesMap[cryptoKey].remainingAmount += transaction.amount;
          }
          // Transfer in: Add to the receiver's wallet
          else {
            remainingCryptocurrenciesMap[cryptoKey].remainingAmount += transaction.amount;
          }
        }
      });
    });

    // convert remainingCryptocurrenciesMap to array
    const remainingCryptocurrencies = Object.values(
      remainingCryptocurrenciesMap
    );

    res.status(200).json({
      message: "Remaining cryptocurrencies fetched successfully",
      remainingCryptocurrencies,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch remaining cryptocurrencies",
      details: error.message,
    });
  }
}


module.exports = {
  getUserTransactions,
  getUserTransactionsById,
  buyCrypto,
  sellCrypto,
  transferCrypto,
  getRemainingCryptocurrenciesByUserId,
};
