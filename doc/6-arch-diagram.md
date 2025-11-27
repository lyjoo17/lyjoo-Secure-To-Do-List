# lyjoo-TodoList 기술 아키텍처 다이어그램

**버전**: 1.0
**작성일**: 2025-11-26
**상태**: 최종
**작성자**: Claude
**참조 문서**:
- [도메인 정의서](./1-domain-definition.md)
- [PRD](./3-prd.md)
- [프로젝트 구조](./5-project-structure.md)

---

## 목차

1. [전체 시스템 아키텍처](#1-전체-시스템-아키텍처)
2. [클린 아키텍처 레이어 구조](#2-클린-아키텍처-레이어-구조)
3. [프론트엔드 아키텍처](#3-프론트엔드-아키텍처)
4. [백엔드 아키텍처](#4-백엔드-아키텍처)
5. [데이터 흐름](#5-데이터-흐름)
6. [배포 아키텍처](#6-배포-아키텍처)

---

## 1. 전체 시스템 아키텍처

### 1.1 시스템 구성도

```mermaid
graph TB
    subgraph Client["클라이언트 레이어"]
        Browser[웹 브라우저<br/>Chrome, Firefox, Safari]
    end

    subgraph Frontend["프론트엔드 - Vercel"]
        React[React 18 App<br/>Vite + Tailwind CSS]
        Zustand[Zustand Store<br/>전역 상태 관리]
    end

    subgraph Backend["백엔드 - Vercel Serverless"]
        API[Express.js API<br/>REST API]
        Auth[JWT 인증]
        Services[비즈니스 로직]
    end

    subgraph Database["데이터베이스"]
        Supabase[(PostgreSQL<br/>Supabase)]
    end

    subgraph External["외부 서비스"]
        Weather[날씨 API<br/>OpenWeatherMap]
        Holiday[공휴일 API<br/>공공데이터포털]
    end

    Browser -->|HTTPS| React
    React -->|API 호출| API
    React -.->|상태 관리| Zustand
    API -->|인증| Auth
    API -->|비즈니스 로직| Services
    Services -->|Prisma ORM| Supabase
    Services -->|HTTP| Weather
    Services -->|HTTP| Holiday

    style Client fill:#e1f5ff
    style Frontend fill:#fff4e1
    style Backend fill:#ffe1e1
    style Database fill:#e1ffe1
    style External fill:#f0e1ff
```

### 1.2 기술 스택 요약

| 레이어 | 기술 | 역할 |
|--------|------|------|
| **프론트엔드** | React 18, Zustand, Tailwind CSS, Vite | 사용자 인터페이스 |
| **백엔드** | Node.js, Express.js, Prisma | API 서버 |
| **데이터베이스** | PostgreSQL (Supabase) | 데이터 저장 |
| **인증** | JWT (jsonwebtoken, bcrypt) | 사용자 인증 |
| **배포** | Vercel (Frontend + Backend) | 호스팅 |
| **외부 API** | OpenWeatherMap, 공공데이터포털 | 날씨, 공휴일 |

### 1.3 상세 라이브러리 목록

#### 프론트엔드 라이브러리

| 라이브러리 | 버전 | 용도 |
|------------|------|------|
| `react` | 18.x | UI 프레임워크 |
| `zustand` | 최신 | 전역 상태 관리 |
| `tailwindcss` | 최신 | 유틸리티 우선 CSS |
| `vite` | 최신 | 빌드 도구 |
| `axios` | 최신 | HTTP 통신 |
| `react-router-dom` | v6 | 라우팅 |
| `react-hook-form` | 최신 | 폼 관리 |
| `zod` | 최신 | 스키마 검증 |
| `date-fns` | 최신 | 날짜 처리 |
| `lucide-react` | 최신 | 아이콘 |

#### 백엔드 라이브러리

| 라이브러리 | 버전 | 용도 |
|------------|------|------|
| `express` | 4.x | 웹 프레임워크 |
| `prisma` | 최신 | ORM |
| `@prisma/client` | 최신 | Prisma 클라이언트 |
| `jsonwebtoken` | 최신 | JWT 인증 |
| `bcrypt` | 최신 | 비밀번호 해싱 |
| `express-validator` | 최신 | 요청 검증 |
| `cors` | 최신 | CORS 설정 |
| `helmet` | 최신 | 보안 헤더 |
| `express-rate-limit` | 최신 | Rate limiting |
| `dotenv` | 최신 | 환경 변수 |

#### 개발 도구

| 도구 | 용도 |
|------|------|
| `eslint` | 코드 린팅 |
| `prettier` | 코드 포맷팅 |
| `typescript` | 타입 체킹 (선택) |
| `postman` / `thunder-client` | API 테스트 |

---

## 2. 클린 아키텍처 레이어 구조

### 2.1 클린 아키텍처 원칙

```mermaid
graph TB
    subgraph External["외부 레이어 - 의존성 없음"]
        UI[UI Components<br/>페이지, 컴포넌트]
        API[API Routes<br/>HTTP 엔드포인트]
        DB[Database<br/>PostgreSQL]
    end

    subgraph Interface["인터페이스 어댑터 레이어"]
        Controllers[Controllers<br/>요청/응답 변환]
        Presenters[Stores/Hooks<br/>상태 관리]
        Gateways[Repositories<br/>데이터 액세스]
    end

    subgraph UseCase["유스케이스 레이어 - 비즈니스 로직"]
        Services[Services<br/>핵심 비즈니스 로직]
    end

    subgraph Domain["도메인 레이어 - 엔티티"]
        Entities[Entities<br/>User, TodoItem, Holiday]
    end

    UI -->|의존| Presenters
    API -->|의존| Controllers
    Controllers -->|의존| Services
    Presenters -->|의존| Services
    Services -->|의존| Entities
    Services -->|의존| Gateways
    Gateways -->|의존| DB

    style Domain fill:#4CAF50
    style UseCase fill:#2196F3
    style Interface fill:#FF9800
    style External fill:#9E9E9E
```

### 2.2 의존성 방향 규칙

**핵심 원칙**: 의존성은 항상 **안쪽(도메인)**으로 향해야 합니다.

```
외부 레이어 → 인터페이스 어댑터 → 유스케이스 → 도메인
     ✅              ✅              ✅
```

**금지 사항**: 역방향 의존성 절대 금지

```
도메인 → 유스케이스 (❌)
유스케이스 → 인터페이스 어댑터 (❌)
```

---

## 3. 프론트엔드 아키텍처

### 3.1 프론트엔드 레이어 구조

```mermaid
graph TB
    subgraph Presentation["Presentation Layer - UI"]
        Pages[Pages<br/>인증, 할일, 국경일, 프로필 페이지]
        Components[Components<br/>TodoCard, Button, Input 등]
    end

    subgraph State["State Management Layer"]
        Zustand[Zustand Stores<br/>authStore, todoStore, holidayStore, uiStore]
        Hooks[Custom Hooks<br/>useMediaQuery, useTheme]
    end

    subgraph Service["API Client Layer"]
        AxiosClient[Axios Instance<br/>api.js]
    end

    subgraph Backend["Backend API"]
        RestAPI[REST API<br/>Express.js]
    end

    Pages -->|사용| Components
    Pages -->|사용| Hooks
    Hooks -->|사용| Zustand
    Zustand -->|HTTP 요청| AxiosClient
    AxiosClient -->|API 호출| RestAPI

    style Presentation fill:#e3f2fd
    style State fill:#fff3e0
    style Service fill:#fce4ec
    style Backend fill:#f3e5f5
```

### 3.2 프론트엔드 폴더 구조

```
frontend/src/
├── components/         # 재사용 가능한 컴포넌트
│   ├── auth/           # 인증 관련 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Skeleton.jsx
│   │   ├── Spinner.jsx
│   │   └── Toast.jsx
│   ├── layout/         # 레이아웃 컴포넌트
│   │   ├── BottomNav.jsx
│   │   ├── Header.jsx
│   │   ├── MainLayout.jsx
│   │   └── Sidebar.jsx
│   └── todo/           # 할일 관련 컴포넌트
│       ├── TodoCard.jsx
│       ├── TodoFormModal.jsx
│       └── TodoSkeleton.jsx
├── pages/              # 페이지 컴포넌트
│   ├── auth/           # 인증 관련 페이지
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── holiday/        # 국경일 페이지
│   │   └── HolidayPage.jsx
│   ├── profile/        # 프로필 페이지
│   │   └── ProfilePage.jsx
│   ├── todo/           # 할일 관련 페이지
│   │   ├── TodoListPage.jsx
│   │   └── TrashPage.jsx
│   └── NotFoundPage.jsx
├── store/              # Zustand 스토어
│   ├── todoStore.js
│   ├── authStore.js
│   ├── holidayStore.js
│   └── uiStore.js
├── services/           # API 클라이언트 및 상수
│   ├── api.js
│   └── constants.js
├── hooks/              # 커스텀 훅
│   ├── useMediaQuery.js
│   └── useTheme.js
└── utils/              # 유틸리티 (현재 비어 있음)
```

### 3.3 상태 관리 흐름

```mermaid
sequenceDiagram
    participant User as 사용자
    participant Page as TodoListPage
    participant Store as todoStore
    participant APIClient as api.js
    participant Backend as Backend API

    User->>Page: 할일 생성 버튼 클릭
    Page->>Store: addTodo(data) 호출
    Store->>APIClient: POST /api/todos (data)
    APIClient->>Backend: HTTP Request
    Backend-->>APIClient: 201 Created + 데이터
    APIClient-->>Store: 응답 반환
    Store->>Store: 상태 업데이트
    Store-->>Page: 업데이트된 할일 목록
    Page-->>User: 할일 목록 갱신
```

---

## 4. 백엔드 아키텍처

### 4.1 백엔드 레이어 구조 (클린 아키텍처)

```mermaid
graph TB
    subgraph Routes["Routes Layer - 라우트 정의"]
        TodoRoutes[todoRoutes.js<br/>/api/todos]
        AuthRoutes[authRoutes.js<br/>/api/auth]
        HolidayRoutes[holidayRoutes.js<br/>/api/holidays]
    end

    subgraph Middlewares["Middlewares - 전처리"]
        AuthMW[authMiddleware<br/>JWT 검증]
        ValidMW[validationMiddleware<br/>입력 검증]
        ErrorMW[errorMiddleware<br/>에러 처리]
    end

    subgraph Controllers["Controllers - 요청/응답"]
        TodoCtrl[todoController<br/>HTTP 처리]
        AuthCtrl[authController<br/>HTTP 처리]
        HolidayCtrl[holidayController<br/>HTTP 처리]
    end

    subgraph Services["Services - 비즈니스 로직"]
        TodoSvc[todoService<br/>할일 로직]
        AuthSvc[authService<br/>인증 로직]
        HolidaySvc[holidayService<br/>공휴일 로직]
    end

    subgraph Repositories["Repositories - DB 액세스"]
        TodoRepo[todoRepository<br/>Prisma 쿼리]
        UserRepo[userRepository<br/>Prisma 쿼리]
        HolidayRepo[holidayRepository<br/>Prisma 쿼리]
    end

    subgraph Database["Database"]
        Prisma[Prisma Client]
        PostgreSQL[(PostgreSQL)]
    end

    TodoRoutes -->|미들웨어| AuthMW
    TodoRoutes -->|미들웨어| ValidMW
    TodoRoutes -->|컨트롤러| TodoCtrl
    TodoCtrl -->|서비스| TodoSvc
    TodoSvc -->|리포지토리| TodoRepo
    TodoRepo -->|ORM| Prisma
    Prisma -->|쿼리| PostgreSQL

    AuthRoutes -->|컨트롤러| AuthCtrl
    AuthCtrl -->|서비스| AuthSvc
    AuthSvc -->|리포지토리| UserRepo
    UserRepo -->|ORM| Prisma

    HolidayRoutes -->|컨트롤러| HolidayCtrl
    HolidayCtrl -->|서비스| HolidaySvc
    HolidaySvc -->|리포지토리| HolidayRepo
    HolidayRepo -->|ORM| Prisma

    ErrorMW -.->|에러 처리| Controllers

    style Routes fill:#e8f5e9
    style Middlewares fill:#fff3e0
    style Controllers fill:#e3f2fd
    style Services fill:#f3e5f5
    style Repositories fill:#fce4ec
    style Database fill:#ffebee
```

### 4.2 백엔드 폴더 구조 (간소화)

```
backend/src/
├── routes/            # 라우트 정의
│   ├── index.js
│   ├── todoRoutes.js
│   └── authRoutes.js
├── controllers/       # 컨트롤러
│   ├── todoController.js
│   └── authController.js
├── services/          # 비즈니스 로직
│   ├── todoService.js
│   └── authService.js
├── repositories/      # DB 액세스
│   ├── todoRepository.js
│   └── userRepository.js
├── middlewares/       # 미들웨어
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── utils/             # 유틸리티
│   ├── jwtHelper.js
│   └── passwordHelper.js
├── config/            # 설정
│   ├── database.js
│   └── jwt.js
└── app.js             # Express 설정
```

### 4.3 API 요청 처리 흐름

```mermaid
sequenceDiagram
    participant Client as 클라이언트
    participant Route as todoRoutes
    participant AuthMW as authMiddleware
    participant Ctrl as todoController
    participant Svc as todoService
    participant Repo as todoRepository
    participant DB as PostgreSQL

    Client->>Route: POST /api/todos
    Route->>AuthMW: JWT 검증
    AuthMW-->>Route: 인증 성공 (userId)
    Route->>Ctrl: createTodo(req, res)
    Ctrl->>Svc: createTodo(userId, data)
    Svc->>Repo: create(todoData)
    Repo->>DB: INSERT INTO todos
    DB-->>Repo: 생성된 레코드
    Repo-->>Svc: 할일 객체
    Svc-->>Ctrl: 할일 반환
    Ctrl-->>Client: 201 Created + JSON
```

---

## 5. 데이터 흐름

### 5.1 사용자 인증 흐름

```mermaid
sequenceDiagram
    participant User as 사용자
    participant UI as 로그인 페이지
    participant AuthStore as authStore
    participant APIClient as api.js
    participant Backend as authController
    participant DB as PostgreSQL

    User->>UI: 아이디/비밀번호 입력
    UI->>AuthStore: login(credentials)
    AuthStore->>APIClient: POST /api/auth/login (credentials)
    APIClient->>Backend: HTTP Request
    Backend->>DB: SELECT * FROM users
    DB-->>Backend: 사용자 정보
    Backend->>Backend: 비밀번호 검증 (bcrypt)
    Backend->>Backend: JWT 토큰 생성
    Backend-->>APIClient: { accessToken, user }
    APIClient-->>AuthStore: 응답 반환
    AuthStore->>AuthStore: 토큰 저장 및 사용자 정보 업데이트
    AuthStore-->>UI: 로그인 성공
    UI-->>User: 메인 페이지 이동
```

### 5.2 할일 생성 흐름

```mermaid
sequenceDiagram
    participant User as 사용자
    participant UI as TodoListPage
    participant TodoStore as todoStore
    participant TodoSvc as todoService
    participant API as todoController
    participant DB as PostgreSQL

    User->>UI: 할일 추가 버튼 클릭
    UI->>TodoStore: addTodo(data)
    TodoStore->>TodoSvc: createTodo(data)
    TodoSvc->>API: POST /api/todos<br/>Authorization: Bearer token
    API->>API: JWT 검증
    API->>DB: INSERT INTO todos
    DB-->>API: 생성된 할일
    API-->>TodoSvc: 201 + 할일 JSON
    TodoSvc-->>TodoStore: 할일 객체
    TodoStore->>TodoStore: 상태 업데이트
    TodoStore-->>UI: 리렌더링
    UI-->>User: 할일 목록 갱신
```



---

## 6. 배포 아키텍처

### 6.1 Vercel 배포 구조

```mermaid
graph TB
    subgraph Internet["인터넷"]
        User[사용자]
    end

    subgraph Vercel["Vercel Platform"]
        subgraph Frontend["Frontend - Vercel"]
            ReactApp[React App<br/>정적 파일]
            CDN[Vercel CDN<br/>글로벌 배포]
        end

        subgraph Backend["Backend - Vercel Serverless"]
            ServerlessFn[Serverless Functions<br/>Express.js API]
        end
    end

    subgraph Supabase["Supabase Cloud"]
        PostgreSQL[(PostgreSQL DB)]
    end

    subgraph External["외부 API"]
        Weather[OpenWeatherMap]
        Holiday[공공데이터포털]
    end

    User -->|HTTPS| CDN
    CDN -->|정적 파일| ReactApp
    ReactApp -->|API 요청| ServerlessFn
    ServerlessFn -->|Prisma| PostgreSQL
    ServerlessFn -->|HTTP| Weather
    ServerlessFn -->|HTTP| Holiday

    style Frontend fill:#e1f5ff
    style Backend fill:#ffe1e1
    style Supabase fill:#e1ffe1
    style External fill:#f0e1ff
```

### 6.2 환경 변수 관리

```mermaid
graph LR
    subgraph Local["로컬 개발"]
        EnvFile[.env 파일]
        LocalApp[로컬 앱]
    end

    subgraph Vercel["Vercel 프로덕션"]
        VercelEnv[Environment Variables<br/>Vercel Dashboard]
        ProdApp[프로덕션 앱]
    end

    EnvFile -.->|개발 환경| LocalApp
    VercelEnv -.->|프로덕션 환경| ProdApp

    style Local fill:#fff3e0
    style Vercel fill:#e8f5e9
```

**환경 변수 목록**:

| 변수명 | 용도 | 예시 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | `postgresql://...` |
| `JWT_SECRET` | JWT 토큰 서명 키 | `random-secret-key` |
| `OPENWEATHERMAP_API_KEY` | 날씨 API 키 | `abcd1234...` |
| `CORS_ORIGIN` | CORS 허용 도메인 | `https://your-app.vercel.app` |

### 6.3 CI/CD 파이프라인 (GitHub Actions)

```mermaid
graph LR
    Developer[개발자] -->|git push| GitHub[GitHub Repository]
    GitHub -->|트리거| VercelDeploy[Vercel Auto Deploy]
    VercelDeploy -->|빌드| Build[빌드 프로세스]
    Build -->|테스트| Test[자동 테스트]
    Test -->|성공| Deploy[프로덕션 배포]
    Deploy -->|완료| Live[라이브 서버]

    style Developer fill:#e3f2fd
    style GitHub fill:#fff3e0
    style VercelDeploy fill:#f3e5f5
    style Live fill:#e8f5e9
```

---

## 7. 보안 아키텍처

### 7.1 인증 및 권한 흐름

```mermaid
graph TB
    subgraph Client["클라이언트"]
        LoginForm[로그인 폼]
        LocalStorage[LocalStorage<br/>토큰 저장]
    end

    subgraph Backend["백엔드 API"]
        AuthAPI[POST /api/auth/login]
        ProtectedAPI[Protected APIs<br/>JWT 검증 필요]
    end

    subgraph Auth["인증 레이어"]
        JWTGen[JWT 생성<br/>Access Token 15분]
        JWTVerify[JWT 검증<br/>authMiddleware]
    end

    subgraph Database["데이터베이스"]
        Users[(users 테이블<br/>bcrypt 해시)]
    end

    LoginForm -->|아이디/비밀번호| AuthAPI
    AuthAPI -->|비밀번호 검증| Users
    AuthAPI -->|토큰 생성| JWTGen
    JWTGen -->|Access Token| LocalStorage
    LocalStorage -->|Authorization Header| ProtectedAPI
    ProtectedAPI -->|토큰 검증| JWTVerify
    JWTVerify -->|인증 성공| ProtectedAPI

    style Client fill:#e3f2fd
    style Backend fill:#fff3e0
    style Auth fill:#f3e5f5
    style Database fill:#e8f5e9
```

### 7.2 보안 계층

```mermaid
graph TB
    subgraph Network["네트워크 보안"]
        HTTPS[HTTPS/TLS<br/>암호화 통신]
        CORS[CORS 설정<br/>허용된 도메인만]
    end

    subgraph Application["애플리케이션 보안"]
        JWT[JWT 인증<br/>토큰 기반]
        Validation[입력 검증<br/>XSS/SQL Injection 방어]
        RateLimit[Rate Limiting<br/>DDoS 방어]
    end

    subgraph Data["데이터 보안"]
        Bcrypt[비밀번호 해싱<br/>bcrypt]
        EnvVars[환경 변수<br/>민감 정보 보호]
    end

    HTTPS --> JWT
    CORS --> Validation
    JWT --> Bcrypt
    Validation --> EnvVars
    RateLimit --> Validation

    style Network fill:#ffebee
    style Application fill:#fff3e0
    style Data fill:#e8f5e9
```

---

## 8. 아키텍처 설계 원칙 요약

### 8.1 핵심 원칙

| 원칙 | 설명 | 적용 사례 |
|------|------|-----------|
| **관심사의 분리** | UI, 비즈니스 로직, 데이터 액세스를 명확히 분리 | Pages ← Stores ← Services ← Repositories |
| **단일 책임** | 각 모듈은 하나의 책임만 가짐 | todoController는 요청/응답만 처리 |
| **의존성 역전** | 상위 레이어가 하위 레이어에 의존 | Controllers → Services → Repositories |
| **DRY** | 중복 코드 제거, 재사용 가능한 컴포넌트/함수 | utils/, hooks/, components/common/ |
| **KISS** | 단순하고 명확한 구조 | 3-tier 아키텍처 (Routes-Services-Repositories) |

### 8.2 레이어별 책임

| 레이어 | 책임 | 금지 사항 |
|--------|------|-----------|
| **UI (Pages/Components)** | 화면 렌더링, 사용자 입력 처리 | ❌ API 직접 호출, 비즈니스 로직 |
| **State (Stores/Hooks)** | 전역 상태 관리, 로직 조율 | ❌ HTTP 통신, DB 액세스 |
| **Service** | API 통신, HTTP 요청/응답 | ❌ UI 렌더링, 상태 직접 변경 |
| **Controllers** | 요청/응답 변환, HTTP 처리 | ❌ 비즈니스 로직, DB 쿼리 |
| **Services (Backend)** | 비즈니스 로직, 유효성 검증 | ❌ HTTP 상세, DB 쿼리 직접 작성 |
| **Repositories** | DB 액세스, Prisma 쿼리 | ❌ 비즈니스 로직, HTTP 처리 |

### 8.3 의존성 규칙

```
프론트엔드: Pages → Hooks/Stores → Services → Backend API
백엔드: Routes → Controllers → Services → Repositories → Database

✅ 상위 → 하위 의존성 (허용)
❌ 하위 → 상위 의존성 (금지)
❌ 순환 의존성 (절대 금지)
```

---

## 9. 참조 문서

- [도메인 정의서](./1-domain-definition.md)
- [PRD](./3-prd.md)
- [프로젝트 구조](./5-project-structure.md)
- [사용자 시나리오](./4-user-scenarios.md)

---

## 10. 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2025-11-26 | 초안 작성 | Claude |

---

**문서 종료**
