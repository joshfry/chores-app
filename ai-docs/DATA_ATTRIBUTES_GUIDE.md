# 🏷️ Test Data Attributes Guide

## Using `data-testid` Instead of `data-cy`

This guide shows you how to add `data-testid` attributes to your React components for comprehensive test coverage.

## 🎯 **Why `data-testid`?**

- **✅ Framework Agnostic**: Works with Jest, Playwright, Testing Library
- **✅ Industry Standard**: Most widely adopted testing attribute
- **✅ Consistent**: Same attributes for unit, integration, and E2E tests
- **✅ Future Proof**: Won't be tied to specific testing frameworks

## 📋 **Required Attributes for Your Components**

### **🔐 Authentication Pages**

#### Login Page (`src/pages/auth/LoginPage.tsx`)

```jsx
<form data-testid="login-form">
  <input
    data-testid="email-input"
    type="email"
    placeholder="Email"
  />
  <button data-testid="send-magic-link-button">
    Send Magic Link
  </button>
</form>

{/* Error/success messages */}
<div data-testid="error-message">{errorMessage}</div>
<div data-testid="success-message">{successMessage}</div>
```

#### Signup Page (`src/pages/auth/SignupPage.tsx`)

```jsx
<form data-testid="signup-form">
  <input data-testid="email-input" type="email" placeholder="Email" />
  <input data-testid="name-input" type="text" placeholder="Your Name" />
  <input
    data-testid="family-name-input"
    type="text"
    placeholder="Family Name"
  />
  <button data-testid="signup-button">Create Family Account</button>
</form>
```

#### Verify Page (`src/pages/auth/VerifyPage.tsx`)

```jsx
<div data-testid="verify-page">
  <div data-testid="verify-loading">Verifying...</div>
  <div data-testid="verify-success">Successfully verified!</div>
  <div data-testid="verify-error">Invalid or expired token</div>
</div>
```

### **🏠 Dashboard Layout**

#### Dashboard Layout (`src/components/layout/DashboardLayout.tsx`)

```jsx
<div data-testid="dashboard">
  {/* Navigation */}
  <nav>
    <Link to="/dashboard" data-testid="nav-dashboard">
      Dashboard
    </Link>
    <Link to="/dashboard/users" data-testid="nav-users">
      Users
    </Link>
    <Link to="/dashboard/chores" data-testid="nav-chores">
      Chores
    </Link>
    <Link to="/dashboard/assignments" data-testid="nav-assignments">
      Assignments
    </Link>
    <button data-testid="logout-button" onClick={handleLogout}>
      Logout
    </button>
  </nav>

  {/* Mobile Navigation */}
  <button data-testid="mobile-nav-toggle" className="md:hidden">
    ☰
  </button>

  {/* User Info */}
  <div data-testid="user-welcome">
    Welcome, <span data-testid="user-name">{user.name}</span>!
  </div>
  <div data-testid="family-name">{family.name} Family</div>
</div>
```

### **📊 Dashboard Pages**

#### Main Dashboard (`src/pages/dashboard/DashboardPage.tsx`)

```jsx
<div data-testid="dashboard-page">
  {/* Statistics Cards */}
  <div data-testid="stats-grid">
    <div data-testid="stat-children">{stats.totalChildren}</div>
    <div data-testid="stat-chores">{stats.totalChores}</div>
    <div data-testid="stat-assignments">{stats.totalAssignments}</div>
    <div data-testid="stat-completed">{stats.completedAssignments}</div>
    <div data-testid="stat-points">{stats.totalPoints}</div>
  </div>

  {/* Weekly Stats */}
  <div data-testid="weekly-stats">
    <div data-testid="weekly-completed">{weeklyStats.completed}</div>
    <div data-testid="weekly-points">{weeklyStats.points}</div>
  </div>

  {/* Leaderboard */}
  <div data-testid="leaderboard">
    {topPerformers.map((performer) => (
      <div key={performer.id} data-testid="top-performer">
        {performer.name}: {performer.points} points
      </div>
    ))}
  </div>
</div>
```

#### Users Page (`src/pages/users/UsersPage.tsx`)

```jsx
<div data-testid="users-page">
  <button data-testid="add-child-button">Add Child</button>

  {users.map((user) => (
    <div key={user.id} data-testid="user-card">
      <span data-testid="user-name">{user.name}</span>
      <span data-testid="user-role">{user.role}</span>
      <button data-testid="edit-user-button">Edit</button>
      <button data-testid="delete-user-button">Delete</button>
    </div>
  ))}
</div>
```

#### Chores Page (`src/pages/chores/ChoresPage.tsx`)

```jsx
<div data-testid="chores-page">
  <button data-testid="add-chore-button">Add New Chore</button>

  {chores.map((chore) => (
    <div key={chore.id} data-testid="chore-card">
      <h3 data-testid="chore-title">{chore.title}</h3>
      <p data-testid="chore-description">{chore.description}</p>
      <span data-testid="chore-points">{chore.points} points</span>
      <span data-testid="chore-difficulty">{chore.difficulty}</span>
      <button data-testid="edit-chore-button">Edit</button>
      <button data-testid="delete-chore-button">Delete</button>
    </div>
  ))}
</div>
```

#### Assignments Page (`src/pages/assignments/AssignmentsPage.tsx`)

```jsx
<div data-testid="assignments-page">
  <button data-testid="create-assignment-button">Create Assignment</button>

  {assignments.map((assignment) => (
    <div key={assignment.id} data-testid="assignment-card">
      <span data-testid="assignment-child">{assignment.childName}</span>
      <span data-testid="assignment-chore">{assignment.choreTitle}</span>
      <span data-testid="assignment-status">{assignment.status}</span>
      <span data-testid="assignment-points">{assignment.points}</span>

      {assignment.status === 'assigned' && (
        <button data-testid="mark-complete-button">Mark Complete</button>
      )}

      <button data-testid="edit-assignment-button">Edit</button>
      <button data-testid="delete-assignment-button">Delete</button>
    </div>
  ))}
</div>
```

### **⚠️ Error Handling**

```jsx
// Global error boundary or error messages
<div data-testid="error-message" className="error">
  {error}
</div>

<div data-testid="loading-spinner" className="loading">
  Loading...
</div>

<div data-testid="network-error" className="error">
  Network connection error
</div>
```

## 🔄 **Update Your Existing Tests**

The tests are already written, you just need to update the selectors. Here's a quick find-and-replace guide:

### **Global Find & Replace**

```
Find:    data-cy=
Replace: data-testid=

Find:    [data-cy=
Replace: [data-testid=
```

## 📝 **Best Practices**

### **✅ DO**

- Use descriptive, action-oriented names: `data-testid="save-user-button"`
- Include the element type: `button`, `input`, `form`, `page`
- Use kebab-case: `data-testid="user-profile-form"`
- Add to interactive elements users will click/type into
- Add to elements that display dynamic content

### **❌ DON'T**

- Use generic names: `data-testid="button1"`
- Add to every single element (only test-relevant ones)
- Use camelCase or spaces: `data-testid="userProfileForm"`
- Rely on CSS classes or text content for testing

## 🎯 **Component Examples**

### **Button Component**

```jsx
export const Button = ({ children, onClick, variant, ...props }) => {
  return (
    <button
      data-testid={`${variant}-button`}
      onClick={onClick}
      className={`btn-${variant}`}
      {...props}
    >
      {children}
    </button>
  )
}

// Usage: <Button variant="save" data-testid="save-user-button">Save</Button>
```

### **Form Input Component**

```jsx
export const Input = ({ name, label, error, ...props }) => {
  return (
    <div data-testid={`${name}-input-group`}>
      <label data-testid={`${name}-label`}>{label}</label>
      <input data-testid={`${name}-input`} name={name} {...props} />
      {error && (
        <span data-testid={`${name}-error`} className="error">
          {error}
        </span>
      )}
    </div>
  )
}
```

### **Loading States**

```jsx
const UserList = ({ users, loading, error }) => {
  if (loading) return <div data-testid="users-loading">Loading users...</div>
  if (error) return <div data-testid="users-error">{error}</div>
  if (!users.length) return <div data-testid="users-empty">No users found</div>

  return (
    <div data-testid="users-list">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
```

## 🧪 **Testing Integration**

Once you add these attributes, your tests will work with:

- **✅ Jest Unit Tests**: `getByTestId('login-button')`
- **✅ React Testing Library**: `screen.getByTestId('login-button')`
- **✅ Playwright Tests**: `page.locator('[data-testid=login-button]')`

## 🚀 **Implementation Order**

1. **Start with Auth**: Login, Signup, Verify pages (highest priority for E2E tests)
2. **Dashboard Layout**: Navigation and user info display
3. **Main Dashboard**: Statistics and overview
4. **Individual Pages**: Users, Chores, Assignments
5. **Error States**: Error messages and loading states

## 📋 **Checklist**

- [ ] Login page attributes
- [ ] Signup page attributes
- [ ] Verify page attributes
- [ ] Dashboard layout navigation
- [ ] User welcome/info display
- [ ] Statistics cards
- [ ] Users page
- [ ] Chores page
- [ ] Assignments page
- [ ] Error messages
- [ ] Loading states
- [ ] Mobile navigation
- [ ] Action buttons

This comprehensive guide ensures your components are fully testable with any testing framework!
