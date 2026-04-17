import { test, expect } from '@playwright/test';

test.describe('로그인 + 메뉴 조회', () => {
  test('로그인만 테스트', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[id="loginEmail"]', 'test1@cnu.ac.kr');
    await page.fill('input[id="password"]', 'dlwldnjs');
    await page.click('button:has-text("로그인")');

    await page.waitForURL('/', { timeout: 10000 });

    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();
  });
});
