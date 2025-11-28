const db = require('../config/database')

const createTodo = async (todoData) => {
  const { userId, title, content, startDate, dueDate, priority = 'MEDIUM' } = todoData
  const query = `
    INSERT INTO todos (user_id, title, content, start_date, due_date, priority)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING todo_id, user_id, title, content, start_date, due_date, status, priority, is_completed, created_at, updated_at
  `
  const result = await db.query(query, [userId, title, content, startDate || null, dueDate || null, priority])
  return result.rows[0]
}

const findTodosByUserId = async (userId, filters = {}) => {
  const { status, search, sortBy = 'created_at', sortOrder = 'desc' } = filters

  let query = `
    SELECT t.todo_id, t.user_id, t.title, t.content, t.start_date, t.due_date,
           t.status, t.priority, t.is_completed, t.created_at, t.updated_at, t.deleted_at,
           u.user_id as "user.userId", u.username as "user.username", u.email as "user.email"
    FROM todos t
    LEFT JOIN users u ON t.user_id = u.user_id
    WHERE t.user_id = $1
  `
  const params = [userId]
  let paramIndex = 2

  if (status) {
    query += ` AND t.status = $${paramIndex++}`
    params.push(status)
  }

  if (search) {
    query += ` AND (t.title ILIKE $${paramIndex} OR t.content ILIKE $${paramIndex})`
    params.push(`%${search}%`)
    paramIndex++
  }

  const validSortColumns = ['created_at', 'updated_at', 'due_date', 'title', 'priority']
  const validSortOrders = ['asc', 'desc']
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at'
  const order = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC'

  query += ` ORDER BY t.${sortColumn} ${order}`

  const result = await db.query(query, params)

  return result.rows.map(row => ({
    todoId: row.todo_id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    startDate: row.start_date,
    dueDate: row.due_date,
    status: row.status,
    priority: row.priority,
    isCompleted: row.is_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    user: {
      userId: row['user.userId'],
      username: row['user.username'],
      email: row['user.email']
    }
  }))
}

const findTodoById = async (todoId) => {
  const query = `
    SELECT t.todo_id, t.user_id, t.title, t.content, t.start_date, t.due_date,
           t.status, t.priority, t.is_completed, t.created_at, t.updated_at, t.deleted_at,
           u.user_id as "user.userId", u.username as "user.username", u.email as "user.email"
    FROM todos t
    LEFT JOIN users u ON t.user_id = u.user_id
    WHERE t.todo_id = $1
  `
  const result = await db.query(query, [todoId])

  if (result.rows.length === 0) {
    return null
  }

  const row = result.rows[0]
  return {
    todoId: row.todo_id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    startDate: row.start_date,
    dueDate: row.due_date,
    status: row.status,
    priority: row.priority,
    isCompleted: row.is_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    user: {
      userId: row['user.userId'],
      username: row['user.username'],
      email: row['user.email']
    }
  }
}

const updateTodo = async (todoId, todoData) => {
  const fields = []
  const values = []
  let paramIndex = 1

  if (todoData.title !== undefined) {
    fields.push(`title = $${paramIndex++}`)
    values.push(todoData.title)
  }
  if (todoData.content !== undefined) {
    fields.push(`content = $${paramIndex++}`)
    values.push(todoData.content)
  }
  if (todoData.startDate !== undefined) {
    fields.push(`start_date = $${paramIndex++}`)
    values.push(todoData.startDate)
  }
  if (todoData.dueDate !== undefined) {
    fields.push(`due_date = $${paramIndex++}`)
    values.push(todoData.dueDate)
  }
  if (todoData.status !== undefined) {
    fields.push(`status = $${paramIndex++}`)
    values.push(todoData.status)
  }
  if (todoData.priority !== undefined) {
    fields.push(`priority = $${paramIndex++}`)
    values.push(todoData.priority)
  }
  if (todoData.isCompleted !== undefined) {
    fields.push(`is_completed = $${paramIndex++}`)
    values.push(todoData.isCompleted)
  }

  if (fields.length === 0) {
    return findTodoById(todoId)
  }

  values.push(todoId)
  const query = `
    UPDATE todos
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE todo_id = $${paramIndex}
    RETURNING todo_id, user_id, title, content, start_date, due_date, status, priority, is_completed, created_at, updated_at, deleted_at
  `
  const result = await db.query(query, values)
  return result.rows[0]
}

const deleteTodo = async (todoId) => {
  const query = `
    UPDATE todos
    SET status = 'DELETED', deleted_at = NOW(), updated_at = NOW()
    WHERE todo_id = $1
    RETURNING todo_id, user_id, title, content, start_date, due_date, status, priority, is_completed, created_at, updated_at, deleted_at
  `
  const result = await db.query(query, [todoId])
  return result.rows[0]
}

const restoreTodo = async (todoId) => {
  const query = `
    UPDATE todos
    SET status = 'ACTIVE', deleted_at = NULL, updated_at = NOW()
    WHERE todo_id = $1
    RETURNING todo_id, user_id, title, content, start_date, due_date, status, priority, is_completed, created_at, updated_at, deleted_at
  `
  const result = await db.query(query, [todoId])
  return result.rows[0]
}

const deletePermanently = async (todoId) => {
  const query = `
    DELETE FROM todos
    WHERE todo_id = $1
    RETURNING todo_id
  `
  const result = await db.query(query, [todoId])
  return result.rows[0]
}

module.exports = {
  createTodo,
  findTodosByUserId,
  findTodoById,
  updateTodo,
  deleteTodo,
  restoreTodo,
  deletePermanently
}
