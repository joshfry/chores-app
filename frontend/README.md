# 🎨 Frontend - Family Chores Management App

React TypeScript frontend for the Family Chores Management application with passwordless authentication.

## 🚀 Quick Start

```bash
# From project root
pnpm dev:frontend

# Or from frontend directory
cd frontend
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 📋 Prerequisites

- **Node.js**: v18+
- **Backend Running**: The API must be running on port 3001
  ```bash
  pnpm dev:backend
  ```

## 🏗 Tech Stack

- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: CSS (future: styled-components)
- **HTTP Client**: Axios
- **State Management**: Context API for auth
- **Testing**: Jest + React Testing Library

## 📁 Project Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── auth/           # Auth-related components
│   ├── layout/         # Layout components (Dashboard, etc.)
│   └── ProtectedRoute.tsx
├── contexts/           # React Context providers
│   └── AuthContext.tsx # Authentication state management
├── pages/              # Route-level page components
│   ├── auth/          # Login, Signup, Verify
│   ├── dashboard/     # Main dashboard
│   ├── users/         # User management
│   ├── chores/        # Chore management
│   └── assignments/   # Assignment management
├── services/          # API client and service layer
│   └── api.ts         # Axios configuration & API calls
├── types/             # TypeScript type definitions
│   └── api.ts         # API response types
└── App.tsx            # Root component with routing

```

## 🔐 Authentication Flow

This app uses **passwordless authentication**:

1. **Signup** → Create family account (`/auth/signup`)
2. **Login** → Request magic link via email (`/auth/login`)
3. **Verify** → Magic link redirects to `/auth/verify?token=...`
4. **Session** → JWT stored in localStorage, sent with all API requests
5. **Protected Routes** → Redirect to login if not authenticated

### Auth Context

```typescript
const { user, login, logout, isLoading } = useAuth()
```

## 🧪 Testing

### Run Tests

```bash
# From root
pnpm run test:frontend

# From frontend directory
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watchAll
```

### Test Coverage

- **Components**: Auth components, protected routes
- **Contexts**: AuthContext state management
- **Services**: API client, error handling
- **Coverage**: ~85%+ maintained

## 🛠 Available Scripts

### Development

```bash
npm start          # Start dev server (port 3000)
npm test           # Run test suite
npm run build      # Production build
```

### From Project Root

```bash
pnpm dev:frontend           # Start frontend dev server
pnpm test:frontend          # Run frontend tests
pnpm test:coverage:frontend # Generate coverage report
pnpm test:watch:frontend    # Run tests in watch mode
```

## 🔗 API Integration

### API Client Configuration

The frontend connects to the backend API at `http://localhost:3001`

```typescript
// src/services/api.ts
const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})
```

### Making API Calls

```typescript
import { api } from './services/api'

// Automatically includes Authorization header if logged in
const response = await api.get('/api/children')
const children = response.data.data
```

## 📄 Key Pages

### Public Routes

- `/auth/login` - Request magic link
- `/auth/signup` - Create family account
- `/auth/verify?token=...` - Verify magic link

### Protected Routes (Login Required)

- `/dashboard` - Main dashboard with stats
- `/users` - User management
- `/chores` - Chore management
- `/assignments` - Assignment tracking

## 🎨 Component Guidelines

### TypeScript Types

```typescript
// Always type your props
interface ButtonProps {
  onClick: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'primary',
}) => {
  return (
    <button onClick={onClick} className={variant}>
      {children}
    </button>
  )
}
```

### Test Data Attributes

For better testing, use `data-testid` attributes:

```tsx
<button data-testid="login-button" onClick={handleLogin}>
  Login
</button>
```

See [`ai-docs/DATA_ATTRIBUTES_GUIDE.md`](../ai-docs/DATA_ATTRIBUTES_GUIDE.md) for comprehensive guidelines.

## 🐛 Troubleshooting

### "API request failed" errors

**Cause**: Backend not running or wrong URL

**Solution**:

```bash
# Check if backend is running
curl http://localhost:3001/health

# Start backend if needed
pnpm dev:backend
```

### "Network Error" on all requests

**Cause**: CORS issue or backend not accessible

**Solution**: Verify backend is running and CORS is enabled for `http://localhost:3000`

### Authentication redirects immediately

**Cause**: Token expired or invalid

**Solution**:

- Clear localStorage: `localStorage.clear()`
- Login again to get fresh token

### Port 3000 already in use

**Cause**: Another app using the port

**Solution**:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

## 🚀 Build & Deploy

### Production Build

```bash
npm run build
```

Creates optimized build in `build/` directory.

### Build Output

- Minified JavaScript bundles
- Optimized CSS
- Static assets with cache-friendly hashes
- `index.html` entry point

### Environment Variables

Create `.env` file for configuration:

```bash
REACT_APP_API_URL=http://localhost:3001
```

Access in code:

```typescript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001'
```

## 📚 Further Documentation

- **Main README**: [`../README.md`](../README.md) - Complete project overview
- **Enterprise Standards**: [`../ai-docs/ENTERPRISE_STANDARDS.md`](../ai-docs/ENTERPRISE_STANDARDS.md)
- **Testing Guide**: [`../ai-docs/TESTING_GUIDE.md`](../ai-docs/TESTING_GUIDE.md)
- **Data Attributes**: [`../ai-docs/DATA_ATTRIBUTES_GUIDE.md`](../ai-docs/DATA_ATTRIBUTES_GUIDE.md)

## 🔧 Development Notes

- This is an **enterprise-grade** application with professional standards
- Maintain **85%+ test coverage** for all new components
- Follow TypeScript best practices (no `any` types)
- Update tests when adding new features
- Keep documentation in sync with code changes

---

**Built with** ⚛️ React + TypeScript | **Styled with** 💅 CSS | **Tested with** 🧪 Jest + RTL
