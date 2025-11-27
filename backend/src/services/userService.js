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

  // Security Fix: Whitelist allowed fields to prevent Privilege Escalation (Mass Assignment)
  // Only allow updating username and password
  const safeUpdates = {}
  
  if (userData.username) {
    safeUpdates.username = userData.username
  }

  if (userData.password) {
    safeUpdates.password = await hashPassword(userData.password)
  }

  // If there are no valid fields to update, return existing user data without database call
  if (Object.keys(safeUpdates).length === 0) {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  const updatedUser = await updateUser(userId, safeUpdates)
  const { password, ...userWithoutPassword } = updatedUser
  return userWithoutPassword
}

module.exports = {
  getUserProfile,
  updateUserProfile
}
