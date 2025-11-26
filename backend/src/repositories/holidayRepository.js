const prisma = require('../config/database')

const createHoliday = async (holidayData) => {
  return await prisma.holiday.create({
    data: holidayData
  })
}

const findHolidays = async (startDate, endDate) => {
  const where = {}

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    }
  } else if (startDate) {
    where.date = {
      gte: new Date(startDate)
    }
  }

  return await prisma.holiday.findMany({
    where,
    orderBy: { date: 'asc' }
  })
}

const updateHoliday = async (holidayId, holidayData) => {
  return await prisma.holiday.update({
    where: { holidayId },
    data: holidayData
  })
}

const upsertHoliday = async (date, holidayData) => {
  return await prisma.holiday.upsert({
    where: {
      holidayId: holidayData.holidayId || 'new-holiday'
    },
    update: holidayData,
    create: {
      ...holidayData,
      date: new Date(date)
    }
  })
}

module.exports = {
  createHoliday,
  findHolidays,
  updateHoliday,
  upsertHoliday
}
