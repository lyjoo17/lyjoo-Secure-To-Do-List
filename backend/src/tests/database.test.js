require('dotenv').config()
const prisma = require('../config/database')
const { hashPassword } = require('../utils/passwordHelper')

let testUserId = null
let testTodoId = null

/**
 * 데이터베이스 연결 테스트
 */
async function testDatabaseConnection() {
  console.log('=== 1. 데이터베이스 연결 테스트 ===')

  try {
    await prisma.$connect()
    console.log('✓ 데이터베이스 연결 성공\n')
    return true
  } catch (error) {
    console.error('✗ 데이터베이스 연결 실패:', error.message)
    return false
  }
}

/**
 * User 생성 테스트
 */
async function testUserCreate() {
  console.log('=== 2. User 생성 테스트 ===')

  try {
    const hashedPassword = await hashPassword('test-password-123')

    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: hashedPassword,
        username: 'Test User',
        role: 'USER'
      }
    })

    testUserId = user.userId

    console.log('✓ User 생성 성공')
    console.log(`  - userId: ${user.userId}`)
    console.log(`  - email: ${user.email}`)
    console.log(`  - username: ${user.username}`)
    console.log(`  - role: ${user.role}\n`)

    return true
  } catch (error) {
    console.error('✗ User 생성 실패:', error.message)
    return false
  }
}

/**
 * User 조회 테스트
 */
async function testUserRead() {
  console.log('=== 3. User 조회 테스트 ===')

  try {
    const user = await prisma.user.findUnique({
      where: { userId: testUserId }
    })

    if (!user) {
      throw new Error('생성한 User를 찾을 수 없습니다')
    }

    console.log('✓ User 조회 성공')
    console.log(`  - userId: ${user.userId}`)
    console.log(`  - email: ${user.email}\n`)

    return true
  } catch (error) {
    console.error('✗ User 조회 실패:', error.message)
    return false
  }
}

/**
 * Todo 생성 테스트
 */
async function testTodoCreate() {
  console.log('=== 4. Todo 생성 테스트 ===')

  try {
    const todo = await prisma.todo.create({
      data: {
        userId: testUserId,
        title: 'Test Todo',
        content: 'This is a test todo item',
        status: 'ACTIVE',
        isCompleted: false,
        dueDate: new Date(Date.now() + 86400000) // 내일
      }
    })

    testTodoId = todo.todoId

    console.log('✓ Todo 생성 성공')
    console.log(`  - todoId: ${todo.todoId}`)
    console.log(`  - title: ${todo.title}`)
    console.log(`  - status: ${todo.status}`)
    console.log(`  - userId: ${todo.userId}\n`)

    return true
  } catch (error) {
    console.error('✗ Todo 생성 실패:', error.message)
    return false
  }
}

/**
 * Todo 조회 테스트
 */
async function testTodoRead() {
  console.log('=== 5. Todo 조회 테스트 ===')

  try {
    const todo = await prisma.todo.findUnique({
      where: { todoId: testTodoId }
    })

    if (!todo) {
      throw new Error('생성한 Todo를 찾을 수 없습니다')
    }

    console.log('✓ Todo 조회 성공')
    console.log(`  - todoId: ${todo.todoId}`)
    console.log(`  - title: ${todo.title}\n`)

    return true
  } catch (error) {
    console.error('✗ Todo 조회 실패:', error.message)
    return false
  }
}

/**
 * User-Todo 관계 조회 테스트
 */
async function testUserTodoRelation() {
  console.log('=== 6. User-Todo 관계 조회 테스트 ===')

  try {
    // User를 조회하면서 관련된 Todo도 함께 조회
    const userWithTodos = await prisma.user.findUnique({
      where: { userId: testUserId },
      include: {
        todos: true
      }
    })

    if (!userWithTodos) {
      throw new Error('User를 찾을 수 없습니다')
    }

    if (userWithTodos.todos.length === 0) {
      throw new Error('User의 Todo가 없습니다')
    }

    console.log('✓ User-Todo 관계 조회 성공')
    console.log(`  - User: ${userWithTodos.username}`)
    console.log(`  - Todo 개수: ${userWithTodos.todos.length}`)
    console.log(`  - 첫 번째 Todo: ${userWithTodos.todos[0].title}\n`)

    // Todo를 조회하면서 관련된 User도 함께 조회
    const todoWithUser = await prisma.todo.findUnique({
      where: { todoId: testTodoId },
      include: {
        user: true
      }
    })

    if (!todoWithUser || !todoWithUser.user) {
      throw new Error('Todo의 User를 찾을 수 없습니다')
    }

    console.log('✓ Todo-User 관계 조회 성공')
    console.log(`  - Todo: ${todoWithUser.title}`)
    console.log(`  - User: ${todoWithUser.user.username}\n`)

    return true
  } catch (error) {
    console.error('✗ User-Todo 관계 조회 실패:', error.message)
    return false
  }
}

/**
 * Todo 업데이트 테스트
 */
async function testTodoUpdate() {
  console.log('=== 7. Todo 업데이트 테스트 ===')

  try {
    const updatedTodo = await prisma.todo.update({
      where: { todoId: testTodoId },
      data: {
        isCompleted: true,
        status: 'COMPLETED'
      }
    })

    console.log('✓ Todo 업데이트 성공')
    console.log(`  - isCompleted: ${updatedTodo.isCompleted}`)
    console.log(`  - status: ${updatedTodo.status}\n`)

    return true
  } catch (error) {
    console.error('✗ Todo 업데이트 실패:', error.message)
    return false
  }
}

/**
 * Soft Delete 테스트
 */
async function testSoftDelete() {
  console.log('=== 8. Soft Delete 테스트 ===')

  try {
    const deletedTodo = await prisma.todo.update({
      where: { todoId: testTodoId },
      data: {
        status: 'DELETED',
        deletedAt: new Date()
      }
    })

    console.log('✓ Soft Delete 성공')
    console.log(`  - status: ${deletedTodo.status}`)
    console.log(`  - deletedAt: ${deletedTodo.deletedAt}\n`)

    // 삭제된 항목이 여전히 존재하는지 확인
    const stillExists = await prisma.todo.findUnique({
      where: { todoId: testTodoId }
    })

    if (stillExists) {
      console.log('✓ Soft Delete 확인: 레코드는 여전히 존재')
      console.log(`  - deletedAt이 설정됨: ${!!stillExists.deletedAt}\n`)
    }

    return true
  } catch (error) {
    console.error('✗ Soft Delete 실패:', error.message)
    return false
  }
}

/**
 * 트랜잭션 테스트
 */
async function testTransaction() {
  console.log('=== 9. 트랜잭션 테스트 ===')

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 새로운 Todo 생성
      const newTodo = await tx.todo.create({
        data: {
          userId: testUserId,
          title: 'Transaction Test Todo',
          status: 'ACTIVE'
        }
      })

      // User의 Todo 개수 확인
      const todoCount = await tx.todo.count({
        where: { userId: testUserId }
      })

      return { newTodo, todoCount }
    })

    console.log('✓ 트랜잭션 성공')
    console.log(`  - 새로운 Todo ID: ${result.newTodo.todoId}`)
    console.log(`  - 총 Todo 개수: ${result.todoCount}\n`)

    return true
  } catch (error) {
    console.error('✗ 트랜잭션 실패:', error.message)
    return false
  }
}

/**
 * 테스트 데이터 정리 (Cleanup)
 */
async function cleanup() {
  console.log('=== 10. 테스트 데이터 정리 ===')

  try {
    // Todo 삭제 (cascade 때문에 User 삭제 전에 먼저 삭제할 필요는 없지만 명시적으로 삭제)
    await prisma.todo.deleteMany({
      where: { userId: testUserId }
    })
    console.log('✓ 테스트 Todo 삭제 완료')

    // User 삭제
    await prisma.user.delete({
      where: { userId: testUserId }
    })
    console.log('✓ 테스트 User 삭제 완료\n')

    return true
  } catch (error) {
    console.error('✗ 테스트 데이터 정리 실패:', error.message)
    return false
  }
}

/**
 * 모든 테스트 실행
 */
async function runAllTests() {
  const results = []

  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║     데이터베이스 연결 및 CRUD 테스트 시작      ║')
  console.log('╚══════════════════════════════════════════════════╝\n')

  try {
    // 1. 연결 테스트
    results.push({ name: '데이터베이스 연결', passed: await testDatabaseConnection() })

    // 2. User CRUD 테스트
    results.push({ name: 'User 생성', passed: await testUserCreate() })
    results.push({ name: 'User 조회', passed: await testUserRead() })

    // 3. Todo CRUD 테스트
    results.push({ name: 'Todo 생성', passed: await testTodoCreate() })
    results.push({ name: 'Todo 조회', passed: await testTodoRead() })

    // 4. 관계 테스트
    results.push({ name: 'User-Todo 관계 조회', passed: await testUserTodoRelation() })

    // 5. 업데이트 테스트
    results.push({ name: 'Todo 업데이트', passed: await testTodoUpdate() })

    // 6. Soft Delete 테스트
    results.push({ name: 'Soft Delete', passed: await testSoftDelete() })

    // 7. 트랜잭션 테스트
    results.push({ name: '트랜잭션', passed: await testTransaction() })

    // 8. 정리
    results.push({ name: '테스트 데이터 정리', passed: await cleanup() })

  } catch (error) {
    console.error('\n예상치 못한 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }

  // 결과 요약
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║              테스트 결과 요약                    ║')
  console.log('╚══════════════════════════════════════════════════╝\n')

  const passedCount = results.filter(r => r.passed).length
  const totalCount = results.length

  results.forEach((result, index) => {
    const status = result.passed ? '✓ PASS' : '✗ FAIL'
    console.log(`${index + 1}. ${result.name}: ${status}`)
  })

  console.log(`\n총 ${totalCount}개 테스트 중 ${passedCount}개 통과`)
  console.log(`성공률: ${((passedCount / totalCount) * 100).toFixed(1)}%\n`)

  if (passedCount === totalCount) {
    console.log('🎉 모든 테스트가 성공적으로 완료되었습니다!')
  } else {
    console.log('⚠️  일부 테스트가 실패했습니다.')
  }

  process.exit(passedCount === totalCount ? 0 : 1)
}

// 테스트 실행
runAllTests()
