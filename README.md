# lyjoo Secure To Do List

사용자 인증 기능을 갖춘 안전한 할 일 관리 애플리케이션입니다.

## 프로젝트 개요

lyjoo Secure To Do List는 개인별 할 일 관리를 위한 웹 애플리케이션으로, 사용자 인증을 통해 안전하게 할 일 목록을 관리할 수 있습니다.

## 해결하고자 하는 문제

- 사용자마다 할 일 목록을 관리할 수 있는 앱 제공
- 할 일의 만료 기간 표현을 통한 효율적인 일정 관리
- 현재 시간, 일자, 날씨 정보를 통한 오늘 확인
- 할 일 완료 시 폭죽 효과를 통한 만족감 제공
- 국경일 등의 일정 통합 관리

## 주요 기능

### 사용자 인증
- **회원가입**: 이름, 핸드폰번호, 아이디, 비밀번호 정보 등록
- **로그인**: 아이디/비밀번호 기반 인증
- **계정 찾기**: 아이디/비밀번호 찾기 기능

### 할 일 관리
- 오늘 날짜의 할 일 목록 확인
- + 버튼을 통한 할 일 추가
- 할 일 만료 기간 설정 및 관리
- 국경일 등 주요 일정 통합 관리

### 사용자 경험
- 메인 화면에 오늘 일자, 시간, 날씨 표시
- 오늘의 할 일 완료 시 축하 폭죽 효과

## 기술 스택

### 프론트엔드
- React 18
- Vite
- Tailwind CSS
- Zustand (상태 관리)
- Axios (HTTP 클라이언트)
- React Router v6

### 백엔드
- Node.js 18+
- Express.js 5.x
- Prisma ORM
- PostgreSQL 15+
- JWT 인증
- bcryptjs (비밀번호 해싱)

### 배포
- Vercel (Frontend + Backend Serverless)
- Supabase / Local PostgreSQL (Database)

## 설치 및 실행

### 사전 요구사항
- Node.js 18 이상
- PostgreSQL 15 이상
- npm 또는 yarn

### 백엔드 설정

1. 백엔드 디렉토리로 이동
```bash
cd backend
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
# .env 파일 생성 (.env.example 참고)
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-secret-key"
JWT_ACCESS_EXPIRES_IN="1d"
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
PORT=3000
```

4. 데이터베이스 마이그레이션
```bash
npx prisma migrate dev
```

5. 시드 데이터 생성 (선택)
```bash
npx prisma db seed
```

6. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## 데이터베이스 설정 및 문제 해결

### Supabase 연결 가이드
본 프로젝트는 PostgreSQL 데이터베이스로 Supabase를 사용할 수 있습니다.
- [Supabase 연결 가이드](https://supabase.com/docs/guides/database/connecting-to-postgres)를 참고하여 Connection String을 확보하세요.
- `.env` 파일의 `DATABASE_URL`을 다음과 같은 형식으로 설정합니다:
  ```
  DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
  ```
  (Transaction Mode 포트 6543 대신 Session Mode 포트 5432 사용 권장)

### 일반적인 에러 및 해결 방법

1. **P1001: Can't reach database server**
   - **원인**: 데이터베이스 서버가 실행 중이지 않거나, 네트워크 연결이 차단된 경우.
   - **해결**: 인터넷 연결을 확인하고, Supabase 대시보드에서 프로젝트 상태가 'Active'인지 확인하세요. 로컬 DB의 경우 Docker 컨테이너 실행 여부를 확인합니다.

2. **P2002: Unique constraint failed**
   - **원인**: 유니크 제약 조건이 있는 필드(예: email)에 중복된 값을 삽입하려 할 때 발생.
   - **해결**: 이미 등록된 이메일인지 확인하거나, 다른 이메일 주소를 사용하세요.

3. **P3000: Failed to create database**
   - **원인**: 마이그레이션 실행 중 데이터베이스 생성 권한이 없거나 이미 존재하는 경우.
   - **해결**: `.env`의 사용자 권한을 확인하거나, `npx prisma migrate reset`으로 초기화 후 다시 시도하세요(주의: 데이터 삭제됨).

### 테스트 실행

```bash
# 데이터베이스 연결 테스트
npm run test:db

# 데이터베이스 헬퍼 함수 테스트
npm run test:helpers

# API 통합 테스트
npm run test:api

# 모든 테스트 실행
npm test
```

### API 엔드포인트

서버는 `http://localhost:3000`에서 실행됩니다.

#### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃

#### 할일
- `GET /api/todos` - 할일 목록 조회
- `POST /api/todos` - 할일 생성
- `GET /api/todos/:id` - 할일 상세 조회
- `PUT /api/todos/:id` - 할일 수정
- `DELETE /api/todos/:id` - 할일 삭제 (휴지통)
- `PATCH /api/todos/:id/restore` - 할일 복원
- `DELETE /api/todos/:id/permanent` - 할일 영구 삭제

#### 국경일
- `GET /api/holidays` - 국경일 조회
- `POST /api/holidays/sync` - 국경일 동기화 (관리자 전용)

#### 사용자
- `GET /api/users/me` - 내 정보 조회
- `PATCH /api/users/me` - 내 정보 수정

### 프론트엔드 설정

1. 프론트엔드 디렉토리로 이동
```bash
cd frontend
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
# .env 파일 생성 (없을 경우)
VITE_API_BASE_URL="http://localhost:3000/api"
```

4. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173`으로 접속하여 애플리케이션을 확인하세요.

### 빌드 및 배포

```bash
# 프론트엔드 빌드
npm run build

# 결과물 미리보기
npm run preview
```

## 라이선스

ISC License
