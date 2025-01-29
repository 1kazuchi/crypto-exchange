const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const cryptocurrencies = [
    { name: "Bitcoin", symbol: "BTC", price: 25000.0 },
    { name: "Ethereum", symbol: "ETH", price: 1700.0 },
    { name: "Ripple", symbol: "XRP", price: 0.5 },
    { name: "Dogecoin", symbol: "DOGE", price: 0.07 },
  ];

  for (const crypto of cryptocurrencies) {
    await prisma.cryptocurrency.upsert({
      where: { symbol: crypto.symbol },
      update: { price: crypto.price },
      create: crypto,
    });
  }

  console.log("Seeded cryptocurrencies!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
