import { test, expect } from '@playwright/test';

test.describe('SYS_ADM 권한 검증 (CRITICAL 이슈 확인)', () => {
  test('일반 사용자 로그인 후 관리자 페이지 접근 거부', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="loginEmail"]', 'test1@pknu.ac.kr');
    await page.fill('input[id="password"]', 'dlwldnjs');
    await page.click('button:has-text("로그인")');

    await page.waitForURL('/', { timeout: 10000 });

    await page.goto('/admin/role-menu');
    await page.waitForTimeout(1000);

    // RequireSysAdmRoute: 비 SYS_ADM은 홈(/)으로 리다이렉트
    expect(new URL(page.url()).pathname).toBe('/');
  });
});
