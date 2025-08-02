# バックエンド実装ルール

## 概要
Elysia.js + TypeScript を使用したAPI開発のルール

## ディレクトリ構成

### 基本構成
```
src/
├── lib/
│   ├── elysia.ts          # メインAPIアプリケーション
│   └── api.ts             # APIクライアント (フロントエンド用)
├── api/                   # API関連
│   ├── controllers/       # コントローラー
│   ├── services/         # ビジネスロジック
│   ├── models/           # データモデル
│   ├── middleware/       # ミドルウェア
│   ├── validators/       # バリデーション
│   └── types/           # API型定義
├── database/            # データベース関連
│   ├── migrations/      # マイグレーション
│   ├── seeds/          # シードデータ
│   └── schema.ts       # スキーマ定義
└── utils/              # ユーティリティ
```

## コーディング規約

### 1. ファイル・ディレクトリ命名規則
- **APIファイル**: kebab-case (`user-profile.ts`)
- **クラス・型定義**: PascalCase (`UserService`, `CreateUserRequest`)
- **関数・変数**: camelCase (`getUserById`, `userCount`)
- **定数**: SCREAMING_SNAKE_CASE (`MAX_FILE_SIZE`)

### 2. API設計原則

#### 2.1 RESTful設計
```typescript
// Good - RESTful endpoints
const app = new Elysia({ prefix: '/api' })
  .get('/users', getAllUsers)           # GET /api/users
  .get('/users/:id', getUserById)       # GET /api/users/123
  .post('/users', createUser)           # POST /api/users
  .put('/users/:id', updateUser)        # PUT /api/users/123
  .delete('/users/:id', deleteUser)     # DELETE /api/users/123
```

#### 2.2 エンドポイント構造
```typescript
import { Elysia, t } from 'elysia'

const userRoutes = new Elysia({ prefix: '/users' })
  .get('/', async () => {
    const users = await userService.getAll()
    return { data: users, meta: { total: users.length } }
  })
  .get('/:id', async ({ params }) => {
    const user = await userService.getById(params.id)
    if (!user) {
      throw new Error('User not found')
    }
    return { data: user }
  }, {
    params: t.Object({
      id: t.String({ minLength: 1 })
    })
  })
  .post('/', async ({ body }) => {
    const user = await userService.create(body)
    return { data: user }
  }, {
    body: t.Object({
      name: t.String({ minLength: 1, maxLength: 100 }),
      email: t.String({ format: 'email' }),
      age: t.Optional(t.Number({ minimum: 0, maximum: 150 }))
    })
  })
```

### 3. バリデーション

#### 3.1 Elysia Validation使用
```typescript
import { t } from 'elysia'

// Basic validation
const createUserSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  email: t.String({ format: 'email' }),
  age: t.Optional(t.Number({ minimum: 0, maximum: 150 })),
  role: t.Union([t.Literal('user'), t.Literal('admin')])
})

// Query parameter validation
const getUsersSchema = t.Object({
  page: t.Optional(t.Number({ minimum: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
  search: t.Optional(t.String())
})

app.get('/users', async ({ query }) => {
  const { page = 1, limit = 20, search } = query
  return await userService.getUsers({ page, limit, search })
}, {
  query: getUsersSchema
})
```

#### 3.2 カスタムバリデーション
```typescript
// validators/user.ts
export const validateUserAge = (age: number): boolean => {
  return age >= 0 && age <= 150
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Custom validation in schema
const customUserSchema = t.Object({
  email: t.String({
    format: 'email',
    error: 'Invalid email format'
  }),
  age: t.Transform(
    t.Number({ minimum: 0, maximum: 150 })
  ).Decode(value => {
    if (!validateUserAge(value)) {
      throw new Error('Invalid age')
    }
    return value
  })
})
```

### 4. エラーハンドリング

#### 4.1 統一エラーレスポンス
```typescript
interface ErrorResponse {
  error: string
  message: string
  code?: string
  details?: any
}

const app = new Elysia()
  .onError(({ code, error, set }) => {
    console.error('API Error:', error)

    switch (code) {
      case 'NOT_FOUND':
        set.status = 404
        return { 
          error: 'Not Found', 
          message: 'The requested resource was not found' 
        }
      
      case 'VALIDATION':
        set.status = 400
        return { 
          error: 'Validation Error', 
          message: error.message,
          details: error.all 
        }
      
      case 'PARSE':
        set.status = 400
        return { 
          error: 'Bad Request', 
          message: 'Invalid request format' 
        }
      
      default:
        set.status = 500
        return { 
          error: 'Internal Server Error', 
          message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong' 
            : error.message 
        }
    }
  })
```

#### 4.2 カスタムエラークラス
```typescript
// utils/errors.ts
export class APIError extends Error {
  public statusCode: number
  public code: string

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'APIError'
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR')
    this.details = details
  }
}

// Usage
app.get('/users/:id', async ({ params }) => {
  const user = await userService.getById(params.id)
  if (!user) {
    throw new NotFoundError('User')
  }
  return { data: user }
})
```

### 5. ミドルウェア

#### 5.1 認証ミドルウェア
```typescript
// middleware/auth.ts
export const authMiddleware = (app: Elysia) => 
  app.derive(async ({ headers }) => {
    const token = headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      throw new APIError('Authorization token required', 401, 'UNAUTHORIZED')
    }

    try {
      const payload = await verifyJWT(token)
      return { user: payload }
    } catch (error) {
      throw new APIError('Invalid token', 401, 'UNAUTHORIZED')
    }
  })

// Usage
app.use(authMiddleware)
  .get('/profile', ({ user }) => {
    return { data: user }
  })
```

#### 5.2 ログミドルウェア
```typescript
// middleware/logger.ts
export const loggerMiddleware = (app: Elysia) =>
  app.onBeforeHandle(({ request, set }) => {
    const start = Date.now()
    console.log(`${request.method} ${request.url} - Started`)
    
    set.headers['x-request-id'] = crypto.randomUUID()
    
    return { requestStart: start }
  })
  .onAfterHandle(({ request, requestStart }) => {
    const duration = Date.now() - requestStart
    console.log(`${request.method} ${request.url} - ${duration}ms`)
  })
```

#### 5.3 CORS設定
```typescript
// middleware/cors.ts
export const corsMiddleware = (app: Elysia) =>
  app.onBeforeHandle(({ set }) => {
    set.headers['Access-Control-Allow-Origin'] = '*'
    set.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    set.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
  })
  .options('*', () => 'OK')
```

### 6. データベース統合

#### 6.1 データベース接続
```typescript
// database/connection.ts
import { PrismaClient } from '@prisma/client'

export const db = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
})

// Graceful shutdown
process.on('beforeExit', async () => {
  await db.$disconnect()
})
```

#### 6.2 Repository パターン
```typescript
// models/user.ts
export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export class UserRepository {
  async findAll(options?: { page?: number; limit?: number; search?: string }): Promise<User[]> {
    const { page = 1, limit = 20, search } = options || {}
    
    return await db.user.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      } : undefined,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  }

  async findById(id: string): Promise<User | null> {
    return await db.user.findUnique({ where: { id } })
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return await db.user.create({ data })
  }

  async update(id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    return await db.user.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await db.user.delete({ where: { id } })
  }
}
```

### 7. ビジネスロジック

#### 7.1 Service層
```typescript
// services/user.ts
export class UserService {
  private userRepository = new UserRepository()

  async getUsers(options?: { page?: number; limit?: number; search?: string }) {
    const users = await this.userRepository.findAll(options)
    const total = await this.userRepository.count(options)
    
    return {
      users,
      pagination: {
        page: options?.page || 1,
        limit: options?.limit || 20,
        total,
        totalPages: Math.ceil(total / (options?.limit || 20))
      }
    }
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new NotFoundError('User')
    }
    return user
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    // ビジネスルール検証
    const existingUser = await this.userRepository.findByEmail(userData.email)
    if (existingUser) {
      throw new ValidationError('Email already exists')
    }

    // パスワードハッシュ化等の処理
    const hashedPassword = await hashPassword(userData.password)
    
    return await this.userRepository.create({
      ...userData,
      password: hashedPassword
    })
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const existingUser = await this.getUserById(id)
    
    // 重複チェック
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.userRepository.findByEmail(userData.email)
      if (emailExists) {
        throw new ValidationError('Email already exists')
      }
    }

    return await this.userRepository.update(id, userData)
  }

  async deleteUser(id: string): Promise<void> {
    await this.getUserById(id) // 存在チェック
    await this.userRepository.delete(id)
  }
}
```

### 8. 型定義

#### 8.1 API型定義
```typescript
// types/api.ts
export interface CreateUserRequest {
  name: string
  email: string
  password: string
  age?: number
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  age?: number
}

export interface UserResponse {
  id: string
  name: string
  email: string
  age?: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ErrorResponse {
  error: string
  message: string
  code?: string
  details?: any
}
```

### 9. テスト

#### 9.1 Unit Test
```typescript
// __tests__/services/user.test.ts
import { UserService } from '@/services/user'
import { UserRepository } from '@/models/user'

jest.mock('@/models/user')

describe('UserService', () => {
  let userService: UserService
  let mockUserRepository: jest.Mocked<UserRepository>

  beforeEach(() => {
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>
    userService = new UserService()
    userService['userRepository'] = mockUserRepository
  })

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = { id: '1', name: 'John', email: 'john@example.com' }
      mockUserRepository.findById.mockResolvedValue(mockUser)

      const result = await userService.getUserById('1')

      expect(result).toEqual(mockUser)
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1')
    })

    it('should throw NotFoundError when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null)

      await expect(userService.getUserById('1')).rejects.toThrow('User not found')
    })
  })
})
```

#### 9.2 Integration Test
```typescript
// __tests__/api/users.test.ts
import { describe, it, expect } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { app } from '@/lib/elysia'

const api = treaty(app)

describe('User API', () => {
  it('should create a user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    }

    const response = await api.users.post(userData)

    expect(response.status).toBe(201)
    expect(response.data?.name).toBe(userData.name)
    expect(response.data?.email).toBe(userData.email)
  })

  it('should return validation error for invalid data', async () => {
    const invalidData = {
      name: '',
      email: 'invalid-email'
    }

    const response = await api.users.post(invalidData)

    expect(response.status).toBe(400)
    expect(response.error?.error).toBe('Validation Error')
  })
})
```

### 10. セキュリティ

#### 10.1 入力サニタイゼーション
```typescript
import DOMPurify from 'isomorphic-dompurify'

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim())
}

// Usage in validation
const createPostSchema = t.Object({
  title: t.Transform(t.String({ minLength: 1, maxLength: 200 }))
    .Decode(sanitizeInput),
  content: t.Transform(t.String({ minLength: 1 }))
    .Decode(sanitizeInput)
})
```

#### 10.2 レート制限
```typescript
// middleware/rate-limit.ts
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export const rateLimitMiddleware = (options: { limit: number; window: number }) =>
  (app: Elysia) => app.onBeforeHandle(({ request, set }) => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const windowStart = now - options.window

    let record = rateLimitStore.get(ip)
    
    if (!record || record.resetTime < windowStart) {
      record = { count: 0, resetTime: now + options.window }
      rateLimitStore.set(ip, record)
    }

    record.count++

    if (record.count > options.limit) {
      set.status = 429
      throw new APIError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED')
    }
  })

// Usage
app.use(rateLimitMiddleware({ limit: 100, window: 60000 })) // 100 requests per minute
```

### 11. パフォーマンス

#### 11.1 キャッシュ
```typescript
// utils/cache.ts
const cache = new Map<string, { data: any; expiry: number }>()

export const setCache = (key: string, data: any, ttl: number = 300000) => {
  cache.set(key, { data, expiry: Date.now() + ttl })
}

export const getCache = (key: string): any | null => {
  const item = cache.get(key)
  if (!item || item.expiry < Date.now()) {
    cache.delete(key)
    return null
  }
  return item.data
}

// Usage in service
async getUsers(options?: GetUsersOptions) {
  const cacheKey = `users:${JSON.stringify(options)}`
  const cached = getCache(cacheKey)
  
  if (cached) {
    return cached
  }

  const result = await this.userRepository.findAll(options)
  setCache(cacheKey, result, 60000) // 1 minute cache
  
  return result
}
```

#### 11.2 データベース最適化
```typescript
// Repository with optimized queries
export class UserRepository {
  async findAllWithPosts(): Promise<UserWithPosts[]> {
    return await db.user.findMany({
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })
  }

  async findByIdWithCounts(id: string): Promise<UserWithCounts | null> {
    const [user, postCount, commentCount] = await Promise.all([
      db.user.findUnique({ where: { id } }),
      db.post.count({ where: { authorId: id } }),
      db.comment.count({ where: { authorId: id } })
    ])

    return user ? { ...user, postCount, commentCount } : null
  }
}
```

## 禁止事項

1. **any型の使用**
2. **console.log/console.error** (本番環境)
3. **SQLインジェクション** の可能性があるクエリ
4. **平文パスワード** の保存
5. **機密情報** のログ出力
6. **未処理のPromise** の放置
7. **グローバル変数** の使用

## デプロイ時の確認事項

1. 環境変数が適切に設定されていること
2. データベースマイグレーションが完了していること
3. APIドキュメント（Swagger）が更新されていること
4. エラーログが適切に設定されていること
5. レート制限が設定されていること
6. セキュリティヘッダーが設定されていること