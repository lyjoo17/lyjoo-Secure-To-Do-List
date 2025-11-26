const { verifyToken } = require('../utils/jwtHelper')

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }
}

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next()
  } else {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    })
  }
}

module.exports = {
  authMiddleware,
  adminMiddleware
}
