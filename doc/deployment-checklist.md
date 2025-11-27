# 프로덕션 배포 체크리스트

## 1. 환경 변수 설정 (Vercel Dashboard)
- [ ] `DATABASE_URL`: Supabase Connection Pooling URL (Transaction Mode)
- [ ] `DIRECT_URL`: Supabase Direct Connection URL (Session Mode)
- [ ] `JWT_SECRET`: 강력한 난수 문자열
- [ ] `JWT_ACCESS_EXPIRES_IN`: 예: `1h`
- [ ] `CORS_ORIGIN`: 프론트엔드 도메인 (예: `https://my-todo-app.vercel.app`)
- [ ] `NODE_ENV`: `production`

## 2. 데이터베이스 준비
- [ ] `prisma generate` 실행 확인 (배포 시 자동 실행 설정됨)
- [ ] `prisma migrate deploy` 실행 확인 (배포 시 자동 실행 설정됨)
- [ ] 데이터베이스 인덱스 확인 (`User.email`, `Todo.userId`, `Todo.status` 등)
- [ ] 백업 정책 수립 (Supabase 자동 백업 확인)

## 3. 프론트엔드 최적화
- [ ] `console.log` 제거 확인
- [ ] `API_BASE_URL` 환경 변수 분리 (Vercel의 경우 자동 감지 또는 설정)
- [ ] 빌드 오류 없음 확인 (`npm run build`)

## 4. 보안 점검
- [ ] `helmet` 미들웨어 적용 확인
- [ ] `cors` 설정이 특정 도메인만 허용하는지 확인
- [ ] `express-rate-limit` 적용 확인

## 5. 모니터링
- [ ] Vercel Analytics 활성화 고려
- [ ] 에러 로깅 (Sentry 등) 도입 고려 (향후)
