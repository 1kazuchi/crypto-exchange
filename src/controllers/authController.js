const { PrismaClient } = require("@prisma/client");
const { hashPassword, verifyPassword } = require("../utils/bcryptHelper");
const { generateToken } = require("../utils/jwtHelper");

const prisma = new PrismaClient();

async function register(req, res) {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to register user", details: error.message });
  }
}

async function login(req, res) {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = generateToken({ id: user.id, username: user.username });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: "Failed to login", details: error.message });
  }
}

module.exports = { register, login };
