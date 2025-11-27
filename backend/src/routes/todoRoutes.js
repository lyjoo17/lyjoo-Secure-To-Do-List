const express = require('express')
const router = express.Router()
const {
  getAllTodos,
  getSingleTodo,
  createTodo,
  updateTodo,
  toggleComplete,
  deleteTodo,
  restoreTodo,
  permanentDelete
} = require('../controllers/todoController')
const { authMiddleware } = require('../middlewares/authMiddleware')
const { todoValidation, updateTodoValidation } = require('../middlewares/validationMiddleware')

router.use(authMiddleware)

router.get('/', getAllTodos)
router.post('/', todoValidation, createTodo)
router.get('/:id', getSingleTodo)
router.put('/:id', updateTodoValidation, updateTodo)
router.patch('/:id/toggle', toggleComplete)
router.delete('/:id', deleteTodo)
router.patch('/:id/restore', restoreTodo)
router.delete('/:id/permanent', permanentDelete)

module.exports = router
