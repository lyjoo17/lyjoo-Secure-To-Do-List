const { createUser, findUserByEmail } = require('../repositories/userRepository')
const { hashPassword, comparePassword } = require('../utils/passwordHelper')
const { generateAccessToken } = require('../utils/jwtHelper')

const register = async (userData) => {
  const existingUser = await findUserByEmail(userData.email)

  if (existingUser) {
    const error = new Error('Email already exists')
    error.statusCode = 409
    throw error
  }

  const hashedPassword = await hashPassword(userData.password)

  const user = await createUser({
    ...userData,
    password: hashedPassword
  })

  const { password, ...userWithoutPassword } = user

  const token = generateAccessToken({
    userId: user.userId,
    email: user.email,
    role: user.role
  })

  return {
    user: userWithoutPassword,
    accessToken: token
  }
}

const login = async (email, password) => {
  const user = await findUserByEmail(email)

  if (!user) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  const isPasswordValid = await comparePassword(password, user.password)

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  const { password: _, ...userWithoutPassword } = user

  const token = generateAccessToken({
    userId: user.userId,
    email: user.email,
    role: user.role
  })

  return {
    user: userWithoutPassword,
    accessToken: token
  }
}

module.exports = {
  register,
  login
}
