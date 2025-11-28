const { Pool } = require('pg')

let pool

const createPool = () => {
  if (pool) {
    return pool
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

  pool.on('error', (err) => {
    console.error('데이터베이스 풀 오류:', err)
  })

  return pool
}

const getPool = () => {
  if (!pool) {
    return createPool()
  }
  return pool
}

const query = async (text, params) => {
  const client = await getPool().connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

const getClient = async () => {
  return await getPool().connect()
}

const closePool = async () => {
  if (pool) {
    await pool.end()
    pool = null
  }
}

if (require.main === module) {
  getPool()
    .connect()
    .then((client) => {
      console.log('데이터베이스 연결 성공')
      client.release()
    })
    .catch((error) => {
      console.error('데이터베이스 연결 실패:', error)
      process.exit(1)
    })
}

module.exports = {
  query,
  getClient,
  getPool,
  closePool
}
