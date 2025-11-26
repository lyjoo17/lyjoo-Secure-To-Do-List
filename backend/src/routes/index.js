const express = require('express')
const router = express.Router()

const authRoutes = require('./authRoutes')
const todoRoutes = require('./todoRoutes')
const holidayRoutes = require('./holidayRoutes')
const userRoutes = require('./userRoutes')

router.use('/auth', authRoutes)
router.use('/todos', todoRoutes)
router.use('/holidays', holidayRoutes)
router.use('/users', userRoutes)

module.exports = router
