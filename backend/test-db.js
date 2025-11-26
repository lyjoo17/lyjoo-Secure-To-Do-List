require('dotenv').config()
const prisma = require('./src/config/database')

async function testDatabase() {
  try {
    console.log('=== 데이터베이스 연결 테스트 ===\n')

    const userCount = await prisma.user.count()
    console.log(`✓ Users 테이블: ${userCount}개 레코드`)

    const todoCount = await prisma.todo.count()
    console.log(`✓ Todos 테이블: ${todoCount}개 레코드`)

    const holidayCount = await prisma.holiday.count()
    console.log(`✓ Holidays 테이블: ${holidayCount}개 레코드`)

    console.log('\n=== 사용자 목록 ===')
    const users = await prisma.user.findMany({
      select: {
        username: true,
        email: true,
        role: true,
      }
    })
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - ${user.role}`)
    })

    console.log('\n=== 할일 목록 (샘플) ===')
    const todos = await prisma.todo.findMany({
      take: 5,
      select: {
        title: true,
        status: true,
        user: {
          select: {
            username: true
          }
        }
      }
    })
    todos.forEach(todo => {
      console.log(`- ${todo.title} [${todo.status}] - ${todo.user.username}`)
    })

    console.log('\n=== 국경일 목록 (샘플) ===')
    const holidays = await prisma.holiday.findMany({
      take: 5,
      orderBy: {
        date: 'asc'
      },
      select: {
        title: true,
        date: true,
      }
    })
    holidays.forEach(holiday => {
      console.log(`- ${holiday.title} (${holiday.date.toISOString().split('T')[0]})`)
    })

    console.log('\n✓ 데이터베이스 연결 및 데이터 확인 완료!')

  } catch (error) {
    console.error('✗ 데이터베이스 테스트 실패:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
