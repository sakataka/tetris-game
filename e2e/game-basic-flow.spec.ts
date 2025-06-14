import { expect, test } from '@playwright/test';
import './types/browser-api';

test.describe('Basic Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game
    await page.goto('/');

    // Wait for the game to load
    await page.waitForLoadState('networkidle');
  });

  test('should load game interface correctly', async ({ page }) => {
    // Check that main game elements are visible
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    await expect(page.locator('[data-testid="next-piece"]')).toBeVisible();
    await expect(page.locator('[data-testid="score"]')).toBeVisible();
    await expect(page.locator('[data-testid="level"]')).toBeVisible();
    await expect(page.locator('[data-testid="lines"]')).toBeVisible();

    // Check initial values
    await expect(page.locator('[data-testid="score"]')).toContainText('0');
    await expect(page.locator('[data-testid="level"]')).toContainText('1');
    await expect(page.locator('[data-testid="lines"]')).toContainText('0');
  });

  test('should respond to keyboard controls', async ({ page }) => {
    // Focus on the page to ensure keyboard events work
    await page.focus('body');

    // Test basic movements
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');

    // Test rotation
    await page.keyboard.press('ArrowUp');

    // Test hard drop
    await page.keyboard.press('Space');

    // The game should still be running (no error)
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  });

  test('should update score when pieces are placed', async ({ page }) => {
    // Get initial score
    const initialScore = await page.locator('[data-testid="score"]').textContent();
    expect(initialScore).toBe('0');

    // Focus on the page
    await page.focus('body');

    // Perform several hard drops to place pieces
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(100); // Short wait for game state to update
    }

    // Score should have increased (hard drop gives points)
    const updatedScore = await page.locator('[data-testid="score"]').textContent();
    const scoreValue = Number.parseInt(updatedScore?.replace(/,/g, '') || '0');
    expect(scoreValue).toBeGreaterThan(0);
  });

  test('should display game correctly on different screen sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  });

  test('should handle page refresh correctly', async ({ page }) => {
    // Focus and play a bit
    await page.focus('body');
    await page.keyboard.press('Space');

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Game should load correctly again
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    await expect(page.locator('[data-testid="score"]')).toBeVisible();

    // Score should be reset to 0
    await expect(page.locator('[data-testid="score"]')).toContainText('0');
  });

  test('should navigate between different routes', async ({ page }) => {
    // Test navigation to different pages
    const routes = ['/settings', '/statistics', '/themes', '/about'];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // Page should load without errors
      await expect(page.locator('body')).toBeVisible();

      // Should not have any console errors
      const logs = await page.evaluate(() => {
        return window.__playwright_logs || [];
      });

      // Check for critical errors (you can customize this based on your error handling)
      const errors = logs.filter((log) => log.type === 'error');
      expect(errors.length).toBe(0);
    }

    // Return to home
    await page.goto('/');
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  });

  test('should handle continuous gameplay without memory leaks', async ({ page }) => {
    // Focus on the page
    await page.focus('body');

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return performance.memory?.usedJSHeapSize || 0;
    });

    // Simulate continuous gameplay for 30 seconds
    const playDuration = 30 * 1000; // 30 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < playDuration) {
      // Perform game actions
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(50);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(50);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
      await page.keyboard.press('Space');
      await page.waitForTimeout(100);
    }

    // Check final memory usage
    const finalMemory = await page.evaluate(() => {
      return performance.memory?.usedJSHeapSize || 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50);
    }

    // Game should still be responsive
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  });
});
