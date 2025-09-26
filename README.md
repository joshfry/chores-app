# Family Chores Management App

Full-stack family chores management application with passwordless authentication.

## Tech Stack

- **Backend**: Node.js + Express.js + SQLite
- **Frontend**: React + TypeScript + Styled Components (planned)
- **Authentication**: Passwordless magic links + WebAuthn
- **Testing**: Jest + Supertest
- **Monorepo**: pnpm workspaces

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install all dependencies
pnpm install

# Start development servers (both backend and frontend)
pnpm dev

# Or start individually
pnpm start:backend
pnpm start:frontend
```

## Available Commands

### Development

```bash
pnpm dev              # Start both backend and frontend in dev mode
pnpm start:backend    # Start backend server
pnpm start:frontend   # Start frontend dev server (when created)
```

### Testing

```bash
pnpm test             # Run all tests
pnpm test:backend     # Run backend tests only
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage report
```

### Utilities

```bash
pnpm clean            # Clean node_modules and build artifacts
pnpm install-all      # Reinstall all dependencies
```

## Project Structure

```
chores/
├── backend/          # Express.js API server
│   ├── routes/       # API routes
│   ├── middleware/   # Custom middleware
│   ├── models/       # Data models
│   └── tests/        # Jest test files
├── frontend/         # React TypeScript app (planned)
└── pnpm-workspace.yaml
```

## API Documentation

- **Root**: http://localhost:3001/ (API documentation)
- **Health**: http://localhost:3001/health
- **Authentication**: http://localhost:3001/api/auth/\*
- **Users**: http://localhost:3001/api/auth/users/\*
- **Data**: http://localhost:3001/api/(children|chores|assignments)/\*

## Development Status

- ✅ **Backend API**: Complete with authentication
- ✅ **Tests**: Comprehensive test suite (91 tests)
- ✅ **Authentication**: Passwordless magic links + session management
- ✅ **User CRUD**: Full user management with role-based access
- 🔄 **Database**: SQLite integration (in progress)
- ⏳ **Frontend**: React app (planned)

## Authentication Flow

1. **Signup**: POST `/api/auth/signup` → Magic link sent
2. **Verify**: GET `/api/auth/verify?token=...` → Get session token
3. **API Access**: Use `Authorization: Bearer <token>` header
4. **User Management**: Full CRUD operations for family members

---

For detailed API documentation, visit http://localhost:3001/ when the server is running.
