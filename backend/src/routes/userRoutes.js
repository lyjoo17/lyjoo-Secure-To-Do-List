const express = require('express')
const router = express.Router()
const { getMe, updateMe } = require('../controllers/userController')
const { authMiddleware } = require('../middlewares/authMiddleware')

router.use(authMiddleware)

router.get('/me', getMe)
router.patch('/me', updateMe)

module.exports = router
