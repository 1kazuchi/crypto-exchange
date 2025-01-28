const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // add coin 
  const cryptocurrencies = await prisma.cryptocurrency.createMany({
    data: [
      { name: "Bitcoin", symbol: "BTC" },
      { name: "Ethereum", symbol: "ETH" },
      { name: "Ripple", symbol: "XRP" },
      { name: "Dogecoin", symbol: "DOGE" },
    ],
  });

  console.log("Seeded cryptocurrencies:", cryptocurrencies);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
