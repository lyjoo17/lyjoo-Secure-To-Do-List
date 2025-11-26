require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const routes = require('./routes')
const errorMiddleware = require('./middlewares/errorMiddleware')

const app = express()

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
})

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again later.'
})

app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(limiter)

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' })
})

app.use('/api/auth', authLimiter)
app.use('/api', routes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

app.use(errorMiddleware)

module.exports = app
