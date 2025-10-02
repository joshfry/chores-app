# Git Standards

## 📝 Commit Message Format

**ALL commits MUST follow this format:**

```
(<Agent Name>): <Short but clear summary of work>
```

### **Format Rules**

1. **Agent Name**: Describe your role (e.g., "PM Agent", "Backend Agent", "Frontend Agent")
2. **Colon**: Always include `: ` after the closing parenthesis
3. **Summary**: Short (ideally under 72 characters) but clear description
4. **No body text**: Keep commits focused and simple

### **Examples**

✅ **Good:**

```
(PM Agent): Organize all documentation into ai-docs folder
(Backend Agent): Implement passwordless authentication endpoints
(Frontend Agent): Add Tailwind CSS styling to login page
(DevOps Agent): Configure Render deployment settings
(Testing Agent): Add unit tests for auth middleware
(Database Agent): Create user and family tables migration
```

❌ **Bad:**

```
Fixed stuff
Update files
WIP
backend changes
```

### **Agent Names by Role**

Use one of these standard agent names:

- **PM Agent** - Project management, documentation organization
- **Backend Agent** - Server, API, database work
- **Frontend Agent** - UI, components, styling
- **DevOps Agent** - Deployment, CI/CD, infrastructure
- **Testing Agent** - Writing tests, QA work
- **Database Agent** - Schema, migrations, queries
- **Documentation Agent** - Writing docs, guides, READMEs
- **Security Agent** - Auth, permissions, security fixes
- **Performance Agent** - Optimization, caching, profiling

If your role doesn't fit these, create a clear descriptive name.

---

## 🔀 Branch Strategy

**Main Branch:**

- Direct commits allowed (monorepo, small team)
- All changes go through commit message standards
- Keep commits atomic and focused

**Feature Branches (Optional):**

- Use for large features spanning multiple sessions
- Name format: `feature/descriptive-name`
- Merge to main when complete

---

## ✅ Commit Guidelines

### **Do:**

- ✅ Write clear, descriptive summaries
- ✅ Make atomic commits (one logical change per commit)
- ✅ Test before committing
- ✅ Run linters/formatters (handled by pre-commit hooks)
- ✅ Include agent name in every commit

### **Don't:**

- ❌ Commit broken code
- ❌ Mix unrelated changes in one commit
- ❌ Commit secrets, .env files, or credentials
- ❌ Use vague messages like "fix", "update", "WIP"
- ❌ Commit without following the format

---

## 🤖 Pre-commit Hooks

**Automated checks (via Husky + lint-staged):**

1. Prettier formatting (auto-fixes)
2. ESLint (if enabled)
3. TypeScript compilation check

These run automatically on `git commit`.

---

## 📦 What to Commit

### **Always Commit:**

- Source code changes
- Configuration files
- Documentation updates
- Test files
- Package.json/lock files (if dependencies change)

### **Never Commit:**

- `.env` files (use `.env.example` instead)
- `node_modules/`
- Build artifacts (`build/`, `dist/`)
- Database files (`*.sqlite`, `*.db`)
- IDE settings (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`)
- Log files (`*.log`)

All of these are in `.gitignore` already.

---

## 🚫 Forbidden Operations

**NEVER:**

- Force push to main (`git push --force`)
- Rewrite public history
- Skip commit hooks (`--no-verify`)
- Commit directly to main without testing

---

## 📖 References

- [Conventional Commits](https://www.conventionalcommits.org/) (inspiration)
- [Git Best Practices](https://git-scm.com/book/en/v2)
- See also: `ai-docs/.agent-notes.md` for critical agent instructions

---

**Last Updated:** October 2, 2025  
**Status:** Active - All agents must follow
