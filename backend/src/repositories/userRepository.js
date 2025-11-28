const db = require('../config/database')

const createUser = async (userData) => {
  const { username, email, password, role = 'USER' } = userData
  const query = `
    INSERT INTO users (username, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING user_id, username, email, role, created_at, updated_at
  `
  const result = await db.query(query, [username, email, password, role])
  const row = result.rows[0]
  return {
    userId: row.user_id,
    username: row.username,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

const findUserByEmail = async (email) => {
  const query = `
    SELECT user_id, username, email, password, role, created_at, updated_at
    FROM users
    WHERE email = $1
  `
  const result = await db.query(query, [email])
  if (!result.rows[0]) return null

  const row = result.rows[0]
  return {
    userId: row.user_id,
    username: row.username,
    email: row.email,
    password: row.password,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

const findUserById = async (userId) => {
  const query = `
    SELECT user_id, username, email, role, created_at, updated_at
    FROM users
    WHERE user_id = $1
  `
  const result = await db.query(query, [userId])
  if (!result.rows[0]) return null

  const row = result.rows[0]
  return {
    userId: row.user_id,
    username: row.username,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

const updateUser = async (userId, userData) => {
  const fields = []
  const values = []
  let paramIndex = 1

  if (userData.username !== undefined) {
    fields.push(`username = $${paramIndex++}`)
    values.push(userData.username)
  }
  if (userData.email !== undefined) {
    fields.push(`email = $${paramIndex++}`)
    values.push(userData.email)
  }
  if (userData.password !== undefined) {
    fields.push(`password = $${paramIndex++}`)
    values.push(userData.password)
  }
  if (userData.role !== undefined) {
    fields.push(`role = $${paramIndex++}`)
    values.push(userData.role)
  }

  if (fields.length === 0) {
    return findUserById(userId)
  }

  values.push(userId)
  const query = `
    UPDATE users
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE user_id = $${paramIndex}
    RETURNING user_id, username, email, role, created_at, updated_at
  `
  const result = await db.query(query, values)
  const row = result.rows[0]
  return {
    userId: row.user_id,
    username: row.username,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser
}
