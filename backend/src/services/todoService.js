const {
  createTodo,
  findTodosByUserId,
  findTodoById,
  updateTodo,
  deleteTodo,
  restoreTodo,
  deletePermanently
} = require('../repositories/todoRepository')

const getTodos = async (userId, filters) => {
  return await findTodosByUserId(userId, filters)
}

const getTodoById = async (todoId, userId) => {
  const todo = await findTodoById(todoId)

  if (!todo) {
    const error = new Error('Todo not found')
    error.statusCode = 404
    throw error
  }

  if (todo.userId !== userId) {
    const error = new Error('Unauthorized access to this todo')
    error.statusCode = 403
    throw error
  }

  return todo
}

const createNewTodo = async (userId, todoData) => {
  if (todoData.dueDate && todoData.startDate) {
    if (new Date(todoData.dueDate) < new Date(todoData.startDate)) {
      const error = new Error('Due date must be after start date')
      error.statusCode = 400
      throw error
    }
  }

  const formattedData = {
    ...todoData,
    startDate: todoData.startDate ? new Date(todoData.startDate) : undefined,
    dueDate: todoData.dueDate ? new Date(todoData.dueDate) : undefined,
    userId
  }

  return await createTodo(formattedData)
}

const updateExistingTodo = async (todoId, userId, todoData) => {
  const todo = await getTodoById(todoId, userId)

  if (todoData.dueDate && todoData.startDate) {
    if (new Date(todoData.dueDate) < new Date(todoData.startDate)) {
      const error = new Error('Due date must be after start date')
      error.statusCode = 400
      throw error
    }
  }

  const formattedData = {
    ...todoData,
    startDate: todoData.startDate ? new Date(todoData.startDate) : undefined,
    dueDate: todoData.dueDate ? new Date(todoData.dueDate) : undefined
  }

  // Remove undefined fields to avoid overwriting with null if not intended
  if (!formattedData.startDate) delete formattedData.startDate
  if (!formattedData.dueDate) delete formattedData.dueDate

  // Update status based on isCompleted if provided
  if (formattedData.isCompleted !== undefined) {
    formattedData.status = formattedData.isCompleted ? 'COMPLETED' : 'ACTIVE'
  }

  return await updateTodo(todoId, formattedData)
}

const deleteTodoSoft = async (todoId, userId) => {
  await getTodoById(todoId, userId)
  return await deleteTodo(todoId)
}

const restoreDeletedTodo = async (todoId, userId) => {
  await getTodoById(todoId, userId)
  return await restoreTodo(todoId)
}

const deleteTodoPermanently = async (todoId, userId) => {
  await getTodoById(todoId, userId)
  return await deletePermanently(todoId)
}

const toggleTodoComplete = async (todoId, userId) => {
  const todo = await getTodoById(todoId, userId)

  const updatedData = {
    isCompleted: !todo.isCompleted,
    status: !todo.isCompleted ? 'COMPLETED' : 'ACTIVE'
  }

  return await updateTodo(todoId, updatedData)
}

module.exports = {
  getTodos,
  getTodoById,
  createNewTodo,
  updateExistingTodo,
  toggleTodoComplete,
  deleteTodoSoft,
  restoreDeletedTodo,
  deleteTodoPermanently
}
