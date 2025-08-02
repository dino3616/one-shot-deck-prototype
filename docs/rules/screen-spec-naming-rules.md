# 画面仕様書命名規則

## 概要
ページ単位での画面仕様書ファイルの命名規則とディレクトリ構成ルール

## ファイル命名規則

### 1. 基本命名パターン
```
[ページ名].spec.md
```

### 2. ページ名の命名規則
- **kebab-case** を使用
- 英語名を推奨（日本語の場合はひらがな）
- URLパスと対応させることを推奨
- 具体的で分かりやすい名前を使用

### 3. ページ名とURLパスの対応例

| ページ名 | ファイル名 | URLパス例 |
|----------|-----------|----------|
| ホーム | `home.spec.md` | `/` |
| ユーザープロフィール | `user-profile.spec.md` | `/user/profile` |
| 商品一覧 | `product-list.spec.md` | `/products` |
| 商品詳細 | `product-detail.spec.md` | `/products/[id]` |
| ログイン | `login.spec.md` | `/login` |
| ユーザー登録 | `register.spec.md` | `/register` |
| 設定 | `settings.spec.md` | `/settings` |
| 管理者ダッシュボード | `admin-dashboard.spec.md` | `/admin` |
| 注文履歴 | `order-history.spec.md` | `/orders` |
| ショッピングカート | `shopping-cart.spec.md` | `/cart` |

### 4. 命名例

```
✅ 正しい例:
- home.spec.md
- user-profile.spec.md
- product-list.spec.md
- login.spec.md
- admin-dashboard.spec.md
- order-history.spec.md

❌ 間違った例:
- UserProfile.spec.md (PascalCaseは使用しない)
- user_profile.spec.md (snake_caseは使用しない)
- userprofile.spec.md (単語の区切りがない)
- user-profile.md (拡張子が間違い)
- user-profile-detail.spec.md (詳細すぎる分類)
```

## ディレクトリ構成

### 基本構成（フラット構造）
```
docs/
└── screen-spec/
    ├── TEMPLATE.md              # テンプレートファイル
    ├── home.spec.md
    ├── login.spec.md
    ├── register.spec.md
    ├── user-profile.spec.md
    ├── settings.spec.md
    ├── product-list.spec.md
    ├── product-detail.spec.md
    ├── shopping-cart.spec.md
    ├── order-history.spec.md
    ├── admin-dashboard.spec.md
    └── ...
```

### 実際の構成例
```
docs/screen-spec/
├── TEMPLATE.md
├── home.spec.md
├── login.spec.md
├── register.spec.md
├── password-reset.spec.md
├── user-profile.spec.md
├── user-settings.spec.md
├── product-list.spec.md
├── product-detail.spec.md
├── product-search.spec.md
├── shopping-cart.spec.md
├── checkout.spec.md
├── order-history.spec.md
├── order-detail.spec.md
├── admin-dashboard.spec.md
├── admin-user-management.spec.md
└── admin-system-settings.spec.md
```

## ファイル内容の命名規則

### 1. 見出しの命名
- メインタイトル: `# [ページ名]ページ仕様`
- 例: `# ユーザープロフィールページ仕様`

### 2. 要素名の命名
- **PascalCase** を使用
- 日本語を併記することを推奨

例:
```markdown
## UserProfileForm (ユーザープロフィールフォーム)
## ProductSearchFilter (商品検索フィルター)
## OrderStatusBadge (注文ステータスバッジ)
```

### 3. メソッド名の命名
- **camelCase** を使用
- 動詞で始める

例:
```markdown
| handleSubmit | フォーム送信処理 |
| validateInput | 入力値検証 |
| fetchUserData | ユーザーデータ取得 |
```

## バージョン管理

### ファイル更新時のルール
1. 大幅な変更時は旧バージョンをバックアップ
2. 変更履歴をファイル末尾に記載
3. レビュー完了後にコミット

### 変更履歴の記載例
```markdown
## 変更履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|-----------|----------|--------|
| 2024-01-15 | v1.0 | 初版作成 | 田中 |
| 2024-01-20 | v1.1 | バリデーション仕様追加 | 佐藤 |
```

## 注意事項

1. **一貫性の保持**: プロジェクト内で命名規則を統一する
2. **可読性の重視**: 略称は避け、分かりやすい名前を使用する
3. **英語優先**: 可能な限り英語での命名を推奨
4. **定期見直し**: プロジェクトの成長に合わせて規則を見直す
5. **チーム共有**: 新メンバー参加時に必ず規則を共有する