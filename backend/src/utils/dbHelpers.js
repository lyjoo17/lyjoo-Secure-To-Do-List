const db = require('../config/database')

const executeTransaction = async (callback) => {
  const client = await db.getClient()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('트랜잭션 실패:', error)
    throw handleDatabaseError(error)
  } finally {
    client.release()
  }
}

const handleDatabaseError = (error) => {
  if (error.code === '23505') {
    const customError = new Error('중복된 데이터가 존재합니다.')
    customError.statusCode = 409
    customError.field = error.constraint
    return customError
  }

  if (error.code === '23503') {
    const foreignKeyError = new Error('참조 무결성 제약 조건 위반입니다.')
    foreignKeyError.statusCode = 400
    return foreignKeyError
  }

  if (error.code === '23514') {
    const checkError = new Error('데이터 검증 제약 조건 위반입니다.')
    checkError.statusCode = 400
    return checkError
  }

  if (error.code === '22001') {
    const valueTooLongError = new Error('입력 값이 너무 깁니다.')
    valueTooLongError.statusCode = 400
    return valueTooLongError
  }

  if (error.code === '42P01') {
    const tableNotFoundError = new Error('테이블을 찾을 수 없습니다.')
    tableNotFoundError.statusCode = 500
    return tableNotFoundError
  }

  if (error.code === '08006' || error.code === '08003') {
    const connectionError = new Error('데이터베이스 연결에 실패했습니다.')
    connectionError.statusCode = 503
    return connectionError
  }

  const genericError = new Error('데이터베이스 오류가 발생했습니다.')
  genericError.statusCode = 500
  genericError.originalCode = error.code
  return genericError
}

const paginate = async (tableName, options = {}) => {
  const {
    page = 1,
    limit = 10,
    where = '',
    whereParams = [],
    orderBy = 'created_at',
    orderDirection = 'DESC',
    select = '*'
  } = options

  const pageNumber = Math.max(1, parseInt(page))
  const pageSize = Math.max(1, Math.min(100, parseInt(limit)))
  const offset = (pageNumber - 1) * pageSize

  const whereClause = where ? `WHERE ${where}` : ''

  const countQuery = `SELECT COUNT(*) FROM ${tableName} ${whereClause}`
  const countResult = await db.query(countQuery, whereParams)
  const total = parseInt(countResult.rows[0].count)

  const dataQuery = `
    SELECT ${select}
    FROM ${tableName}
    ${whereClause}
    ORDER BY ${orderBy} ${orderDirection}
    LIMIT $${whereParams.length + 1} OFFSET $${whereParams.length + 2}
  `
  const dataResult = await db.query(dataQuery, [...whereParams, pageSize, offset])

  const totalPages = Math.ceil(total / pageSize)

  return {
    data: dataResult.rows,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1
    }
  }
}

const softDeleteFilter = (where = '', includeDeleted = false) => {
  if (includeDeleted) {
    return where
  }

  const deletedFilter = 'deleted_at IS NULL'
  if (!where) {
    return deletedFilter
  }

  return `${where} AND ${deletedFilter}`
}

const batchUpdate = async (tableName, updates, idColumn) => {
  return await executeTransaction(async (client) => {
    const results = []
    for (const { id, data } of updates) {
      const fields = []
      const values = []
      let paramIndex = 1

      for (const [key, value] of Object.entries(data)) {
        fields.push(`${key} = $${paramIndex++}`)
        values.push(value)
      }

      values.push(id)
      const query = `
        UPDATE ${tableName}
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE ${idColumn} = $${paramIndex}
        RETURNING *
      `
      const result = await client.query(query, values)
      results.push(result.rows[0])
    }
    return results
  })
}

const recordExists = async (tableName, where, whereParams) => {
  const query = `SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE ${where}) as exists`
  const result = await db.query(query, whereParams)
  return result.rows[0].exists
}

module.exports = {
  executeTransaction,
  handleDatabaseError,
  paginate,
  softDeleteFilter,
  batchUpdate,
  recordExists
}
