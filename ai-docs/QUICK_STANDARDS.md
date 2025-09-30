# 🎯 **QUICK ENTERPRISE STANDARDS**

## ⚠️ **CRITICAL FOR ALL AGENTS**

**This is ENTERPRISE-GRADE software. Not a prototype.**

### **📋 Non-Negotiable Requirements**

- ✅ **90%+ test coverage** (currently: 67 tests - 56 backend + 11 frontend)
- ✅ **TypeScript with full type safety** (no `any`)
- ✅ **Complete error handling** (production-grade)
- ✅ **Security-first approach** (auth, validation, logging)
- ✅ **Professional documentation** (update docs with changes)

### **🧪 Testing Standards**

```bash
# Must pass before any commit
pnpm test                 # All tests
pnpm run test:coverage    # Maintain coverage levels
```

**Write tests for:**

- ✅ Happy path + error scenarios
- ✅ Security validation
- ✅ Edge cases & malformed inputs

### **🔐 Security Patterns**

```typescript
// ✅ REQUIRED: Always validate inputs
const result = validateInput(data)
if (!result.isValid) {
  return res.status(400).json({
    success: false,
    error: result.error,
  })
}
```

### **📚 Documentation Rule**

**Every change = documentation update**

- Update README if architecture changes
- Document new API endpoints
- Add troubleshooting for common issues

### **🎯 Quality Checklist**

Before submitting ANY work:

- [ ] Tests pass (`pnpm test`)
- [ ] Coverage maintained
- [ ] TypeScript compiles without `any`
- [ ] Security patterns followed
- [ ] Documentation updated

---

**📖 Detailed guides:** [`ENTERPRISE_STANDARDS.md`](./ENTERPRISE_STANDARDS.md) | **Examples:** See existing codebase
**🧪 Testing:** [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) | **Setup:** [`WORKSPACE_TESTS.md`](./WORKSPACE_TESTS.md)
