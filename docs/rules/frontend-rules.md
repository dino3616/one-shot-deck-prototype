# フロントエンド実装ルール

## 概要
Next.js (App Router) + TypeScript + Tailwind CSS を使用したフロントエンド開発のルール

## ディレクトリ構成

### 基本構成
```
src/
├── app/                    # App Router (Pages)
│   ├── globals.css        # グローバルCSS
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx          # ホームページ
│   └── [feature]/        # 機能別ページ
├── components/           # 再利用可能なコンポーネント
│   ├── ui/              # UIコンポーネント
│   └── common/          # 共通コンポーネント
├── hooks/               # カスタムフック
├── lib/                 # ユーティリティ・設定
├── types/               # 型定義
└── constants/           # 定数
```

## コーディング規約

### 1. ファイル・ディレクトリ命名規則
- **ページファイル**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- **コンポーネントファイル**: PascalCase (`UserProfile.tsx`)
- **ディレクトリ**: kebab-case (`user-profile/`)
- **ユーティリティファイル**: camelCase (`apiClient.ts`)

### 2. コンポーネント設計原則

#### 2.1 関数コンポーネントの使用
```tsx
// Good
export default function UserProfile({ userId }: { userId: string }) {
  return <div>Profile for {userId}</div>
}

// Good (named export for reusable components)
export function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}
```

#### 2.2 Props型定義
```tsx
// Good - インターフェースで型定義
interface UserProfileProps {
  userId: string
  className?: string
  onUpdate?: (user: User) => void
}

export function UserProfile({ userId, className, onUpdate }: UserProfileProps) {
  // ...
}
```

#### 2.3 Server Component vs Client Component
```tsx
// Server Component (デフォルト)
export default function ProductList() {
  // データフェッチング、静的コンテンツ
  return <div>...</div>
}

// Client Component (必要な場合のみ)
'use client'

export function InteractiveButton() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### 3. スタイリング規則

#### 3.1 Tailwind CSS使用
```tsx
// Good - Tailwind classesを使用
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      {children}
    </div>
  )
}
```

#### 3.2 条件付きスタイル
```tsx
import { cn } from '@/lib/utils'

export function Button({ variant = 'default', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
        },
        className
      )}
      {...props}
    />
  )
}
```

### 4. データフェッチング

#### 4.1 Server Component でのデータフェッチ
```tsx
// Server Component
export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await fetchUser(params.id)
  
  return <UserProfile user={user} />
}
```

#### 4.2 Client Component でのデータフェッチ
```tsx
'use client'

import { useEffect, useState } from 'react'

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <div>Loading...</div>
  if (!user) return <div>User not found</div>

  return <div>{user.name}</div>
}
```

### 5. API統合

#### 5.1 Elysia API クライアント使用
```tsx
import { api } from '@/lib/api'

// Server Component
export default async function HomePage() {
  const response = await api.hello.get()
  
  return <div>{response.data?.message}</div>
}

// Client Component
'use client'

export function EchoForm() {
  const [message, setMessage] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await api.echo.post({ message })
    console.log(response.data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
      />
      <button type="submit">Send</button>
    </form>
  )
}
```

### 6. エラーハンドリング

#### 6.1 Error Boundary
```tsx
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <button onClick={reset} className="mt-4 rounded bg-blue-500 px-4 py-2 text-white">
        Try again
      </button>
    </div>
  )
}
```

#### 6.2 Loading States
```tsx
// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  )
}
```

### 7. フォーム処理

#### 7.1 Server Actions使用
```tsx
// Server Action
export async function createUser(formData: FormData) {
  'use server'
  
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  
  // バリデーション
  if (!name || !email) {
    throw new Error('Name and email are required')
  }
  
  // API呼び出し
  const response = await api.users.post({ name, email })
  
  // リダイレクト
  redirect('/users')
}

// Component
export function CreateUserForm() {
  return (
    <form action={createUser} className="space-y-4">
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit">Create User</button>
    </form>
  )
}
```

### 8. パフォーマンス最適化

#### 8.1 Dynamic Import
```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
})
```

#### 8.2 Image最適化
```tsx
import Image from 'next/image'

export function UserAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className="rounded-full"
    />
  )
}
```

### 9. TypeScript活用

#### 9.1 厳密な型定義
```tsx
// types/user.ts
export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export type CreateUserRequest = Omit<User, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateUserRequest = Partial<CreateUserRequest>
```

#### 9.2 Generic Components
```tsx
interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
}

export function DataTable<T>({ data, columns, onRowClick }: DataTableProps<T>) {
  return (
    <table>
      {/* table implementation */}
    </table>
  )
}
```

### 10. テスト

#### 10.1 Component Testing
```tsx
// __tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### 11. アクセシビリティ

#### 11.1 セマンティックHTML
```tsx
export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="border rounded-lg p-4">
      <header>
        <h2 className="text-xl font-semibold">{article.title}</h2>
        <time dateTime={article.publishedAt}>
          {formatDate(article.publishedAt)}
        </time>
      </header>
      <p className="mt-2">{article.excerpt}</p>
    </article>
  )
}
```

#### 11.2 ARIA属性
```tsx
export function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className={isOpen ? 'block' : 'hidden'}
    >
      <div className="modal-content">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-2 right-2"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}
```

## 禁止事項

1. **default export以外での複数export** (Pageコンポーネント以外)
2. **inline styles** の使用
3. **any型** の使用
4. **console.log** の本番環境への残存
5. **直接的なDOM操作** (refが必要な場合を除く)
6. **グローバル状態の濫用** (必要最小限に)

## コミット時の確認事項

1. `npm run lint` でESLintエラーがないこと
2. `npm run build` が成功すること
3. TypeScriptエラーがないこと
4. 未使用のimportが残っていないこと
5. console.logが残っていないこと