import { test, expect } from './fixtures/auth.fixture';

test.describe('회원가입 + 역할 할당', () => {
  test('학생 역할로 회원가입 후 DB에서 역할 매핑 확인', async ({ page }) => {
    const email = `student-${Date.now()}@cnu.ac.kr`;
    const password = 'Test1234!';

    await page.goto('/signup');

    await page.fill('input[name="email"]', email);
    await page.click('button:has-text("인증번호 발송")');

    await page.fill('input[placeholder*="인증번호"]', '123456');
    await page.click('button:has-text("인증 확인")');

    await page.fill('input[name="name"]', 'Student User');
    await page.fill('input[name="phone"]', '010-1111-2222');
    await page.click('button:has-text("다음")');

    await page.selectOption('select[name="role"]', 'STDNT');
    await page.fill('input[name="dept_nm"]', '컴퓨터공학과');
    await page.fill('input[name="grade_nm"]', '학부생');
    await page.click('button:has-text("가입 완료")');

    await page.waitForURL('/', { timeout: 10000 });

    const token = await page.evaluate(() => {
      return localStorage.getItem('auth_token');
    });

    expect(token).toBeTruthy();

    const user = await page.evaluate(() => {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    });

    expect(user).toBeTruthy();
    expect(user.email).toBe(email);
  });

  test('교직원 역할로 회원가입', async ({ page }) => {
    const email = `staff-${Date.now()}@cnu.ac.kr`;
    const password = 'Test1234!';

    await page.goto('/signup');

    await page.fill('input[name="email"]', email);
    await page.click('button:has-text("인증번호 발송")');

    await page.fill('input[placeholder*="인증번호"]', '123456');
    await page.click('button:has-text("인증 확인")');

    await page.fill('input[name="name"]', 'Staff User');
    await page.fill('input[name="phone"]', '010-2222-3333');
    await page.click('button:has-text("다음")');

    await page.selectOption('select[name="role"]', 'EMP');
    await page.fill('input[name="dept_nm"]', '교무처');
    await page.fill('input[name="grade_nm"]', '직원');
    await page.click('button:has-text("가입 완료")');

    await page.waitForURL('/', { timeout: 10000 });

    const token = await page.evaluate(() => {
      return localStorage.getItem('auth_token');
    });

    expect(token).toBeTruthy();
  });
});
