const { findHolidays, createHoliday } = require('../repositories/holidayRepository')

const getHolidays = async (startDate, endDate) => {
  return await findHolidays(startDate, endDate)
}

const syncHolidays = async (holidaysData) => {
  const results = []

  for (const holiday of holidaysData) {
    const formattedData = {
      ...holiday,
      date: new Date(holiday.date)
    }
    const created = await createHoliday(formattedData)
    results.push(created)
  }

  return results
}

module.exports = {
  getHolidays,
  syncHolidays
}
