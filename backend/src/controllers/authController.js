const asyncHandler = require('../utils/asyncHandler')
const { register, login } = require('../services/authService')

const registerUser = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body

  const result = await register({ email, password, username })

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result
  })
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const result = await login(email, password)

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  })
})

const logoutUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  })
})

module.exports = {
  registerUser,
  loginUser,
  logoutUser
}
