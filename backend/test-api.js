const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'
let authToken = ''

const testAPI = async () => {
  try {
    console.log('=== API 테스트 시작 ===\n')

    console.log('1. Health Check')
    const health = await axios.get('http://localhost:3000/health')
    console.log('✓ Health:', health.data)

    console.log('\n2. 회원가입 테스트')
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      username: 'Test User'
    }

    try {
      const register = await axios.post(`${BASE_URL}/auth/register`, registerData)
      console.log('✓ 회원가입 성공:', register.data.message)
      authToken = register.data.data.accessToken
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✓ 이미 존재하는 사용자 (로그인 시도)')
        const login = await axios.post(`${BASE_URL}/auth/login`, {
          email: registerData.email,
          password: registerData.password
        })
        authToken = login.data.data.accessToken
        console.log('✓ 로그인 성공')
      } else {
        throw error
      }
    }

    console.log('\n3. 할일 생성 테스트')
    const todoData = {
      title: 'API 테스트 할일',
      content: '테스트 내용',
      dueDate: new Date(Date.now() + 86400000).toISOString()
    }
    const createTodo = await axios.post(`${BASE_URL}/todos`, todoData, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    console.log('✓ 할일 생성 성공:', createTodo.data.data.title)
    const todoId = createTodo.data.data.todoId

    console.log('\n4. 할일 목록 조회 테스트')
    const todos = await axios.get(`${BASE_URL}/todos`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    console.log(`✓ 할일 ${todos.data.data.length}개 조회 성공`)

    console.log('\n5. 할일 상세 조회 테스트')
    const todo = await axios.get(`${BASE_URL}/todos/${todoId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    console.log('✓ 할일 상세 조회 성공:', todo.data.data.title)

    console.log('\n6. 할일 수정 테스트')
    const updateTodo = await axios.put(
      `${BASE_URL}/todos/${todoId}`,
      { title: '수정된 할일', isCompleted: true },
      { headers: { Authorization: `Bearer ${authToken}` } }
    )
    console.log('✓ 할일 수정 성공:', updateTodo.data.data.title)

    console.log('\n7. 할일 삭제 테스트')
    const deleteTodo = await axios.delete(`${BASE_URL}/todos/${todoId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    console.log('✓ 할일 삭제 성공 (휴지통 이동)')

    console.log('\n8. 할일 복원 테스트')
    const restoreTodo = await axios.patch(
      `${BASE_URL}/todos/${todoId}/restore`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    )
    console.log('✓ 할일 복원 성공')

    console.log('\n9. 국경일 조회 테스트')
    const holidays = await axios.get(`${BASE_URL}/holidays`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    console.log(`✓ 국경일 ${holidays.data.data.length}개 조회 성공`)

    console.log('\n10. 사용자 프로필 조회 테스트')
    const profile = await axios.get(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    console.log('✓ 프로필 조회 성공:', profile.data.data.username)

    console.log('\n11. 인증 실패 테스트')
    try {
      await axios.get(`${BASE_URL}/todos`)
      console.log('✗ 인증 없이 접근 가능 (오류)')
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✓ 인증 실패 처리 정상')
      }
    }

    console.log('\n=== 모든 API 테스트 완료 ===')

  } catch (error) {
    console.error('\n✗ 테스트 실패:', error.response?.data || error.message)
  }
}

testAPI()
