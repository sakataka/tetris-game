import { expect, test } from '@playwright/test';

test.describe('Settings Persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should persist theme changes across sessions', async ({ page }) => {
    // Navigate to settings tab
    await page.click('[data-testid="theme-tab"]');
    await page.waitForTimeout(500);

    // Get current theme
    const initialTheme = await page.locator('[data-testid="theme-selector"]').inputValue();

    // Change to a different theme
    const targetTheme = initialTheme === 'cyber-cyan' ? 'purple' : 'cyber-cyan';

    await page.click('[data-testid="theme-selector"]');
    await page.locator(`[data-value="${targetTheme}"]`).click();
    await page.waitForTimeout(500);

    // Verify theme was changed
    const newTheme = await page.locator('[data-testid="theme-selector"]').inputValue();
    expect(newTheme).toBe(targetTheme);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Navigate back to theme tab
    await page.click('[data-testid="theme-tab"]');
    await page.waitForTimeout(500);

    // Verify theme persisted
    const persistedTheme = await page.locator('[data-testid="theme-selector"]').inputValue();
    expect(persistedTheme).toBe(targetTheme);
  });

  test('should persist volume settings across sessions', async ({ page }) => {
    // Navigate to settings tab
    await page.click('[data-testid="settings-tab"]');
    await page.waitForTimeout(500);

    // Get current volume slider value
    const volumeSlider = page.locator('[data-testid="volume-slider"]');
    await expect(volumeSlider).toBeVisible();

    // Change volume to 0.3 (30%)
    await volumeSlider.fill('0.3');
    await page.waitForTimeout(500);

    // Verify volume was changed
    const newVolume = await volumeSlider.inputValue();
    expect(Number.parseFloat(newVolume)).toBeCloseTo(0.3, 1);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Navigate back to settings tab
    await page.click('[data-testid="settings-tab"]');
    await page.waitForTimeout(500);

    // Verify volume persisted
    const persistedVolume = await page.locator('[data-testid="volume-slider"]').inputValue();
    expect(Number.parseFloat(persistedVolume)).toBeCloseTo(0.3, 1);
  });

  test('should persist language settings across sessions', async ({ page }) => {
    // Navigate to settings tab
    await page.click('[data-testid="settings-tab"]');
    await page.waitForTimeout(500);

    // Get current language
    const languageSelector = page.locator('[data-testid="language-selector"]');
    await expect(languageSelector).toBeVisible();

    const initialLanguage = await languageSelector.inputValue();

    // Change to different language
    const targetLanguage = initialLanguage === 'en' ? 'ja' : 'en';

    await languageSelector.click();
    await page.locator(`[data-value="${targetLanguage}"]`).click();
    await page.waitForTimeout(1000); // Wait for language to load

    // Verify language was changed
    const newLanguage = await languageSelector.inputValue();
    expect(newLanguage).toBe(targetLanguage);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Navigate back to settings tab
    await page.click('[data-testid="settings-tab"]');
    await page.waitForTimeout(500);

    // Verify language persisted
    const persistedLanguage = await page.locator('[data-testid="language-selector"]').inputValue();
    expect(persistedLanguage).toBe(targetLanguage);

    // Verify UI elements are in the correct language
    if (targetLanguage === 'ja') {
      // Check for Japanese text
      await expect(page.locator('[data-testid="game-tab"]')).toContainText('ゲーム');
    } else {
      // Check for English text
      await expect(page.locator('[data-testid="game-tab"]')).toContainText('Game');
    }
  });

  test('should persist multiple settings together', async ({ page }) => {
    // Set multiple settings
    await page.click('[data-testid="settings-tab"]');
    await page.waitForTimeout(500);

    // Change language to Japanese
    await page.click('[data-testid="language-selector"]');
    await page.locator('[data-value="ja"]').click();
    await page.waitForTimeout(1000);

    // Change volume to 0.7
    await page.locator('[data-testid="volume-slider"]').fill('0.7');
    await page.waitForTimeout(500);

    // Change theme
    await page.click('[data-testid="theme-tab"]');
    await page.waitForTimeout(500);
    await page.click('[data-testid="theme-selector"]');
    await page.locator('[data-value="purple"]').click();
    await page.waitForTimeout(500);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify all settings persisted
    // Check language
    await page.click('[data-testid="settings-tab"]');
    await page.waitForTimeout(500);

    const language = await page.locator('[data-testid="language-selector"]').inputValue();
    expect(language).toBe('ja');

    // Check volume
    const volume = await page.locator('[data-testid="volume-slider"]').inputValue();
    expect(Number.parseFloat(volume)).toBeCloseTo(0.7, 1);

    // Check theme
    await page.click('[data-testid="theme-tab"]');
    await page.waitForTimeout(500);
    const theme = await page.locator('[data-testid="theme-selector"]').inputValue();
    expect(theme).toBe('purple');

    // Verify UI reflects Japanese language
    await expect(page.locator('[data-testid="game-tab"]')).toContainText('ゲーム');
  });

  test('should handle localStorage corruption gracefully', async ({ page }) => {
    // Corrupt localStorage
    await page.evaluate(() => {
      localStorage.setItem('tetris-settings', 'invalid-json-data');
      localStorage.setItem('tetris-language', 'invalid-data');
      localStorage.setItem('tetris-theme', '{broken-json}');
    });

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should load with default settings without errors
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

    // Check that default settings are applied
    await page.click('[data-testid="settings-tab"]');
    await page.waitForTimeout(500);

    // Should have default language (en)
    const language = await page.locator('[data-testid="language-selector"]').inputValue();
    expect(language).toBe('en');

    // Should have default volume (0.5)
    const volume = await page.locator('[data-testid="volume-slider"]').inputValue();
    expect(Number.parseFloat(volume)).toBeCloseTo(0.5, 1);

    // Should have default theme
    await page.click('[data-testid="theme-tab"]');
    await page.waitForTimeout(500);
    const theme = await page.locator('[data-testid="theme-selector"]').inputValue();
    expect(theme).toBe('cyber-cyan'); // Assuming this is the default
  });

  test('should sync settings between tabs', async ({ context }) => {
    // Open two tabs
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.goto('/');
    await page2.goto('/');

    await page1.waitForLoadState('networkidle');
    await page2.waitForLoadState('networkidle');

    // Change settings in tab 1
    await page1.click('[data-testid="settings-tab"]');
    await page1.waitForTimeout(500);

    await page1.click('[data-testid="language-selector"]');
    await page1.locator('[data-value="ja"]').click();
    await page1.waitForTimeout(1000);

    // Check if tab 2 reflects the change (depends on implementation)
    // Note: This might require a storage event listener implementation
    await page2.reload();
    await page2.waitForLoadState('networkidle');

    await page2.click('[data-testid="settings-tab"]');
    await page2.waitForTimeout(500);

    const language = await page2.locator('[data-testid="language-selector"]').inputValue();
    expect(language).toBe('ja');

    await page1.close();
    await page2.close();
  });
});
