const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Cryptocurrencies
  const cryptocurrencies = await Promise.all(
    [
      { name: "Bitcoin", symbol: "BTC", price: 25000.0 },
      { name: "Ethereum", symbol: "ETH", price: 1700.0 },
      { name: "Ripple", symbol: "XRP", price: 0.5 },
      { name: "Dogecoin", symbol: "DOGE", price: 0.07 },
    ].map((crypto) =>
      prisma.cryptocurrency.upsert({
        where: { symbol: crypto.symbol },
        update: { price: crypto.price },
        create: crypto,
      })
    )
  );
  console.log("Seeded Cryptocurrencies!");

  // Seed Users
  const users = await Promise.all(
    [
      { username: "john_doe", email: "john@example.com", password: "hashedPassword1" },
      { username: "jane_doe", email: "jane@example.com", password: "hashedPassword2" },
    ].map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: { username: user.username },
        create: user,
      })
    )
  );
  console.log("Seeded Users!");

  // Seed Wallets
  const wallets = await Promise.all(
    [
      { userId: users[0].id, balance: 1000.0 },
      { userId: users[1].id, balance: 500.0 },
    ].map((wallet) => prisma.wallet.create({ data: wallet }))
  );
  console.log("Seeded Wallets!");

  // Seed WalletCryptocurrencies
  await Promise.all(
    [
      { walletId: wallets[0].id, cryptocurrencyId: cryptocurrencies[0].id, amount: 1.5 },
      { walletId: wallets[0].id, cryptocurrencyId: cryptocurrencies[1].id, amount: 2.0 },
      { walletId: wallets[1].id, cryptocurrencyId: cryptocurrencies[0].id, amount: 0.8 },
      { walletId: wallets[1].id, cryptocurrencyId: cryptocurrencies[3].id, amount: 10000.0 },
    ].map((wc) =>
      prisma.walletCryptocurrency.upsert({
        where: { walletId_cryptocurrencyId: { walletId: wc.walletId, cryptocurrencyId: wc.cryptocurrencyId } },
        update: { amount: wc.amount },
        create: wc,
      })
    )
  );
  console.log("Seeded Wallet Cryptocurrencies!");

  //Seed Transactions
  await Promise.all(
    [
      { userId: users[0].id, walletId: wallets[0].id, cryptoId: cryptocurrencies[0].id, amount: 0.5, price: 25000.0, transactionType: "buy", currency: "USD", description: "Bought BTC" },
      { userId: users[1].id, walletId: wallets[1].id, cryptoId: cryptocurrencies[3].id, amount: 5000.0, price: 0.07, transactionType: "buy", currency: "USD", description: "Bought DOGE" },
      { userId: users[0].id, walletId: wallets[0].id, cryptoId: cryptocurrencies[0].id, amount: -0.2, price: 26000.0, transactionType: "sell", currency: "USD", description: "Sold BTC" },
      { userId: users[1].id, walletId: wallets[1].id, cryptoId: cryptocurrencies[0].id, amount: 0.5, price: 25500.0, transactionType: "buy", currency: "USD", description: "Bought BTC" },
    ].map((transaction) => prisma.transaction.create({ data: transaction }))
  );
  console.log("Seeded Transactions!");

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
