
# Cryptocurrency Exchange System

This is a cryptocurrency exchange system built using Node.js, Prisma, and MySQL. The system allows users to buy, sell, transfer, and track cryptocurrencies in their wallets.

## Features

- **User Authentication**: Secure login and user management.
- **Cryptocurrency Transactions**: Buy, sell, and transfer cryptocurrencies.
- **Wallet Management**: Track the balance of cryptocurrencies in user wallets.
- **Transaction History**: Record and display transaction details.

## Technologies Used

- **Node.js**: Backend runtime environment.
- **Prisma**: ORM to interact with the MySQL database.
- **MySQL**: Stores user, wallet, and transaction data.
- **Express.js**: Framework for building RESTful APIs.
- **JWT Authentication**: For securing API routes.

## API Endpoints

### Authentication

- **POST /api/auth/login**: Login with username and password to receive a JWT token.
- **POST /api/auth/register**: Register a new user.

### Wallet

- **GET /api/wallet/**: Get all wallets.
- **GET /api/wallet/:id**: Get user's wallet by id.
- **POST /api/wallet/deposit**: Deposit money into the user's wallet.
- **POST /api/wallet/withdraw**: Withdraw money into the user's wallet.

### Cryptocurrency
- **GET /api/cryptocurrencies/**: Get all cryptocurrency.

### Transactions

- **GET /api/transactions**: Get all transactions.
- **GET /api/transactions/:id**: Get user's transactions by id.
- **GET /api/remaining/:id**: Get user's remaining cryptocurrency by id.
- **POST /api/transactions/buy**: Create a buy transaction.
- **POST /api/transactions/sell**: Create a sell transaction.
- **POST /api/transactions/transfer**: Create a transfer transaction between wallets.

## Setup

### Prerequisites

- Node.js
- Express.js
- MySQL
- Prisma
- Exios

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/crypto-exchange.git
   cd crypto-exchange

2. Install dependencies:

    ```bash 
    npm install

3. Configure the database:

-  Set up your database credentials in the .env file.

4. Run migrations:
    ```bash
    npx prisma migrate dev
    node prisma/seed.js

5. Start the server:

    ```bash 
    npm run dev

## Environment Variables

Create a .env file in the root directory with the following content:

    DATABASE_URL="mysql://username:password@localhost:3306/crypto_exchange"
    SECRET_KEY="your-secret-key"
    EXCHANGE_API_URL="https://api.exchangerate-api.com/v4/latest/USD"
