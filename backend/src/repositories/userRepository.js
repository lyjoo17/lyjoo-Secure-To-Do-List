const prisma = require('../config/database')

const createUser = async (userData) => {
  return await prisma.user.create({
    data: userData
  })
}

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email }
  })
}

const findUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { userId }
  })
}

const updateUser = async (userId, userData) => {
  return await prisma.user.update({
    where: { userId },
    data: userData
  })
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser
}
