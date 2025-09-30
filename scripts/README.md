# 🛠️ Utility Scripts

This folder contains utility scripts for development, testing, and automation.

## 📜 Scripts

### **Testing & Development**

- **`test-all.sh`** - Comprehensive test suite runner
  - Runs backend and frontend tests
  - Provides detailed reporting and coverage
  - Used for full test validation

## 🚀 Usage

These scripts are typically called by root-level scripts such as `pnpm run test:comprehensive`.

## 📁 Organization

- **Root `/scripts/`** - Cross-cutting utilities that manage both backend and frontend
- **`/backend/dev-scripts/`** - Backend-specific development scripts
- **Frontend scripts** - Handled through package.json, no separate folder needed

---

_For backend-specific scripts, see [`/backend/dev-scripts/`](../backend/dev-scripts/)_
