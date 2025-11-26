# WHS-TodoList 프로젝트 구조 설계 원칙

**버전**: 1.0
**작성일**: 2025-11-25
**상태**: 최종
**작성자**: Claude
**참조 문서**:
- [도메인 정의서](./1-domain-definition.md)
- [PRD](./3-prd.md)
- [스타일 가이드](./4-style-guide.md)

---

## 목차

1. [최상위 원칙 (모든 스택 공통)](#1-최상위-원칙-모든-스택-공통)
2. [의존성/레이어 원칙](#2-의존성레이어-원칙)
3. [코드/네이밍 원칙](#3-코드네이밍-원칙)
4. [테스트/품질 원칙](#4-테스트품질-원칙)
5. [설정/보안/운영 원칙](#5-설정보안운영-원칙)
6. [디렉토리 구조](#6-디렉토리-구조)
7. [프로젝트별 추가 가이드](#7-프로젝트별-추가-가이드)

---

## 1. 최상위 원칙 (모든 스택 공통)

### 1.1 관심사의 분리 (Separation of Concerns)

**원칙**: 각 모듈, 컴포넌트, 함수는 하나의 책임만 가지며, 서로 다른 관심사는 명확히 분리합니다.

**예시**:
```javascript
// ❌ 나쁜 예: UI 컴포넌트가 데이터 fetching과 비즈니스 로직을 모두 처리
function TodoList() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetch('/api/todos')
      .then(res => res.json())
      .then(data => {
        const filteredTodos = data.filter(todo => !todo.isCompleted);
        setTodos(filteredTodos);
      });
  }, []);

  return <div>{/* render */}</div>;
}

// ✅ 좋은 예: 관심사를 분리
// 1. API 호출은 service 레이어
// services/todoService.js
export const fetchTodos = async () => {
  const response = await axios.get('/api/todos');
  return response.data;
};

// 2. 비즈니스 로직은 커스텀 훅
// hooks/useTodos.js
export const useTodos = () => {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const loadTodos = async () => {
      const data = await fetchTodos();
      setTodos(data);
    };
    loadTodos();
  }, []);

  return { todos };
};

// 3. UI 컴포넌트는 순수하게 렌더링만
// components/TodoList.jsx
function TodoList() {
  const { todos } = useTodos();
  return <div>{/* render */}</div>;
}
```

**체크리스트**:
- [ ] 각 파일은 단일 책임을 가지는가?
- [ ] UI 로직과 비즈니스 로직이 분리되어 있는가?
- [ ] 데이터 fetching 로직이 별도 레이어(service)에 있는가?

---

### 1.2 DRY (Don't Repeat Yourself)

**원칙**: 동일한 코드를 반복하지 말고 재사용 가능한 함수/컴포넌트로 추출합니다.

**예시**:
```javascript
// ❌ 나쁜 예: 중복된 날짜 포맷팅 로직
function TodoCard() {
  const formattedDate = new Date(todo.dueDate).toLocaleDateString('ko-KR');
  return <div>{formattedDate}</div>;
}

function HolidayCard() {
  const formattedDate = new Date(holiday.date).toLocaleDateString('ko-KR');
  return <div>{formattedDate}</div>;
}

// ✅ 좋은 예: 공통 유틸리티로 추출
// utils/dateFormatter.js
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR');
};

// components/TodoCard.jsx
import { formatDate } from '../utils/dateFormatter';

function TodoCard() {
  return <div>{formatDate(todo.dueDate)}</div>;
}
```

**체크리스트**:
- [ ] 3번 이상 반복되는 코드가 있는가? → 함수/컴포넌트로 추출
- [ ] 공통 로직이 utils, hooks, services에 정리되어 있는가?
- [ ] 컴포넌트 재사용성을 고려했는가?

---

### 1.3 KISS (Keep It Simple, Stupid)

**원칙**: 가능한 한 단순하게 작성합니다. 복잡한 추상화나 과도한 엔지니어링을 지양합니다.

**예시**:
```javascript
// ❌ 나쁜 예: 과도한 추상화
class TodoFactory {
  createTodo(type, data) {
    switch(type) {
      case 'simple': return new SimpleTodo(data);
      case 'complex': return new ComplexTodo(data);
      default: throw new Error('Unknown type');
    }
  }
}

// ✅ 좋은 예: 단순하게 (MVP에서는 불필요한 추상화 제거)
function createTodo(data) {
  return {
    todoId: uuid(),
    ...data,
    status: 'active',
    isCompleted: false,
    createdAt: new Date()
  };
}
```

**체크리스트**:
- [ ] 코드가 읽고 이해하기 쉬운가?
- [ ] 필요 이상의 추상화를 사용하지 않았는가?
- [ ] 간단한 문제를 복잡하게 해결하지 않았는가?

---

### 1.4 YAGNI (You Aren't Gonna Need It)

**원칙**: 현재 필요하지 않은 기능은 구현하지 않습니다. MVP에 집중합니다.

**예시**:
```javascript
// ❌ 나쁜 예: 미래를 위한 기능 미리 구현
function TodoItem({ todo }) {
  // MVP에서는 태그 기능이 없는데 미리 구현
  const tags = todo.tags || [];
  const categories = todo.categories || [];
  const priority = todo.priority || 'normal';

  return <div>{/* ... */}</div>;
}

// ✅ 좋은 예: MVP에 필요한 것만 구현
function TodoItem({ todo }) {
  return (
    <div>
      <h3>{todo.title}</h3>
      <p>{todo.content}</p>
      <span>{formatDate(todo.dueDate)}</span>
    </div>
  );
}
```

**체크리스트**:
- [ ] 이 기능이 MVP에 필수인가?
- [ ] 현재 요구사항에 명시된 기능인가?
- [ ] "나중에 필요할 것 같아서"라는 이유로 구현하지 않았는가?

---

### 1.5 단일 책임 원칙 (Single Responsibility Principle)

**원칙**: 각 함수, 클래스, 컴포넌트는 하나의 책임만 가져야 합니다.

**예시**:
```javascript
// ❌ 나쁜 예: 여러 책임을 가진 컴포넌트
function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [user, setUser] = useState(null);
  const [holidays, setHolidays] = useState([]);

  // 할일 로직
  const addTodo = () => { /* ... */ };
  const deleteTodo = () => { /* ... */ };

  // 사용자 로직
  const login = () => { /* ... */ };
  const logout = () => { /* ... */ };

  // 국경일 로직
  const fetchHolidays = () => { /* ... */ };

  return <div>{/* 복잡한 렌더링 */}</div>;
}

// ✅ 좋은 예: 책임을 분리
// stores/todoStore.js
export const useTodoStore = create((set) => ({
  todos: [],
  addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] })),
  deleteTodo: (id) => set((state) => ({ todos: state.todos.filter(t => t.todoId !== id) }))
}));

// stores/authStore.js
export const useAuthStore = create((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null })
}));

// pages/TodoPage.jsx
function TodoPage() {
  const { todos, addTodo, deleteTodo } = useTodoStore();
  return <TodoList todos={todos} onAdd={addTodo} onDelete={deleteTodo} />;
}
```

**체크리스트**:
- [ ] 이 파일/함수/컴포넌트가 하나의 책임만 가지는가?
- [ ] 이름이 역할을 명확히 나타내는가?
- [ ] 변경 사유가 한 가지인가?

---

## 2. 의존성/레이어 원칙

### 2.1 레이어드 아키텍처

**원칙**: 애플리케이션을 명확한 레이어로 분리하고, 각 레이어는 특정 책임을 가집니다.

#### 프론트엔드 레이어 구조

```
┌─────────────────────────────────────────┐
│     Presentation Layer (UI)             │
│  - Components (pages, components)       │
│  - Hooks (custom hooks)                 │
└───────────────┬─────────────────────────┘
                │ depends on
┌───────────────▼─────────────────────────┐
│     State Management Layer              │
│  - Stores (Zustand)                     │
│  - Global State                         │
└───────────────┬─────────────────────────┘
                │ depends on
┌───────────────▼─────────────────────────┐
│     Service Layer (API)                 │
│  - API Clients (axios)                  │
│  - HTTP Communication                   │
└───────────────┬─────────────────────────┘
                │ communicates with
┌───────────────▼─────────────────────────┐
│     Backend API                         │
└─────────────────────────────────────────┘
```

#### 백엔드 레이어 구조

```
┌─────────────────────────────────────────┐
│     Presentation Layer                  │
│  - Routes (라우트 정의)                   │
│  - Controllers (요청/응답 처리)           │
└───────────────┬─────────────────────────┘
                │ depends on
┌───────────────▼─────────────────────────┐
│     Business Logic Layer                │
│  - Services (비즈니스 로직)               │
│  - Validation (데이터 검증)               │
└───────────────┬─────────────────────────┘
                │ depends on
┌───────────────▼─────────────────────────┐
│     Data Access Layer                   │
│  - Repositories (DB 액세스)              │
│  - Prisma Client                        │
└───────────────┬─────────────────────────┘
                │ accesses
┌───────────────▼─────────────────────────┐
│     Database (PostgreSQL)               │
└─────────────────────────────────────────┘
```

**예시 (백엔드)**:
```javascript
// ✅ 좋은 예: 레이어 분리

// routes/todoRoutes.js (Presentation Layer)
const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/todos', authMiddleware, todoController.getTodos);
router.post('/todos', authMiddleware, todoController.createTodo);

module.exports = router;

// controllers/todoController.js (Presentation Layer)
const todoService = require('../services/todoService');

exports.getTodos = async (req, res) => {
  try {
    const userId = req.user.userId;
    const todos = await todoService.getTodosByUserId(userId);
    res.json({ success: true, data: todos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// services/todoService.js (Business Logic Layer)
const todoRepository = require('../repositories/todoRepository');

exports.getTodosByUserId = async (userId) => {
  const todos = await todoRepository.findByUserId(userId);
  return todos.filter(todo => todo.status !== 'deleted');
};

// repositories/todoRepository.js (Data Access Layer)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.findByUserId = async (userId) => {
  return await prisma.todo.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};
```

**체크리스트**:
- [ ] 각 레이어가 명확히 분리되어 있는가?
- [ ] 레이어 간 책임이 명확한가?
- [ ] 레이어를 넘나드는 로직이 없는가?

---

### 2.2 의존성 방향 (상위 레이어 → 하위 레이어)

**원칙**: 의존성은 항상 상위 레이어에서 하위 레이어로 향해야 합니다. 역방향 의존성을 금지합니다.

```
Presentation → Business Logic → Data Access → Database
     ✅              ✅               ✅

Database → Data Access (❌ 금지)
Business Logic → Presentation (❌ 금지)
```

**예시**:
```javascript
// ❌ 나쁜 예: 역방향 의존성
// repositories/todoRepository.js
const todoController = require('../controllers/todoController'); // ❌ Repository가 Controller에 의존

exports.create = async (data) => {
  const todo = await prisma.todo.create({ data });
  todoController.notifyCreated(todo); // ❌ 하위 레이어가 상위 레이어 호출
  return todo;
};

// ✅ 좋은 예: 올바른 의존성 방향
// repositories/todoRepository.js
exports.create = async (data) => {
  return await prisma.todo.create({ data });
};

// services/todoService.js
exports.createTodo = async (data) => {
  const todo = await todoRepository.create(data);
  // 필요하면 여기서 이벤트 발행 (상위 레이어에서 처리)
  return todo;
};

// controllers/todoController.js
exports.createTodo = async (req, res) => {
  const todo = await todoService.createTodo(req.body);
  // 여기서 추가 로직 처리 (예: 알림)
  res.json({ success: true, data: todo });
};
```

**체크리스트**:
- [ ] 하위 레이어가 상위 레이어를 import하지 않는가?
- [ ] 의존성 방향이 일관되게 하향하는가?
- [ ] 레이어 순서: Routes → Controllers → Services → Repositories

---

### 2.3 순환 의존성 금지

**원칙**: 모듈 간 순환 의존성(Circular Dependency)을 절대 만들지 않습니다.

**예시**:
```javascript
// ❌ 나쁜 예: 순환 의존성
// userService.js
const todoService = require('./todoService');

exports.deleteUser = async (userId) => {
  await todoService.deleteUserTodos(userId); // A → B
  await userRepository.delete(userId);
};

// todoService.js
const userService = require('./userService'); // B → A (순환 발생!)

exports.createTodo = async (data) => {
  const user = await userService.getUser(data.userId);
  // ...
};

// ✅ 좋은 예: 공통 로직을 별도 모듈로 분리
// userService.js
const todoRepository = require('../repositories/todoRepository');

exports.deleteUser = async (userId) => {
  await todoRepository.deleteByUserId(userId); // 직접 Repository 호출
  await userRepository.delete(userId);
};

// todoService.js
const userRepository = require('../repositories/userRepository');

exports.createTodo = async (data) => {
  const user = await userRepository.findById(data.userId); // 직접 Repository 호출
  // ...
};
```

**체크리스트**:
- [ ] 모듈 A가 B를 import하고, B가 A를 import하지 않는가?
- [ ] 빌드 시 순환 의존성 경고가 없는가?
- [ ] 공통 로직이 적절히 분리되었는가?

---

### 2.4 인터페이스 기반 의존성 주입

**원칙**: 구체적인 구현이 아닌 인터페이스(또는 추상화)에 의존합니다. (TypeScript 사용 시)

**예시 (TypeScript 사용 시)**:
```typescript
// ✅ 좋은 예: 인터페이스 기반
// interfaces/ITodoRepository.ts
export interface ITodoRepository {
  findById(id: string): Promise<Todo>;
  create(data: CreateTodoDto): Promise<Todo>;
  update(id: string, data: UpdateTodoDto): Promise<Todo>;
  delete(id: string): Promise<void>;
}

// repositories/PrismaTodoRepository.ts
export class PrismaTodoRepository implements ITodoRepository {
  async findById(id: string): Promise<Todo> {
    return await prisma.todo.findUnique({ where: { todoId: id } });
  }
  // ...
}

// services/todoService.ts
export class TodoService {
  constructor(private todoRepository: ITodoRepository) {}

  async getTodo(id: string): Promise<Todo> {
    return await this.todoRepository.findById(id);
  }
}

// 사용
const todoRepository = new PrismaTodoRepository();
const todoService = new TodoService(todoRepository);
```

**JavaScript 프로젝트의 경우**:
- TypeScript를 사용하지 않는 경우, 명확한 모듈 분리와 JSDoc으로 대체 가능
- 의존성 주입보다는 명확한 레이어 분리에 집중

**체크리스트** (TypeScript 사용 시):
- [ ] Service가 구체적인 Repository 구현이 아닌 인터페이스에 의존하는가?
- [ ] 의존성이 생성자를 통해 주입되는가?
- [ ] 테스트 시 Mock 객체로 쉽게 대체 가능한가?

---

## 3. 코드/네이밍 원칙

### 3.1 파일명 규칙

#### 프론트엔드 (React)

| 파일 유형 | 규칙 | 예시 |
|-----------|------|------|
| 컴포넌트 | PascalCase | `TodoCard.jsx`, `UserProfile.jsx` |
| 페이지 | PascalCase | `LoginPage.jsx`, `TodoListPage.jsx` |
| 훅 | camelCase, `use` 접두사 | `useTodos.js`, `useAuth.js` |
| 유틸리티 | camelCase | `dateFormatter.js`, `validator.js` |
| 스토어 | camelCase, `Store` 접미사 | `todoStore.js`, `authStore.js` |
| 서비스 | camelCase, `Service` 접미사 | `todoService.js`, `authService.js` |
| 상수 | UPPER_SNAKE_CASE | `API_ENDPOINTS.js`, `COLORS.js` |
| 타입/인터페이스 | PascalCase | `Todo.ts`, `User.ts` |

#### 백엔드 (Node.js + Express)

| 파일 유형 | 규칙 | 예시 |
|-----------|------|------|
| 컨트롤러 | camelCase, `Controller` 접미사 | `todoController.js`, `authController.js` |
| 서비스 | camelCase, `Service` 접미사 | `todoService.js`, `authService.js` |
| 리포지토리 | camelCase, `Repository` 접미사 | `todoRepository.js`, `userRepository.js` |
| 라우트 | camelCase, `Routes` 접미사 | `todoRoutes.js`, `authRoutes.js` |
| 미들웨어 | camelCase, `Middleware` 접미사 | `authMiddleware.js`, `errorMiddleware.js` |
| 유틸리티 | camelCase | `jwtHelper.js`, `passwordHelper.js` |
| 설정 | camelCase | `database.js`, `jwt.js` |

**예시 구조**:
```
frontend/src/
├── components/
│   ├── TodoCard.jsx           ✅ PascalCase
│   └── Button.jsx             ✅ PascalCase
├── pages/
│   └── LoginPage.jsx          ✅ PascalCase
├── hooks/
│   └── useTodos.js            ✅ camelCase + use prefix
├── stores/
│   └── todoStore.js           ✅ camelCase + Store suffix
├── services/
│   └── todoService.js         ✅ camelCase + Service suffix
└── utils/
    └── dateFormatter.js       ✅ camelCase

backend/src/
├── controllers/
│   └── todoController.js      ✅ camelCase + Controller suffix
├── services/
│   └── todoService.js         ✅ camelCase + Service suffix
└── repositories/
    └── todoRepository.js      ✅ camelCase + Repository suffix
```

**체크리스트**:
- [ ] 파일명이 규칙을 따르는가?
- [ ] 파일명이 내용을 명확히 표현하는가?
- [ ] 접두사/접미사가 일관되게 사용되는가?

---

### 3.2 변수/함수명 규칙

#### 일반 규칙

| 유형 | 규칙 | 예시 |
|------|------|------|
| 변수 | camelCase | `userName`, `todoList`, `isCompleted` |
| 함수 | camelCase, 동사로 시작 | `getTodos()`, `createTodo()`, `deleteTodo()` |
| 상수 | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_TODO_LENGTH` |
| Boolean | `is`, `has`, `can` 접두사 | `isCompleted`, `hasPermission`, `canEdit` |
| 비동기 함수 | 동사 + 명사 | `fetchTodos()`, `saveTodo()` |

**예시**:
```javascript
// ✅ 좋은 예
const userName = 'John Doe';              // camelCase
const todoList = [];                      // camelCase
const isCompleted = false;                // Boolean with is prefix
const MAX_RETRY_COUNT = 3;                // UPPER_SNAKE_CASE for constant

function getTodos() { /* ... */ }         // 동사로 시작
function createTodo(data) { /* ... */ }   // 동사 + 명사
async function fetchTodos() { /* ... */ } // 비동기 함수

// ❌ 나쁜 예
const UserName = 'John';                  // ❌ PascalCase (변수는 camelCase)
const todo_list = [];                     // ❌ snake_case (JavaScript는 camelCase)
const completed = false;                  // ❌ Boolean인데 is/has/can 없음
const maxRetryCount = 3;                  // ❌ 상수인데 camelCase (UPPER_SNAKE_CASE 사용)
function todos() { /* ... */ }            // ❌ 명사만 (동사로 시작해야 함)
```

#### 함수 네이밍 패턴

| 작업 | 패턴 | 예시 |
|------|------|------|
| 조회 (단일) | `get{Entity}` | `getTodo()`, `getUser()` |
| 조회 (목록) | `get{Entity}s` 또는 `list{Entity}s` | `getTodos()`, `listHolidays()` |
| 생성 | `create{Entity}` | `createTodo()`, `createUser()` |
| 수정 | `update{Entity}` | `updateTodo()`, `updateUser()` |
| 삭제 | `delete{Entity}` | `deleteTodo()`, `deleteUser()` |
| 검색 | `search{Entity}s` | `searchTodos()` |
| 필터 | `filter{Entity}s` | `filterTodosByDate()` |
| 검증 | `validate{Entity}` | `validateEmail()`, `validatePassword()` |
| API 호출 | `fetch{Entity}` | `fetchTodos()`, `fetchHolidays()` |

**체크리스트**:
- [ ] 변수명이 camelCase를 따르는가?
- [ ] Boolean 변수는 is/has/can으로 시작하는가?
- [ ] 함수명이 동사로 시작하는가?
- [ ] 이름만 보고 역할을 알 수 있는가?

---

### 3.3 컴포넌트명 규칙

#### React 컴포넌트

| 유형 | 규칙 | 예시 |
|------|------|------|
| 일반 컴포넌트 | PascalCase | `Button`, `TodoCard`, `UserProfile` |
| 페이지 컴포넌트 | PascalCase + `Page` 접미사 | `LoginPage`, `TodoListPage` |
| 레이아웃 컴포넌트 | PascalCase + `Layout` 접미사 | `MainLayout`, `AuthLayout` |
| HOC | `with{Feature}` 접두사 | `withAuth`, `withLoading` |
| Context | PascalCase + `Context` 접미사 | `AuthContext`, `ThemeContext` |

**예시**:
```javascript
// ✅ 좋은 예
function TodoCard({ todo }) { /* ... */ }           // PascalCase
function LoginPage() { /* ... */ }                  // PascalCase + Page
function MainLayout({ children }) { /* ... */ }     // PascalCase + Layout
const withAuth = (Component) => { /* ... */ };      // with prefix for HOC

// ❌ 나쁜 예
function todoCard({ todo }) { /* ... */ }           // ❌ camelCase (PascalCase 사용)
function login_page() { /* ... */ }                 // ❌ snake_case
function Todo_Card() { /* ... */ }                  // ❌ snake_case
```

**체크리스트**:
- [ ] 컴포넌트명이 PascalCase인가?
- [ ] 컴포넌트 역할이 이름에 명확히 드러나는가?
- [ ] 파일명과 컴포넌트명이 동일한가?

---

### 3.4 상수명 규칙

**원칙**: 변경되지 않는 값은 UPPER_SNAKE_CASE를 사용하고, 파일 상단 또는 별도 상수 파일에 정의합니다.

**예시**:
```javascript
// ✅ 좋은 예: constants/apiEndpoints.js
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
export const API_ENDPOINTS = {
  TODOS: '/api/todos',
  TRASH: '/api/trash',
  HOLIDAYS: '/api/holidays',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
};

// constants/validationRules.js
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_TODO_TITLE_LENGTH = 200;
export const MAX_TODO_CONTENT_LENGTH = 1000;

// constants/todoStatus.js
export const TODO_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DELETED: 'deleted',
};

// ❌ 나쁜 예: 하드코딩
function createTodo(data) {
  if (data.title.length > 200) {           // ❌ 매직 넘버
    throw new Error('Title too long');
  }

  return axios.post('/api/todos', {        // ❌ 하드코딩된 URL
    ...data,
    status: 'active'                       // ❌ 하드코딩된 값
  });
}

// ✅ 좋은 예: 상수 사용
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { TODO_STATUS } from '../constants/todoStatus';
import { MAX_TODO_TITLE_LENGTH } from '../constants/validationRules';

function createTodo(data) {
  if (data.title.length > MAX_TODO_TITLE_LENGTH) {
    throw new Error('Title too long');
  }

  return axios.post(API_ENDPOINTS.TODOS, {
    ...data,
    status: TODO_STATUS.ACTIVE
  });
}
```

**체크리스트**:
- [ ] 매직 넘버를 상수로 추출했는가?
- [ ] 하드코딩된 문자열을 상수로 정의했는가?
- [ ] 상수명이 UPPER_SNAKE_CASE인가?
- [ ] 관련 상수들이 객체로 그룹화되어 있는가?

---

### 3.5 코드 포맷팅 (ESLint, Prettier)

**원칙**: 일관된 코드 스타일을 위해 ESLint와 Prettier를 설정하고 자동 포맷팅을 적용합니다.

#### ESLint 설정 (`.eslintrc.json`)

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

#### Prettier 설정 (`.prettierrc`)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

#### VS Code 설정 (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

**체크리스트**:
- [ ] ESLint와 Prettier가 프로젝트에 설정되어 있는가?
- [ ] 저장 시 자동 포맷팅이 적용되는가?
- [ ] 팀원 간 동일한 설정을 사용하는가?
- [ ] 커밋 전 lint 체크가 실행되는가? (husky + lint-staged)

---

## 4. 테스트/품질 원칙

### 4.1 테스트 커버리지 목표

**MVP 단계 목표**:
- **핵심 비즈니스 로직**: 70% 이상
- **유틸리티 함수**: 80% 이상
- **API 엔드포인트**: 주요 CRUD 작업 커버

**우선순위**:
1. **P0**: 비즈니스 로직 (Services)
2. **P1**: API 엔드포인트 (Controllers)
3. **P2**: 유틸리티 함수
4. **P3**: UI 컴포넌트 (선택)

**체크리스트**:
- [ ] 핵심 비즈니스 로직에 테스트가 있는가?
- [ ] 엣지 케이스를 테스트하는가?
- [ ] 실패 케이스를 테스트하는가?

---

### 4.2 단위 테스트 작성 원칙

**원칙**: 각 함수/모듈을 독립적으로 테스트합니다. 외부 의존성은 Mock으로 대체합니다.

#### 백엔드 테스트 예시 (Jest)

```javascript
// ✅ 좋은 예: services/todoService.test.js
const todoService = require('./todoService');
const todoRepository = require('../repositories/todoRepository');

// Repository를 Mock으로 대체
jest.mock('../repositories/todoRepository');

describe('TodoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTodosByUserId', () => {
    it('should return active todos for a user', async () => {
      // Arrange
      const userId = 'user-123';
      const mockTodos = [
        { todoId: '1', title: 'Test Todo', status: 'active' },
        { todoId: '2', title: 'Deleted Todo', status: 'deleted' },
      ];
      todoRepository.findByUserId.mockResolvedValue(mockTodos);

      // Act
      const result = await todoService.getTodosByUserId(userId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('active');
      expect(todoRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return empty array when user has no todos', async () => {
      // Arrange
      const userId = 'user-456';
      todoRepository.findByUserId.mockResolvedValue([]);

      // Act
      const result = await todoService.getTodosByUserId(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
```

#### 프론트엔드 테스트 예시 (React Testing Library)

```javascript
// ✅ 좋은 예: components/TodoCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import TodoCard from './TodoCard';

describe('TodoCard', () => {
  const mockTodo = {
    todoId: '1',
    title: 'Test Todo',
    content: 'Test content',
    dueDate: '2025-11-28',
    isCompleted: false,
  };

  const mockOnComplete = jest.fn();
  const mockOnDelete = jest.fn();

  it('should render todo information', () => {
    // Act
    render(<TodoCard todo={mockTodo} onComplete={mockOnComplete} onDelete={mockOnDelete} />);

    // Assert
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should call onComplete when checkbox is clicked', () => {
    // Arrange
    render(<TodoCard todo={mockTodo} onComplete={mockOnComplete} onDelete={mockOnDelete} />);
    const checkbox = screen.getByRole('checkbox');

    // Act
    fireEvent.click(checkbox);

    // Assert
    expect(mockOnComplete).toHaveBeenCalledWith('1');
  });
});
```

**테스트 네이밍 패턴**:
```javascript
describe('ComponentName or FunctionName', () => {
  it('should [expected behavior] when [condition]', () => {
    // test
  });
});
```

**체크리스트**:
- [ ] 각 테스트가 독립적으로 실행 가능한가?
- [ ] Arrange-Act-Assert 패턴을 따르는가?
- [ ] 외부 의존성을 Mock으로 대체했는가?
- [ ] 테스트 이름이 명확한가?

---

### 4.3 통합 테스트 전략

**원칙**: 여러 모듈이 함께 동작하는지 테스트합니다. 주로 API 엔드포인트를 테스트합니다.

**예시 (Backend API Integration Test)**:
```javascript
// ✅ 좋은 예: tests/integration/todoApi.test.js
const request = require('supertest');
const app = require('../../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Todo API Integration Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // 테스트용 사용자 생성 및 로그인
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        username: 'Test User',
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = loginRes.body.data.accessToken;
    userId = loginRes.body.data.user.userId;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.todo.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { userId } });
    await prisma.$disconnect();
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      // Arrange
      const newTodo = {
        title: 'Integration Test Todo',
        content: 'Test content',
        startDate: '2025-11-25',
        dueDate: '2025-11-28',
      };

      // Act
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTodo);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newTodo.title);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Test' });

      // Assert
      expect(response.status).toBe(401);
    });
  });
});
```

**체크리스트**:
- [ ] 데이터베이스 연동이 포함되어 있는가?
- [ ] 테스트 전후 데이터 정리가 되는가?
- [ ] 인증이 필요한 API는 토큰을 포함하는가?
- [ ] 성공 케이스와 실패 케이스를 모두 테스트하는가?

---

### 4.4 E2E 테스트 (선택)

**MVP 단계**: E2E 테스트는 선택 사항입니다. 시간이 허용되면 주요 사용자 플로우만 테스트합니다.

**우선순위 플로우**:
1. 회원가입 → 로그인 → 할일 생성
2. 할일 완료 처리
3. 할일 삭제 → 휴지통 → 복원

**도구**: Playwright, Cypress (2차 개발 시 고려)

**체크리스트**:
- [ ] 핵심 사용자 플로우가 E2E로 테스트되는가? (선택)
- [ ] 테스트 환경이 프로덕션과 유사한가? (선택)

---

### 4.5 코드 리뷰 체크리스트

**기능**:
- [ ] 요구사항을 충족하는가?
- [ ] 비즈니스 로직이 올바른가?
- [ ] 엣지 케이스를 처리하는가?

**코드 품질**:
- [ ] 함수/컴포넌트가 단일 책임을 가지는가?
- [ ] 중복 코드가 없는가? (DRY)
- [ ] 과도한 추상화가 없는가? (KISS, YAGNI)
- [ ] 네이밍이 명확한가?

**보안**:
- [ ] 사용자 입력을 검증하는가?
- [ ] SQL Injection / XSS 취약점이 없는가?
- [ ] 민감한 정보가 로그에 출력되지 않는가?
- [ ] 환경 변수를 사용하는가?

**성능**:
- [ ] 불필요한 렌더링이 없는가? (React)
- [ ] 데이터베이스 쿼리가 최적화되어 있는가?
- [ ] N+1 쿼리 문제가 없는가?

**테스트**:
- [ ] 핵심 로직에 테스트가 있는가?
- [ ] 테스트가 통과하는가?
- [ ] 테스트 커버리지가 충분한가?

**문서화**:
- [ ] 복잡한 로직에 주석이 있는가?
- [ ] API 변경 사항이 문서화되었는가?

---

## 5. 설정/보안/운영 원칙

### 5.1 환경 변수 관리 (.env)

**원칙**:
- 환경별 설정값은 환경 변수로 관리합니다.
- `.env` 파일은 절대 Git에 커밋하지 않습니다.
- `.env.example` 파일로 필요한 환경 변수 목록을 공유합니다.

#### 프론트엔드 `.env` 예시

```bash
# .env (Git에 커밋하지 않음)
REACT_APP_API_BASE_URL=http://localhost:3000
REACT_APP_ENV=development
```

```bash
# .env.example (Git에 커밋)
REACT_APP_API_BASE_URL=
REACT_APP_ENV=
```

#### 백엔드 `.env` 예시

```bash
# .env (Git에 커밋하지 않음)
DATABASE_URL=postgresql://user:password@localhost:5432/whs_todolist
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

```bash
# .env.example (Git에 커밋)
DATABASE_URL=
JWT_SECRET=
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
PORT=3000
NODE_ENV=development
CORS_ORIGIN=
```

#### 환경 변수 사용 예시

```javascript
// ✅ 좋은 예: config/database.js
require('dotenv').config();

module.exports = {
  databaseUrl: process.env.DATABASE_URL,
};

// ✅ 좋은 예: config/jwt.js
module.exports = {
  secret: process.env.JWT_SECRET,
  accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
};

// ❌ 나쁜 예: 하드코딩
const JWT_SECRET = 'my-secret-key';  // ❌ 절대 하드코딩 금지!
```

#### `.gitignore` 설정

```
# 환경 변수
.env
.env.local
.env.production

# 민감한 정보
*.key
*.pem
credentials.json
```

**체크리스트**:
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] `.env.example` 파일이 제공되는가?
- [ ] 민감한 정보가 코드에 하드코딩되어 있지 않은가?
- [ ] 환경별로 다른 값을 사용하는가? (dev, prod)

---

### 5.2 시크릿 관리

**원칙**: API 키, 비밀번호, 토큰 등 민감한 정보는 절대 코드에 포함하지 않습니다.

#### 보안이 필요한 정보

| 유형 | 예시 | 관리 방법 |
|------|------|-----------|
| 데이터베이스 자격증명 | `DATABASE_URL` | 환경 변수 |
| JWT Secret | `JWT_SECRET` | 환경 변수 |
| API 키 | `OPENAI_API_KEY` | 환경 변수 |
| 외부 서비스 토큰 | `STRIPE_API_KEY` | 환경 변수 |
| 암호화 키 | `ENCRYPTION_KEY` | 환경 변수 |

#### 시크릿 생성 방법

```bash
# JWT Secret 생성 (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Vercel 환경 변수 설정

```bash
# Vercel CLI로 환경 변수 추가
vercel env add JWT_SECRET production
vercel env add DATABASE_URL production
```

**체크리스트**:
- [ ] JWT Secret이 안전하게 생성되었는가? (최소 32자 이상)
- [ ] 프로덕션과 개발 환경의 시크릿이 다른가?
- [ ] 시크릿이 로그에 출력되지 않는가?
- [ ] 배포 플랫폼에 환경 변수가 설정되었는가?

---

### 5.3 API 키 보호

**원칙**:
- 프론트엔드에서는 외부 API 키를 직접 사용하지 않습니다.
- 백엔드를 통해 프록시하여 API 키를 보호합니다.

**예시**:
```javascript
// ❌ 나쁜 예: 프론트엔드에서 직접 API 키 사용
// frontend/src/services/weatherService.js
const API_KEY = 'sk-1234567890abcdef';  // ❌ 노출 위험!

export const getWeather = async (city) => {
  const response = await fetch(`https://api.weather.com?key=${API_KEY}&city=${city}`);
  return response.json();
};

// ✅ 좋은 예: 백엔드 프록시 사용
// frontend/src/services/weatherService.js
export const getWeather = async (city) => {
  const response = await axios.get('/api/weather', { params: { city } });
  return response.data;
};

// backend/src/controllers/weatherController.js
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;  // ✅ 환경 변수로 관리

exports.getWeather = async (req, res) => {
  const { city } = req.query;
  const response = await axios.get(`https://api.weather.com?key=${WEATHER_API_KEY}&city=${city}`);
  res.json(response.data);
};
```

**체크리스트**:
- [ ] 프론트엔드 코드에 API 키가 노출되지 않는가?
- [ ] 외부 API 호출은 백엔드를 통하는가?
- [ ] 환경 변수로 API 키를 관리하는가?

---

### 5.4 CORS 설정

**원칙**: 허용된 Origin에서만 API 접근을 허용합니다.

**예시**:
```javascript
// ✅ 좋은 예: backend/src/middlewares/corsMiddleware.js
const cors = require('cors');

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',  // 개발 환경
  'https://whs-todolist.vercel.app',                    // 프로덕션
];

const corsOptions = {
  origin: (origin, callback) => {
    // origin이 없는 경우 (같은 도메인) 또는 허용된 origin인 경우
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // 쿠키 허용
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = cors(corsOptions);

// app.js
const corsMiddleware = require('./middlewares/corsMiddleware');
app.use(corsMiddleware);
```

**체크리스트**:
- [ ] CORS가 설정되어 있는가?
- [ ] 허용된 Origin이 명시되어 있는가?
- [ ] 프로덕션 도메인이 포함되어 있는가?
- [ ] 불필요한 Origin이 허용되지 않는가?

---

### 5.5 Rate Limiting

**원칙**: API 남용을 방지하기 위해 요청 횟수를 제한합니다.

**예시**:
```javascript
// ✅ 좋은 예: middlewares/rateLimitMiddleware.js
const rateLimit = require('express-rate-limit');

// 일반 API 제한
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15분
  max: 100,                   // 최대 100 요청
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// 인증 API 제한 (더 엄격)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15분
  max: 5,                     // 최대 5 요청 (무차별 대입 공격 방지)
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,  // 성공한 요청은 카운트하지 않음
});

module.exports = { generalLimiter, authLimiter };

// routes/authRoutes.js
const { authLimiter } = require('../middlewares/rateLimitMiddleware');

router.post('/login', authLimiter, authController.login);
router.post('/register', authLimiter, authController.register);
```

**체크리스트**:
- [ ] Rate Limiting이 설정되어 있는가?
- [ ] 인증 API에 더 엄격한 제한이 있는가?
- [ ] 제한 초과 시 명확한 에러 메시지가 반환되는가?

---

### 5.6 로깅 전략

**원칙**:
- 적절한 로그 레벨을 사용합니다 (error, warn, info, debug).
- 민감한 정보는 로그에 출력하지 않습니다.
- 프로덕션 환경에서는 error와 warn만 로그합니다.

**예시**:
```javascript
// ✅ 좋은 예: utils/logger.js
const winston = require('winston');

const logLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// 민감한 정보 필터링
const sanitize = (data) => {
  const sanitized = { ...data };
  if (sanitized.password) sanitized.password = '***';
  if (sanitized.token) sanitized.token = '***';
  return sanitized;
};

module.exports = { logger, sanitize };

// 사용 예시
const { logger, sanitize } = require('../utils/logger');

// ✅ 좋은 예
logger.info('User logged in', { userId: user.userId });
logger.error('Database connection failed', { error: error.message });
logger.debug('Request body', sanitize(req.body));  // 비밀번호 필터링

// ❌ 나쁜 예
console.log('User:', user);  // ❌ 민감한 정보 포함 가능
logger.info('Password:', req.body.password);  // ❌ 절대 금지!
```

**로그 레벨 사용 가이드**:

| 레벨 | 용도 | 예시 |
|------|------|------|
| `error` | 에러 발생 | `Database connection failed` |
| `warn` | 경고 (정상 동작하지만 주의) | `API rate limit approaching` |
| `info` | 중요한 이벤트 | `User logged in`, `Todo created` |
| `debug` | 디버깅 정보 (개발 환경만) | `Request body`, `Query result` |

**체크리스트**:
- [ ] 적절한 로그 레벨을 사용하는가?
- [ ] 민감한 정보가 로그에 출력되지 않는가?
- [ ] 프로덕션 환경에서는 debug 로그가 출력되지 않는가?
- [ ] 에러 로그가 별도 파일로 저장되는가?

---

## 6. 디렉토리 구조

### 6.1 프론트엔드 구조 (React 18 + Zustand + Tailwind)

```
frontend/
├── public/                     # 정적 파일
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/             # 재사용 가능한 컴포넌트
│   │   ├── common/             # 공통 컴포넌트
│   │   │   ├── Button.jsx      # 버튼 컴포넌트
│   │   │   ├── Input.jsx       # 입력 필드
│   │   │   ├── Modal.jsx       # 모달
│   │   │   └── Loading.jsx     # 로딩 스피너
│   │   ├── todo/               # 할일 관련 컴포넌트
│   │   │   ├── TodoCard.jsx    # 할일 카드
│   │   │   ├── TodoList.jsx    # 할일 목록
│   │   │   ├── TodoForm.jsx    # 할일 추가/수정 폼
│   │   │   └── TodoFilter.jsx  # 필터 컴포넌트
│   │   ├── holiday/            # 국경일 관련 컴포넌트
│   │   │   └── HolidayCard.jsx
│   │   └── layout/             # 레이아웃 컴포넌트
│   │       ├── Header.jsx      # 헤더
│   │       ├── Sidebar.jsx     # 사이드바 (선택)
│   │       └── MainLayout.jsx  # 메인 레이아웃
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── LoginPage.jsx       # 로그인 페이지
│   │   ├── RegisterPage.jsx    # 회원가입 페이지
│   │   ├── TodoListPage.jsx    # 할일 목록 (메인)
│   │   ├── TrashPage.jsx       # 휴지통 페이지
│   │   ├── HolidayPage.jsx     # 국경일 페이지
│   │   └── ProfilePage.jsx     # 프로필 페이지
│   ├── stores/                 # Zustand 스토어
│   │   ├── todoStore.js        # 할일 상태 관리
│   │   ├── authStore.js        # 인증 상태 관리
│   │   ├── holidayStore.js     # 국경일 상태 관리
│   │   └── uiStore.js          # UI 상태 (모달, 토스트 등)
│   ├── services/               # API 서비스
│   │   ├── api.js              # Axios 인스턴스 설정
│   │   ├── todoService.js      # 할일 API 호출
│   │   ├── authService.js      # 인증 API 호출
│   │   ├── holidayService.js   # 국경일 API 호출
│   │   └── userService.js      # 사용자 API 호출
│   ├── hooks/                  # 커스텀 훅
│   │   ├── useTodos.js         # 할일 로직 훅
│   │   ├── useAuth.js          # 인증 로직 훅
│   │   ├── useDebounce.js      # Debounce 훅
│   │   └── useLocalStorage.js  # LocalStorage 훅
│   ├── utils/                  # 유틸리티 함수
│   │   ├── dateFormatter.js    # 날짜 포맷팅
│   │   ├── validator.js        # 검증 함수
│   │   ├── tokenManager.js     # JWT 토큰 관리
│   │   └── errorHandler.js     # 에러 처리
│   ├── types/                  # TypeScript 타입 (선택)
│   │   ├── todo.ts             # Todo 타입
│   │   └── user.ts             # User 타입
│   ├── constants/              # 상수
│   │   ├── apiEndpoints.js     # API 엔드포인트
│   │   ├── todoStatus.js       # 할일 상태 상수
│   │   └── colors.js           # 색상 상수
│   ├── assets/                 # 정적 자산
│   │   ├── images/
│   │   └── icons/
│   ├── styles/                 # 글로벌 스타일 (선택)
│   │   └── global.css
│   ├── App.jsx                 # 루트 컴포넌트
│   ├── main.jsx                # 엔트리 포인트
│   └── routes.jsx              # 라우트 설정
├── .env                        # 환경 변수 (Git 제외)
├── .env.example                # 환경 변수 예시
├── .eslintrc.json              # ESLint 설정
├── .prettierrc                 # Prettier 설정
├── .gitignore
├── package.json
├── vite.config.js              # Vite 설정
└── tailwind.config.js          # Tailwind 설정
```

#### 각 폴더의 역할

| 폴더 | 역할 | 예시 |
|------|------|------|
| `components/` | 재사용 가능한 UI 컴포넌트 | `Button.jsx`, `TodoCard.jsx` |
| `pages/` | 라우트별 페이지 컴포넌트 | `LoginPage.jsx`, `TodoListPage.jsx` |
| `stores/` | Zustand 스토어 (전역 상태) | `todoStore.js`, `authStore.js` |
| `services/` | API 통신 레이어 | `todoService.js` |
| `hooks/` | 커스텀 React 훅 | `useTodos.js`, `useAuth.js` |
| `utils/` | 순수 유틸리티 함수 | `dateFormatter.js`, `validator.js` |
| `constants/` | 상수 정의 | `API_ENDPOINTS`, `TODO_STATUS` |
| `assets/` | 이미지, 아이콘 등 정적 자산 | `logo.png` |

---

### 6.2 백엔드 구조 (Node.js + Express + Prisma)

```
backend/
├── src/
│   ├── controllers/            # 컨트롤러 (요청/응답 처리)
│   │   ├── todoController.js   # 할일 컨트롤러
│   │   ├── authController.js   # 인증 컨트롤러
│   │   ├── holidayController.js# 국경일 컨트롤러
│   │   └── userController.js   # 사용자 컨트롤러
│   ├── services/               # 비즈니스 로직
│   │   ├── todoService.js      # 할일 비즈니스 로직
│   │   ├── authService.js      # 인증 비즈니스 로직
│   │   ├── holidayService.js   # 국경일 비즈니스 로직
│   │   └── userService.js      # 사용자 비즈니스 로직
│   ├── repositories/           # 데이터 액세스
│   │   ├── todoRepository.js   # 할일 DB 액세스
│   │   ├── userRepository.js   # 사용자 DB 액세스
│   │   └── holidayRepository.js# 국경일 DB 액세스
│   ├── middlewares/            # 미들웨어
│   │   ├── authMiddleware.js   # JWT 인증 미들웨어
│   │   ├── errorMiddleware.js  # 에러 핸들링 미들웨어
│   │   ├── validationMiddleware.js # 요청 검증 미들웨어
│   │   ├── corsMiddleware.js   # CORS 설정
│   │   └── rateLimitMiddleware.js # Rate Limiting
│   ├── routes/                 # 라우트 정의
│   │   ├── index.js            # 라우트 통합
│   │   ├── todoRoutes.js       # 할일 라우트
│   │   ├── authRoutes.js       # 인증 라우트
│   │   ├── holidayRoutes.js    # 국경일 라우트
│   │   └── userRoutes.js       # 사용자 라우트
│   ├── utils/                  # 유틸리티
│   │   ├── jwtHelper.js        # JWT 생성/검증
│   │   ├── passwordHelper.js   # 비밀번호 해싱
│   │   ├── validator.js        # 검증 함수
│   │   └── logger.js           # 로깅
│   ├── config/                 # 설정
│   │   ├── database.js         # DB 설정
│   │   ├── jwt.js              # JWT 설정
│   │   └── cors.js             # CORS 설정
│   ├── types/                  # TypeScript 타입 (선택)
│   │   └── express.d.ts        # Express 타입 확장
│   ├── app.js                  # Express 앱 설정
│   └── server.js               # 서버 진입점
├── prisma/
│   ├── schema.prisma           # Prisma 스키마
│   ├── migrations/             # DB 마이그레이션
│   └── seed.js                 # 시드 데이터 (선택)
├── tests/                      # 테스트
│   ├── unit/                   # 단위 테스트
│   │   ├── services/
│   │   └── utils/
│   └── integration/            # 통합 테스트
│       └── todoApi.test.js
├── .env                        # 환경 변수 (Git 제외)
├── .env.example                # 환경 변수 예시
├── .eslintrc.json              # ESLint 설정
├── .prettierrc                 # Prettier 설정
├── .gitignore
├── package.json
└── jest.config.js              # Jest 설정 (테스트)
```

#### 각 폴더의 역할

| 폴더 | 역할 | 예시 |
|------|------|------|
| `controllers/` | HTTP 요청/응답 처리 | `todoController.js` |
| `services/` | 비즈니스 로직 (핵심 기능) | `todoService.js` |
| `repositories/` | DB 액세스 (Prisma 사용) | `todoRepository.js` |
| `middlewares/` | 요청 전처리 (인증, 검증) | `authMiddleware.js` |
| `routes/` | 라우트 정의 | `todoRoutes.js` |
| `utils/` | 순수 유틸리티 함수 | `jwtHelper.js`, `passwordHelper.js` |
| `config/` | 설정 파일 | `database.js`, `jwt.js` |
| `prisma/` | Prisma 스키마 및 마이그레이션 | `schema.prisma` |

---

### 6.3 디렉토리 구조 원칙 요약

#### 프론트엔드

1. **컴포넌트 분리**: `components/`는 재사용 가능한 컴포넌트, `pages/`는 라우트별 페이지
2. **비즈니스 로직 분리**: `hooks/`와 `stores/`에 로직 추출
3. **API 레이어 분리**: `services/`에서 모든 API 호출 처리
4. **유틸리티 분리**: 순수 함수는 `utils/`에 배치
5. **상수 중앙화**: `constants/`에서 모든 상수 관리

#### 백엔드

1. **레이어드 아키텍처**: Controllers → Services → Repositories
2. **단일 책임**: 각 파일은 하나의 엔티티/기능만 처리
3. **미들웨어 분리**: 인증, 검증, 에러 처리는 별도 미들웨어로
4. **설정 중앙화**: `config/`에서 모든 설정 관리
5. **Prisma 분리**: `prisma/` 폴더에 스키마와 마이그레이션 관리

---

## 7. 프로젝트별 추가 가이드

### 7.1 React 컴포넌트 작성 가이드

#### 함수형 컴포넌트 사용

```javascript
// ✅ 좋은 예: 함수형 컴포넌트
function TodoCard({ todo, onComplete, onDelete }) {
  return (
    <div className="todo-card">
      <h3>{todo.title}</h3>
      <p>{todo.content}</p>
      <button onClick={() => onComplete(todo.todoId)}>Complete</button>
      <button onClick={() => onDelete(todo.todoId)}>Delete</button>
    </div>
  );
}

// ❌ 나쁜 예: 클래스 컴포넌트 (React 18에서는 함수형 권장)
class TodoCard extends React.Component {
  render() {
    const { todo, onComplete, onDelete } = this.props;
    return <div>...</div>;
  }
}
```

#### Props Destructuring

```javascript
// ✅ 좋은 예: Props를 구조 분해
function TodoCard({ todo, onComplete, onDelete }) {
  return <div>{todo.title}</div>;
}

// ❌ 나쁜 예: props 객체 직접 사용
function TodoCard(props) {
  return <div>{props.todo.title}</div>;
}
```

#### 조건부 렌더링

```javascript
// ✅ 좋은 예: 명확한 조건부 렌더링
function TodoCard({ todo }) {
  if (!todo) {
    return null;
  }

  return (
    <div>
      <h3>{todo.title}</h3>
      {todo.isCompleted && <span className="badge">Completed</span>}
      {todo.dueDate ? (
        <p>Due: {formatDate(todo.dueDate)}</p>
      ) : (
        <p>No due date</p>
      )}
    </div>
  );
}
```

---

### 7.2 Zustand 스토어 작성 가이드

**예시**:
```javascript
// ✅ 좋은 예: stores/todoStore.js
import { create } from 'zustand';
import { todoService } from '../services/todoService';

export const useTodoStore = create((set, get) => ({
  // State
  todos: [],
  loading: false,
  error: null,

  // Actions
  fetchTodos: async () => {
    set({ loading: true, error: null });
    try {
      const todos = await todoService.getTodos();
      set({ todos, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addTodo: async (todoData) => {
    try {
      const newTodo = await todoService.createTodo(todoData);
      set((state) => ({ todos: [newTodo, ...state.todos] }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  deleteTodo: async (todoId) => {
    try {
      await todoService.deleteTodo(todoId);
      set((state) => ({
        todos: state.todos.filter((todo) => todo.todoId !== todoId),
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Selectors (선택)
  getActiveTodos: () => {
    const { todos } = get();
    return todos.filter((todo) => todo.status === 'active');
  },
}));
```

---

### 7.3 Prisma 사용 가이드

#### 스키마 작성

```prisma
// ✅ 좋은 예: prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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
  todoId      String     @id @default(uuid())
  userId      String
  user        User       @relation(fields: [userId], references: [userId], onDelete: Cascade)
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

#### Repository 패턴 사용

```javascript
// ✅ 좋은 예: repositories/todoRepository.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.findByUserId = async (userId, status = 'active') => {
  return await prisma.todo.findMany({
    where: {
      userId,
      status,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

exports.create = async (data) => {
  return await prisma.todo.create({
    data,
  });
};

exports.update = async (todoId, data) => {
  return await prisma.todo.update({
    where: { todoId },
    data,
  });
};

exports.softDelete = async (todoId) => {
  return await prisma.todo.update({
    where: { todoId },
    data: {
      status: 'deleted',
      deletedAt: new Date(),
    },
  });
};

exports.hardDelete = async (todoId) => {
  return await prisma.todo.delete({
    where: { todoId },
  });
};
```

---

### 7.4 API 서비스 작성 가이드 (프론트엔드)

**예시**:
```javascript
// ✅ 좋은 예: services/api.js (Axios 설정)
import axios from 'axios';
import { API_BASE_URL } from '../constants/apiEndpoints';
import { getAccessToken, setAccessToken } from '../utils/tokenManager';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: Access Token 추가
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 토큰 만료 시 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// services/todoService.js
import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const getTodos = async (params) => {
  const response = await api.get(API_ENDPOINTS.TODOS, { params });
  return response.data.data;
};

export const createTodo = async (todoData) => {
  const response = await api.post(API_ENDPOINTS.TODOS, todoData);
  return response.data.data;
};

export const updateTodo = async (todoId, todoData) => {
  const response = await api.put(`${API_ENDPOINTS.TODOS}/${todoId}`, todoData);
  return response.data.data;
};

export const deleteTodo = async (todoId) => {
  const response = await api.delete(`${API_ENDPOINTS.TODOS}/${todoId}`);
  return response.data;
};
```

---

## 8. 부록

### 8.1 체크리스트 요약

#### 개발 시작 전
- [ ] `.env` 파일 설정 완료
- [ ] ESLint, Prettier 설정 완료
- [ ] Git 초기화 및 `.gitignore` 설정
- [ ] 디렉토리 구조 생성

#### 코드 작성 시
- [ ] 단일 책임 원칙 준수
- [ ] DRY 원칙 준수 (중복 제거)
- [ ] KISS 원칙 (단순하게 작성)
- [ ] YAGNI 원칙 (필요한 것만 구현)
- [ ] 네이밍 규칙 준수
- [ ] 레이어 분리 명확

#### 커밋 전
- [ ] ESLint 에러 없음
- [ ] 테스트 통과
- [ ] 민감한 정보 제거
- [ ] 불필요한 console.log 제거
- [ ] 코드 리뷰 체크리스트 확인

#### 배포 전
- [ ] 환경 변수 설정 확인 (Vercel)
- [ ] CORS 설정 확인
- [ ] Rate Limiting 설정 확인
- [ ] 프로덕션 빌드 테스트
- [ ] DB 마이그레이션 완료

---

### 8.2 참조 문서

- [도메인 정의서](./1-domain-definition.md)
- [PRD](./3-prd.md)
- [스타일 가이드](./4-style-guide.md)

### 8.3 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2025-11-25 | 초안 작성 | Claude |

---

**문서 종료**