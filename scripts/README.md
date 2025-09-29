# 🛠️ Utility Scripts

This folder contains utility scripts for development, testing, and automation.

## 📜 Scripts

### **Testing & Development**

- **`start-both-servers.js`** - Concurrent server starter for E2E tests

  - Starts both backend and frontend servers
  - Waits for health checks before proceeding
  - Used by E2E test automation

- **`test-all.sh`** - Comprehensive test suite runner
  - Runs all backend, frontend, and E2E tests
  - Provides detailed reporting and coverage
  - Used for full test validation

## 🚀 Usage

These scripts are typically called by root-level package.json commands:

```bash
# E2E tests (calls start-both-servers.js)
pnpm run test:e2e
pnpm run test:e2e:open

# Comprehensive tests (calls test-all.sh)
pnpm run test:comprehensive
```

## 📁 Organization

- **Root `/scripts/`** - Cross-cutting utilities that manage both backend and frontend
- **`/backend/dev-scripts/`** - Backend-specific development scripts
- **Frontend scripts** - Handled through package.json, no separate folder needed

---

_For backend-specific scripts, see [`/backend/dev-scripts/`](../backend/dev-scripts/)_
