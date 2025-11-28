const db = require('../config/database')

const createHoliday = async (holidayData) => {
  const { title, date, description, isRecurring = true } = holidayData
  const query = `
    INSERT INTO holidays (title, date, description, is_recurring)
    VALUES ($1, $2, $3, $4)
    RETURNING holiday_id, title, date, description, is_recurring, created_at, updated_at
  `
  const result = await db.query(query, [title, new Date(date), description || null, isRecurring])
  return result.rows[0]
}

const findHolidays = async (startDate, endDate) => {
  let query = `
    SELECT holiday_id, title, date, description, is_recurring, created_at, updated_at
    FROM holidays
  `
  const params = []
  const conditions = []

  if (startDate && endDate) {
    conditions.push(`date >= $1 AND date <= $2`)
    params.push(new Date(startDate), new Date(endDate))
  } else if (startDate) {
    conditions.push(`date >= $1`)
    params.push(new Date(startDate))
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`
  }

  query += ` ORDER BY date ASC`

  const result = await db.query(query, params)
  return result.rows
}

const updateHoliday = async (holidayId, holidayData) => {
  const fields = []
  const values = []
  let paramIndex = 1

  if (holidayData.title !== undefined) {
    fields.push(`title = $${paramIndex++}`)
    values.push(holidayData.title)
  }
  if (holidayData.date !== undefined) {
    fields.push(`date = $${paramIndex++}`)
    values.push(new Date(holidayData.date))
  }
  if (holidayData.description !== undefined) {
    fields.push(`description = $${paramIndex++}`)
    values.push(holidayData.description)
  }
  if (holidayData.isRecurring !== undefined) {
    fields.push(`is_recurring = $${paramIndex++}`)
    values.push(holidayData.isRecurring)
  }

  if (fields.length === 0) {
    const query = `SELECT * FROM holidays WHERE holiday_id = $1`
    const result = await db.query(query, [holidayId])
    return result.rows[0]
  }

  values.push(holidayId)
  const query = `
    UPDATE holidays
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE holiday_id = $${paramIndex}
    RETURNING holiday_id, title, date, description, is_recurring, created_at, updated_at
  `
  const result = await db.query(query, values)
  return result.rows[0]
}

const upsertHoliday = async (date, holidayData) => {
  const existingQuery = `SELECT * FROM holidays WHERE date = $1 LIMIT 1`
  const existingResult = await db.query(existingQuery, [new Date(date)])

  if (existingResult.rows.length > 0) {
    return await updateHoliday(existingResult.rows[0].holiday_id, holidayData)
  } else {
    return await createHoliday({ ...holidayData, date })
  }
}

module.exports = {
  createHoliday,
  findHolidays,
  updateHoliday,
  upsertHoliday
}
