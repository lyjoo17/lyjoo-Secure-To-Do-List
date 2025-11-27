const express = require('express')
const router = express.Router()
const { getMe, updateMe } = require('../controllers/userController')
const { authMiddleware } = require('../middlewares/authMiddleware')
const { updateUserValidation } = require('../middlewares/validationMiddleware')

router.use(authMiddleware)

router.get('/me', getMe)
router.patch('/me', updateUserValidation, updateMe)

module.exports = router
