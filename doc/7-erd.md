# lyjoo-TodoList 데이터 모델 (ERD)

**버전**: 1.0
**작성일**: 2025-11-26
**상태**: 최종
**작성자**: Claude
**참조 문서**:
- [도메인 정의서](./1-domain-definition.md)
- [PRD](./3-prd.md)
- [프로젝트 구조](./5-project-structure.md)
- [아키텍처 다이어그램](./6-arch-diagram.md)

---

## 목차

1. [ERD 다이어그램](#1-erd-다이어그램)
2. [엔티티 상세](#2-엔티티-상세)
3. [관계 설명](#3-관계-설명)
4. [인덱스 전략](#4-인덱스-전략)
5. [Prisma 스키마](#5-prisma-스키마)
6. [마이그레이션 가이드](#6-마이그레이션-가이드)

---

## 1. ERD 다이어그램

### 1.1 전체 ERD (Mermaid)

```mermaid
erDiagram
    User ||--o{ Todo : "owns"

    User {
        uuid userId PK "사용자 고유 ID"
        varchar email UK "로그인 이메일"
        varchar password "bcrypt 해시된 비밀번호"
        varchar username "사용자 이름"
        enum role "사용자 역할 (user, admin)"
        timestamp createdAt "가입일시"
        timestamp updatedAt "최종 수정일시"
    }

    Todo {
        uuid todoId PK "할일 고유 ID"
        uuid userId FK "소유자 ID"
        varchar title "할일 제목"
        text content "할일 상세 내용"
        date startDate "시작일"
        date dueDate "만료일"
        enum status "할일 상태 (active, completed, deleted)"
        boolean isCompleted "완료 여부"
        timestamp createdAt "생성일시"
        timestamp updatedAt "최종 수정일시"
        timestamp deletedAt "삭제일시 (소프트 삭제)"
    }

    Holiday {
        uuid holidayId PK "국경일 고유 ID"
        varchar title "국경일 이름"
        date date "국경일 날짜"
        text description "설명"
        boolean isRecurring "매년 반복 여부"
        timestamp createdAt "생성일시"
        timestamp updatedAt "최종 수정일시"
    }
```

### 1.2 엔티티 개요

lyjoo-secure-to-do-list 시스템은 3개의 핵심 엔티티로 구성됩니다:

| 엔티티 | 설명 | 주요 역할 |
|--------|------|-----------|
| **User** | 사용자 정보 | 인증 및 권한 관리 |
| **Todo** | 할일 정보 | 개인 할일 관리 및 추적 |
| **Holiday** | 국경일 정보 | 공통 국경일 데이터 제공 |

**엔티티 간 관계**:
- User와 Todo는 1:N 관계 (한 사용자가 여러 할일을 소유)
- Holiday는 독립적인 엔티티 (모든 사용자가 공통으로 조회)

---

## 2. 엔티티 상세

### 2.1 User (사용자)

사용자 계정 및 인증 정보를 저장하는 엔티티입니다.

| 필드명 | 데이터 타입 | 제약 조건 | 기본값 | 설명 |
|--------|-------------|-----------|--------|------|
| `userId` | UUID | PRIMARY KEY | uuid() | 사용자 고유 식별자 |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | - | 로그인 이메일 주소 |
| `password` | VARCHAR(255) | NOT NULL | - | bcrypt 해시된 비밀번호 (salt rounds: 10) |
| `username` | VARCHAR(100) | NOT NULL | - | 사용자 표시 이름 |
| `role` | ENUM('USER', 'ADMIN') | NOT NULL | 'USER' | 사용자 권한 레벨 |
| `createdAt` | TIMESTAMP | NOT NULL | now() | 계정 생성일시 |
| `updatedAt` | TIMESTAMP | NOT NULL | now() | 최종 정보 수정일시 (자동 갱신) |

**비즈니스 규칙**:
- [BR-01] 모든 API 접근은 인증된 사용자만 가능
- [BR-02] 사용자는 자신의 데이터만 조회/수정 가능
- 이메일은 계정의 유일한 식별자로 중복 불가
- 비밀번호는 평문 저장 불가 (bcrypt 해싱 필수)
- role='ADMIN' 사용자만 국경일 관리 가능

---

### 2.2 Todo (할일)

사용자의 개인 할일 정보를 저장하는 엔티티입니다.

| 필드명 | 데이터 타입 | 제약 조건 | 기본값 | 설명 |
|--------|-------------|-----------|--------|------|
| `todoId` | UUID | PRIMARY KEY | uuid() | 할일 고유 식별자 |
| `userId` | UUID | FOREIGN KEY, NOT NULL | - | 할일 소유자 (User.userId 참조) |
| `title` | VARCHAR(200) | NOT NULL | - | 할일 제목 |
| `content` | TEXT | NULL | null | 할일 상세 설명 (선택) |
| `startDate` | DATE | NULL | null | 할일 시작일 (선택) |
| `dueDate` | DATE | NULL, CHECK(dueDate >= startDate) | null | 할일 만료일 (선택, 시작일 이후) |
| `status` | ENUM('ACTIVE', 'COMPLETED', 'DELETED') | NOT NULL | 'ACTIVE' | 할일 상태 |
| `isCompleted` | BOOLEAN | NOT NULL | false | 완료 여부 플래그 |
| `createdAt` | TIMESTAMP | NOT NULL | now() | 할일 생성일시 |
| `updatedAt` | TIMESTAMP | NOT NULL | now() | 최종 수정일시 (자동 갱신) |
| `deletedAt` | TIMESTAMP | NULL | null | 소프트 삭제 일시 (삭제 시 기록) |

**외래 키 제약**:
- `userId` → `User.userId` (ON DELETE CASCADE)
  - 사용자 삭제 시 해당 사용자의 모든 할일도 함께 삭제

**체크 제약**:
- `dueDate >= startDate`: 만료일은 시작일보다 이전일 수 없음

**비즈니스 규칙**:
- [BR-05] 할일 삭제 시 DB에서 제거하지 않고 status='DELETED', deletedAt 기록
- [BR-06] 휴지통의 할일은 복원 가능
- [BR-07] 영구 삭제 시에만 DB에서 완전 제거
- [BR-08] 할일 완료 시 isCompleted=true, status='COMPLETED' 동시 설정
- [BR-12] 만료일은 시작일과 같거나 이후여야 함
- [BR-13] 만료일 지난 할일은 UI에서 시각적으로 구분 표시

**상태 전이 다이어그램**:
```
active → completed (완료)
active → deleted (삭제)
deleted → active (복원)
deleted → [영구 삭제] (DB에서 제거)
```

---

### 2.3 Holiday (국경일)

대한민국 공휴일 및 국경일 정보를 저장하는 엔티티입니다.

| 필드명 | 데이터 타입 | 제약 조건 | 기본값 | 설명 |
|--------|-------------|-----------|--------|------|
| `holidayId` | UUID | PRIMARY KEY | uuid() | 국경일 고유 식별자 |
| `title` | VARCHAR(100) | NOT NULL | - | 국경일 이름 (예: 신정, 설날, 광복절) |
| `date` | DATE | NOT NULL | - | 국경일 날짜 |
| `description` | TEXT | NULL | null | 국경일 상세 설명 (선택) |
| `isRecurring` | BOOLEAN | NOT NULL | true | 매년 반복 여부 (대부분 true) |
| `createdAt` | TIMESTAMP | NOT NULL | now() | 데이터 생성일시 |
| `updatedAt` | TIMESTAMP | NOT NULL | now() | 최종 수정일시 (자동 갱신) |

**비즈니스 규칙**:
- [BR-03] 모든 인증된 사용자가 조회 가능 (공개 데이터)
- [BR-04] 관리자(role='admin')만 수동 추가/수정 권한 보유
- [BR-09] 국경일은 공공데이터포털 API에서 자동 동기화 (일 1회)
- [BR-09a] API 동기화 실패 시 DB 캐시 데이터 사용
- [BR-10] 국경일은 삭제 불가 (비활성화만 가능)
- [BR-11] 매년 반복되는 일정 지원 (isRecurring=true)

**데이터 소스**:
1. **1차**: 공공데이터포털 API (자동 동기화, 일 1회)
2. **2차**: DB 저장된 캐시 데이터 (API 장애 시 폴백)
3. **3차**: 관리자 수동 입력 (API 미제공 항목)

---

## 3. 관계 설명

### 3.1 User ↔ Todo (1:N)

**관계 유형**: 1:N (One-to-Many)

**설명**:
- 한 명의 사용자(User)는 여러 개의 할일(Todo)을 가질 수 있습니다
- 각 할일(Todo)은 정확히 한 명의 사용자(User)에게 속합니다

**관계 세부사항**:
```
User.userId (1) ----< Todo.userId (N)
```

**외래 키**:
- `Todo.userId` → `User.userId`
- ON DELETE CASCADE: 사용자 삭제 시 해당 사용자의 모든 할일도 함께 삭제

**비즈니스 의미**:
- 사용자는 자신의 할일만 조회, 수정, 삭제 가능
- 타인의 할일에 대한 접근 권한 없음 (403 Forbidden)
- 사용자 계정 삭제 시 모든 연관 할일도 자동 삭제

---

### 3.2 Holiday (독립 엔티티)

**관계 유형**: 독립적 (No Direct Relationship)

**설명**:
- Holiday는 User 및 Todo와 직접적인 관계가 없는 독립 엔티티입니다
- 모든 사용자가 공통으로 조회하는 공개 데이터입니다

**비즈니스 의미**:
- 국경일은 시스템 전체에서 공유되는 마스터 데이터
- 개별 사용자에게 소유되지 않음
- 인증된 모든 사용자가 조회 가능
- 관리자만 생성/수정 권한 보유

**데이터 접근 패턴**:
```
사용자 (인증됨) → [조회] → Holiday (공개 데이터)
관리자 (role='admin') → [생성/수정] → Holiday
```

---

## 4. 인덱스 전략

효율적인 쿼리 성능을 위한 인덱스 설계입니다.

### 4.1 User 엔티티 인덱스

| 인덱스 유형 | 컬럼 | 목적 | 예상 성능 향상 |
|-------------|------|------|----------------|
| **PRIMARY KEY** | `userId` | 고유 식별 및 빠른 조회 | 필수 |
| **UNIQUE INDEX** | `email` | 로그인 시 이메일 조회, 중복 방지 | 로그인 속도 향상 |
| **INDEX** | `role` | 관리자 조회 및 권한 필터링 | 관리자 목록 조회 최적화 |

**주요 쿼리 패턴**:
```sql
-- 인덱스 활용 예시
SELECT * FROM User WHERE email = 'user@example.com'; -- UNIQUE INDEX 활용
SELECT * FROM User WHERE role = 'admin'; -- INDEX 활용
```

---

### 4.2 Todo 엔티티 인덱스

| 인덱스 유형 | 컬럼 | 목적 | 예상 성능 향상 |
|-------------|------|------|----------------|
| **PRIMARY KEY** | `todoId` | 고유 식별 및 빠른 조회 | 필수 |
| **COMPOSITE INDEX** | `(userId, status)` | 사용자별 상태별 할일 조회 (가장 빈번) | 메인 화면 로딩 속도 향상 |
| **INDEX** | `dueDate` | 만료일 기준 정렬 및 필터링 | 날짜별 정렬 성능 향상 |
| **INDEX** | `deletedAt` | 휴지통 조회 및 소프트 삭제 관리 | 휴지통 화면 성능 향상 |

**주요 쿼리 패턴**:
```sql
-- 복합 인덱스 활용 (userId, status)
SELECT * FROM Todo
WHERE userId = '550e8400-...' AND status = 'active'
ORDER BY dueDate ASC;

-- dueDate 인덱스 활용
SELECT * FROM Todo
WHERE userId = '550e8400-...' AND dueDate < '2025-11-28'
ORDER BY dueDate ASC;

-- deletedAt 인덱스 활용 (휴지통 조회)
SELECT * FROM Todo
WHERE userId = '550e8400-...' AND status = 'deleted'
ORDER BY deletedAt DESC;
```

**인덱스 선택 이유**:
- `(userId, status)` 복합 인덱스: 가장 빈번한 쿼리 패턴 (사용자별 상태별 조회)
- `dueDate`: 날짜 기준 정렬이 자주 사용됨
- `deletedAt`: 휴지통 조회 시 NULL 여부로 필터링

---

### 4.3 Holiday 엔티티 인덱스

| 인덱스 유형 | 컬럼 | 목적 | 예상 성능 향상 |
|-------------|------|------|----------------|
| **PRIMARY KEY** | `holidayId` | 고유 식별 및 빠른 조회 | 필수 |
| **INDEX** | `date` | 날짜 기준 조회 및 정렬 | 연도별/월별 조회 성능 향상 |

**주요 쿼리 패턴**:
```sql
-- date 인덱스 활용
SELECT * FROM Holiday
WHERE date >= '2025-01-01' AND date < '2026-01-01'
ORDER BY date ASC;

-- 특정 월의 국경일 조회
SELECT * FROM Holiday
WHERE date >= '2025-11-01' AND date < '2025-12-01'
ORDER BY date ASC;
```

---

### 4.4 인덱스 유지보수 전략

**정기 점검 항목**:
1. **인덱스 사용률 모니터링**: 사용되지 않는 인덱스 제거
2. **쿼리 실행 계획 분석**: EXPLAIN 명령으로 성능 확인
3. **인덱스 재구축**: 데이터 증가 시 주기적 재구축
4. **통계 정보 갱신**: PostgreSQL ANALYZE 명령 실행

**인덱스 추가 고려 사항**:
- 향후 검색 기능 추가 시: `Todo.title`, `Todo.content`에 Full-Text Search 인덱스
- 대량 데이터 처리 시: 파티셔닝 고려 (연도별, 사용자별)

---

## 5. Prisma 스키마

lyjoo-TodoList의 완전한 Prisma 스키마 정의입니다.

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// User 엔티티 - 사용자 계정 정보
// ============================================
model User {
  userId    String   @id @default(uuid())
  email     String   @unique
  password  String
  username  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  todos     Todo[]

  // Indexes
  @@index([role])
  @@map("users")
}

// ============================================
// Todo 엔티티 - 할일 정보
// ============================================
model Todo {
  todoId      String      @id @default(uuid())
  userId      String
  title       String
  content     String?
  startDate   DateTime?
  dueDate     DateTime?
  status      TodoStatus  @default(ACTIVE)
  isCompleted Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?

  // Relations
  user        User        @relation(fields: [userId], references: [userId], onDelete: Cascade)

  // Indexes
  @@index([userId, status])
  @@index([dueDate])
  @@index([deletedAt])
  @@map("todos")
}

// ============================================
// Holiday 엔티티 - 국경일 정보
// ============================================
model Holiday {
  holidayId   String   @id @default(uuid())
  title       String
  date        DateTime
  description String?
  isRecurring Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Indexes
  @@index([date])
  @@map("holidays")
}

// ============================================
// Enum 정의
// ============================================

// 사용자 역할
enum Role {
  USER   // 일반 사용자
  ADMIN  // 관리자 (국경일 관리 권한)

  @@map("role")
}

// 할일 상태
enum TodoStatus {
  ACTIVE     // 활성 (진행 중)
  COMPLETED  // 완료됨
  DELETED    // 삭제됨 (휴지통)

  @@map("todo_status")
}
```

### 5.1 Prisma 스키마 주요 특징

**1. 명명 규칙**:
- 모델명: PascalCase (User, Todo, Holiday)
- 필드명: camelCase (userId, createdAt)
- 테이블명: snake_case (users, todos, holidays) - `@@map` 사용
- Enum: UPPER_CASE (USER, ADMIN, ACTIVE)

**2. UUID 사용**:
- 모든 Primary Key는 UUID 사용 (`@default(uuid())`)
- 보안성 향상 (순차 ID 노출 방지)
- 분산 시스템 확장성 고려

**3. 자동 타임스탬프**:
- `createdAt`: `@default(now())` - 생성 시 자동 설정
- `updatedAt`: `@updatedAt` - 수정 시 자동 갱신

**4. 관계 설정**:
- `User ↔ Todo`: 1:N 관계, CASCADE 삭제
- 외래 키 명시: `@relation(fields: [userId], references: [userId], onDelete: Cascade)`

**5. 인덱스 최적화**:
- 복합 인덱스: `@@index([userId, status])`
- 단일 인덱스: `@@index([dueDate])`, `@@index([deletedAt])`
- 유니크 제약: `@unique` (email)

---

## 6. 마이그레이션 가이드

### 6.1 초기 설정

**1. Prisma 설치 및 초기화**:
```bash
# 개발 의존성으로 Prisma CLI 설치
npm install -D prisma

# Prisma Client 설치
npm install @prisma/client

# Prisma 초기화 (PostgreSQL)
npx prisma init --datasource-provider postgresql
```

**2. 환경 변수 설정** (`.env`):
```env
# Supabase PostgreSQL 연결 문자열
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# 예시 (Supabase)
# DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

---

### 6.2 마이그레이션 실행

**1. 스키마 파일 작성**:
- 위의 [5. Prisma 스키마](#5-prisma-스키마) 내용을 `prisma/schema.prisma`에 복사

**2. 마이그레이션 생성**:
```bash
# 마이그레이션 파일 생성 및 적용
npx prisma migrate dev --name init

# 출력 예시:
# ✔ Generated Prisma Client
# ✔ Applied migration(s) init
```

**3. Prisma Client 생성**:
```bash
# Prisma Client 재생성 (스키마 변경 시)
npx prisma generate
```

**4. 데이터베이스 확인**:
```bash
# Prisma Studio로 데이터베이스 시각화
npx prisma studio
```

---

### 6.3 마이그레이션 명령어 정리

| 명령어 | 용도 | 사용 시기 |
|--------|------|-----------|
| `npx prisma migrate dev` | 개발 환경 마이그레이션 | 로컬 개발 중 스키마 변경 시 |
| `npx prisma migrate deploy` | 프로덕션 마이그레이션 | CI/CD 배포 시 |
| `npx prisma migrate reset` | DB 초기화 및 재생성 | 개발 중 DB 리셋 필요 시 |
| `npx prisma generate` | Prisma Client 재생성 | 스키마 변경 후 |
| `npx prisma studio` | 데이터베이스 GUI | 데이터 확인 및 수정 |
| `npx prisma db push` | 스키마 직접 푸시 (마이그레이션 파일 없이) | 프로토타이핑 시 |
| `npx prisma db pull` | 기존 DB에서 스키마 가져오기 | 기존 DB 역공학 시 |

---

### 6.4 프로덕션 배포 절차

**1. 환경 변수 설정** (Vercel):
```
Vercel Dashboard → Settings → Environment Variables
DATABASE_URL = [Supabase Production URL]
```

**2. 빌드 스크립트 추가** (`package.json`):
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && npm run build:app",
    "build:app": "tsc && vite build"
  }
}
```

**3. 배포 전 체크리스트**:
- [ ] `DATABASE_URL` 프로덕션 URL 확인
- [ ] 마이그레이션 파일 커밋 여부 확인 (`prisma/migrations/`)
- [ ] Prisma Client 버전 일치 확인
- [ ] 백업 생성 (Supabase 자동 백업 확인)

**4. 배포 명령**:
```bash
# Vercel CLI 배포
vercel --prod

# 또는 Git push로 자동 배포
git push origin main
```

---

### 6.5 스키마 변경 시나리오

#### 시나리오 1: 새 컬럼 추가

**상황**: Todo에 `priority` 필드 추가

**1. 스키마 수정** (`schema.prisma`):
```prisma
model Todo {
  // ... 기존 필드 ...
  priority    Priority  @default(MEDIUM)
  // ... 나머지 필드 ...
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

**2. 마이그레이션 실행**:
```bash
npx prisma migrate dev --name add_todo_priority
```

**3. Prisma Client 재생성**:
```bash
npx prisma generate
```

---

#### 시나리오 2: 데이터 타입 변경

**상황**: `username` 길이 100 → 150으로 변경

**1. 스키마 수정**:
```prisma
model User {
  username  String @db.VarChar(150)  // 이전: @db.VarChar(100)
}
```

**2. 마이그레이션 실행**:
```bash
npx prisma migrate dev --name increase_username_length
```

**주의**: 데이터 타입 변경은 기존 데이터에 영향을 줄 수 있으므로 신중히 진행

---

#### 시나리오 3: 인덱스 추가

**상황**: `Todo.title`에 검색 성능 향상을 위한 인덱스 추가

**1. 스키마 수정**:
```prisma
model Todo {
  // ... 필드 ...

  @@index([title])  // 새로운 인덱스
  @@index([userId, status])
}
```

**2. 마이그레이션 실행**:
```bash
npx prisma migrate dev --name add_title_index
```

---

### 6.6 롤백 절차

**개발 환경**:
```bash
# 전체 DB 리셋 (주의: 모든 데이터 삭제)
npx prisma migrate reset

# 또는 특정 마이그레이션으로 롤백 (수동)
# 1. migrations 폴더에서 해당 마이그레이션 파일 확인
# 2. down.sql 작성 또는 이전 상태로 복원
```

**프로덕션 환경**:
1. **백업 확인**: Supabase 자동 백업 또는 수동 스냅샷
2. **롤백 마이그레이션 생성**: 변경 사항을 되돌리는 새 마이그레이션
3. **테스트 후 배포**: 스테이징 환경에서 먼저 테스트

**롤백 예시** (컬럼 추가 취소):
```sql
-- migrations/[timestamp]_remove_todo_priority/migration.sql
ALTER TABLE "todos" DROP COLUMN "priority";
```

---

### 6.7 마이그레이션 베스트 프랙티스

**1. 마이그레이션 네이밍**:
```bash
# 좋은 예
npx prisma migrate dev --name add_user_avatar
npx prisma migrate dev --name remove_todo_category
npx prisma migrate dev --name fix_user_email_unique

# 나쁜 예
npx prisma migrate dev --name update
npx prisma migrate dev --name fix
```

**2. 주의사항**:
- ⚠️ 프로덕션에서는 `prisma migrate dev` 절대 사용 금지
- ⚠️ `prisma db push`는 프로토타이핑용, 프로덕션 사용 금지
- ⚠️ 마이그레이션 파일 수동 수정 최소화
- ⚠️ 데이터 손실 가능성 있는 변경은 백업 먼저

**3. 권장사항**:
- ✅ 마이그레이션 파일을 Git에 커밋
- ✅ 스키마 변경 전 백업
- ✅ 스테이징 환경에서 먼저 테스트
- ✅ 마이그레이션 실행 전 팀원과 공유
- ✅ 큰 변경은 여러 단계로 나누기

---

### 6.8 트러블슈팅

#### 문제 1: 마이그레이션 충돌

**증상**:
```
Error: Migration failed: database is out of sync
```

**해결**:
```bash
# 1. 현재 DB 상태 확인
npx prisma migrate status

# 2. 로컬 개발 환경이면 리셋
npx prisma migrate reset

# 3. 프로덕션이면 수동으로 동기화
npx prisma migrate resolve --applied [migration_name]
```

---

#### 문제 2: Prisma Client 버전 불일치

**증상**:
```
Error: @prisma/client version mismatch
```

**해결**:
```bash
# Prisma와 Prisma Client 버전 맞추기
npm install prisma@latest @prisma/client@latest
npx prisma generate
```

---

#### 문제 3: 데이터베이스 연결 실패

**증상**:
```
Error: Can't reach database server
```

**해결**:
```bash
# 1. DATABASE_URL 확인
echo $DATABASE_URL

# 2. Supabase 연결 테스트
npx prisma db pull

# 3. 방화벽/IP 화이트리스트 확인 (Supabase Dashboard)
```

---

## 7. 부록

### 7.1 참조 SQL 쿼리

**사용자별 할일 통계 조회**:
```sql
SELECT
  u.username,
  COUNT(t.todoId) as total_todos,
  COUNT(CASE WHEN t.status = 'ACTIVE' THEN 1 END) as active_todos,
  COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END) as completed_todos,
  COUNT(CASE WHEN t.status = 'DELETED' THEN 1 END) as deleted_todos
FROM users u
LEFT JOIN todos t ON u.userId = t.userId
GROUP BY u.userId, u.username;
```

**만료일 임박 할일 조회** (3일 이내):
```sql
SELECT
  t.*,
  u.username,
  (t.dueDate - CURRENT_DATE) as days_remaining
FROM todos t
JOIN users u ON t.userId = u.userId
WHERE
  t.status = 'ACTIVE'
  AND t.dueDate BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '3 days')
ORDER BY t.dueDate ASC;
```

**국경일 포함 캘린더 뷰**:
```sql
SELECT
  date,
  'holiday' as type,
  title,
  description
FROM holidays
WHERE date >= '2025-11-01' AND date < '2025-12-01'

UNION ALL

SELECT
  dueDate as date,
  'todo' as type,
  title,
  content as description
FROM todos
WHERE
  userId = '550e8400-...'
  AND status = 'ACTIVE'
  AND dueDate >= '2025-11-01'
  AND dueDate < '2025-12-01'

ORDER BY date ASC;
```

---

### 7.2 Prisma Client 사용 예시

**사용자 생성**:
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: hashedPassword, // bcrypt로 해싱된 비밀번호
    username: '홍길동',
    role: 'USER',
  },
});
```

**할일 조회 (관계 포함)**:
```typescript
const todos = await prisma.todo.findMany({
  where: {
    userId: currentUserId,
    status: 'ACTIVE',
  },
  include: {
    user: {
      select: {
        username: true,
        email: true,
      },
    },
  },
  orderBy: {
    dueDate: 'asc',
  },
});
```

**할일 완료 처리**:
```typescript
const completedTodo = await prisma.todo.update({
  where: { todoId: todoId },
  data: {
    status: 'COMPLETED',
    isCompleted: true,
  },
});
```

**소프트 삭제**:
```typescript
const deletedTodo = await prisma.todo.update({
  where: { todoId: todoId },
  data: {
    status: 'DELETED',
    deletedAt: new Date(),
  },
});
```

**트랜잭션 예시**:
```typescript
const [deletedTodo, logEntry] = await prisma.$transaction([
  prisma.todo.update({
    where: { todoId: todoId },
    data: { status: 'DELETED', deletedAt: new Date() },
  }),
  prisma.auditLog.create({
    data: {
      userId: currentUserId,
      action: 'DELETE_TODO',
      todoId: todoId,
    },
  }),
]);
```

---

### 7.3 참조 문서

**Prisma 공식 문서**:
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

**PostgreSQL 문서**:
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)

**프로젝트 문서**:
- [도메인 정의서](./1-domain-definition.md)
- [PRD](./3-prd.md)
- [프로젝트 구조](./5-project-structure.md)
- [아키텍처 다이어그램](./6-arch-diagram.md)

---

### 7.4 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2025-11-26 | ERD 문서 초안 작성 | Claude |
| 1.1 | 2025-11-26 | DB 스키마 동기화 (Enum 대문자 변경, CHECK 제약조건 확인) | Gemini |

---

**문서 종료**
