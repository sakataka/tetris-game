# GitHub Actions CI/CD

このディレクトリには、Tetris Game プロジェクトの CI/CD パイプラインが含まれています。

## ワークフロー概要

### 1. CI/CD Pipeline (`ci.yml`)

メインの CI/CD ワークフローで、以下のジョブを実行します：

- **quality-check**: コード品質チェック（型チェック、ESLint、フォーマット、テスト）
- **build**: アプリケーションのビルドとバンドル分析
- **security-check**: セキュリティ監査（npm audit、Snyk）
- **lighthouse**: パフォーマンス測定（PRのみ）
- **deploy-preview**: Vercel プレビューデプロイ（PRのみ）

トリガー：

- `main`、`develop` ブランチへのプッシュ
- `main` ブランチへのプルリクエスト
- 手動実行

### 2. Pull Request Checks (`pr-checks.yml`)

プルリクエスト専用の追加チェック：

- **label-pr**: 変更ファイルに基づく自動ラベリング
- **size-check**: バンドルサイズの変更比較
- **code-quality**: ESLint アノテーション付きレビュー
- **test-summary**: テスト結果の詳細レポート
- **accessibility-check**: アクセシビリティ監査

### 3. Scheduled Quality Review (`scheduled-quality.yml`)

毎週月曜日に実行される定期品質レビュー：

- **dependency-review**: 依存関係の更新チェック
- **code-metrics**: コード複雑度分析
- **performance-baseline**: パフォーマンスベースライン測定
- **test-coverage-trend**: テストカバレッジの傾向分析
- **create-summary-issue**: 週次サマリーIssueの作成

## 必要なシークレット

以下のシークレットをリポジトリに設定する必要があります：

- `SNYK_TOKEN`: Snyk セキュリティスキャン用（オプション）
- `VERCEL_TOKEN`: Vercel デプロイ用（オプション）
- `VERCEL_ORG_ID`: Vercel 組織ID（オプション）
- `VERCEL_PROJECT_ID`: Vercel プロジェクトID（オプション）

## ローカルでの動作確認

GitHub Actions をローカルで実行するには、[act](https://github.com/nektos/act) を使用できます：

```bash
# act のインストール
brew install act

# ワークフローの実行
act -W .github/workflows/ci.yml

# 特定のジョブの実行
act -W .github/workflows/ci.yml -j quality-check
```

## キャッシュ戦略

効率的なビルドのため、以下のキャッシュを使用しています：

1. **pnpm store**: 依存関係のキャッシュ
2. **Next.js build cache**: ビルドキャッシュ
3. **Node modules**: Node.js の組み込みキャッシュ

## アーティファクト

各ワークフローは以下のアーティファクトを生成します：

- **build-output**: ビルド成果物（7日間保持）
- **bundle-analysis**: バンドル分析レポート（7日間保持）
- **complexity-report**: コード複雑度レポート（30日間保持）
- **performance-reports**: パフォーマンスレポート（30日間保持）

## トラブルシューティング

### ビルドが失敗する場合

1. Node.js バージョンが `20.x` であることを確認
2. `pnpm install --frozen-lockfile` でローカルで依存関係をインストール
3. `pnpm build` でローカルビルドを確認

### テストが失敗する場合

1. `pnpm test:run` でローカルでテストを実行
2. テストカバレッジを確認: `pnpm test:coverage`

### ESLint エラー

1. `pnpm lint` でエラーを確認
2. `pnpm lint --fix` で自動修正を試行

## カスタマイズ

### 新しいチェックの追加

1. 適切なワークフローファイルを編集
2. 新しいジョブまたはステップを追加
3. 必要に応じて依存関係を更新

### スケジュールの変更

`scheduled-quality.yml` の cron 式を編集：

```yaml
schedule:
  - cron: '0 0 * * 1' # 毎週月曜日の 0:00 UTC
```

[cron 式の生成ツール](https://crontab.guru/)

## 関連ドキュメント

- [GitHub Actions ドキュメント](https://docs.github.com/en/actions)
- [pnpm アクション](https://github.com/pnpm/action-setup)
- [Vercel アクション](https://github.com/amondnet/vercel-action)
