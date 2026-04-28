import { test, expect } from '@playwright/test';

test.describe('관리자 메뉴-화면 통합 UI 검증', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="loginEmail"]', 'test1@cnu.ac.kr');
    await page.fill('input[id="password"]', 'dlwldnjs');
    await page.click('button:has-text("로그인")');
    await page.waitForURL('/', { timeout: 10000 });
    await page.screenshot({ path: 'e2e-screenshots/01-login-success.png' });
  });

  test('메뉴 관리자 전체 라이프사이클 검증 (추가->스크롤->삭제)', async ({ page }) => {
    await page.goto('/admin/menus');
    await page.waitForTimeout(2000);

    // 1. [슬롯 화면 추가] 버튼 클릭 전 스샷
    await page.screenshot({ path: 'e2e-screenshots/02-01-before-click.png' });
    const addSlotBtn = page.getByRole('button', { name: '슬롯 화면 추가' });
    await addSlotBtn.click();
    await page.waitForTimeout(1000);

    // 2. 화면 리스트 중 첫 번째 화면 선택 및 모달 스샷
    const screenButton = page.locator('div.max-h-60 button').first();
    const screenName = await screenButton.locator('span.text-sm').innerText();
    await screenButton.click({ force: true });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'e2e-screenshots/02-03-modal-confirm-stage.png', fullPage: true });

    // 3. [메뉴 추가] 확정 (JS 강제 클릭)
    const submitBtn = page.locator('button').filter({ hasText: '메뉴 추가' }).last();
    const createPromise = page.waitForResponse(res => res.url().includes('/api/admin/menus') && res.request().method() === 'POST', { timeout: 15000 });
    const treePromise = page.waitForResponse(res => res.url().includes('/api/admin/menus/tree'), { timeout: 15000 });
    
    await submitBtn.evaluate(node => (node as HTMLElement).click());
    await Promise.all([createPromise, treePromise]);
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'e2e-screenshots/02-04-tree-updated-full.png', fullPage: true });

    // 4. 트리에 추가된 노드 클릭하여 상세 화면 진입
    const addedNode = page.locator('div').filter({ hasText: screenName }).filter({ hasText: /슬롯/ }).last();
    await addedNode.scrollIntoViewIfNeeded();
    await addedNode.click();
    await page.waitForTimeout(2000);
    
    // 5. 스크롤 전 상세 화면 상태 스샷
    await page.screenshot({ path: 'e2e-screenshots/03-01-menu-detail-slot.png' });

    // 6. 상세 정보창 강제 스크롤 실행
    await page.evaluate(() => {
        const containers = document.querySelectorAll('.overflow-y-auto');
        containers.forEach(container => {
            if (container.scrollHeight > container.clientHeight) {
                container.scrollTop = container.scrollHeight;
            }
        });
    });
    
    await page.waitForTimeout(2000);
    // [성공 확인용 스샷] 스크롤 후 삭제 버튼이 보여야 함
    await page.screenshot({ path: 'e2e-screenshots/03-01-SCROLL-SUCCESS-CHECK.png' });

    // 7. 메뉴 삭제 테스트
    const deleteBtn = page.locator('button').filter({ hasText: /^삭제$/ }).last();
    await expect(deleteBtn).toBeVisible({ timeout: 5000 });
    
    // 삭제 전 해당 노드의 개수 파악
    const countBefore = await page.locator('div').filter({ hasText: screenName }).filter({ hasText: /슬롯/ }).count();
    
    // 삭제 API 및 트리 갱신 API 대기 설정
    const deletePromise = page.waitForResponse(res => res.url().includes('/api/admin/menus') && res.request().method() === 'DELETE');
    const treeRefreshPromise = page.waitForResponse(res => res.url().includes('/api/admin/menus/tree'));
    
    page.once('dialog', dialog => dialog.accept());
    
    await deleteBtn.click({ force: true });
    await deletePromise;
    await treeRefreshPromise;
    
    await page.waitForTimeout(3000);
    // 삭제 후 상태 스샷
    await page.screenshot({ path: 'e2e-screenshots/03-02-after-delete.png' });

    // 최종 검증: 페이지 새로고침 후 노드 개수 확인
    await page.reload();
    await page.waitForTimeout(3000);
    const countAfter = await page.locator('div').filter({ hasText: screenName }).filter({ hasText: /슬롯/ }).count();
    
    // 개수가 1개 줄어들었거나, 항목이 아예 없어야 함
    if (countBefore > 0) {
        expect(countAfter).toBeLessThan(countBefore);
    }
  });
});
