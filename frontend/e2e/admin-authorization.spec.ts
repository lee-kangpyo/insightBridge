import { test, expect } from '@playwright/test';

test.describe('SYS_ADM 권한 검증 (CRITICAL 이슈 확인)', () => {
  test('일반 사용자가 관리자 페이지 접근 시 거부되어야 함', async ({ page, request }) => {
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

    const adminResponse = await request.get('http://localhost:8000/api/admin/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (adminResponse.ok()) {
      console.log('❌ CRITICAL 이슈: 일반 사용자가 관리자 API에 접근 가능!');
      expect(true).toBe(false);
    } else {
      expect(adminResponse.status()).toBe(401);
    }
  });

  test('관리자 역할 메뉴 매트릭스 페이지 접근 권한 확인', async ({ page }) => {
    const email = 'test1@cnu.ac.kr';
    const password = 'dlwldnjs';

    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("로그인")');

    await page.waitForURL('/', { timeout: 10000 });

    await page.goto('/admin/role-menu');

    await page.waitForTimeout(1000);

    const currentUrl = page.url();

    if (currentUrl.includes('/admin/role-menu')) {
      const pageTitle = await page.locator('h1').textContent();

      if (pageTitle?.includes('권한')) {
        console.log('❌ CRITICAL 이슈: 일반 사용자가 관리자 페이지에 접근 가능!');
        expect(true).toBe(false);
      }
    } else {
      expect(currentUrl).toContain('/login');
    }
  });

  test('관리자 API 엔드포인트 권한 확인', async ({ request }) => {
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

    const endpoints = [
      'GET /api/admin/users',
      'PATCH /api/admin/users/1/role',
      'PATCH /api/admin/role-menu',
    ];

    let hasAccess = false;

    for (const endpoint of endpoints) {
      const [method, path] = endpoint.split(' ');

      let response;
      if (method === 'GET') {
        response = await request.get(`http://localhost:8000${path}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else if (method === 'PATCH') {
        response = await request.patch(`http://localhost:8000${path}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {},
        });
      }

      if (response.ok()) {
        hasAccess = true;
        console.log(`❌ CRITICAL 이슈: ${endpoint} 에 일반 사용자가 접근 가능!`);
      }
    }

    if (hasAccess) {
      expect(true).toBe(false);
    } else {
      expect(true).toBe(true);
    }
  });

  test('로그인 응답에 roles가 포함되는지 확인', async ({ request }) => {
    const email = 'test1@cnu.ac.kr';
    const password = 'dlwldnjs';

    const loginResponse = await request.post('http://localhost:8000/api/auth/login', {
      data: {
        email,
        password,
      },
    });

    expect(loginResponse.ok()).toBeTruthy();

    const data = await loginResponse.json();

    if (!data.roles) {
      console.log('⚠️ WARNING: 로그인 응답에 roles 필드가 없음');
    }

    expect(data).toHaveProperty('roles');
  });
});
