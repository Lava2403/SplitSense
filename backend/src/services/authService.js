const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users = require("../data/users");

const JWT_SECRET = process.env.JWT_SECRET || "splitsense-dev-secret";

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((user) => user.email === normalizedEmail)) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: String(users.length + 1),
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  };

  users.push(newUser);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: sanitizeUser(newUser),
  };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((entry) => entry.email === normalizedEmail);

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: sanitizeUser(user),
  };
};

const getUserById = (id) => {
  const user = users.find((entry) => entry.id === id);
  return user ? sanitizeUser(user) : null;
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  JWT_SECRET,
};
