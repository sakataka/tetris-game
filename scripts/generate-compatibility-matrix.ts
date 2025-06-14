#!/usr/bin/env tsx

/**
 * 互換性マトリックス生成スクリプト
 * Playwrightテスト結果から包括的な互換性レポートを生成
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

interface TestResult {
  projectName: string;
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

interface CompatibilityResult {
  browser: string;
  device: string;
  testsPassed: number;
  testsTotal: number;
  successRate: number;
  issues: string[];
  performance: {
    averageDuration: number;
    slowestTest: number;
  };
}

interface BrowserCapability {
  name: string;
  css: {
    grid: boolean;
    flexbox: boolean;
    customProperties: boolean;
  };
  javascript: {
    es6: boolean;
    es2020: boolean;
    modules: boolean;
  };
  webapis: {
    webgl: boolean;
    webaudio: boolean;
    serviceworker: boolean;
    localstorage: boolean;
  };
}

export class CompatibilityMatrixGenerator {
  private testResults: TestResult[] = [];
  private capabilities: BrowserCapability[] = [];

  constructor(private resultsPath = './playwright-report/results.json') {}

  /**
   * テスト結果を読み込み
   */
  loadTestResults(): void {
    if (!existsSync(this.resultsPath)) {
      console.warn(`Test results file not found: ${this.resultsPath}`);
      return;
    }

    try {
      const resultsData = JSON.parse(readFileSync(this.resultsPath, 'utf-8'));

      if (resultsData.suites) {
        this.parseTestResults(resultsData.suites);
      }
    } catch (error) {
      console.error('Error loading test results:', error);
    }
  }

  /**
   * テスト結果のパース
   */
  private parseTestResults(suites: Array<Record<string, any>>): void {
    for (const suite of suites) {
      if (suite['suites']) {
        this.parseTestResults(suite['suites']);
      }

      if (suite['specs']) {
        for (const spec of suite['specs']) {
          for (const test of spec.tests) {
            for (const result of test.results) {
              this.testResults.push({
                projectName: result.projectName || 'unknown',
                testName: spec.title,
                status: result.status as 'passed' | 'failed' | 'skipped',
                duration: result.duration || 0,
                error: result.error?.message,
              });
            }
          }
        }
      }
    }
  }

  /**
   * ブラウザー機能の検出データを追加
   */
  addBrowserCapabilities(capabilities: BrowserCapability[]): void {
    this.capabilities = capabilities;
  }

  /**
   * 互換性マトリックスの生成
   */
  generateMatrix(): CompatibilityResult[] {
    const browserGroups = this.groupResultsByBrowser();
    const results: CompatibilityResult[] = [];

    for (const [browser, tests] of Object.entries(browserGroups)) {
      const passed = tests.filter((t) => t.status === 'passed').length;
      const total = tests.length;
      const failed = tests.filter((t) => t.status === 'failed');

      const issues = failed.map((t) => t.error || `${t.testName} failed`).slice(0, 5);

      const durations = tests.map((t) => t.duration).filter((d) => d > 0);
      const avgDuration =
        durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
      const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

      results.push({
        browser,
        device: this.getDeviceType(browser),
        testsPassed: passed,
        testsTotal: total,
        successRate: total > 0 ? (passed / total) * 100 : 0,
        issues,
        performance: {
          averageDuration: Math.round(avgDuration),
          slowestTest: Math.round(maxDuration),
        },
      });
    }

    return results.sort((a, b) => b.successRate - a.successRate);
  }

  /**
   * ブラウザー別にテスト結果をグループ化
   */
  private groupResultsByBrowser(): Record<string, TestResult[]> {
    const groups: Record<string, TestResult[]> = {};

    for (const result of this.testResults) {
      const projectName = result.projectName || 'unknown';
      if (!groups[projectName]) {
        groups[projectName] = [];
      }
      groups[projectName].push(result);
    }

    return groups;
  }

  /**
   * デバイスタイプの判定
   */
  private getDeviceType(browser: string): string {
    if (browser.toLowerCase().includes('mobile')) {
      return 'Mobile';
    }
    if (browser.toLowerCase().includes('ipad') || browser.toLowerCase().includes('tablet')) {
      return 'Tablet';
    }
    return 'Desktop';
  }

  /**
   * Markdownレポートの生成
   */
  generateMarkdownReport(results: CompatibilityResult[]): string {
    let markdown = '# 🌐 Browser Compatibility Matrix\\n\\n';
    markdown += `*Generated: ${new Date().toISOString()}*\\n\\n`;

    // 概要
    markdown += '## 📊 Overview\\n\\n';
    const avgSuccessRate = results.reduce((sum, r) => sum + r.successRate, 0) / results.length;
    markdown += `**Average Success Rate**: ${avgSuccessRate.toFixed(1)}%\\n\\n`;

    // マトリックステーブル
    markdown += '## 🎯 Compatibility Matrix\\n\\n';
    markdown += '| Browser | Device | Tests Passed | Success Rate | Avg Duration | Status |\\n';
    markdown += '|---------|--------|-------------|-------------|-------------|--------|\\n';

    for (const result of results) {
      const status = this.getStatusIcon(result.successRate);
      const duration = `${result.performance.averageDuration}ms`;

      markdown += `| ${result.browser} | ${result.device} | ${result.testsPassed}/${result.testsTotal} | ${result.successRate.toFixed(1)}% | ${duration} | ${status} |\\n`;
    }

    // 詳細セクション
    markdown += '\\n## 🔍 Detailed Results\\n\\n';

    for (const result of results) {
      markdown += `### ${result.browser}\\n\\n`;
      markdown += `- **Device Type**: ${result.device}\\n`;
      markdown += `- **Success Rate**: ${result.successRate.toFixed(1)}% (${result.testsPassed}/${result.testsTotal})\\n`;
      markdown += `- **Performance**: ${result.performance.averageDuration}ms avg, ${result.performance.slowestTest}ms max\\n`;

      if (result.issues.length > 0) {
        markdown += '- **Issues**:\\n';
        for (const issue of result.issues) {
          markdown += `  - ${issue}\\n`;
        }
      }
      markdown += '\\n';
    }

    // 推奨事項
    markdown += '## 💡 Recommendations\\n\\n';

    const lowPerformanceResults = results.filter((r) => r.successRate < 80);
    if (lowPerformanceResults.length > 0) {
      markdown += '### ⚠️ Browsers Needing Attention\\n\\n';
      for (const result of lowPerformanceResults) {
        markdown += `- **${result.browser}**: ${result.successRate.toFixed(1)}% success rate\\n`;
      }
      markdown += '\\n';
    }

    const slowBrowsers = results.filter((r) => r.performance.averageDuration > 1000);
    if (slowBrowsers.length > 0) {
      markdown += '### 🐌 Performance Concerns\\n\\n';
      for (const result of slowBrowsers) {
        markdown += `- **${result.browser}**: ${result.performance.averageDuration}ms average duration\\n`;
      }
      markdown += '\\n';
    }

    // ブラウザー機能サポート
    if (this.capabilities.length > 0) {
      markdown += '## 🔧 Browser Capabilities\\n\\n';
      markdown += this.generateCapabilitiesTable();
    }

    // テスト環境情報
    markdown += '## 🧪 Test Environment\\n\\n';
    markdown += '- **Framework**: Playwright E2E Testing\\n';
    markdown += '- **Test Types**: Cross-browser, Mobile, Performance\\n';
    markdown += '- **Browsers**: Chromium, Firefox, Safari/WebKit, Mobile Chrome, Mobile Safari\\n';
    markdown += '- **React Router**: 7.6.2 with SSR\\n';
    markdown += '- **Known Issues**: React 19.1 + React Router 7 SSR compatibility issue\\n\\n';

    return markdown;
  }

  /**
   * ブラウザー機能サポートテーブルの生成
   */
  private generateCapabilitiesTable(): string {
    let table = '| Browser | CSS Grid | Flexbox | WebGL | Web Audio | Service Worker |\\n';
    table += '|---------|----------|---------|-------|-----------|----------------|\\n';

    for (const capability of this.capabilities) {
      const grid = capability.css.grid ? '✅' : '❌';
      const flexbox = capability.css.flexbox ? '✅' : '❌';
      const webgl = capability.webapis.webgl ? '✅' : '❌';
      const webaudio = capability.webapis.webaudio ? '✅' : '❌';
      const sw = capability.webapis.serviceworker ? '✅' : '❌';

      table += `| ${capability.name} | ${grid} | ${flexbox} | ${webgl} | ${webaudio} | ${sw} |\\n`;
    }

    return `${table}\\n`;
  }

  /**
   * 成功率に基づくステータスアイコン
   */
  private getStatusIcon(successRate: number): string {
    if (successRate >= 95) return '🟢 Excellent';
    if (successRate >= 80) return '🟡 Good';
    if (successRate >= 60) return '🟠 Fair';
    return '🔴 Poor';
  }

  /**
   * JSONレポートの生成
   */
  generateJsonReport(results: CompatibilityResult[]): string {
    const report = {
      generated: new Date().toISOString(),
      summary: {
        totalBrowsers: results.length,
        averageSuccessRate: results.reduce((sum, r) => sum + r.successRate, 0) / results.length,
        bestBrowser: results[0]?.browser || 'none',
        worstBrowser: results[results.length - 1]?.browser || 'none',
      },
      results,
      capabilities: this.capabilities,
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * レポートファイルの保存
   */
  saveReports(results: CompatibilityResult[]): void {
    try {
      // Markdownレポート
      const markdownReport = this.generateMarkdownReport(results);
      writeFileSync('./compatibility-matrix.md', markdownReport);
      console.log('✅ Markdown report saved: compatibility-matrix.md');

      // JSONレポート
      const jsonReport = this.generateJsonReport(results);
      writeFileSync('./compatibility-matrix.json', jsonReport);
      console.log('✅ JSON report saved: compatibility-matrix.json');
    } catch (error) {
      console.error('Error saving reports:', error);
    }
  }
}

/**
 * メイン実行関数
 */
async function generateCompatibilityMatrix() {
  console.log('🔄 Generating compatibility matrix...');

  const generator = new CompatibilityMatrixGenerator();

  // テスト結果の読み込み
  generator.loadTestResults();

  // サンプルブラウザー機能データ（実際のテストから取得可能）
  const sampleCapabilities: BrowserCapability[] = [
    {
      name: 'Chromium',
      css: { grid: true, flexbox: true, customProperties: true },
      javascript: { es6: true, es2020: true, modules: true },
      webapis: { webgl: true, webaudio: true, serviceworker: true, localstorage: true },
    },
    {
      name: 'Firefox',
      css: { grid: true, flexbox: true, customProperties: true },
      javascript: { es6: true, es2020: true, modules: true },
      webapis: { webgl: true, webaudio: true, serviceworker: true, localstorage: true },
    },
    {
      name: 'Safari/WebKit',
      css: { grid: true, flexbox: true, customProperties: true },
      javascript: { es6: true, es2020: true, modules: true },
      webapis: { webgl: true, webaudio: true, serviceworker: true, localstorage: true },
    },
  ];

  generator.addBrowserCapabilities(sampleCapabilities);

  // マトリックス生成
  const results = generator.generateMatrix();

  if (results.length === 0) {
    console.warn('⚠️ No test results found. Run E2E tests first.');
    console.log('Example: pnpm test:e2e');
    return;
  }

  // レポート保存
  generator.saveReports(results);

  console.log('\\n📊 Compatibility Matrix Summary:');
  for (const result of results.slice(0, 3)) {
    console.log(
      `  ${result.browser}: ${result.successRate.toFixed(1)}% (${result.testsPassed}/${result.testsTotal})`
    );
  }

  console.log('\\n✨ Compatibility matrix generation complete!');
}

// スクリプトとして直接実行された場合
if (typeof require !== 'undefined' && require.main === module) {
  generateCompatibilityMatrix().catch(console.error);
}

export { generateCompatibilityMatrix };
