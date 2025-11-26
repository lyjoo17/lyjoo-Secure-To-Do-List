const express = require('express')
const router = express.Router()
const { getAllHolidays, syncHolidaysData } = require('../controllers/holidayController')
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware')

router.get('/', authMiddleware, getAllHolidays)
router.post('/sync', authMiddleware, adminMiddleware, syncHolidaysData)

module.exports = router
