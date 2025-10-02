# 🎯 **BEST PRACTICES GUIDE**

## 📋 **Overview**

This document consolidates all best practices for the Family Chores Management App. Follow these guidelines to maintain enterprise-grade code quality.

---

## 🔐 **1. Security Best Practices**

### **Authentication & Authorization**

```typescript
// ✅ GOOD: Always validate authentication state
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    })
  }

  try {
    const session = await validateSessionToken(token)
    req.user = session.user
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    })
  }
}

// ❌ BAD: Trusting client-provided user IDs
app.get('/api/profile', (req, res) => {
  const userId = req.query.userId // NEVER DO THIS
  // ...
})
```

### **Input Validation**

```typescript
// ✅ GOOD: Validate all inputs before processing
import { z } from 'zod'

const createChoreSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  isRecurring: z.boolean(),
  recurrenceDays: z.array(z.string()).optional(),
})

app.post('/api/chores', async (req, res) => {
  try {
    const validated = createChoreSchema.parse(req.body)
    // Process validated data
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input data',
    })
  }
})

// ❌ BAD: Direct database insertion without validation
app.post('/api/chores', async (req, res) => {
  await db.chore.create({ data: req.body }) // NEVER DO THIS
})
```

### **Sensitive Data Handling**

```typescript
// ✅ GOOD: Never expose sensitive data
const sanitizeUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  // Omit: passwordHash, sessionToken, etc.
})

// ✅ GOOD: Use environment variables for secrets
const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // NEVER hardcode
  },
}

// ❌ BAD: Returning full user object with sensitive data
res.json({ user: dbUser }) // May contain hashed passwords, tokens, etc.
```

---

## 🧪 **2. Testing Best Practices**

### **Test Structure**

```typescript
// ✅ GOOD: Comprehensive test with proper setup/teardown
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await resetTestDatabase()
    await createTestUser({ email: 'test@example.com' })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should send magic link for valid email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: expect.stringContaining('login'),
      }),
    )
  })

  it('should handle non-existent user gracefully', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com' })
      .set('Accept', 'application/json')

    // Security: Don't reveal if user exists
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })

  it('should reject invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email' })
      .set('Accept', 'application/json')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('Invalid email')
  })
})

// ❌ BAD: Minimal test without proper assertions
it('login works', async () => {
  const response = await request(app).post('/api/auth/login')
  expect(response.status).toBe(200)
})
```

### **What to Test**

✅ **Always Test:**

- Happy path (successful scenarios)
- Error scenarios (validation failures, not found, etc.)
- Edge cases (empty strings, very long strings, special characters)
- Security validation (unauthorized access, malformed tokens)
- Database errors (connection failures, constraint violations)
- API contract (response structure, status codes, headers)

❌ **Don't Test:**

- Third-party library internals
- Framework functionality (Express, React, etc.)
- Simple getters/setters with no logic

### **Test Coverage Standards**

- **Minimum**: 90% coverage across all projects
- **Current**: 92% backend, 85% frontend
- **Focus**: Business logic, security validation, error handling

```bash
# Always check coverage before committing
pnpm run test:coverage

# Fail if coverage drops below threshold
jest --coverage --coverageThreshold='{"global":{"branches":90,"functions":90,"lines":90,"statements":90}}'
```

---

## 🏗️ **3. Code Quality Best Practices**

### **TypeScript**

```typescript
// ✅ GOOD: Explicit types, no any
interface CreateChoreRequest {
  title: string
  description?: string
  difficulty: 'easy' | 'medium' | 'hard'
  isRecurring: boolean
  recurrenceDays?: string[]
}

async function createChore(data: CreateChoreRequest): Promise<Chore> {
  // Implementation
}

// ❌ BAD: Using any or implicit any
async function createChore(data: any) {
  // NEVER DO THIS
}

// ✅ GOOD: Type guards for runtime validation
function isChore(obj: unknown): obj is Chore {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'difficulty' in obj
  )
}

// ✅ GOOD: Use enums for fixed values
enum ChoreStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}
```

### **Error Handling**

```typescript
// ✅ GOOD: Comprehensive error handling with proper responses
app.post('/api/chores', async (req, res) => {
  try {
    const validated = createChoreSchema.parse(req.body)
    const chore = await db.chore.create({ data: validated })

    return res.status(201).json({
      success: true,
      data: chore,
      message: 'Chore created successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      })
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Chore with this title already exists',
      })
    }

    console.error('Error creating chore:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
})

// ❌ BAD: Generic error handling
app.post('/api/chores', async (req, res) => {
  try {
    const chore = await db.chore.create({ data: req.body })
    res.json(chore)
  } catch (error) {
    res.status(500).json({ error: 'Error' })
  }
})
```

### **Async/Await Patterns**

```typescript
// ✅ GOOD: Proper async/await with error handling
async function fetchUserWithChores(userId: number) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { chores: true },
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

// ❌ BAD: Promise chains (harder to read/debug)
function fetchUserWithChores(userId: number) {
  return db.user
    .findUnique({ where: { id: userId } })
    .then((user) => {
      if (!user) throw new Error('Not found')
      return user
    })
    .catch((error) => {
      console.error(error)
      throw error
    })
}
```

---

## 🎨 **4. Styling Best Practices (Tailwind CSS)**

### **Component Styling**

```tsx
// ✅ GOOD: Use Tailwind utility classes
export const Button = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors'
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  )
}

// ❌ BAD: Inline styles or styled-components (project uses Tailwind)
const Button = styled.button`
  padding: 1rem;
  background: blue;
` // DON'T USE THIS

// ❌ BAD: Inline styles
<button style={{ padding: '1rem', background: 'blue' }}>Click</button>
```

### **Responsive Design**

```tsx
// ✅ GOOD: Mobile-first responsive design
<div className="
  w-full px-4 py-8
  md:max-w-2xl md:mx-auto
  lg:max-w-4xl
">
  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
    Dashboard
  </h1>
</div>

// ✅ GOOD: Consistent spacing scale
<div className="space-y-4"> {/* Tailwind spacing: 1rem (16px) */}
  <Card />
  <Card />
  <Card />
</div>
```

---

## 🗄️ **5. Database Best Practices (Prisma)**

### **Query Optimization**

```typescript
// ✅ GOOD: Use select to fetch only needed fields
const users = await db.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // Don't fetch large fields unless needed
  },
})

// ✅ GOOD: Use include for relations efficiently
const user = await db.user.findUnique({
  where: { id: userId },
  include: {
    assignments: {
      where: { status: 'assigned' },
      include: { chores: true },
    },
  },
})

// ❌ BAD: Fetching all data then filtering in JS
const users = await db.user.findMany() // Fetches everything
const activeUsers = users.filter((u) => u.isActive) // Filter in DB instead
```

### **Transactions**

```typescript
// ✅ GOOD: Use transactions for related operations
await db.$transaction(async (tx) => {
  const assignment = await tx.assignment.create({
    data: {
      userId,
      startDate,
      endDate,
    },
  })

  await tx.assignmentChore.createMany({
    data: choreIds.map((choreId) => ({
      assignmentId: assignment.id,
      choreId,
      status: 'pending',
    })),
  })

  return assignment
})

// ❌ BAD: Separate operations that should be atomic
const assignment = await db.assignment.create({ data: assignmentData })
await db.assignmentChore.createMany({ data: choresData })
// If second operation fails, first is already committed
```

### **Migrations**

```bash
# ✅ GOOD: Use Prisma migrations for schema changes
npx prisma migrate dev --name add_recurring_chores

# ✅ GOOD: Review generated migration before applying
# Check migration file in prisma/migrations/

# ❌ BAD: Direct database schema modifications
# NEVER manually edit the database schema
```

---

## 🌐 **6. API Design Best Practices**

### **RESTful Conventions**

```typescript
// ✅ GOOD: Follow REST conventions
GET    /api/chores           // List all chores
GET    /api/chores/:id       // Get specific chore
POST   /api/chores           // Create new chore
PATCH  /api/chores/:id       // Update chore (partial)
PUT    /api/chores/:id       // Replace chore (full)
DELETE /api/chores/:id       // Delete chore

// ❌ BAD: Non-RESTful endpoints
GET    /api/getChores
POST   /api/createChore
POST   /api/deleteChore
```

### **Response Format**

```typescript
// ✅ GOOD: Consistent response structure
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Success response
res.status(200).json({
  success: true,
  data: chores,
  message: 'Chores retrieved successfully',
})

// Error response
res.status(400).json({
  success: false,
  error: 'Invalid chore ID',
})

// ❌ BAD: Inconsistent responses
res.json(chores) // Sometimes just data
res.json({ error: 'Failed' }) // Sometimes just error
res.json({ status: 'ok', chores }) // Different structure
```

### **Status Codes**

```typescript
// ✅ GOOD: Use appropriate HTTP status codes
200 // OK - Successful GET, PATCH, PUT
201 // Created - Successful POST
204 // No Content - Successful DELETE
400 // Bad Request - Validation errors
401 // Unauthorized - Authentication required
403 // Forbidden - Insufficient permissions
404 // Not Found - Resource doesn't exist
409 // Conflict - Duplicate resource
500 // Internal Server Error - Server-side error

// ❌ BAD: Always returning 200
res.status(200).json({ error: 'Not found' }) // Should be 404
res.status(200).json({ error: 'Unauthorized' }) // Should be 401
```

---

## 📝 **7. Git Best Practices**

### **Commit Messages**

**REQUIRED FORMAT:**

```
(<Agent Name>): <Short but clear summary of work>
```

**Examples:**

```
(PM): Organize all documentation into ai-docs folder
(Backend): Implement user authentication endpoints
(Frontend): Add Tailwind CSS styling to login page
(Testing): Add unit tests for auth middleware
```

**See [`GIT_STANDARDS.md`](./GIT_STANDARDS.md) for complete details.**

### **Commit Hygiene**

```bash
# ✅ GOOD: Atomic commits (one logical change)
git commit -m "(Backend): Add email validation to signup"
git commit -m "(Backend): Add tests for email validation"

# ❌ BAD: Mixed concerns in one commit
git commit -m "(Backend): Add email, fix bug, update docs, refactor code"

# ✅ GOOD: Test before committing
pnpm test && git commit -m "(Frontend): Add user profile page"

# ❌ BAD: Committing broken code
git commit -m "WIP - half done, tests fail"
```

---

## 📚 **8. Documentation Best Practices**

### **When to Update Documentation**

✅ **Always Document:**

- New API endpoints or changes to existing ones
- New environment variables required
- Breaking changes to interfaces or contracts
- New setup/deployment steps
- Security considerations or vulnerabilities fixed

❌ **Don't Document:**

- Internal refactoring with no external impact
- Minor code formatting or style changes
- Temporary debugging code

### **Documentation Standards**

```markdown
## ✅ GOOD: Clear, actionable documentation

### POST /api/chores

Create a new chore.

**Request Body:**
\`\`\`json
{
"title": "Take out trash",
"difficulty": "easy",
"isRecurring": true,
"recurrenceDays": ["monday", "friday"]
}
\`\`\`

**Response (201):**
\`\`\`json
{
"success": true,
"data": { "id": 1, "title": "Take out trash", ... }
}
\`\`\`

**Errors:**

- 400: Invalid input data
- 409: Chore with title already exists

---

## ❌ BAD: Vague documentation

### Create Chore

POST /api/chores
Creates a chore. Send JSON data.
```

---

## 🚀 **9. Performance Best Practices**

### **Database Queries**

```typescript
// ✅ GOOD: Paginated queries for large datasets
const chores = await db.chore.findMany({
  take: 20,
  skip: page * 20,
  orderBy: { createdAt: 'desc' },
})

// ✅ GOOD: Use indexes for frequently queried fields
// In schema.prisma:
model User {
  id    Int    @id @default(autoincrement())
  email String @unique // Automatically indexed
  name  String
  @@index([name]) // Add index for name lookups
}

// ❌ BAD: Fetching all records without pagination
const allChores = await db.chore.findMany() // Could be thousands
```

### **Frontend Optimization**

```tsx
// ✅ GOOD: Memoize expensive computations
const sortedChores = useMemo(
  () => chores.sort((a, b) => a.title.localeCompare(b.title)),
  [chores]
)

// ✅ GOOD: Debounce user input
const debouncedSearch = useDebounce(searchTerm, 300)

useEffect(() => {
  fetchChores(debouncedSearch)
}, [debouncedSearch])

// ❌ BAD: Sorting on every render
function ChoreList({ chores }) {
  const sorted = chores.sort(...) // Sorts on EVERY render
  // ...
}
```

---

## 🔍 **10. Debugging Best Practices**

### **Logging**

```typescript
// ✅ GOOD: Structured logging with context
console.log('[AUTH] User login attempt:', {
  email: user.email,
  timestamp: new Date().toISOString(),
  ip: req.ip,
})

// ✅ GOOD: Use appropriate log levels
console.error('[ERROR] Database connection failed:', error)
console.warn('[WARN] Deprecated API endpoint used')
console.info('[INFO] Server started on port 3001')
console.debug('[DEBUG] Request body:', req.body)

// ❌ BAD: Vague logging
console.log('error') // What error? Where? Why?
console.log(req.body) // No context
```

### **Error Messages**

```typescript
// ✅ GOOD: Clear, actionable error messages
throw new Error('User not found with ID: ' + userId)
throw new Error('Invalid email format. Expected: user@example.com')

// ❌ BAD: Generic error messages
throw new Error('Error')
throw new Error('Something went wrong')
```

---

## ✅ **Quick Checklist**

Before committing ANY code:

- [ ] All tests pass (`pnpm test`)
- [ ] Test coverage maintained (90%+)
- [ ] TypeScript compiles with no `any` types
- [ ] Inputs validated, errors handled
- [ ] Security patterns followed
- [ ] Documentation updated (if needed)
- [ ] Commit message follows format
- [ ] Code reviewed for best practices

---

## 📖 **Additional Resources**

- **Enterprise Standards**: [`ENTERPRISE_STANDARDS.md`](./ENTERPRISE_STANDARDS.md)
- **Testing Guide**: [`TESTING_GUIDE.md`](./TESTING_GUIDE.md)
- **Git Standards**: [`GIT_STANDARDS.md`](./GIT_STANDARDS.md)
- **Styling Approach**: [`STYLING_APPROACH.md`](./STYLING_APPROACH.md)
- **Project Context**: [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)

---

**Last Updated:** October 2, 2025  
**Status:** Active - All developers must follow
