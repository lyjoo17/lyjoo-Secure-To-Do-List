require('dotenv').config()
const prisma = require('./src/config/database')
const {
  executeTransaction,
  handlePrismaError,
  paginate,
  softDeleteFilter,
  batchUpdate,
  recordExists
} = require('./src/utils/dbHelpers')

async function testDbHelpers() {
  try {
    console.log('=== 데이터베이스 헬퍼 함수 테스트 ===\n')

    // 1. recordExists 테스트
    console.log('1. recordExists 테스트')
    const userExists = await recordExists(prisma.user, {
      email: 'admin@example.com'
    })
    console.log(`✓ 관리자 계정 존재 여부: ${userExists}`)

    const nonExistentUser = await recordExists(prisma.user, {
      email: 'nonexistent@example.com'
    })
    console.log(`✓ 존재하지 않는 사용자: ${nonExistentUser}\n`)

    // 2. paginate 테스트
    console.log('2. paginate 테스트')
    const paginatedTodos = await paginate(prisma.todo, {
      page: 1,
      limit: 5,
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true } } }
    })
    console.log(`✓ 페이지: ${paginatedTodos.pagination.page}/${paginatedTodos.pagination.totalPages}`)
    console.log(`✓ 총 ${paginatedTodos.pagination.total}개 중 ${paginatedTodos.data.length}개 조회`)
    console.log(`✓ 다음 페이지 존재: ${paginatedTodos.pagination.hasNextPage}`)
    console.log(`✓ 이전 페이지 존재: ${paginatedTodos.pagination.hasPreviousPage}\n`)

    // 3. softDeleteFilter 테스트
    console.log('3. softDeleteFilter 테스트')
    const activeFilter = softDeleteFilter({ status: 'ACTIVE' })
    console.log(`✓ 활성 필터 (삭제 제외):`, activeFilter)

    const allFilter = softDeleteFilter({ status: 'ACTIVE' }, true)
    console.log(`✓ 전체 필터 (삭제 포함):`, allFilter, '\n')

    // 4. executeTransaction 테스트
    console.log('4. executeTransaction 테스트')
    const user = await prisma.user.findFirst()

    const transactionResult = await executeTransaction(async (tx) => {
      const newTodo = await tx.todo.create({
        data: {
          userId: user.userId,
          title: '트랜잭션 테스트 할일',
          content: 'executeTransaction 함수 테스트',
          status: 'ACTIVE'
        }
      })

      const todoCount = await tx.todo.count({
        where: { userId: user.userId }
      })

      return { newTodo, todoCount }
    })

    console.log(`✓ 트랜잭션으로 할일 생성: ${transactionResult.newTodo.title}`)
    console.log(`✓ 해당 사용자의 총 할일 개수: ${transactionResult.todoCount}\n`)

    // 5. handlePrismaError 테스트
    console.log('5. handlePrismaError 테스트')
    try {
      await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: 'test',
          username: 'Test'
        }
      })
    } catch (error) {
      const handledError = handlePrismaError(error)
      console.log(`✓ 중복 이메일 에러 처리: ${handledError.message}`)
      console.log(`✓ 에러 상태 코드: ${handledError.statusCode}\n`)
    }

    // 6. batchUpdate 테스트 (주의: 실제 데이터 수정됨)
    console.log('6. batchUpdate 테스트 (읽기 전용)')
    const todosToUpdate = await prisma.todo.findMany({
      where: {
        title: { contains: '트랜잭션 테스트' }
      },
      take: 2
    })

    if (todosToUpdate.length > 0) {
      console.log(`✓ 업데이트 가능한 할일: ${todosToUpdate.length}개`)
      console.log(`  (실제 업데이트는 스킵)\n`)
    }

    // 정리
    console.log('7. 테스트 데이터 정리')
    await prisma.todo.deleteMany({
      where: {
        title: { contains: '트랜잭션 테스트' }
      }
    })
    console.log('✓ 테스트 할일 삭제 완료\n')

    console.log('=== 모든 헬퍼 함수 테스트 완료 ===')

  } catch (error) {
    console.error('\n✗ 테스트 실패:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

testDbHelpers()
