# 스키마 비교 분석 리포트

**작성일**: 2025-11-26
**작성자**: Claude
**상태**: 🔴 **심각한 불일치 발견**

---

## 목차
1. [요약](#1-요약)
2. [비교 대상](#2-비교-대상)
3. [발견된 불일치 사항](#3-발견된-불일치-사항)
4. [상세 비교 분석](#4-상세-비교-분석)
5. [영향도 분석](#5-영향도-분석)
6. [권장 조치사항](#6-권장-조치사항)

---

## 1. 요약

### 🔴 심각도: 높음

**핵심 문제**:
- **Prisma schema 파일**(`backend/prisma/schema.prisma`)과 **실제 데이터베이스 스키마**가 불일치합니다.
- **ERD 문서**(`doc/7-erd.md`)에 정의된 스키마와도 일부 차이가 있습니다.

### 주요 발견 사항

| 항목 | ERD 문서 | Prisma 스키마 파일 | 실제 데이터베이스 | 상태 |
|------|----------|-------------------|------------------|------|
| Todo.status 필드 | ✅ 있음 (TodoStatus) | ❌ **없음** | ✅ 있음 (todo_status) | 🔴 불일치 |
| TodoStatus enum | ✅ 정의됨 | ❌ **없음** | ✅ 있음 (todo_status) | 🔴 불일치 |
| Todo 인덱스 (userId, status) | ✅ 있음 | ❌ **없음** | ✅ 있음 | 🔴 불일치 |
| Todo 인덱스 (userId, isCompleted) | ❌ 없음 | ✅ **있음** | ❌ 없음 | 🔴 불일치 |

---

## 2. 비교 대상

### 2.1 비교한 소스

1. **ERD 문서**: `doc/7-erd.md`
   - 프로젝트 설계 문서
   - Prisma 스키마 예시 포함

2. **Prisma 스키마 파일**: `backend/prisma/schema.prisma`
   - 백엔드 코드베이스의 실제 스키마 정의 파일
   - Prisma Client 생성 기준

3. **실제 데이터베이스**: PostgreSQL (localhost:5432)
   - `npx prisma db pull` 명령으로 확인
   - 마이그레이션: `20251126050952_init`

---

## 3. 발견된 불일치 사항

### 3.1 Todo 모델 - status 필드

#### ERD 문서 (doc/7-erd.md)
```prisma
model Todo {
  todoId      String      @id @default(uuid())
  userId      String
  title       String
  content     String?
  startDate   DateTime?
  dueDate     DateTime?
  status      TodoStatus  @default(ACTIVE)  // ✅ 있음
  isCompleted Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?

  // ...

  @@index([userId, status])  // ✅ status 인덱스
  @@index([dueDate])
  @@index([deletedAt])
}

enum TodoStatus {
  ACTIVE
  COMPLETED
  DELETED

  @@map("todo_status")
}
```

#### Prisma 스키마 파일 (backend/prisma/schema.prisma)
```prisma
model Todo {
  todoId      String     @id @default(uuid())
  userId      String
  title       String
  content     String?
  startDate   DateTime?
  dueDate     DateTime?
  isCompleted Boolean    @default(false)  // ❌ status 필드 없음
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  deletedAt   DateTime?

  // ...

  @@index([userId, isCompleted])  // ❌ 잘못된 인덱스
  @@index([dueDate])
  @@index([deletedAt])
}

// ❌ TodoStatus enum 정의 없음
```

#### 실제 데이터베이스 (db pull 결과)
```prisma
model Todo {
  todoId      String      @id @default(uuid())
  userId      String
  title       String
  content     String?
  startDate   DateTime?
  dueDate     DateTime?
  status      todo_status @default(ACTIVE)  // ✅ 있음
  isCompleted Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?

  // ...

  @@index([userId, status])  // ✅ status 인덱스
  @@index([dueDate])
  @@index([deletedAt])
}

enum todo_status {
  ACTIVE
  COMPLETED
  DELETED
}
```

**SQL 마이그레이션 (실제 생성된 스키마)**:
```sql
-- CreateEnum
CREATE TYPE "todo_status" AS ENUM ('ACTIVE', 'COMPLETED', 'DELETED');

-- CreateTable
CREATE TABLE "todos" (
    "todoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "status" "todo_status" NOT NULL DEFAULT 'ACTIVE',  -- ✅ status 있음
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "todos_pkey" PRIMARY KEY ("todoId")
);

-- CreateIndex
CREATE INDEX "todos_userId_status_idx" ON "todos"("userId", "status");  -- ✅ status 인덱스
```

---

### 3.2 Enum 명명 규칙

| 항목 | ERD 문서 | 실제 데이터베이스 | 비고 |
|------|----------|------------------|------|
| TodoStatus enum 이름 | `TodoStatus` (PascalCase) | `todo_status` (snake_case) | ⚠️ 명명 규칙 차이 |
| Enum 매핑 | `@@map("todo_status")` | - | ERD는 매핑 지정 |

**ERD 문서**:
```prisma
enum TodoStatus {
  ACTIVE
  COMPLETED
  DELETED

  @@map("todo_status")  // ✅ 명시적 매핑
}
```

**실제 데이터베이스**:
```prisma
enum todo_status {  // ⚠️ 직접 snake_case 사용
  ACTIVE
  COMPLETED
  DELETED
}
```

---

### 3.3 인덱스 불일치

#### Prisma 스키마 파일
```prisma
model Todo {
  // ...

  @@index([userId, isCompleted])  // ❌ 잘못된 인덱스
  @@index([dueDate])
  @@index([deletedAt])
}
```

#### 실제 데이터베이스
```sql
CREATE INDEX "todos_userId_status_idx" ON "todos"("userId", "status");  -- ✅ 올바른 인덱스
CREATE INDEX "todos_dueDate_idx" ON "todos"("dueDate");
CREATE INDEX "todos_deletedAt_idx" ON "todos"("deletedAt");
```

**영향**:
- Prisma 스키마 파일에 정의된 `@@index([userId, isCompleted])` 인덱스는 **데이터베이스에 존재하지 않습니다**.
- 실제 데이터베이스는 `@@index([userId, status])` 인덱스를 사용합니다.

---

## 4. 상세 비교 분석

### 4.1 User 모델

| 필드 | ERD 문서 | Prisma 스키마 | 실제 DB | 상태 |
|------|----------|--------------|---------|------|
| userId | ✅ String @id @default(uuid()) | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| email | ✅ String @unique | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| password | ✅ String | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| username | ✅ String | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| role | ✅ Role @default(USER) | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| createdAt | ✅ DateTime @default(now()) | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| updatedAt | ✅ DateTime @updatedAt | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| **인덱스** | `@@index([role])` | ✅ 동일 | ✅ 동일 | ✅ 일치 |

**결론**: User 모델은 **완벽하게 일치**합니다. ✅

---

### 4.2 Todo 모델

| 필드 | ERD 문서 | Prisma 스키마 | 실제 DB | 상태 |
|------|----------|--------------|---------|------|
| todoId | ✅ String @id @default(uuid()) | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| userId | ✅ String (FK) | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| title | ✅ String | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| content | ✅ String? | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| startDate | ✅ DateTime? | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| dueDate | ✅ DateTime? | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| **status** | ✅ TodoStatus @default(ACTIVE) | ❌ **없음** | ✅ todo_status @default(ACTIVE) | 🔴 **불일치** |
| isCompleted | ✅ Boolean @default(false) | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| createdAt | ✅ DateTime @default(now()) | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| updatedAt | ✅ DateTime @updatedAt | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| deletedAt | ✅ DateTime? | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| **인덱스 1** | `@@index([userId, status])` | ❌ `@@index([userId, isCompleted])` | ✅ `@@index([userId, status])` | 🔴 **불일치** |
| **인덱스 2** | `@@index([dueDate])` | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| **인덱스 3** | `@@index([deletedAt])` | ✅ 동일 | ✅ 동일 | ✅ 일치 |

**결론**: Todo 모델에 **심각한 불일치**가 있습니다. 🔴

---

### 4.3 Holiday 모델

| 필드 | ERD 문서 | Prisma 스키마 | 실제 DB | 상태 |
|------|----------|--------------|---------|------|
| holidayId | ✅ String @id @default(uuid()) | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| title | ✅ String | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| date | ✅ DateTime | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| description | ✅ String? | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| isRecurring | ✅ Boolean @default(true) | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| createdAt | ✅ DateTime @default(now()) | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| updatedAt | ✅ DateTime @updatedAt | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| **인덱스** | `@@index([date])` | ✅ 동일 | ✅ 동일 | ✅ 일치 |

**결론**: Holiday 모델은 **완벽하게 일치**합니다. ✅

---

### 4.4 Enum 정의

#### Role Enum

| 항목 | ERD 문서 | Prisma 스키마 | 실제 DB | 상태 |
|------|----------|--------------|---------|------|
| Enum 이름 | Role | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| 값 | USER, ADMIN | ✅ 동일 | ✅ 동일 | ✅ 일치 |
| 매핑 | `@@map("role")` | ✅ 동일 | ✅ 동일 | ✅ 일치 |

**결론**: Role enum은 **완벽하게 일치**합니다. ✅

#### TodoStatus Enum

| 항목 | ERD 문서 | Prisma 스키마 | 실제 DB | 상태 |
|------|----------|--------------|---------|------|
| **Enum 정의** | ✅ 있음 (TodoStatus) | ❌ **없음** | ✅ 있음 (todo_status) | 🔴 **불일치** |
| Enum 이름 | TodoStatus (PascalCase) | - | todo_status (snake_case) | ⚠️ 명명 규칙 차이 |
| 값 | ACTIVE, COMPLETED, DELETED | - | ✅ 동일 | ✅ 일치 (DB) |
| 매핑 | `@@map("todo_status")` | - | - | ⚠️ ERD에만 있음 |

**결론**: TodoStatus enum에 **심각한 불일치**가 있습니다. 🔴

---

## 5. 영향도 분석

### 5.1 현재 발생 가능한 문제

#### 🔴 심각도: 높음

1. **타입 안전성 문제**
   - Prisma Client가 `status` 필드를 인식하지 못함
   - TypeScript 타입 체킹에서 `todo.status` 접근 시 컴파일 에러 발생 가능
   - 백엔드 코드에서 `status` 필드 사용 시 런타임 에러 위험

2. **쿼리 최적화 문제**
   - Prisma 스키마에 정의된 `@@index([userId, isCompleted])` 인덱스가 실제로는 없음
   - 실제 DB는 `@@index([userId, status])` 인덱스 사용
   - 쿼리 성능 저하 가능성

3. **마이그레이션 충돌 위험**
   - 향후 마이그레이션 실행 시 스키마 불일치로 인한 충돌 가능
   - `npx prisma migrate dev` 실행 시 예상치 못한 스키마 변경 발생 가능

4. **문서-코드 불일치**
   - ERD 문서와 실제 코드가 다름
   - 프론트엔드 개발 시 혼란 발생 가능
   - 신규 개발자 온보딩 시 혼란

---

### 5.2 백엔드 코드 분석

#### 실제 백엔드 코드에서 status 사용 여부 확인

**확인 결과**: 백엔드 코드가 `status` 필드를 사용하고 있는지 확인이 필요합니다.

**가능한 시나리오**:
1. **시나리오 A**: 코드가 `status` 필드를 사용하지 않음
   - 이 경우 `isCompleted` 및 `deletedAt` 필드로 상태 관리
   - Prisma 스키마가 정확하며, DB만 불필요한 필드 포함

2. **시나리오 B**: 코드가 `status` 필드를 사용함
   - 이 경우 Prisma 스키마가 잘못되었으며 **즉시 수정 필요**
   - 현재 코드가 런타임 에러 없이 작동한다면 Raw SQL 사용 중일 가능성

---

## 6. 권장 조치사항

### 6.1 즉시 조치 (우선순위 1)

#### ✅ 1단계: 백엔드 코드에서 status 사용 여부 확인

**확인 명령**:
```bash
cd backend
grep -r "status" src/ --include="*.js" --include="*.ts"
```

**판단 기준**:
- `todo.status` 또는 `data.status`를 사용하는 코드가 있는가?
- `TodoStatus` enum을 import하거나 사용하는가?
- `status: 'ACTIVE'` 같은 하드코딩된 문자열이 있는가?

---

#### ✅ 2단계: Prisma 스키마 동기화

**옵션 A: status 필드가 필요한 경우** (백엔드 코드가 사용 중)

```bash
cd backend

# 1. 데이터베이스 스키마를 Prisma 파일로 가져오기
npx prisma db pull

# 2. 가져온 스키마 확인
cat prisma/schema.prisma

# 3. Prisma Client 재생성
npx prisma generate

# 4. 백엔드 재시작
npm run dev
```

**결과**:
- `status` 필드와 `todo_status` enum이 Prisma 스키마에 추가됨
- `@@index([userId, status])`로 인덱스 수정됨

---

**옵션 B: status 필드가 불필요한 경우** (백엔드 코드가 미사용)

```bash
cd backend

# 1. 마이그레이션 생성 (status 필드 제거)
npx prisma migrate dev --name remove_todo_status_field

# 2. Prisma Client 재생성
npx prisma generate
```

**마이그레이션 내용** (수동 작성):
```sql
-- Drop index
DROP INDEX "todos_userId_status_idx";

-- Drop column
ALTER TABLE "todos" DROP COLUMN "status";

-- Drop enum
DROP TYPE "todo_status";

-- Create new index
CREATE INDEX "todos_userId_isCompleted_idx" ON "todos"("userId", "isCompleted");
```

---

#### ✅ 3단계: ERD 문서 업데이트

**파일**: `doc/7-erd.md`

**수정 내용**:
- 최종 결정된 스키마로 ERD 문서 업데이트
- Enum 명명 규칙 통일 (PascalCase with @@map 또는 snake_case 직접 사용)

---

### 6.2 후속 조치 (우선순위 2)

#### ✅ 4단계: 프론트엔드 통합 가이드 업데이트

**파일**: `doc/10-frontend-integration-guide.md`

**업데이트 내용**:
- Todo 모델의 최종 필드 구조 명시
- `status` 필드 사용 여부 및 상태 관리 방법 설명
- API 응답 예시 업데이트

---

#### ✅ 5단계: Swagger 문서 업데이트

**파일**: `swagger/swagger.json`

**업데이트 내용**:
- Todo 스키마의 `status` 필드 정의
- API 응답 예시 수정

---

#### ✅ 6단계: 테스트 실행

```bash
cd backend

# API 테스트
npm run test:api

# 데이터베이스 헬퍼 테스트
npm run test:helpers
```

---

### 6.3 장기 조치 (우선순위 3)

#### ✅ 7단계: CI/CD 파이프라인 추가

**목적**: 스키마 동기화 검증 자동화

**GitHub Actions 예시** (`.github/workflows/schema-check.yml`):
```yaml
name: Schema Sync Check

on: [push, pull_request]

jobs:
  check-schema:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd backend && npm install
      - run: cd backend && npx prisma generate
      - name: Check schema sync
        run: |
          cd backend
          npx prisma db pull --print > /tmp/actual-schema.prisma
          diff prisma/schema.prisma /tmp/actual-schema.prisma
```

---

#### ✅ 8단계: 문서 자동 생성 도구 도입

**옵션**:
1. **Prisma ERD Generator**: Prisma 스키마에서 ERD 자동 생성
2. **Swagger 자동 생성**: Prisma → OpenAPI 변환 도구

---

## 7. 체크리스트

### 즉시 조치 체크리스트

- [ ] 백엔드 코드에서 `status` 필드 사용 여부 확인
- [ ] Prisma 스키마 동기화 (`npx prisma db pull` 또는 마이그레이션)
- [ ] Prisma Client 재생성 (`npx prisma generate`)
- [ ] 백엔드 재시작 및 동작 확인
- [ ] ERD 문서 업데이트 (`doc/7-erd.md`)
- [ ] 프론트엔드 통합 가이드 업데이트 (`doc/10-frontend-integration-guide.md`)
- [ ] Swagger 문서 업데이트 (`swagger/swagger.json`)
- [ ] API 테스트 실행
- [ ] Git 커밋 및 푸시

---

## 8. 결론

### 현재 상태

| 모델 | 상태 | 심각도 |
|------|------|--------|
| User | ✅ 완벽히 일치 | - |
| Todo | 🔴 심각한 불일치 | 높음 |
| Holiday | ✅ 완벽히 일치 | - |
| Role enum | ✅ 완벽히 일치 | - |
| TodoStatus enum | 🔴 심각한 불일치 | 높음 |

### 권장사항

1. **즉시**: 백엔드 코드에서 `status` 필드 사용 여부 확인
2. **즉시**: Prisma 스키마 동기화 (옵션 A 또는 B 선택)
3. **24시간 내**: 모든 문서 업데이트
4. **1주일 내**: CI/CD 파이프라인 추가

### 예상 작업 시간

- **즉시 조치**: 1~2시간
- **문서 업데이트**: 1시간
- **테스트 및 검증**: 1시간
- **총 예상 시간**: 3~4시간

---

**문서 종료**

