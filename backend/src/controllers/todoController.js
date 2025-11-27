const asyncHandler = require('../utils/asyncHandler')
const {
  getTodos,
  getTodoById,
  createNewTodo,
  updateExistingTodo,
  toggleTodoComplete,
  deleteTodoSoft,
  restoreDeletedTodo,
  deleteTodoPermanently
} = require('../services/todoService')

const getAllTodos = asyncHandler(async (req, res) => {
  const userId = req.user.userId
  const filters = {
    status: req.query.status,
    search: req.query.search,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder
  }

  const todos = await getTodos(userId, filters)

  res.status(200).json({
    success: true,
    data: todos
  })
})

const getSingleTodo = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user.userId

  const todo = await getTodoById(id, userId)

  res.status(200).json({
    success: true,
    data: todo
  })
})

const createTodo = asyncHandler(async (req, res) => {
  const userId = req.user.userId
  const todoData = req.body

  const todo = await createNewTodo(userId, todoData)

  res.status(201).json({
    success: true,
    message: 'Todo created successfully',
    data: todo
  })
})

const updateTodo = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user.userId
  const todoData = req.body

  const todo = await updateExistingTodo(id, userId, todoData)

  res.status(200).json({
    success: true,
    message: 'Todo updated successfully',
    data: todo
  })
})

const deleteTodo = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user.userId

  const todo = await deleteTodoSoft(id, userId)

  res.status(200).json({
    success: true,
    message: 'Todo moved to trash',
    data: todo
  })
})

const restoreTodo = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user.userId

  const todo = await restoreDeletedTodo(id, userId)

  res.status(200).json({
    success: true,
    message: 'Todo restored successfully',
    data: todo
  })
})

const permanentDelete = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user.userId

  await deleteTodoPermanently(id, userId)

  res.status(200).json({
    success: true,
    message: 'Todo permanently deleted'
  })
})

const toggleComplete = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user.userId

  const todo = await toggleTodoComplete(id, userId)

  res.status(200).json({
    success: true,
    message: 'Todo completion status toggled',
    data: todo
  })
})

module.exports = {
  getAllTodos,
  getSingleTodo,
  createTodo,
  updateTodo,
  toggleComplete,
  deleteTodo,
  restoreTodo,
  permanentDelete
}
