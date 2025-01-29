const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// get all list Cryptocurrency
async function getCryptocurrencies(req, res) {
  try {
    const cryptocurrencies = await prisma.cryptocurrency.findMany();
    res.status(200).json({ cryptocurrencies });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cryptocurrencies", details: error.message });
  }
}

module.exports = { getCryptocurrencies};