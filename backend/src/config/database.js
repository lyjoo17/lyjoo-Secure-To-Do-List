const { PrismaClient } = require('@prisma/client')

let prisma

const logLevels = {
  development: ['query', 'info', 'warn', 'error'],
  production: ['warn', 'error'],
  test: ['error']
}

const getLogLevel = () => {
  const env = process.env.NODE_ENV || 'development'
  return logLevels[env] || logLevels.development
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: getLogLevel(),
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: getLogLevel(),
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  }
  prisma = global.prisma
}

if (require.main === module) {
  prisma.$connect()
    .then(() => {
      console.log('Database connected successfully')
    })
    .catch((error) => {
      console.error('Database connection failed:', error)
      process.exit(1)
    })
}

module.exports = prisma
