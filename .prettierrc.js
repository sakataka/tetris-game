/**
 * Prettier 設定ファイル
 *
 * プロジェクト全体のコードフォーマット統一
 */

module.exports = {
  // 基本設定
  semi: true, // セミコロンを追加
  singleQuote: true, // シングルクォート使用
  quoteProps: 'as-needed', // 必要な場合のみクォート
  trailingComma: 'es5', // ES5レベルの末尾カンマ
  tabWidth: 2, // インデント幅
  useTabs: false, // スペースを使用

  // 行の長さ
  printWidth: 100, // 1行の最大文字数

  // JSX設定
  jsxSingleQuote: true, // JSXでシングルクォート使用
  bracketSameLine: false, // JSX括弧を次の行に（新しい名前）

  // その他
  arrowParens: 'always', // アロー関数の括弧常に表示
  endOfLine: 'lf', // 改行文字（LF）
  bracketSpacing: true, // オブジェクト括弧内のスペース
  insertPragma: false, // @formatプラグマ挿入しない
  requirePragma: false, // @formatプラグマ不要

  // ファイル固有設定
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'preserve',
      },
    },
    {
      files: '*.css',
      options: {
        printWidth: 120,
      },
    },
  ],
};
