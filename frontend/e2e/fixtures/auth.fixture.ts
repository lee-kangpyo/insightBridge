import { test as base, expect } from '@playwright/test';

type Fixtures = {
  authenticatedPage: {
    email: string;
    password: string;
    token: string;
  };
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page }, use) => {
    const email = `test-${Date.now()}@cnu.ac.kr`;
    const password = 'Test1234!';

    await page.goto('/signup');

    await page.fill('input[name="email"]', email);
    await page.click('button:has-text("인증번호 발송")');

    await page.fill('input[placeholder*="인증번호"]', '123456');
    await page.click('button:has-text("인증 확인")');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="phone"]', '010-1234-5678');
    await page.click('button:has-text("다음")');

    await page.selectOption('select[name="role"]', 'STDNT');
    await page.fill('input[name="dept_nm"]', '컴퓨터공학과');
    await page.fill('input[name="grade_nm"]', '학부생');
    await page.click('button:has-text("가입 완료")');

    await page.waitForURL('/', { timeout: 10000 });

    const token = await page.evaluate(() => {
      return localStorage.getItem('auth_token');
    });

    await use({ email, password, token: token || '' });

    await page.evaluate(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    });
  },
});

export { expect };
