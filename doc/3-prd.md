# WHS-TodoList Product Requirements Document (PRD)

**버전**: 1.0
**작성일**: 2025-11-25
**상태**: 최종
**작성자**: Claude
**참조 문서**:
- [도메인 정의서](./1-domain-definition.md)
- [PRD 입력 템플릿](./2-prd-input-template.md)
- [스타일 가이드](./4-style-guide.md)

---

## 목차

1. [제품 개요](#1-제품-개요)
2. [제품 비전 및 목표](#2-제품-비전-및-목표)
3. [타겟 사용자](#3-타겟-사용자)
4. [성공 지표 (KPI)](#4-성공-지표-kpi)
5. [기능 요구사항](#5-기능-요구사항)
6. [비기능 요구사항](#6-비기능-요구사항)
7. [기술 스택](#7-기술-스택)
8. [데이터 모델](#8-데이터-모델)
9. [API 설계](#9-api-설계)
10. [UI/UX 요구사항](#10-uiux-요구사항)
11. [일정 및 마일스톤](#11-일정-및-마일스톤)
12. [리스크 및 제약사항](#12-리스크-및-제약사항)

---

## 1. 제품 개요

### 1.1 제품 설명

**WHS-TodoList**는 사용자 인증 기반의 개인 할일 관리 애플리케이션으로, 사용자별 할일 목록과 공통 국경일 일정을 통합 관리하는 웹 애플리케이션입니다.

### 1.2 핵심 가치

- **단순함**: 복잡하지 않고 직관적인 사용자 경험
- **통합 관리**: 개인 할일과 국경일을 한 곳에서 관리
- **복원 가능성**: 휴지통 기능을 통한 안전한 삭제 관리
- **접근성**: 데스크톱과 모바일 모두 지원

### 1.3 주요 특징

1. **사용자 인증 시스템**: JWT 기반 안전한 인증
2. **할일 관리**: 생성, 조회, 수정, 완료, 삭제, 복원
3. **휴지통 기능**: 소프트 삭제를 통한 복구 가능
4. **국경일 표시**: 공통 국경일 자동 표시
5. **반응형 디자인**: 데스크톱 및 모바일 지원

---

## 2. 제품 비전 및 목표

### 2.1 제품 비전

> "개인의 시간 관리를 돕고 생산성을 향상시키는 직관적인 할일 관리 플랫폼"

### 2.2 해결하려는 문제

기존 할일 관리 앱들의 문제점:
- 복잡한 UI로 인한 낮은 접근성
- 국경일 등 공통 일정을 함께 관리하기 어려움
- 실수로 삭제한 할일 복구 불가
- 과도한 기능으로 인한 학습 곡선

### 2.3 비즈니스 목표

| 목표 | 설명 | 우선순위 |
|------|------|----------|
| **사용자 확보** | 1,000명의 가입자 확보 | High |
| **포트폴리오** | 풀스택 개발 역량 증명 | High |
| **학습** | 최신 웹 기술 스택 습득 | High |
| **수익 창출** | 광고 기반 수익 모델 (2차) | Low |

---

## 3. 타겟 사용자

### 3.1 주요 타겟 그룹

1. **직장인** - 업무 일정 관리
2. **대학생** - 과제 및 시험 일정 관리
3. **주부** - 가사 일정 관리

### 3.2 사용자 페르소나

#### 페르소나 1: 김철수 (직장인)

```
- 나이: 20-30대
- 직업: 직장인
- 기술 수준: 보통
- 주요 니즈: 간단하면서 명료한 할일 관리
- 사용 패턴: 하루에 10분-1시간 정도 사용
- 페인 포인트:
  - 복잡한 기능보다 단순한 체크리스트 선호
  - 업무와 개인 일정을 함께 관리하고 싶음
  - 실수로 삭제한 할일 복구 필요
```

#### 페르소나 2: 카리나 (대학생)

```
- 나이: 20대 초반
- 직업: 대학생
- 기술 수준: 초급
- 주요 니즈: 학과 수업과 과제를 위한 할일 관리
- 사용 패턴: 하루 중 아침에 주로 이용
- 페인 포인트:
  - 시험 일정과 과제 마감일 관리
  - 공휴일 확인을 위한 별도 앱 사용 불편
  - 모바일에서 빠르게 확인하고 싶음
```

---

## 4. 성공 지표 (KPI)

### 4.1 사용자 성장 지표

| 지표 | 목표 | 측정 주기 |
|------|------|-----------|
| 1개월 내 가입자 수 | 100명 | 월간 |
| 3개월 내 가입자 수 | 500명 | 분기 |
| DAU (일일 활성 사용자) | 30명 | 일간 |
| MAU (월간 활성 사용자) | 1,000명 | 월간 |

### 4.2 사용자 참여도 지표

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 할일 완료율 | 50% | 완료된 할일 / 전체 할일 |
| 일평균 할일 생성 | 3개/사용자 | 총 생성 수 / DAU |
| 사용자 유지율 (30일) | 80% | 30일 후 재방문 사용자 비율 |
| 평균 세션 시간 | 5-10분 | 로그인 ~ 로그아웃 시간 |

### 4.3 기능 사용 지표

- 휴지통 사용률: 삭제 후 복원하는 사용자 비율
- 국경일 조회 빈도: 국경일 정보 클릭 수
- 검색 기능 사용률: 전체 사용자 중 검색 사용 비율

---

## 5. 기능 요구사항

### 5.1 MVP (1차 출시) 필수 기능

#### 5.1.1 사용자 인증 및 관리

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| [UC-01] | 회원가입 | 이메일, 비밀번호, 사용자 이름으로 신규 계정 생성 | P0 |
| [UC-02] | 로그인 | 이메일/비밀번호 인증 후 JWT 토큰 발급 | P0 |
| - | 로그아웃 | 클라이언트 토큰 삭제 | P0 |
| - | 토큰 갱신 | Refresh Token으로 Access Token 재발급 | P0 |
| - | 프로필 조회/수정 | 사용자 자신의 정보 조회 및 수정 | P1 |

#### 5.1.2 할일 관리

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| [UC-03] | 할일 조회 | 로그인한 사용자의 활성 할일 목록 조회 | P0 |
| [UC-04] | 할일 추가 | 제목, 내용, 시작일, 만료일로 새 할일 생성 | P0 |
| [UC-05] | 할일 수정 | 기존 할일의 모든 속성 변경 가능 | P0 |
| [UC-06] | 할일 완료 | 할일 완료 처리 (isCompleted=true, status='completed') | P0 |
| [UC-07] | 할일 삭제 | 할일을 휴지통으로 이동 (소프트 삭제) | P0 |
| [UC-08] | 할일 복원 | 휴지통의 할일을 활성 상태로 복원 | P0 |
| - | 할일 검색 | 제목/내용 기반 검색 | P1 |
| - | 할일 필터링 | 날짜별, 상태별 필터 | P1 |
| - | 할일 정렬 | 날짜, 상태 기준 정렬 | P1 |

**비즈니스 규칙**:
- [BR-02] 사용자는 자신의 할일만 조회/수정/삭제 가능
- [BR-08] 할일 완료 시 isCompleted=true, status='completed'
- [BR-12] 만료일은 시작일과 같거나 이후여야 함
- [BR-13] 만료일 지난 할일은 UI에서 시각적 구분

#### 5.1.3 휴지통 관리

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| [UC-09] | 휴지통 조회 | 삭제된 할일 목록 조회 (status='deleted') | P0 |
| [UC-10] | 영구 삭제 | 휴지통의 할일을 DB에서 완전히 제거 | P0 |

**비즈니스 규칙**:
- [BR-05] 할일 삭제 시 휴지통으로 이동 (status='deleted', deletedAt 기록)
- [BR-06] 휴지통의 할일은 복원 가능
- [BR-07] 영구 삭제 시 DB에서 완전히 제거

#### 5.1.4 국경일 관리

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| [UC-11] | 국경일 조회 | 모든 사용자가 국경일 목록 조회 가능 | P0 |
| - | 국경일 추가 | 관리자만 새로운 국경일 추가 가능 | P1 |
| - | 국경일 수정 | 관리자만 기존 국경일 수정 가능 | P1 |

**비즈니스 규칙**:
- [BR-03] 모든 인증된 사용자가 조회 가능
- [BR-04] 관리자(role='admin')만 추가/수정 권한
- [BR-09] 관리자만 추가/수정 가능
- [BR-10] 국경일은 삭제 불가
- [BR-11] 매년 반복되는 일정 지원

### 5.2 기능 우선순위 정의

- **P0 (Must-have)**: MVP 출시에 필수적인 기능
- **P1 (Should-have)**: MVP에 포함되면 좋지만 필수는 아님
- **P2 (Nice-to-have)**: 2차 개발에서 고려

### 5.3 MVP 제외 기능 (2차 개발)

- 할일 카테고리/태그
- 할일 공유 기능
- 알림 기능 (이메일/푸시)
- 통계 및 리포트
- 협업 기능
- 반복 일정
- 캘린더 뷰

---

## 6. 비기능 요구사항

### 6.1 성능 요구사항

| 항목 | 요구사항 | 측정 방법 |
|------|----------|-----------|
| API 응답 시간 | 1,000ms 이내 | 95 percentile |
| 페이지 로딩 시간 | 3초 이내 | First Contentful Paint |
| 동시 접속자 | 100명 지원 | 로드 테스트 |
| 데이터베이스 성능 | 20,000개 할일 처리 가능 | 쿼리 성능 테스트 |

**성능 최적화 전략**:
- API 응답 최적화 (인덱싱, 쿼리 최적화)
- 프론트엔드 번들 크기 최소화
- 이미지 최적화
- Lazy Loading 적용

### 6.2 보안 요구사항

#### 필수 보안 조치

| 항목 | 구현 방법 | 우선순위 |
|------|-----------|----------|
| HTTPS 통신 | SSL/TLS 인증서 적용 | P0 |
| 비밀번호 암호화 | bcrypt 해싱 (salt rounds: 10) | P0 |
| JWT 인증 | Access Token (15분) + Refresh Token (7일) | P0 |
| CORS 정책 | 허용된 Origin만 접근 가능 | P0 |
| SQL Injection 방어 | Prepared Statements, ORM 사용 | P0 |
| XSS 방어 | 입력 값 sanitization, CSP 헤더 | P0 |
| Rate Limiting | API 호출 제한 (100 req/min per user) | P1 |

**보안 규칙** (도메인 정의서 참조):
- [BR-01] 인증된 사용자만 접근 가능
- [BR-02] 사용자는 타인의 할일 접근 불가

### 6.3 확장성 요구사항

| 항목 | 목표 | 구현 전략 |
|------|------|-----------|
| 사용자 규모 | 1,000명 지원 | PostgreSQL 최적화 |
| 데이터 규모 | 20,000개 할일 | 인덱싱, 페이지네이션 |
| 향후 확장 | 수평 확장 가능 구조 | Stateless 아키텍처 |

### 6.4 가용성 요구사항

- **목표 Uptime**: 99% (MVP 기준)
- **백업**: 일일 데이터베이스 백업 (Supabase 자동 백업)
- **장애 복구**: 24시간 이내 복구

### 6.5 접근성 요구사항

- **WCAG 2.1 AA 준수**
- 색상 대비율: 4.5:1 이상
- 키보드 네비게이션 지원
- 스크린 리더 호환성

### 6.6 브라우저 호환성

| 브라우저 | 최소 지원 버전 |
|----------|----------------|
| Chrome | 최신 2개 버전 |
| Firefox | 최신 2개 버전 |
| Safari | 최신 2개 버전 |
| Edge | 최신 2개 버전 |
| Mobile Safari (iOS) | iOS 14+ |
| Chrome Mobile (Android) | Android 10+ |

---

## 7. 기술 스택

### 7.1 프론트엔드

```
Framework: React 18
State Management: Zustand
Styling: Tailwind CSS
HTTP Client: Axios
Routing: React Router v6
Form Handling: React Hook Form
Validation: Zod
Build Tool: Vite
```

**주요 라이브러리**:
- `react`: 18.x
- `zustand`: 상태 관리
- `tailwindcss`: 유틸리티 우선 CSS
- `axios`: HTTP 통신
- `react-router-dom`: 라우팅
- `react-hook-form`: 폼 관리
- `zod`: 스키마 검증
- `date-fns`: 날짜 처리
- `lucide-react`: 아이콘

### 7.2 백엔드

```
Runtime: Node.js 18+
Framework: Express.js
API Style: REST API
Authentication: JWT (jsonwebtoken)
Password Hashing: bcrypt
Validation: express-validator
ORM: Prisma
```

**주요 라이브러리**:
- `express`: 4.x
- `jsonwebtoken`: JWT 인증
- `bcrypt`: 비밀번호 해싱
- `prisma`: ORM
- `express-validator`: 요청 검증
- `cors`: CORS 설정
- `helmet`: 보안 헤더
- `express-rate-limit`: Rate limiting

### 7.3 데이터베이스

```
Database: PostgreSQL 15+
Hosting: Supabase
ORM: Prisma
```

**데이터베이스 기능**:
- 트랜잭션 지원
- 인덱싱 최적화
- 자동 백업 (Supabase)
- Connection Pooling

### 7.4 배포 및 인프라

```
Frontend Hosting: Vercel
Backend Hosting: Vercel (Serverless Functions)
Database Hosting: Supabase PostgreSQL
CI/CD: GitHub Actions (2차 개발)
Version Control: Git + GitHub
```

**배포 전략**:
- 프론트엔드: Vercel 자동 배포
- 백엔드: Vercel Serverless Functions
- 환경 변수 관리: Vercel Environment Variables
- 도메인: Vercel 제공 도메인 (커스텀 도메인은 선택)

### 7.5 개발 도구

```
Code Editor: VS Code
Linting: ESLint
Formatting: Prettier
Type Checking: TypeScript (선택)
API Testing: Postman / Thunder Client
Version Control: Git
```

---

## 8. 데이터 모델

### 8.1 ERD (Entity Relationship Diagram)

```
┌─────────────────┐
│     User        │
├─────────────────┤
│ userId (PK)     │
│ email (unique)  │
│ password        │
│ username        │
│ role            │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│      Todo       │
├─────────────────┤
│ todoId (PK)     │
│ userId (FK)     │
│ title           │
│ content         │
│ startDate       │
│ dueDate         │
│ status          │
│ isCompleted     │
│ createdAt       │
│ updatedAt       │
│ deletedAt       │
└─────────────────┘

┌─────────────────┐
│    Holiday      │
├─────────────────┤
│ holidayId (PK)  │
│ title           │
│ date            │
│ description     │
│ isRecurring     │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

### 8.2 엔티티 상세

#### User (사용자)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| userId | UUID | PK | 사용자 고유 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 로그인 이메일 |
| password | VARCHAR(255) | NOT NULL | bcrypt 해시된 비밀번호 |
| username | VARCHAR(100) | NOT NULL | 사용자 이름 |
| role | ENUM('user', 'admin') | NOT NULL, DEFAULT 'user' | 사용자 역할 |
| createdAt | TIMESTAMP | NOT NULL | 가입일시 |
| updatedAt | TIMESTAMP | NOT NULL | 최종 수정일시 |

**인덱스**:
- PRIMARY KEY: userId
- UNIQUE INDEX: email
- INDEX: role (관리자 조회용)

#### Todo (할일)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| todoId | UUID | PK | 할일 고유 ID |
| userId | UUID | FK, NOT NULL | 소유자 ID |
| title | VARCHAR(200) | NOT NULL | 할일 제목 |
| content | TEXT | NULL | 할일 상세 내용 |
| startDate | DATE | NULL | 시작일 |
| dueDate | DATE | NULL | 만료일 |
| status | ENUM('active', 'completed', 'deleted') | NOT NULL, DEFAULT 'active' | 할일 상태 |
| isCompleted | BOOLEAN | NOT NULL, DEFAULT false | 완료 여부 |
| createdAt | TIMESTAMP | NOT NULL | 생성일시 |
| updatedAt | TIMESTAMP | NOT NULL | 최종 수정일시 |
| deletedAt | TIMESTAMP | NULL | 삭제일시 (소프트 삭제) |

**제약 조건**:
- CHECK: dueDate >= startDate (만료일은 시작일 이후)
- FOREIGN KEY: userId REFERENCES User(userId) ON DELETE CASCADE

**인덱스**:
- PRIMARY KEY: todoId
- INDEX: userId, status (사용자별 상태 조회)
- INDEX: dueDate (만료일 기준 정렬)
- INDEX: deletedAt (휴지통 조회)

#### Holiday (국경일)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| holidayId | UUID | PK | 국경일 고유 ID |
| title | VARCHAR(100) | NOT NULL | 국경일 이름 |
| date | DATE | NOT NULL | 국경일 날짜 |
| description | TEXT | NULL | 설명 |
| isRecurring | BOOLEAN | NOT NULL, DEFAULT true | 매년 반복 여부 |
| createdAt | TIMESTAMP | NOT NULL | 생성일시 |
| updatedAt | TIMESTAMP | NOT NULL | 최종 수정일시 |

**인덱스**:
- PRIMARY KEY: holidayId
- INDEX: date (날짜 기준 조회)

### 8.3 Prisma 스키마 예시

```prisma
model User {
  userId    String   @id @default(uuid())
  email     String   @unique
  password  String
  username  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  todos     Todo[]

  @@index([role])
}

model Todo {
  todoId      String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [userId], onDelete: Cascade)
  title       String
  content     String?
  startDate   DateTime?
  dueDate     DateTime?
  status      TodoStatus @default(ACTIVE)
  isCompleted Boolean    @default(false)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  deletedAt   DateTime?

  @@index([userId, status])
  @@index([dueDate])
  @@index([deletedAt])
}

model Holiday {
  holidayId   String   @id @default(uuid())
  title       String
  date        DateTime
  description String?
  isRecurring Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([date])
}

enum Role {
  USER
  ADMIN
}

enum TodoStatus {
  ACTIVE
  COMPLETED
  DELETED
}
```

---

## 9. API 설계

### 9.1 API 기본 정보

**베이스 URL**: `http://localhost:3000/api` (개발), `https://your-domain.vercel.app/api` (프로덕션)

**인증 방식**: JWT Bearer Token

**응답 형식**: JSON

**에러 형식**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

### 9.2 인증 API

#### POST /api/auth/register
회원가입

**요청**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "홍길동"
}
```

**응답** (201 Created):
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "username": "홍길동",
    "role": "user"
  }
}
```

**에러**:
- 400: 이메일 형식 오류, 비밀번호 길이 부족
- 409: 이메일 중복

#### POST /api/auth/login
로그인

**요청**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "user": {
      "userId": "uuid",
      "email": "user@example.com",
      "username": "홍길동",
      "role": "user"
    }
  }
}
```

**에러**:
- 401: 이메일 또는 비밀번호 오류

#### POST /api/auth/refresh
토큰 갱신

**요청**:
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**응답** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-access-token"
  }
}
```

**에러**:
- 401: 유효하지 않은 Refresh Token

#### POST /api/auth/logout
로그아웃

**요청 헤더**:
```
Authorization: Bearer {accessToken}
```

**응답** (200 OK):
```json
{
  "success": true,
  "message": "로그아웃 되었습니다"
}
```

### 9.3 할일 API

#### GET /api/todos
할일 목록 조회

**요청 헤더**:
```
Authorization: Bearer {accessToken}
```

**쿼리 파라미터**:
- `status`: active | completed | deleted (선택)
- `search`: 검색어 (선택)
- `sortBy`: dueDate | createdAt (선택, 기본: createdAt)
- `order`: asc | desc (선택, 기본: desc)

**응답** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "todoId": "uuid",
      "title": "프로젝트 마감",
      "content": "PRD 작성 완료하기",
      "startDate": "2025-11-25",
      "dueDate": "2025-11-28",
      "status": "active",
      "isCompleted": false,
      "createdAt": "2025-11-25T10:00:00Z",
      "updatedAt": "2025-11-25T10:00:00Z"
    }
  ]
}
```

#### POST /api/todos
할일 생성

**요청**:
```json
{
  "title": "프로젝트 마감",
  "content": "PRD 작성 완료하기",
  "startDate": "2025-11-25",
  "dueDate": "2025-11-28"
}
```

**응답** (201 Created):
```json
{
  "success": true,
  "data": {
    "todoId": "uuid",
    "title": "프로젝트 마감",
    "content": "PRD 작성 완료하기",
    "startDate": "2025-11-25",
    "dueDate": "2025-11-28",
    "status": "active",
    "isCompleted": false
  }
}
```

**에러**:
- 400: title 누락, dueDate < startDate

#### GET /api/todos/:id
할일 상세 조회

**응답** (200 OK):
```json
{
  "success": true,
  "data": {
    "todoId": "uuid",
    "title": "프로젝트 마감",
    "content": "PRD 작성 완료하기",
    "startDate": "2025-11-25",
    "dueDate": "2025-11-28",
    "status": "active",
    "isCompleted": false
  }
}
```

**에러**:
- 404: 할일을 찾을 수 없음
- 403: 권한 없음 (타인의 할일)

#### PUT /api/todos/:id
할일 수정

**요청**:
```json
{
  "title": "프로젝트 마감 (수정)",
  "content": "PRD 작성 및 검토 완료",
  "startDate": "2025-11-25",
  "dueDate": "2025-11-29"
}
```

**응답** (200 OK):
```json
{
  "success": true,
  "data": {
    "todoId": "uuid",
    "title": "프로젝트 마감 (수정)",
    "content": "PRD 작성 및 검토 완료",
    "dueDate": "2025-11-29"
  }
}
```

#### PATCH /api/todos/:id/complete
할일 완료

**응답** (200 OK):
```json
{
  "success": true,
  "data": {
    "todoId": "uuid",
    "status": "completed",
    "isCompleted": true
  }
}
```

#### DELETE /api/todos/:id
할일 삭제 (휴지통 이동)

**응답** (200 OK):
```json
{
  "success": true,
  "message": "할일이 휴지통으로 이동되었습니다",
  "data": {
    "todoId": "uuid",
    "status": "deleted",
    "deletedAt": "2025-11-25T15:00:00Z"
  }
}
```

#### PATCH /api/todos/:id/restore
할일 복원

**응답** (200 OK):
```json
{
  "success": true,
  "message": "할일이 복원되었습니다",
  "data": {
    "todoId": "uuid",
    "status": "active",
    "deletedAt": null
  }
}
```

### 9.4 휴지통 API

#### GET /api/trash
휴지통 조회

**요청 헤더**:
```
Authorization: Bearer {accessToken}
```

**응답** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "todoId": "uuid",
      "title": "삭제된 할일",
      "status": "deleted",
      "deletedAt": "2025-11-25T15:00:00Z"
    }
  ]
}
```

#### DELETE /api/trash/:id
영구 삭제

**응답** (200 OK):
```json
{
  "success": true,
  "message": "할일이 영구적으로 삭제되었습니다"
}
```

**에러**:
- 400: 활성 상태의 할일은 영구 삭제 불가
- 404: 할일을 찾을 수 없음

### 9.5 국경일 API

#### GET /api/holidays
국경일 조회

**쿼리 파라미터**:
- `year`: 연도 (선택, 기본: 현재 연도)
- `month`: 월 (선택)

**응답** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "holidayId": "uuid",
      "title": "신정",
      "date": "2025-01-01",
      "description": "새해 첫날",
      "isRecurring": true
    },
    {
      "holidayId": "uuid",
      "title": "설날",
      "date": "2025-01-29",
      "description": "음력 1월 1일",
      "isRecurring": true
    }
  ]
}
```

#### POST /api/holidays
국경일 추가 (관리자 전용)

**요청 헤더**:
```
Authorization: Bearer {accessToken}
X-Admin-Role: required
```

**요청**:
```json
{
  "title": "광복절",
  "date": "2025-08-15",
  "description": "대한민국 독립 기념일",
  "isRecurring": true
}
```

**응답** (201 Created):
```json
{
  "success": true,
  "data": {
    "holidayId": "uuid",
    "title": "광복절",
    "date": "2025-08-15",
    "isRecurring": true
  }
}
```

**에러**:
- 403: 관리자 권한 필요

#### PUT /api/holidays/:id
국경일 수정 (관리자 전용)

**요청**:
```json
{
  "title": "광복절",
  "date": "2025-08-15",
  "description": "수정된 설명"
}
```

**응답** (200 OK):
```json
{
  "success": true,
  "data": {
    "holidayId": "uuid",
    "title": "광복절",
    "description": "수정된 설명"
  }
}
```

### 9.6 사용자 API

#### GET /api/users/me
현재 사용자 프로필 조회

**요청 헤더**:
```
Authorization: Bearer {accessToken}
```

**응답** (200 OK):
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "username": "홍길동",
    "role": "user",
    "createdAt": "2025-11-01T00:00:00Z"
  }
}
```

#### PATCH /api/users/me
현재 사용자 프로필 수정

**요청**:
```json
{
  "username": "새이름",
  "password": "newpassword123"
}
```

**응답** (200 OK):
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "새이름"
  }
}
```

### 9.7 에러 코드 정의

| HTTP 상태 | 에러 코드 | 설명 |
|-----------|-----------|------|
| 400 | BAD_REQUEST | 잘못된 요청 |
| 400 | INVALID_DATE_RANGE | 만료일이 시작일보다 이전 |
| 400 | TITLE_REQUIRED | 제목 필수 입력 |
| 401 | UNAUTHORIZED | 인증 실패 |
| 401 | TOKEN_EXPIRED | 토큰 만료 |
| 401 | INVALID_TOKEN | 유효하지 않은 토큰 |
| 403 | FORBIDDEN | 권한 없음 |
| 403 | ADMIN_REQUIRED | 관리자 권한 필요 |
| 404 | NOT_FOUND | 리소스 없음 |
| 404 | TODO_NOT_FOUND | 할일을 찾을 수 없음 |
| 404 | USER_NOT_FOUND | 사용자를 찾을 수 없음 |
| 409 | CONFLICT | 중복 데이터 |
| 409 | EMAIL_EXISTS | 이메일 중복 |
| 409 | ALREADY_DELETED | 이미 삭제된 할일 |
| 429 | TOO_MANY_REQUESTS | 요청 횟수 초과 |
| 500 | INTERNAL_ERROR | 서버 내부 오류 |

---

## 10. UI/UX 요구사항

### 10.1 화면 구성

#### 필수 화면

| 화면 | 라우트 | 설명 | 우선순위 |
|------|--------|------|----------|
| 로그인 | `/login` | 이메일/비밀번호 로그인 | P0 |
| 회원가입 | `/register` | 신규 사용자 등록 | P0 |
| 할일 목록 (메인) | `/` | 할일 목록 조회 및 관리 | P0 |
| 할일 상세/수정 | `/todos/:id` | 모달 또는 별도 페이지 | P0 |
| 휴지통 | `/trash` | 삭제된 할일 관리 | P0 |
| 국경일 조회 | `/holidays` | 국경일 목록 (할일 목록과 통합 가능) | P0 |
| 관리자 화면 | `/admin/holidays` | 국경일 관리 (관리자 전용) | P1 |
| 프로필 | `/profile` | 사용자 정보 조회/수정 | P1 |

#### 화면 플로우

```
[로그인] → [할일 목록 (메인)]
            ├→ [할일 추가 모달]
            ├→ [할일 상세/수정 모달]
            ├→ [휴지통]
            ├→ [국경일 조회]
            └→ [프로필]

[회원가입] → [로그인]

[관리자] → [관리자 화면 (국경일 관리)]
```

### 10.2 디자인 방향

**스타일**: 모던하고 세련된 디자인
**참조**: 네이버 캘린더 UI ([스타일 가이드](./4-style-guide.md) 참조)

**핵심 원칙**:
1. **단순함**: 불필요한 장식 없이 깔끔한 인터페이스
2. **명확성**: 직관적인 아이콘과 레이블
3. **일관성**: 모든 화면에서 동일한 디자인 패턴
4. **반응성**: 데스크톱과 모바일 모두 최적화

**색상 체계**:
- Primary: 네이버 그린 (#00C73C)
- 할일 상태:
  - 진행 중: 주황색 (#FF7043)
  - 완료: 초록색 (#66BB6A)
  - 삭제: 회색 (#BDBDBD)
- 국경일: 빨간색 (#E53935)

### 10.3 컴포넌트 구성

#### 공통 컴포넌트

1. **Header (헤더)**
   - 로고
   - 사용자 정보 (드롭다운)
   - 로그아웃 버튼

2. **Sidebar (사이드바)** - 선택
   - 할일 목록
   - 휴지통
   - 국경일
   - 설정

3. **Button (버튼)**
   - Primary, Secondary, Icon 버튼
   - Hover/Active 상태

4. **Input Field (입력 필드)**
   - Text, Email, Password, Date
   - 에러 상태 표시

5. **Modal (모달)**
   - 할일 추가/수정 모달
   - 확인 다이얼로그

6. **TodoCard (할일 카드)**
   - 제목, 내용, 날짜
   - 완료 체크박스
   - 수정/삭제 버튼
   - 상태별 색상 구분

7. **Calendar (캘린더)** - 2차 개발
   - 월간 캘린더 그리드
   - 할일 바 표시
   - 국경일 표시

### 10.4 반응형 디자인

**지원 디바이스**:
- 데스크톱 (1024px+)
- 모바일 (< 768px)

**브레이크포인트**:
```css
mobile: 480px
tablet: 768px
desktop: 1024px
wide: 1440px
```

**모바일 최적화**:
- 터치 친화적인 버튼 크기 (최소 44x44px)
- 스와이프 제스처 지원 (할일 삭제 등)
- 하단 고정 네비게이션 바
- 풀스크린 모달

### 10.5 다크모드

**지원 여부**: 예 (P1 우선순위)

**구현 방법**:
- Tailwind CSS `dark:` 유틸리티 사용
- 사용자 설정 저장 (LocalStorage)
- 시스템 설정 감지 (`prefers-color-scheme`)

**다크모드 색상**:
- 배경: #1A1A1A
- 텍스트: #E5E5E5
- Primary: #00E047 (밝은 그린)

### 10.6 접근성

- **키보드 네비게이션**: Tab, Enter, ESC 지원
- **포커스 인디케이터**: 명확한 포커스 스타일
- **스크린 리더**: aria-label, role 속성 사용
- **색상 대비**: WCAG AA 기준 (4.5:1)

---

## 11. 일정 및 마일스톤

### 11.1 전체 일정

**프로젝트 기간**: 2025-11-25 ~ 2025-11-28 (4일)
**목표 런칭일**: 2025-11-28 오후

### 11.2 상세 일정

#### Phase 1: 기획 및 설계 (완료)

| 항목 | 목표 완료일 | 상태 |
|------|-------------|------|
| 도메인 정의서 작성 | 2025-11-25 | ✅ 완료 |
| PRD 작성 | 2025-11-25 | ✅ 완료 |
| 스타일 가이드 작성 | 2025-11-25 | ✅ 완료 |
| DB 스키마 설계 | 2025-11-25 | 진행 중 |
| API 명세 완료 | 2025-11-26 | 예정 |

#### Phase 2: 백엔드 개발

**기간**: 2025-11-26

| 항목 | 담당 | 예상 시간 |
|------|------|-----------|
| 프로젝트 초기 설정 | Backend | 1h |
| Prisma 스키마 작성 및 마이그레이션 | Backend | 1h |
| 인증 API 구현 (회원가입, 로그인, 토큰 갱신) | Backend | 3h |
| 할일 CRUD API 구현 | Backend | 4h |
| 휴지통 API 구현 | Backend | 2h |
| 국경일 API 구현 | Backend | 2h |
| 미들웨어 (인증, 에러 핸들링, Rate Limiting) | Backend | 2h |
| API 테스트 (Postman) | Backend | 2h |

**총 예상 시간**: 17시간

#### Phase 3: 프론트엔드 개발

**기간**: 2025-11-27 ~ 2025-11-28 오전

| 항목 | 담당 | 예상 시간 |
|------|------|-----------|
| 프로젝트 초기 설정 (React + Vite + Tailwind) | Frontend | 1h |
| 라우팅 및 레이아웃 구조 | Frontend | 2h |
| 공통 컴포넌트 구현 (Button, Input, Modal) | Frontend | 3h |
| 인증 화면 (로그인, 회원가입) | Frontend | 3h |
| 할일 목록 화면 | Frontend | 4h |
| 할일 추가/수정 모달 | Frontend | 3h |
| 휴지통 화면 | Frontend | 2h |
| 국경일 화면 | Frontend | 2h |
| 프로필 화면 | Frontend | 2h |
| 상태 관리 (Zustand) | Frontend | 2h |
| API 연동 (Axios) | Frontend | 4h |
| 반응형 디자인 적용 | Frontend | 3h |
| 다크모드 구현 | Frontend | 2h |

**총 예상 시간**: 33시간 → **2일 소요** (하루 16시간 작업 기준)

#### Phase 4: 통합 및 테스트

**기간**: 2025-11-28

| 항목 | 담당 | 예상 시간 |
|------|------|-----------|
| 프론트엔드-백엔드 통합 테스트 | Full Stack | 2h |
| 버그 수정 | Full Stack | 2h |
| 크로스 브라우저 테스트 | Frontend | 1h |
| 모바일 반응형 테스트 | Frontend | 1h |
| 성능 최적화 | Full Stack | 2h |

**총 예상 시간**: 8시간

#### Phase 5: 배포 및 런칭

**기간**: 2025-11-28 오후

| 항목 | 담당 | 예상 시간 |
|------|------|-----------|
| Vercel 프론트엔드 배포 | Frontend | 1h |
| Vercel 백엔드 배포 | Backend | 1h |
| Supabase DB 설정 | Backend | 1h |
| 환경 변수 설정 | Full Stack | 0.5h |
| 프로덕션 테스트 | Full Stack | 1h |
| 런칭 | - | - |

**총 예상 시간**: 4.5시간

### 11.3 마일스톤

| 마일스톤 | 날짜 | 목표 |
|----------|------|------|
| M1: 기획 완료 | 2025-11-25 | 도메인 정의서, PRD, API 명세 완료 |
| M2: 백엔드 완료 | 2025-11-26 | 모든 API 구현 및 테스트 완료 |
| M3: 프론트엔드 완료 | 2025-11-28 오전 | 모든 화면 구현 및 API 연동 완료 |
| M4: 통합 테스트 완료 | 2025-11-28 오전 | E2E 테스트 및 버그 수정 완료 |
| M5: 런칭 | 2025-11-28 오후 | 프로덕션 배포 완료 |

### 11.4 리스크 및 일정 버퍼

**주요 리스크**:
1. 기술 학습 곡선 (React 18, Zustand, Prisma)
2. API 통합 이슈
3. 배포 설정 문제

**대응 방안**:
- 각 Phase마다 2-4시간 버퍼 포함
- 우선순위 낮은 기능 (P1)은 시간 부족 시 제외
- 다크모드, 검색/필터는 선택적 구현

---

## 12. 리스크 및 제약사항

### 12.1 기술적 리스크

| 리스크 | 영향도 | 확률 | 대응 방안 |
|--------|--------|------|-----------|
| **새로운 기술 스택 학습** | High | High | - 공식 문서 우선 참고<br>- 간단한 예제부터 시작<br>- 커뮤니티 활용 |
| **Prisma + Supabase 통합** | Medium | Medium | - Prisma 공식 Supabase 가이드 참조<br>- Connection String 설정 주의 |
| **JWT 토큰 관리** | Medium | Medium | - 토큰 갱신 로직 명확화<br>- Refresh Token 저장 방식 결정 (Cookie vs LocalStorage) |
| **CORS 이슈** | Low | Medium | - Express CORS 미들웨어 설정<br>- Vercel 환경 변수 확인 |
| **성능 최적화** | Medium | Low | - 인덱싱 적용<br>- Lazy Loading<br>- 번들 크기 최소화 |

### 12.2 일정 리스크

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| **프론트엔드 개발 지연** | High | - 우선순위 낮은 기능 제외 (다크모드, 검색)<br>- UI 단순화 |
| **API 통합 이슈** | Medium | - API 명세 사전 합의<br>- Mock 데이터로 프론트 먼저 개발 |
| **배포 설정 시간 초과** | Medium | - Vercel 템플릿 활용<br>- 배포 가이드 사전 숙지 |

### 12.3 외부 의존성

| 의존성 | 리스크 | 대응 방안 |
|--------|--------|-----------|
| **Supabase 서비스** | 서비스 다운타임 | - 로컬 PostgreSQL 백업 환경 구축<br>- Supabase 상태 페이지 모니터링 |
| **Vercel 배포** | 배포 실패 | - 로컬 테스트 철저히<br>- Vercel 로그 확인 |
| **국경일 데이터** | 데이터 정확성 | - 공공데이터포털 또는 수동 입력<br>- 관리자 화면으로 수정 가능 |

### 12.4 기술적 제약사항

**도메인 정의서 참조**:

1. **인증**:
   - JWT 기반 인증 (Access Token 15분, Refresh Token 7일)
   - 비밀번호 bcrypt 해싱

2. **데이터**:
   - 소프트 삭제 방식 (복원 가능성 보장)
   - 할일 제목 필수 입력
   - 이메일 고유성
   - 만료일 >= 시작일

3. **보안**:
   - HTTPS 필수
   - CORS 정책 설정
   - SQL Injection / XSS 방어
   - Rate Limiting

### 12.5 비즈니스 제약사항

1. **개발 기간**: 4일 이내 완료 필수
2. **인력**: 1인 개발 (풀스택)
3. **예산**: 무료 티어 활용 (Vercel, Supabase)
4. **범위**: MVP 기능만 우선 구현, 추가 기능은 2차 개발

### 12.6 데이터 제약사항

**도메인 정의서 5.3 참조**:
- 할일 제목: 필수 입력, VARCHAR(200)
- 이메일: 고유, VARCHAR(255)
- 비밀번호: bcrypt 해싱, VARCHAR(255)
- 날짜: dueDate >= startDate

### 12.7 리스크 완화 전략

1. **MVP 범위 엄격히 준수**
   - P0 기능만 우선 구현
   - P1 기능은 시간 여유 시 추가

2. **단계별 테스트**
   - 각 Phase 완료 후 테스트
   - 문제 조기 발견 및 해결

3. **문서화**
   - API 명세 명확히
   - 코드 주석 작성
   - README 작성

4. **버퍼 시간 확보**
   - 각 Phase에 여유 시간 포함
   - 예상치 못한 이슈 대응

---

## 13. 부록

### 13.1 참조 문서

- [도메인 정의서 v1.1](./1-domain-definition.md)
- [PRD 입력 템플릿](./2-prd-input-template.md)
- [스타일 가이드](./4-style-guide.md)

### 13.2 관련 링크

**기술 문서**:
- [React 18 공식 문서](https://react.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Express.js](https://expressjs.com/)
- [Vercel](https://vercel.com/docs)
- [Supabase](https://supabase.com/docs)

**디자인 참조**:
- [네이버 캘린더](https://calendar.naver.com/)
- [Material Design](https://material.io/)

### 13.3 용어 정의

| 용어 | 정의 |
|------|------|
| **MVP** | Minimum Viable Product - 최소 기능 제품 |
| **JWT** | JSON Web Token - 토큰 기반 인증 방식 |
| **소프트 삭제** | 데이터를 실제로 삭제하지 않고 상태만 변경 |
| **REST API** | Representational State Transfer - RESTful 아키텍처 기반 API |
| **ORM** | Object-Relational Mapping - 객체-관계 매핑 |
| **DAU** | Daily Active Users - 일일 활성 사용자 |
| **MAU** | Monthly Active Users - 월간 활성 사용자 |
| **KPI** | Key Performance Indicator - 핵심 성과 지표 |

### 13.4 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2025-11-25 | 초안 작성 | Claude |

---

## 승인

| 역할 | 이름 | 서명 | 날짜 |
|------|------|------|------|
| Product Owner | - | - | - |
| Tech Lead | - | - | - |
| Designer | - | - | - |

---

**문서 종료**