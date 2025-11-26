const prisma = require('../config/database')
const { Prisma } = require('@prisma/client')

/**
 * 트랜잭션 실행 헬퍼 함수
 * 여러 데이터베이스 작업을 원자적으로 실행합니다.
 *
 * @param {Function} callback - 트랜잭션 내에서 실행할 함수
 * @returns {Promise<any>} 트랜잭션 결과
 *
 * @example
 * const result = await executeTransaction(async (tx) => {
 *   const user = await tx.user.create({ data: userData })
 *   const todo = await tx.todo.create({ data: { ...todoData, userId: user.userId } })
 *   return { user, todo }
 * })
 */
const executeTransaction = async (callback) => {
  try {
    return await prisma.$transaction(callback)
  } catch (error) {
    console.error('Transaction failed:', error)
    throw handlePrismaError(error)
  }
}

/**
 * Prisma 에러를 처리하고 의미있는 에러 메시지로 변환합니다.
 *
 * @param {Error} error - Prisma 에러 객체
 * @returns {Error} 처리된 에러 객체
 *
 * @example
 * try {
 *   await prisma.user.create({ data })
 * } catch (error) {
 *   throw handlePrismaError(error)
 * }
 */
const handlePrismaError = (error) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        const customError = new Error('중복된 데이터가 존재합니다.')
        customError.statusCode = 409
        customError.field = error.meta?.target
        return customError

      case 'P2025':
        const notFoundError = new Error('요청한 데이터를 찾을 수 없습니다.')
        notFoundError.statusCode = 404
        return notFoundError

      case 'P2003':
        const foreignKeyError = new Error('참조 무결성 제약 조건 위반입니다.')
        foreignKeyError.statusCode = 400
        return foreignKeyError

      case 'P2014':
        const relationError = new Error('관계된 데이터가 이미 존재합니다.')
        relationError.statusCode = 400
        return relationError

      case 'P2000':
        const valueTooLongError = new Error('입력 값이 너무 깁니다.')
        valueTooLongError.statusCode = 400
        return valueTooLongError

      case 'P2001':
        const recordNotFoundError = new Error('레코드를 찾을 수 없습니다.')
        recordNotFoundError.statusCode = 404
        return recordNotFoundError

      default:
        const genericError = new Error('데이터베이스 오류가 발생했습니다.')
        genericError.statusCode = 500
        genericError.originalCode = error.code
        return genericError
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    const validationError = new Error('데이터 검증에 실패했습니다.')
    validationError.statusCode = 400
    return validationError
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    const initError = new Error('데이터베이스 연결에 실패했습니다.')
    initError.statusCode = 503
    return initError
  }

  return error
}

/**
 * 페이지네이션 헬퍼 함수
 * 데이터를 페이지 단위로 조회합니다.
 *
 * @param {Object} model - Prisma 모델 (예: prisma.user)
 * @param {Object} options - 페이지네이션 옵션
 * @param {number} [options.page=1] - 현재 페이지 번호 (1부터 시작)
 * @param {number} [options.limit=10] - 페이지당 항목 수
 * @param {Object} [options.where={}] - 필터 조건
 * @param {Object} [options.orderBy={}] - 정렬 조건
 * @param {Object} [options.include={}] - 포함할 관계 데이터
 * @returns {Promise<Object>} 페이지네이션 결과
 *
 * @example
 * const result = await paginate(prisma.todo, {
 *   page: 2,
 *   limit: 20,
 *   where: { userId: 'user-id', status: 'ACTIVE' },
 *   orderBy: { createdAt: 'desc' },
 *   include: { user: true }
 * })
 * // result = { data: [...], pagination: { page: 2, limit: 20, total: 100, totalPages: 5 } }
 */
const paginate = async (model, options = {}) => {
  const {
    page = 1,
    limit = 10,
    where = {},
    orderBy = {},
    include = {},
    select = undefined
  } = options

  const pageNumber = Math.max(1, parseInt(page))
  const pageSize = Math.max(1, Math.min(100, parseInt(limit)))
  const skip = (pageNumber - 1) * pageSize

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      orderBy,
      include,
      select,
      skip,
      take: pageSize
    }),
    model.count({ where })
  ])

  const totalPages = Math.ceil(total / pageSize)

  return {
    data,
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

/**
 * 소프트 딜리트 필터 헬퍼
 * deletedAt이 null인 레코드만 조회하는 where 조건을 생성합니다.
 *
 * @param {Object} where - 기존 where 조건
 * @param {boolean} [includeDeleted=false] - 삭제된 항목 포함 여부
 * @returns {Object} 소프트 딜리트 필터가 적용된 where 조건
 *
 * @example
 * const where = softDeleteFilter({ userId: 'user-id' })
 * // where = { userId: 'user-id', deletedAt: null }
 */
const softDeleteFilter = (where = {}, includeDeleted = false) => {
  if (includeDeleted) {
    return where
  }

  return {
    ...where,
    deletedAt: null
  }
}

/**
 * 일괄 업데이트 헬퍼
 * 여러 레코드를 한 번에 업데이트합니다.
 *
 * @param {Object} model - Prisma 모델
 * @param {Array<Object>} updates - 업데이트할 데이터 배열 (각 객체는 where와 data 포함)
 * @returns {Promise<Array>} 업데이트된 레코드 배열
 *
 * @example
 * const updates = [
 *   { where: { todoId: 'id1' }, data: { isCompleted: true } },
 *   { where: { todoId: 'id2' }, data: { isCompleted: true } }
 * ]
 * const results = await batchUpdate(prisma.todo, updates)
 */
const batchUpdate = async (model, updates) => {
  return await executeTransaction(async (tx) => {
    const results = []
    for (const { where, data } of updates) {
      const result = await tx[model.name.toLowerCase()].update({
        where,
        data
      })
      results.push(result)
    }
    return results
  })
}

/**
 * 존재 여부 확인 헬퍼
 * 특정 조건을 만족하는 레코드가 존재하는지 확인합니다.
 *
 * @param {Object} model - Prisma 모델
 * @param {Object} where - 검색 조건
 * @returns {Promise<boolean>} 존재 여부
 *
 * @example
 * const exists = await recordExists(prisma.user, { email: 'test@example.com' })
 */
const recordExists = async (model, where) => {
  const count = await model.count({ where })
  return count > 0
}

module.exports = {
  executeTransaction,
  handlePrismaError,
  paginate,
  softDeleteFilter,
  batchUpdate,
  recordExists
}
