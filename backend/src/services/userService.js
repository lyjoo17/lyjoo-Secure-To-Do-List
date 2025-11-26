const { findUserById, updateUser } = require('../repositories/userRepository')
const { hashPassword } = require('../utils/passwordHelper')

const getUserProfile = async (userId) => {
  const user = await findUserById(userId)

  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}

const updateUserProfile = async (userId, userData) => {
  const user = await findUserById(userId)

  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  if (userData.password) {
    userData.password = await hashPassword(userData.password)
  }

  const updatedUser = await updateUser(userId, userData)
  const { password, ...userWithoutPassword } = updatedUser
  return userWithoutPassword
}

module.exports = {
  getUserProfile,
  updateUserProfile
}
