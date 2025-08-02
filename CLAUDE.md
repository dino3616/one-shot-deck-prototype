# 開発ルール

## 概要
Next.js (App Router) + Elysia を用いたWebアプリケーションの開発ルールです。

## フロントエンド

### ルール
- 詳細: `docs/rules/frontend-rules.md`
- Next.js 15 (App Router)、TypeScript、Tailwind CSS
- コンポーネント名はPascalCase、ファイル名はkebab-case

### バックエンド
- 詳細: `docs/rules/backend-rules.md`
- Elysia + TypeScript

### 画面仕様
- 詳細: `docs/rules/screen-spec-naming-rules.md`
- 命名規則: `[画面名].spec.md`
- 管理場所: `docs/screen-spec/`（画面仕様書）
- テンプレート: `docs/screen-spec/TEMPLATE.md`

## コマンド
```bash
npm run lint      # ESLintによるリント
npm run build     # ビルド
npm run typecheck # TypeScript型チェック
```
```

---

もし他にも直したいファイルや、追加で修正したい箇所があれば教えてください！  
この内容で `CLAUDE.md` を修正してもよろしいですか？