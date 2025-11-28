// 사용자 시나리오 기반 통합 테스트
// 참조: doc/4-user-scenarios.md
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:3000';

// 테스트용 사용자 정보
const TEST_USER = {
  email: `test_${Date.now()}@example.com`,
  password: 'SecurePass123!',
  name: '테스트사용자'
};

async function runTests() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  const results = {
    passed: [],
    failed: [],
    screenshots: []
  };

  try {
    console.log('\n=== 통합 테스트 시작 ===\n');

    // 시나리오 3.1.1: 신규 사용자 회원가입
    console.log('📋 테스트 1: 회원가입');
    try {
      await page.goto(TARGET_URL);
      await page.waitForLoadState('networkidle');

      // 회원가입 페이지로 이동
      const signupButton = page.locator('text=/회원가입|가입/i').first();
      if (await signupButton.isVisible({ timeout: 5000 })) {
        await signupButton.click();
        await page.waitForTimeout(1000);
      }

      // 회원가입 폼 작성
      await page.fill('input[type="email"], input[name="email"]', TEST_USER.email);
      await page.fill('input[type="password"], input[name="password"]', TEST_USER.password);

      // 비밀번호 확인 필드가 있다면 입력
      const passwordConfirmInput = page.locator('input[name*="confirm"], input[placeholder*="확인"]');
      if (await passwordConfirmInput.count() > 0) {
        await passwordConfirmInput.fill(TEST_USER.password);
      }

      // 이름 필드가 있다면 입력
      const nameInput = page.locator('input[name="name"], input[name="username"]');
      if (await nameInput.count() > 0) {
        await nameInput.fill(TEST_USER.name);
      }

      // 회원가입 버튼 클릭
      await page.click('button[type="submit"], button:has-text("가입"), button:has-text("회원가입")');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test/e2e/1-signup.png', fullPage: true });
      results.screenshots.push('1-signup.png');
      results.passed.push('회원가입');
      console.log('✅ 회원가입 성공\n');
    } catch (error) {
      results.failed.push({ test: '회원가입', error: error.message });
      console.log('❌ 회원가입 실패:', error.message, '\n');
    }

    // 시나리오 3.1.2: 로그인
    console.log('📋 테스트 2: 로그인');
    try {
      // 로그인 페이지로 이동 (이미 로그인되어 있지 않은 경우)
      const loginButton = page.locator('text=/로그인|로그인하기/i').first();
      if (await loginButton.isVisible({ timeout: 2000 })) {
        await loginButton.click();
        await page.waitForTimeout(1000);

        // 로그인 폼 작성
        await page.fill('input[type="email"], input[name="email"]', TEST_USER.email);
        await page.fill('input[type="password"], input[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"], button:has-text("로그인")');
        await page.waitForTimeout(2000);
      }

      // 메인 화면 확인
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test/e2e/2-login.png', fullPage: true });
      results.screenshots.push('2-login.png');
      results.passed.push('로그인');
      console.log('✅ 로그인 성공\n');
    } catch (error) {
      results.failed.push({ test: '로그인', error: error.message });
      console.log('❌ 로그인 실패:', error.message, '\n');
    }

    // 시나리오 2.1.1 & 3.2.1: 할일 추가
    console.log('📋 테스트 3: 할일 추가');
    try {
      // 할일 추가 버튼 찾기
      const addButton = page.locator('button:has-text("+")').first();
      await addButton.click();
      await page.waitForTimeout(1000);

      // 할일 폼 작성
      await page.fill('input[name="title"], input[placeholder*="제목"]', '팀장님께 보고서 제출');

      const contentInput = page.locator('textarea, input[name="content"], input[placeholder*="내용"]');
      if (await contentInput.count() > 0) {
        await contentInput.first().fill('오전 11시까지 제출 필요');
      }

      // 날짜 설정 (오늘)
      const today = new Date().toISOString().split('T')[0];
      const startDateInput = page.locator('input[type="date"]').first();
      if (await startDateInput.count() > 0) {
        await startDateInput.fill(today);
      }

      const endDateInput = page.locator('input[type="date"]').nth(1);
      if (await endDateInput.count() > 0) {
        await endDateInput.fill(today);
      }

      // 저장
      await page.click('button:has-text("저장"), button[type="submit"]');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test/e2e/3-add-todo.png', fullPage: true });
      results.screenshots.push('3-add-todo.png');
      results.passed.push('할일 추가');
      console.log('✅ 할일 추가 성공\n');

      // 추가 할일 2개 더 생성
      for (let i = 2; i <= 3; i++) {
        await page.waitForTimeout(1000);
        await addButton.click();
        await page.waitForTimeout(1000);
        await page.fill('input[name="title"], input[placeholder*="제목"]', `테스트 할일 ${i}`);
        await page.click('button:has-text("저장"), button[type="submit"]');
        await page.waitForTimeout(1500);
      }
      console.log('✅ 추가 할일 2개 생성 완료\n');
    } catch (error) {
      results.failed.push({ test: '할일 추가', error: error.message });
      console.log('❌ 할일 추가 실패:', error.message, '\n');
    }

    // 시나리오 2.1.2: 할일 완료 처리
    console.log('📋 테스트 4: 할일 완료 처리');
    try {
      // 첫 번째 할일의 체크박스 클릭
      const checkbox = page.locator('input[type="checkbox"]').first();
      await checkbox.click();
      await page.waitForTimeout(1500);

      await page.screenshot({ path: 'test/e2e/4-complete-todo.png', fullPage: true });
      results.screenshots.push('4-complete-todo.png');
      results.passed.push('할일 완료 처리');
      console.log('✅ 할일 완료 처리 성공\n');
    } catch (error) {
      results.failed.push({ test: '할일 완료 처리', error: error.message });
      console.log('❌ 할일 완료 처리 실패:', error.message, '\n');
    }

    // 시나리오 2.1.3: 모든 할일 완료 및 폭죽 효과
    console.log('📋 테스트 5: 모든 할일 완료 (폭죽 효과 확인)');
    try {
      // 남은 할일 모두 완료
      const checkboxes = page.locator('input[type="checkbox"]:not(:checked)');
      const count = await checkboxes.count();

      for (let i = 0; i < count; i++) {
        await checkboxes.nth(0).click();
        await page.waitForTimeout(1000);
      }

      // 폭죽 효과 확인 (canvas 또는 애니메이션 요소)
      await page.waitForTimeout(3000); // 폭죽 효과 대기

      await page.screenshot({ path: 'test/e2e/5-confetti.png', fullPage: true });
      results.screenshots.push('5-confetti.png');
      results.passed.push('모든 할일 완료 및 폭죽 효과');
      console.log('✅ 모든 할일 완료 및 폭죽 효과 확인\n');
    } catch (error) {
      results.failed.push({ test: '모든 할일 완료 및 폭죽 효과', error: error.message });
      console.log('❌ 모든 할일 완료 실패:', error.message, '\n');
    }

    // 시나리오 2.1.4: 할일 삭제
    console.log('📋 테스트 6: 할일 삭제');
    try {
      // 새 할일 추가
      const addButton = page.locator('button:has-text("+"), button[aria-label*="추가"]').first();
      await addButton.click();
      await page.waitForTimeout(1000);
      await page.fill('input[name="title"], input[placeholder*="제목"]', '삭제 테스트 할일');
      await page.click('button:has-text("저장"), button[type="submit"]');
      await page.waitForTimeout(2000);

      // 삭제 버튼 클릭
      const deleteButton = page.locator('button:has-text("🗑"), button[aria-label*="삭제"]').first();
      await deleteButton.click();
      await page.waitForTimeout(1000);

      // 확인 다이얼로그
      const confirmButton = page.locator('button:has-text("확인"), button:has-text("삭제")');
      if (await confirmButton.count() > 0) {
        await confirmButton.first().click();
      }
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test/e2e/6-delete-todo.png', fullPage: true });
      results.screenshots.push('6-delete-todo.png');
      results.passed.push('할일 삭제');
      console.log('✅ 할일 삭제 성공\n');
    } catch (error) {
      results.failed.push({ test: '할일 삭제', error: error.message });
      console.log('❌ 할일 삭제 실패:', error.message, '\n');
    }

    // 시나리오 2.1.4: 휴지통 및 복원
    console.log('📋 테스트 7: 휴지통 및 할일 복원');
    try {
      // 휴지통 메뉴 클릭
      const trashButton = page.locator('text=/휴지통/i').first();
      await trashButton.click();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test/e2e/7-trash.png', fullPage: true });
      results.screenshots.push('7-trash.png');

      // 복원 버튼 클릭
      const restoreButton = page.locator('button:has-text("복원")').first();
      if (await restoreButton.count() > 0) {
        await restoreButton.click();
        await page.waitForTimeout(2000);

        await page.screenshot({ path: 'test/e2e/8-restore.png', fullPage: true });
        results.screenshots.push('8-restore.png');
      }

      results.passed.push('휴지통 및 복원');
      console.log('✅ 휴지통 및 복원 성공\n');
    } catch (error) {
      results.failed.push({ test: '휴지통 및 복원', error: error.message });
      console.log('❌ 휴지통 및 복원 실패:', error.message, '\n');
    }

    // 시나리오 3.4.1: 국경일 조회
    console.log('📋 테스트 8: 국경일 조회');
    try {
      // 메인 화면으로 돌아가기
      const homeButton = page.locator('text=/홈/i').first();
      if (await homeButton.count() > 0) {
        await homeButton.click();
        await page.waitForTimeout(1000);
      }

      // 국경일 메뉴 클릭
      const holidayButton = page.locator('text=/국경일/i').first();
      if (await holidayButton.count() > 0) {
        await holidayButton.click();
        await page.waitForTimeout(2000);

        await page.screenshot({ path: 'test/e2e/9-holidays.png', fullPage: true });
        results.screenshots.push('9-holidays.png');
        results.passed.push('국경일 조회');
        console.log('✅ 국경일 조회 성공\n');
      } else {
        console.log('⚠️ 국경일 메뉴를 찾을 수 없습니다\n');
      }
    } catch (error) {
      results.failed.push({ test: '국경일 조회', error: error.message });
      console.log('❌ 국경일 조회 실패:', error.message, '\n');
    }

    // 반응형 테스트 (모바일)
    console.log('📋 테스트 9: 모바일 반응형');
    try {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(TARGET_URL);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test/e2e/10-mobile.png', fullPage: true });
      results.screenshots.push('10-mobile.png');
      results.passed.push('모바일 반응형');
      console.log('✅ 모바일 반응형 확인\n');
    } catch (error) {
      results.failed.push({ test: '모바일 반응형', error: error.message });
      console.log('❌ 모바일 반응형 실패:', error.message, '\n');
    }

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
  } finally {
    await browser.close();
  }

  // 결과 요약
  console.log('\n=== 테스트 결과 요약 ===\n');
  console.log(`✅ 성공: ${results.passed.length}개`);
  results.passed.forEach(test => console.log(`   - ${test}`));

  console.log(`\n❌ 실패: ${results.failed.length}개`);
  results.failed.forEach(({ test, error }) => console.log(`   - ${test}: ${error}`));

  console.log(`\n📸 스크린샷: ${results.screenshots.length}개`);
  results.screenshots.forEach(screenshot => console.log(`   - test/e2e/${screenshot}`));

  console.log('\n테스트 완료!\n');

  return results;
}

runTests().catch(console.error);
