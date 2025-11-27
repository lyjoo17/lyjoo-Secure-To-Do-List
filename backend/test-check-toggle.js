const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'
let authToken = ''

const testAPI = async () => {
  try {
    console.log('=== API 테스트 시작 ===\n')

    console.log('1. Health Check')
    try {
      const health = await axios.get('http://localhost:3000/health')
      console.log('✓ Health:', health.data)
    } catch (e) {
      console.log('! Health Check endpoint might not exist or server error')
    }

    console.log('\n2. 회원가입 및 로그인 테스트')
    const registerData = {
      email: 'test_check@example.com',
      password: 'password123',
      username: 'Check User'
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

    console.log('\n3. 할일 생성 및 완료 처리 테스트')
    const todoData = {
      title: '완료 처리 테스트 할일',
      content: '테스트 내용',
      dueDate: new Date(Date.now() + 86400000).toISOString()
    }
    const createTodo = await axios.post(`${BASE_URL}/todos`, todoData, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    const todoId = createTodo.data.data.todoId
    console.log('✓ 할일 생성 성공')

    // 완료 처리 테스트
    console.log('\n-> 할일 완료 상태로 변경 시도 (isCompleted: true)')
    const completeTodo = await axios.put(
      `${BASE_URL}/todos/${todoId}`,
      { isCompleted: true },
      { headers: { Authorization: `Bearer ${authToken}` } }
    )
    
    if (completeTodo.data.data.isCompleted === true && completeTodo.data.data.status === 'COMPLETED') {
        console.log('✓ 할일 완료 처리 성공 (isCompleted: true, status: COMPLETED)')
    } else {
        console.error('✗ 할일 완료 처리 실패:', completeTodo.data.data)
    }

    // 미완료 처리 테스트
    console.log('\n-> 할일 미완료 상태로 변경 시도 (isCompleted: false)')
    const uncompleteTodo = await axios.put(
      `${BASE_URL}/todos/${todoId}`,
      { isCompleted: false },
      { headers: { Authorization: `Bearer ${authToken}` } }
    )

    if (uncompleteTodo.data.data.isCompleted === false && uncompleteTodo.data.data.status === 'ACTIVE') {
        console.log('✓ 할일 미완료 처리 성공 (isCompleted: false, status: ACTIVE)')
    } else {
        console.error('✗ 할일 미완료 처리 실패:', uncompleteTodo.data.data)
    }

    // 정리 (삭제)
    await axios.delete(`${BASE_URL}/todos/${todoId}/permanent`, {
        headers: { Authorization: `Bearer ${authToken}` }
    }).catch(() => {}) // Ignore cleanup errors if any

    console.log('\n=== 테스트 완료 ===')

  } catch (error) {
    console.error('\n✗ 테스트 실패:', error.response?.data || error.message)
  }
}

testAPI()
