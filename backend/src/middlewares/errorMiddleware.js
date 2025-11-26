const { Prisma } = require('@prisma/client')

const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err)

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Duplicate entry. Resource already exists.'
      })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      })
    }
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    })
  }

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

module.exports = errorMiddleware
