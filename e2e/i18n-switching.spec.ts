import { expect, test } from '@playwright/test';
import './types/browser-api';

test.describe('Internationalization (i18n)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should switch from English to Japanese and update UI', async ({ page }) => {
    // Verify initial English state
    await expect(page.locator('[data-testid="game-tab"]')).toContainText('Game');
    await expect(page.locator('[data-testid="settings-tab"]')).toContainText('Settings');
    await expect(page.locator('[data-testid="theme-tab"]')).toContainText('Themes');
    await expect(page.locator('[data-testid="stats-tab"]')).toContainText('Statistics');

    // Switch to settings tab
    await page.click('[data-testid="settings-tab"]');
    await page.waitForTimeout(500);

    // Change language to Japanese
    await page.click('[data-testid="language-selector"]');
    await page.locator('[data-value="ja"]').click();
    await page.waitForTimeout(1000); // Wait for language resources to load

    // Verify Japanese UI elements
    await expect(page.locator('[data-testid="game-tab"]')).toContainText('ゲーム');
    await expect(page.locator('[data-testid="settings-tab"]')).toContainText('設定');
    await expect(page.locator('[data-testid="theme-tab"]')).toContainText('テーマ');
    await expect(page.locator('[data-testid="stats-tab"]')).toContainText('統計');
  });

  test('should switch from Japanese to English and update UI', async ({ page }) => {
    // First set to Japanese
    await page.click('[data-testid="settings-tab"]');
    await page.waitForTimeout(500);

    await page.click('[data-testid="language-selector"]');
    await page.locator('[data-value="ja"]').click();
    await page.waitForTimeout(1000);

    // Verify Japanese state
    await expect(page.locator('[data-testid="game-tab"]')).toContainText('ゲーム');

    // Switch back to English
    await page.click('[data-testid="language-selector"]');
    await page.locator('[data-value="en"]').click();
    await page.waitForTimeout(1000);

    // Verify English UI elements
    await expect(page.locator('[data-testid="game-tab"]')).toContainText('Game');
    await expect(page.locator('[data-testid="settings-tab"]')).toContainText('Settings');
    await expect(page.locator('[data-testid="theme-tab"]')).toContainText('Themes');
    await expect(page.locator('[data-testid="stats-tab"]')).toContainText('Statistics');
  });

  test('should update game-specific terms in different languages', async ({ page }) => {
    // Navigate to game tab to check game-specific terms
    await page.click('[data-testid="game-tab"]');
    await page.waitForTimeout(500);

    // Check English game terms (these might be in score display or next piece)
    // Note: Adjust selectors based on actual game UI elements
    const initialScoreLabel = await page.locator('text=Score').first().textContent();
    expect(initialScoreLabel).toContain('Score');

    // Switch to Japanese
    await page.click('[data-testid="settings-tab"]');
    await page.waitForTimeout(500);

    await page.click('[data-testid="language-selector"]');
    await page.locator('[data-value="ja"]').click();
    await page.waitForTimeout(1000);

    // Go back to game tab
    await page.click('[data-testid="game-tab"]');
    await page.waitForTimeout(500);

    // Check Japanese game terms
    const japaneseScoreLabel = await page.locator('text=スコア').first().textContent();
    expect(japaneseScoreLabel).toContain('スコア');
  });

  test('should handle language switching on different pages', async ({ page }) => {
    const routes = ['/settings', '/statistics', '/themes', '/about'];

    for (const route of routes) {
      // Navigate to route
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // If we're not on a tab-based page, we might need to find language selector elsewhere
      if (route === '/settings') {
        // On settings page, language selector should be directly available
        await page.click('[data-testid="language-selector"]');
        await page.locator('[data-value="ja"]').click();
        await page.waitForTimeout(1000);

        // Check that page content updated to Japanese
        await expect(page.locator('body')).toContainText('設定');
      }

      // Switch back to English for next iteration
      if (route === '/settings') {
        await page.click('[data-testid="language-selector"]');
        await page.locator('[data-value="en"]').click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should preserve language selection when navigating between routes', async ({ page }) => {
    // Set language to Japanese
    await page.click('[data-testid="settings-tab"]');
    await page.waitForTimeout(500);

    await page.click('[data-testid="language-selector"]');
    await page.locator('[data-value="ja"]').click();
    await page.waitForTimeout(1000);

    // Navigate to different routes and verify language persists
    const routes = ['/about', '/themes', '/statistics', '/'];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // If it's the home route, check game tab text
      if (route === '/') {
        await expect(page.locator('[data-testid="game-tab"]')).toContainText('ゲーム');
      }

      // Check that Japanese language is maintained
      if (route === '/' || route.includes('settings')) {
        // Navigate to settings to check language selector
        if (route === '/') {
          await page.click('[data-testid="settings-tab"]');
          await page.waitForTimeout(500);
        }

        const currentLanguage = await page
          .locator('[data-testid="language-selector"]')
          .inputValue();
        expect(currentLanguage).toBe('ja');
      }
    }
  });

  test('should handle rapid language switching', async ({ page }) => {
    await page.click('[data-testid="settings-tab"]');
    await page.waitForTimeout(500);

    const languageSelector = page.locator('[data-testid="language-selector"]');

    // Rapidly switch between languages
    for (let i = 0; i < 5; i++) {
      // Switch to Japanese
      await languageSelector.click();
      await page.locator('[data-value="ja"]').click();
      await page.waitForTimeout(200);

      // Switch to English
      await languageSelector.click();
      await page.locator('[data-value="en"]').click();
      await page.waitForTimeout(200);
    }

    // Verify final state is stable
    await page.waitForTimeout(1000);

    const finalLanguage = await languageSelector.inputValue();
    expect(finalLanguage).toBe('en');

    await expect(page.locator('[data-testid="game-tab"]')).toContainText('Game');
  });

  test('should handle missing translations gracefully', async ({ page }) => {
    // Switch to Japanese
    await page.click('[data-testid="settings-tab"]');
    await page.waitForTimeout(500);

    await page.click('[data-testid="language-selector"]');
    await page.locator('[data-value="ja"]').click();
    await page.waitForTimeout(1000);

    // Check that UI elements are displayed (either translated or fallback)
    // This test ensures the app doesn't break with missing translations
    await expect(page.locator('[data-testid="game-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="theme-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="stats-tab"]')).toBeVisible();

    // Navigate through tabs to ensure all content loads
    const tabs = ['game-tab', 'stats-tab', 'theme-tab', 'settings-tab'];

    for (const tab of tabs) {
      await page.click(`[data-testid="${tab}"]`);
      await page.waitForTimeout(500);

      // Ensure no JavaScript errors occurred
      const errors = await page.evaluate(() => {
        return window.__playwright_errors || [];
      });
      expect(errors.length).toBe(0);
    }
  });

  test('should maintain language preference in browser session', async ({ page }) => {
    // Set language to Japanese
    await page.click('[data-testid="settings-tab"]');
    await page.waitForTimeout(500);

    await page.click('[data-testid="language-selector"]');
    await page.locator('[data-value="ja"]').click();
    await page.waitForTimeout(1000);

    // Open new tab in same browser context
    const newPage = await page.context().newPage();
    await newPage.goto('/');
    await newPage.waitForLoadState('networkidle');

    // Language should be Japanese in new tab
    await expect(newPage.locator('[data-testid="game-tab"]')).toContainText('ゲーム');

    // Verify language selector shows Japanese
    await newPage.click('[data-testid="settings-tab"]');
    await newPage.waitForTimeout(500);

    const language = await newPage.locator('[data-testid="language-selector"]').inputValue();
    expect(language).toBe('ja');

    await newPage.close();
  });
});
