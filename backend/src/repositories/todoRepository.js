const prisma = require('../config/database')

const createTodo = async (todoData) => {
  return await prisma.todo.create({
    data: todoData
  })
}

const findTodosByUserId = async (userId, filters = {}) => {
  const { status, search, sortBy = 'createdAt', sortOrder = 'desc' } = filters

  const where = { userId }

  if (status) {
    where.status = status
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } }
    ]
  }

  return await prisma.todo.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    include: {
      user: {
        select: {
          userId: true,
          username: true,
          email: true
        }
      }
    }
  })
}

const findTodoById = async (todoId) => {
  return await prisma.todo.findUnique({
    where: { todoId },
    include: {
      user: {
        select: {
          userId: true,
          username: true,
          email: true
        }
      }
    }
  })
}

const updateTodo = async (todoId, todoData) => {
  return await prisma.todo.update({
    where: { todoId },
    data: todoData
  })
}

const deleteTodo = async (todoId) => {
  return await prisma.todo.update({
    where: { todoId },
    data: {
      status: 'DELETED',
      deletedAt: new Date()
    }
  })
}

const restoreTodo = async (todoId) => {
  return await prisma.todo.update({
    where: { todoId },
    data: {
      status: 'ACTIVE',
      deletedAt: null
    }
  })
}

const deletePermanently = async (todoId) => {
  return await prisma.todo.delete({
    where: { todoId }
  })
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
