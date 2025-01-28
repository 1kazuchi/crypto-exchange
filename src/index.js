const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");

dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
