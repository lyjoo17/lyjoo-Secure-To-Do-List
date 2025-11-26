const asyncHandler = require('../utils/asyncHandler')
const { getUserProfile, updateUserProfile } = require('../services/userService')

const getMe = asyncHandler(async (req, res) => {
  const userId = req.user.userId

  const user = await getUserProfile(userId)

  res.status(200).json({
    success: true,
    data: user
  })
})

const updateMe = asyncHandler(async (req, res) => {
  const userId = req.user.userId
  const userData = req.body

  const user = await updateUserProfile(userId, userData)

  res.status(200).json({
    success: true,
    message: 'User profile updated successfully',
    data: user
  })
})

module.exports = {
  getMe,
  updateMe
}
