# 🔄 **Converting from `data-cy` to `data-testid`**

## Quick Conversion Reference

Your Cypress tests will work exactly the same - just with different attribute names:

### **Before (data-cy)**

```jsx
<button data-cy="login-button">Login</button>
<input data-cy="email-input" type="email" />
<div data-cy="user-welcome">Welcome!</div>
```

### **After (data-testid)**

```jsx
<button data-testid="login-button">Login</button>
<input data-testid="email-input" type="email" />
<div data-testid="user-welcome">Welcome!</div>
```

### **Test Selectors Update**

```javascript
// Before
cy.get('[data-cy=login-button]')

// After
cy.get('[data-testid=login-button]')
```

## **Global Find & Replace**

In your IDE, do a project-wide find and replace:

1. **Find:** `data-cy=`  
   **Replace:** `data-testid=`

2. **Find:** `[data-cy=`  
   **Replace:** `[data-testid=`

That's it! Your tests will work identically with the new attributes.

## **Benefits of the Switch**

✅ **Multi-framework support**: Works with Jest, Cypress, Playwright  
✅ **Industry standard**: More widely adopted  
✅ **Future-proof**: Not tied to specific testing tools  
✅ **Team alignment**: Consistent with React Testing Library patterns
