import { test, expect } from '@playwright/test';

test.describe('로그인 + 메뉴 조회', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('로그인 후 메뉴 API 호출 및 LNB 렌더링', async ({ page }) => {
    const email = 'test1@cnu.ac.kr';
    const password = 'dlwldnjs';

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("로그인")');

    await page.waitForURL('/', { timeout: 10000 });

    const token = await page.evaluate(() => {
      return localStorage.getItem('auth_token');
    });

    expect(token).toBeTruthy();

    await page.waitForTimeout(1000);

    const menus = await page.evaluate(() => {
      const authUser = localStorage.getItem('auth_user');
      if (!authUser) return null;
      return JSON.parse(authUser);
    });

    expect(menus).toBeTruthy();

    const lnbMenu = page.locator('nav').first();
    await expect(lnbMenu).toBeVisible();

    const menuItems = page.locator('nav button, nav a');
    const count = await menuItems.count();

    expect(count).toBeGreaterThan(0);
  });

  test('로그인 응답에 roles 필드 포함 확인', async ({ page, request }) => {
    const email = 'test1@cnu.ac.kr';
    const password = 'dlwldnjs';

    const response = await request.post('http://localhost:8000/api/auth/login', {
      data: {
        email,
        password,
      },
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    expect(data).toHaveProperty('roles');
    expect(Array.isArray(data.roles)).toBeTruthy();
  });

  test('메뉴 API 응답 형식 검증', async ({ page, request }) => {
    const email = 'test1@cnu.ac.kr';
    const password = 'dlwldnjs';

    const loginResponse = await request.post('http://localhost:8000/api/auth/login', {
      data: {
        email,
        password,
      },
    });

    const loginData = await loginResponse.json();
    const token = loginData.access_token;

    const menuResponse = await request.get('http://localhost:8000/api/users/me/menus', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(menuResponse.ok()).toBeTruthy();

    const menuData = await menuResponse.json();

    expect(menuData).toHaveProperty('menu_tree');
    expect(Array.isArray(menuData.menu_tree)).toBeTruthy();
  });
});
