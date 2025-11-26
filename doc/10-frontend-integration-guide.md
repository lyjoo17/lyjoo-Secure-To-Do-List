# 프론트엔드 통합 가이드

## 목차
1. [개요](#개요)
2. [백엔드 서버 정보](#백엔드-서버-정보)
3. [인증 및 보안](#인증-및-보안)
4. [CORS 설정](#cors-설정)
5. [API 엔드포인트](#api-엔드포인트)
6. [에러 처리](#에러-처리)
7. [Rate Limiting](#rate-limiting)
8. [환경 설정](#환경-설정)

---

## 개요

본 문서는 lyjoo Secure To-Do List 백엔드 API와 프론트엔드를 통합하기 위한 가이드입니다. 백엔드는 Express.js 기반으로 구축되었으며, JWT 인증, Prisma ORM, PostgreSQL을 사용합니다.

### 기술 스택
- **프레임워크**: Express.js 5.x
- **데이터베이스**: PostgreSQL 15+ (Prisma ORM)
- **인증**: JWT (JSON Web Token)
- **보안**: Helmet, CORS, Rate Limiting, bcryptjs
- **검증**: express-validator

---

## 백엔드 서버 정보

### 서버 주소
- **로컬 개발**: `http://localhost:3000`
- **프로덕션**: `https://your-domain.vercel.app` (배포 후 설정)

### Health Check
서버 상태 확인:
```
GET /health
```

**응답 예시**:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## 인증 및 보안

### JWT 기반 인증

백엔드는 Bearer 토큰 방식의 JWT 인증을 사용합니다.

#### 인증 흐름

1. **회원가입/로그인**: 사용자가 회원가입 또는 로그인하면 `accessToken`을 받습니다.
2. **토큰 저장**: 프론트엔드는 토큰을 안전하게 저장합니다 (권장: localStorage 또는 sessionStorage).
3. **인증 요청**: 보호된 API 엔드포인트 호출 시 Authorization 헤더에 토큰을 포함합니다.

#### 토큰 사용 방법

**헤더 형식**:
```
Authorization: Bearer {accessToken}
```

**Axios 예시**:
```javascript
const token = localStorage.getItem('accessToken');

axios.get('http://localhost:3000/api/todos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

#### 토큰 만료 처리

- 토큰 기본 만료 시간: **1일** (환경변수로 설정 가능)
- 토큰이 만료되면 `401 Unauthorized` 에러 발생
- 401 에러 발생 시 로그인 페이지로 리다이렉트

**에러 응답 예시**:
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 보안 헤더

백엔드는 Helmet 미들웨어를 통해 다음 보안 헤더를 자동으로 설정합니다:
- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`
- `Strict-Transport-Security`

---

## CORS 설정

### CORS 정책

백엔드는 CORS(Cross-Origin Resource Sharing)를 지원하며, 환경 변수로 허용된 Origin을 제어합니다.

#### 허용된 Origin
- **개발 환경**: `http://localhost:5173` (기본값)
- **프로덕션 환경**: `.env` 파일의 `CORS_ORIGIN` 환경 변수로 설정

#### 주의사항
- `credentials: true` 설정으로 쿠키를 포함한 요청이 가능합니다.
- 프론트엔드에서 요청 시 `withCredentials: true` 옵션을 사용하여 쿠키를 포함할 수 있습니다.

**Axios 설정 예시**:
```javascript
axios.defaults.withCredentials = true;
```

---

## API 엔드포인트

### 공통 응답 형식

모든 API는 다음 형식으로 응답합니다:

**성공 응답**:
```json
{
  "success": true,
  "data": { /* 응답 데이터 */ }
}
```

**실패 응답**:
```json
{
  "success": false,
  "message": "에러 메시지",
  "errors": [ /* 검증 에러 배열 (선택적) */ ]
}
```

---

### 1. 인증 (Auth)

#### 1.1. 회원가입
```
POST /api/auth/register
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "홍길동"
}
```

**검증 규칙**:
- `email`: 유효한 이메일 형식
- `password`: 최소 6자 이상
- `username`: 2~50자, 필수

**성공 응답** (201):
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "username": "홍길동",
    "role": "user",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**에러 응답**:
- `400`: 검증 실패
- `409`: 이메일 중복

---

#### 1.2. 로그인
```
POST /api/auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**성공 응답** (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "uuid",
      "email": "user@example.com",
      "username": "홍길동",
      "role": "user"
    }
  }
}
```

**에러 응답**:
- `401`: 로그인 실패 (잘못된 이메일 또는 비밀번호)

**프론트엔드 처리**:
```javascript
const response = await axios.post('http://localhost:3000/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

if (response.data.success) {
  const { accessToken, user } = response.data.data;

  // 토큰 저장
  localStorage.setItem('accessToken', accessToken);

  // 사용자 정보 저장 (선택적)
  localStorage.setItem('user', JSON.stringify(user));
}
```

---

#### 1.3. 로그아웃
```
POST /api/auth/logout
```

**인증**: Bearer Token 필요

**성공 응답** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**프론트엔드 처리**:
```javascript
// 로그아웃 시 토큰 삭제
localStorage.removeItem('accessToken');
localStorage.removeItem('user');
```

---

### 2. 할일 관리 (Todos)

모든 Todo API는 **인증 필요** (`Authorization: Bearer {token}`)

#### 2.1. 할일 목록 조회
```
GET /api/todos
```

**Query Parameters** (선택적):
- `status`: 상태 필터 (`active`, `completed`, `deleted`)
- `search`: 제목/내용 검색어
- `sortBy`: 정렬 기준 (`dueDate`, `createdAt`) - 기본: `createdAt`
- `order`: 정렬 순서 (`asc`, `desc`) - 기본: `desc`

**예시**:
```
GET /api/todos?status=active&sortBy=dueDate&order=asc
```

**성공 응답** (200):
```json
{
  "success": true,
  "data": [
    {
      "todoId": "uuid",
      "userId": "uuid",
      "title": "할일 제목",
      "content": "할일 내용",
      "startDate": "2025-01-01",
      "dueDate": "2025-01-10",
      "isCompleted": false,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

---

#### 2.2. 할일 생성
```
POST /api/todos
```

**Request Body**:
```json
{
  "title": "할일 제목",
  "content": "할일 내용 (선택적)",
  "startDate": "2025-01-01",
  "dueDate": "2025-01-10"
}
```

**검증 규칙**:
- `title`: 필수, 최대 255자
- `content`: 선택적
- `startDate`, `dueDate`: ISO 8601 날짜 형식 (선택적)

**성공 응답** (201):
```json
{
  "success": true,
  "data": {
    "todoId": "uuid",
    "userId": "uuid",
    "title": "할일 제목",
    "content": "할일 내용",
    "startDate": "2025-01-01T00:00:00.000Z",
    "dueDate": "2025-01-10T00:00:00.000Z",
    "isCompleted": false,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "deletedAt": null
  }
}
```

**에러 응답**:
- `400`: 검증 실패

---

#### 2.3. 할일 상세 조회
```
GET /api/todos/:id
```

**Path Parameter**:
- `id`: Todo UUID

**성공 응답** (200):
```json
{
  "success": true,
  "data": {
    "todoId": "uuid",
    "userId": "uuid",
    "title": "할일 제목",
    "content": "할일 내용",
    "startDate": "2025-01-01T00:00:00.000Z",
    "dueDate": "2025-01-10T00:00:00.000Z",
    "isCompleted": false,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "deletedAt": null
  }
}
```

**에러 응답**:
- `404`: Todo를 찾을 수 없음
- `403`: 권한 없음 (다른 사용자의 Todo)

---

#### 2.4. 할일 수정
```
PUT /api/todos/:id
```

**Request Body**:
```json
{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "startDate": "2025-01-02",
  "dueDate": "2025-01-15"
}
```

**성공 응답** (200):
```json
{
  "success": true,
  "data": {
    "todoId": "uuid",
    "title": "수정된 제목",
    ...
  }
}
```

**에러 응답**:
- `404`: Todo를 찾을 수 없음
- `403`: 권한 없음

---

#### 2.5. 할일 완료 처리

할일을 완료 상태로 변경하려면 `PUT /api/todos/:id`를 사용하여 `isCompleted` 필드를 업데이트합니다.

**Request Body**:
```json
{
  "isCompleted": true
}
```

**성공 응답** (200):
```json
{
  "success": true,
  "message": "Todo updated successfully",
  "data": {
    "todoId": "uuid",
    "isCompleted": true,
    ...
  }
}
```

---

#### 2.6. 할일 삭제 (휴지통으로 이동)
```
DELETE /api/todos/:id
```

**성공 응답** (200):
```json
{
  "success": true,
  "message": "Todo moved to trash",
  "data": {
    "todoId": "uuid",
    "deletedAt": "2025-01-01T00:00:00.000Z",
    ...
  }
}
```

---

#### 2.7. 할일 복원
```
PATCH /api/todos/:id/restore
```

**성공 응답** (200):
```json
{
  "success": true,
  "message": "Todo restored successfully",
  "data": {
    "todoId": "uuid",
    "deletedAt": null,
    ...
  }
}
```

---

#### 2.8. 할일 영구 삭제
```
DELETE /api/todos/:id/permanent
```

**주의**: 복구 불가능

**성공 응답** (200):
```json
{
  "success": true,
  "message": "Todo permanently deleted"
}
```

**에러 응답**:
- `400`: 활성 상태의 Todo는 영구 삭제 불가 (먼저 휴지통으로 이동해야 함)

---

### 3. 휴지통

휴지통 기능은 별도 엔드포인트가 아닌 할일 목록 조회 API의 `status` 파라미터를 사용합니다.

#### 3.1. 휴지통 목록 조회
```
GET /api/todos?status=deleted
```

**인증**: Bearer Token 필요

**성공 응답** (200):
```json
{
  "success": true,
  "data": [
    {
      "todoId": "uuid",
      "title": "삭제된 할일",
      "deletedAt": "2025-01-01T00:00:00.000Z",
      ...
    }
  ]
}
```

**사용 예시**:
```javascript
// 휴지통 목록 조회
const response = await axios.get('http://localhost:3000/api/todos', {
  params: { status: 'deleted' },
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

### 4. 국경일 (Holidays)

#### 4.1. 국경일 목록 조회
```
GET /api/holidays
```

**인증**: Bearer Token 필요

**Query Parameters** (선택적):
- `year`: 연도 필터 (예: 2025)
- `month`: 월 필터 (1~12)

**예시**:
```
GET /api/holidays?year=2025&month=1
```

**성공 응답** (200):
```json
{
  "success": true,
  "data": [
    {
      "holidayId": "uuid",
      "title": "신정",
      "date": "2025-01-01T00:00:00.000Z",
      "description": "새해 첫날",
      "isRecurring": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### 4.2. 국경일 동기화 (관리자 전용)
```
POST /api/holidays/sync
```

**인증**: Bearer Token 필요 (Admin 권한)

**설명**: 외부 API에서 국경일 데이터를 가져와 동기화합니다.

**성공 응답** (200):
```json
{
  "success": true,
  "message": "Holidays synchronized successfully",
  "data": {
    "count": 15
  }
}
```

**에러 응답**:
- `403`: 관리자 권한 필요

---

### 5. 사용자 (Users)

#### 5.1. 내 프로필 조회
```
GET /api/users/me
```

**인증**: Bearer Token 필요

**성공 응답** (200):
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "username": "홍길동",
    "role": "user",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### 5.2. 내 프로필 수정
```
PATCH /api/users/me
```

**인증**: Bearer Token 필요

**Request Body**:
```json
{
  "username": "새로운이름",
  "password": "newpassword123"
}
```

**성공 응답** (200):
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "새로운이름"
  }
}
```

---

## 에러 처리

### HTTP 상태 코드

| 상태 코드 | 의미 | 설명 |
|---------|------|------|
| 200 | OK | 요청 성공 |
| 201 | Created | 리소스 생성 성공 |
| 400 | Bad Request | 잘못된 요청 (검증 실패) |
| 401 | Unauthorized | 인증 실패 (토큰 없음/만료) |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스를 찾을 수 없음 |
| 409 | Conflict | 중복된 리소스 (이메일 등) |
| 429 | Too Many Requests | Rate Limit 초과 |
| 500 | Internal Server Error | 서버 에러 |

### 에러 응답 형식

```json
{
  "success": false,
  "message": "에러 메시지",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### 프론트엔드 에러 처리 예시

```javascript
try {
  const response = await axios.post('http://localhost:3000/api/todos', todoData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  // 성공 처리
  console.log(response.data.data);

} catch (error) {
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400:
        // 검증 에러
        console.error('검증 실패:', data.errors);
        break;
      case 401:
        // 인증 에러 - 로그인 페이지로 리다이렉트
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        break;
      case 403:
        // 권한 에러
        alert('권한이 없습니다.');
        break;
      case 404:
        // Not Found
        alert('리소스를 찾을 수 없습니다.');
        break;
      case 429:
        // Rate Limit
        alert('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
        break;
      default:
        alert('오류가 발생했습니다.');
    }
  }
}
```

---

## Rate Limiting

백엔드는 요청 횟수 제한(Rate Limiting)을 적용합니다.

### 일반 API
- **제한**: 1분에 100회
- **초과 시**: HTTP 429 응답

### 인증 API (회원가입/로그인)
- **제한**: 1분에 10회
- **초과 시**: HTTP 429 응답

**에러 응답**:
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

### 프론트엔드 대응 방안
- 429 에러 발생 시 사용자에게 안내 메시지 표시
- 재시도 로직 구현 시 Exponential Backoff 패턴 사용

---

## 환경 설정

### 백엔드 환경 변수

백엔드 `.env` 파일 설정:

```env
# 데이터베이스
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT 설정
JWT_SECRET="your-secret-key-here"
JWT_ACCESS_EXPIRES_IN="1d"

# CORS 설정
CORS_ORIGIN="http://localhost:5173"

# 서버 설정
NODE_ENV="development"
PORT=3000
```

### 프론트엔드 환경 변수

프론트엔드 `.env` 파일 설정 (Vite 기준):

```env
# API 서버 주소
VITE_API_BASE_URL=http://localhost:3000/api

# 프로덕션
# VITE_API_BASE_URL=https://your-domain.vercel.app/api
```

### Axios 기본 설정

```javascript
// src/api/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터 - 토큰 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 401 에러 자동 처리
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

## 추가 참고 자료

- **Swagger 문서**: `swagger/swagger.json` 파일 참조
- **데이터베이스 스키마**: `backend/prisma/schema.prisma` 참조
- **백엔드 README**: `README.md` 참조

---

## 문의 및 지원

프론트엔드 개발 중 문제가 발생하면 다음을 확인하세요:

1. 백엔드 서버가 실행 중인지 확인: `http://localhost:3000/health`
2. 환경 변수가 올바르게 설정되었는지 확인
3. CORS 에러 발생 시 백엔드 `.env`의 `CORS_ORIGIN` 확인
4. 인증 토큰이 올바르게 전달되는지 확인 (Browser DevTools Network 탭)

---

**문서 버전**: 1.0.0
**최종 수정일**: 2025-11-26
