const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

async function createUser(data) {
  if (!data) {
    throw new Error("Request body is missing");
  }

  const { email, password, name } = data;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  return user;
}

module.exports = {
  createUser,
};
