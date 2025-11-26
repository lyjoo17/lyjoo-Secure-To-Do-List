const asyncHandler = require('../utils/asyncHandler')
const { getHolidays, syncHolidays } = require('../services/holidayService')

const getAllHolidays = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query

  const holidays = await getHolidays(startDate, endDate)

  res.status(200).json({
    success: true,
    data: holidays
  })
})

const syncHolidaysData = asyncHandler(async (req, res) => {
  const holidaysData = req.body

  const result = await syncHolidays(holidaysData)

  res.status(201).json({
    success: true,
    message: 'Holidays synced successfully',
    data: result
  })
})

module.exports = {
  getAllHolidays,
  syncHolidaysData
}
