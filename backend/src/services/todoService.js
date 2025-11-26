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

  return await createTodo({
    ...todoData,
    userId
  })
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

  return await updateTodo(todoId, todoData)
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

module.exports = {
  getTodos,
  getTodoById,
  createNewTodo,
  updateExistingTodo,
  deleteTodoSoft,
  restoreDeletedTodo,
  deleteTodoPermanently
}
