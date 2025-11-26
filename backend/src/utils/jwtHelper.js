const jwt = require('jsonwebtoken')

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1d'
  })
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

module.exports = {
  generateAccessToken,
  verifyToken
}
