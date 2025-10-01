# Styling Approach

## **🎨 TailwindCSS - Our Styling Framework**

This project uses **TailwindCSS v3** for all styling needs.

### **Why Tailwind?**

- ✅ **Utility-first approach** - Compose designs directly in JSX
- ✅ **Consistent design system** - Pre-defined spacing, colors, typography
- ✅ **No CSS file management** - All styles are in components
- ✅ **Production optimization** - Unused styles are purged automatically
- ✅ **Responsive design** - Built-in breakpoint utilities (`sm:`, `md:`, `lg:`, etc.)
- ✅ **Developer experience** - Fast, predictable, maintainable

### **Configuration**

#### **Tailwind Config** (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### **PostCSS Config** (`postcss.config.js`)

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### **CSS Entry Point** (`src/index.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles and resets here */
```

### **Usage Examples**

#### **Basic Layout**

```tsx
<div className="p-6">
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-bold text-gray-900">Page Title</h1>
    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
      Action
    </button>
  </div>
</div>
```

#### **Responsive Design**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

#### **Cards & Shadows**

```tsx
<div className="bg-white rounded-lg shadow-lg p-6">
  <h2 className="text-xl font-semibold mb-4">Card Title</h2>
  <p className="text-gray-600">Card content</p>
</div>
```

#### **Forms**

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
  <input
    type="text"
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
  />
</div>
```

#### **Gradients**

```tsx
<div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-lg">
  Gradient Background
</div>
```

#### **Tables**

```tsx
<table className="w-full">
  <thead className="bg-gray-50 border-b border-gray-200">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
        Header
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">Cell</td>
    </tr>
  </tbody>
</table>
```

### **Common Patterns**

#### **Color System**

- **Primary Action**: `bg-blue-600 hover:bg-blue-700 text-white`
- **Secondary Action**: `border border-gray-300 text-gray-700 hover:bg-gray-50`
- **Danger Action**: `border border-red-300 text-red-700 hover:bg-red-50`
- **Success Badge**: `bg-green-100 text-green-800`
- **Warning Badge**: `bg-yellow-100 text-yellow-800`
- **Info Badge**: `bg-blue-100 text-blue-800`

#### **Spacing Scale**

- **Tight**: `gap-2`, `p-2`, `m-2` (8px)
- **Default**: `gap-4`, `p-4`, `m-4` (16px)
- **Loose**: `gap-6`, `p-6`, `m-6` (24px)

#### **Typography**

- **Page Title**: `text-2xl font-bold text-gray-900`
- **Section Title**: `text-xl font-semibold text-gray-900`
- **Body Text**: `text-sm text-gray-600`
- **Label**: `text-sm font-medium text-gray-700`

### **Migration from Styled-Components**

This project was migrated from styled-components to TailwindCSS. All styling is now inline using Tailwind utility classes.

**Before (Styled-Components):**

```tsx
const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.375rem;
  &:hover {
    background-color: #2563eb;
  }
`
```

**After (TailwindCSS):**

```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
  Click me
</button>
```

### **AI Assistant Guidelines**

When styling components:

1. ✅ **DO**: Use Tailwind utility classes directly in `className`
2. ✅ **DO**: Follow the established patterns in this document
3. ✅ **DO**: Use responsive utilities (`md:`, `lg:`) for mobile-first design
4. ✅ **DO**: Preserve `data-testid` attributes for testing
5. ❌ **DON'T**: Create CSS files for styling
6. ❌ **DON'T**: Use inline `style={{}}` props (unless absolutely necessary)
7. ❌ **DON'T**: Use styled-components or other CSS-in-JS libraries
8. ❌ **DON'T**: Suggest alternative CSS frameworks

### **Resources**

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- [Tailwind UI Components](https://tailwindui.com/components)

---

**Last Updated:** October 1, 2025  
**Tailwind Version:** 3.4.17
