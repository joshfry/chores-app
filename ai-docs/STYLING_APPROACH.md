# 🎨 Styling Approach

## **CRITICAL: Read Before Making Any Frontend Changes**

### **Current Styling Strategy**

This project uses **styled-components with EMPTY templates**. The developer provides all CSS styling themselves.

### **What This Means for AI Agents**

✅ **DO:**

- Keep all styled-component declarations
- Use empty template literals: ` styled.div` `` (no CSS inside)
- Maintain component structure and props (like `variant`, `isActive`, etc.)
- Preserve all `data-testid` attributes

❌ **DON'T:**

- Add CSS to styled-components
- Use inline `style={{}}` props
- Add CSS classes with predefined styles
- Import or suggest CSS frameworks (Tailwind, Bootstrap, etc.)
- Create new CSS files

### **Example Pattern**

```typescript
// ✅ CORRECT - Empty styled-component
const Button = styled.button<{ variant?: 'primary' | 'secondary' }>``

// ❌ WRONG - Don't add CSS
const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 1rem;
  background: blue;
`

// ❌ WRONG - Don't use inline styles
<div style={{ display: 'flex', gap: '1rem' }}>

// ✅ CORRECT - Use styled-components instead
const Container = styled.div``
<Container>
```

### **Semantic Class Names**

Nested elements with `className` are acceptable for semantic purposes:

```typescript
// ✅ CORRECT - Semantic class names
<EmptyState>
  <div className="icon">✅</div>
  <div className="title">No chores created yet</div>
  <div className="subtitle">Create your first chore...</div>
</EmptyState>
```

The developer can target these via parent styled-components:

```typescript
const EmptyState = styled.div`
  .icon {
    font-size: 3rem;
  }
  .title {
    font-weight: bold;
  }
`
```

### **Why This Approach?**

The developer is a **staff-level frontend engineer** who prefers full control over styling. They want the component structure from AI assistance but will handle all visual design themselves.

### **Files Using This Pattern**

All frontend component files follow this pattern:

- `frontend/src/pages/**/*.tsx`
- `frontend/src/components/**/*.tsx`

### **Global Styles**

- **`index.css`** - CSS reset and base styles (keep this)
- No other CSS files should exist

---

**📝 Last Updated:** September 2025  
**🎯 Status:** Active - All components cleaned, ready for custom styling
