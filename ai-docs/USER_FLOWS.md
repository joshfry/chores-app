# User Flows Guide

**Family Chores Management Application**

This guide explains all user flows in the Family Chores Management application for developers unfamiliar with the codebase.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Flows](#authentication-flows)
3. [Dashboard Navigation](#dashboard-navigation)
4. [User Management Flow](#user-management-flow)
5. [Chores Management Flow](#chores-management-flow)
6. [Assignments Management Flow](#assignments-management-flow)
7. [Role-Based Features](#role-based-features)
8. [Technical Architecture](#technical-architecture)

---

## Overview

### Application Purpose

The Family Chores Management app helps families organize and track household chores. Parents can create chores, assign them to children, and track completion. Children can view their assignments and mark them as complete.

### User Roles

- **Parent**: Full administrative access - can create chores, manage users, create/delete assignments
- **Child**: Limited access - can view assignments and mark their own assignments complete

---

## Authentication Flows

The application uses **passwordless authentication** via magic links sent to email.

### 1. New User Signup Flow

**Route**: `/signup`  
**Component**: `SignupPage.tsx`

#### Steps:

1. User visits `/signup`
2. User fills out signup form:
   - Email address (required)
   - Name (required)
   - Family name (required)
   - Birthdate (optional)
3. User submits form
4. Backend creates:
   - A new family account
   - A parent user account
   - A magic link token
5. Magic link is sent to the user's email
6. Success message displayed: "🎉 Family account created! Check your email for a magic link to get started."
7. User is redirected to `/login` after 1.2 seconds

#### Form Validation:

- Email must contain `@` and `.`
- Name and family name must not be empty
- Submit button is disabled until validation passes

#### Backend Flow:

```
POST /api/auth/signup
Request: { email, name, familyName, birthdate? }
Response: { success: true, message: "Magic link sent" }
```

---

### 2. Returning User Login Flow

**Route**: `/login`  
**Component**: `LoginPage.tsx`

#### Steps:

1. User visits `/login`
2. User enters email address
3. User submits form
4. Backend:
   - Validates user exists
   - Generates magic link token
   - Sends magic link to email
5. Success message displayed: "📧 Magic link sent! Check your email and click the link to sign in."
6. User remains on login page (can navigate away)

#### Form Validation:

- Email must contain `@` and `.`
- Submit button disabled until validation passes

#### Backend Flow:

```
POST /api/auth/send-magic-link
Request: { email }
Response: { success: true, message: "Magic link sent" }
```

---

### 3. Magic Link Verification Flow

**Route**: `/verify?token=<magic-link-token>`  
**Component**: `VerifyPage.tsx`

#### Steps:

1. User clicks magic link from their email
2. Browser opens `/verify?token=abc123`
3. Component extracts token from URL query parameter
4. Automatic verification begins (no user interaction needed)
5. Backend validates token and creates session
6. Component shows verification status:
   - **Verifying**: Shows spinner and "Verifying Your Account"
   - **Success**: Shows checkmark and "Verification Successful!"
   - **Error**: Shows X and error message
7. On success:
   - Session token stored in localStorage
   - User authenticated in AuthContext
   - Automatic redirect to `/dashboard` after 2 seconds
   - Manual "Go to Dashboard" button also available
8. On error:
   - "Back to Login" button shown

#### Backend Flow:

```
POST /api/auth/verify-magic-token
Request: { token }
Response: {
  success: true,
  data: {
    sessionToken,
    user: { id, email, name, role, ... },
    family: { id, name, ... }
  }
}
```

#### Important Technical Details:

- Uses `useRef` to prevent duplicate verification calls
- Verification happens automatically in `useEffect`
- Session token stored via `api.setSessionToken()`
- AuthContext updated with user and family data

---

### 4. Session Persistence

**Component**: `AuthContext.tsx` (runs on app load)

#### Steps:

1. App loads, `AuthProvider` mounts
2. `useEffect` checks for existing session token in localStorage
3. If token exists:
   - Calls `GET /api/auth/me` to validate token
   - If valid: restores user/family data to state
   - If invalid: clears token and logs user out
4. If no token: user remains unauthenticated
5. Sets `isLoading: false` when check completes

#### States:

- `isLoading: true` - Initial state, checking authentication
- `isAuthenticated: true` - Valid session found
- `isAuthenticated: false` - No valid session

---

### 5. Logout Flow

**Triggered From**: Dashboard layout sidebar  
**Component**: `DashboardLayout.tsx`

#### Steps:

1. User clicks "Sign Out" button
2. `AuthContext.logout()` called
3. Backend session invalidated: `POST /api/auth/logout`
4. Session token removed from localStorage
5. AuthContext state cleared (user, family set to null)
6. User redirected to `/login`

---

## Dashboard Navigation

### Protected Routes

**All dashboard routes require authentication.**

**Component**: `ProtectedRoute.tsx`

#### How It Works:

```
Route: /dashboard/*
```

- `ProtectedRoute` component checks `AuthContext.isAuthenticated`
- If `false`: redirects to `/login`
- If `true`: renders requested page

---

### Main Dashboard Layout

**Route**: `/dashboard`  
**Components**: `DashboardLayout.tsx` + `DashboardPage.tsx`

#### Layout Structure:

```
┌──────────────────────────────────────────────┐
│  Sidebar                │  Main Content      │
│  ────────               │  ──────────────    │
│  🏠 Family Chores       │  [Page Title]      │
│                         │                    │
│  📊 Dashboard           │  [Page Content]    │
│  👥 Users               │                    │
│  ✅ Chores              │                    │
│  📋 Assignments         │                    │
│                         │                    │
│  [User Info]            │                    │
│  Sign Out               │                    │
└──────────────────────────────────────────────┘
```

#### Navigation Items:

1. **Dashboard** (`/dashboard`) - Overview and statistics
2. **Users** (`/users`) - Family member management
3. **Chores** (`/chores`) - Chore library
4. **Assignments** (`/assignments`) - Active assignments

#### Sidebar Features:

- **Toggle**: Collapse/expand sidebar (desktop)
- **Mobile**: Hamburger menu with overlay
- **User Section**: Shows current user name, role, and logout button
- **Family Name**: Displayed in top header

---

### Dashboard Home Page

**Route**: `/dashboard`  
**Component**: `DashboardPage.tsx`

#### Page Sections:

##### 1. Welcome Card

```
Welcome back, [User Name]! 👋
Here's what's happening with [Family Name] today.
```

##### 2. Statistics Grid

Displays 7 key metrics:

- **Family Members**: Total active users
- **Children**: Count of child accounts
- **Total Chores**: Number of chores in library
- **Total Assignments**: All assignments
- **Completed**: Completed assignments
- **Pending**: Pending assignments
- **Total Points**: Points earned by all children

##### 3. Weekly Stats (if available)

- Assignments completed this week
- Points earned this week

##### 4. Top Performers Leaderboard

Shows children with most points earned this week

##### 5. Family Members Preview

- Shows first 3 active users
- Displays: name, role, total points
- "Manage Users" link to full users page

##### 6. Recent Assignments Preview

- Shows last 5 assignments
- Displays: chore title, assigned child, due date, status
- "View All" link to assignments page

#### Data Loading:

```javascript
// Fetches on component mount:
;-GET / api / users -
  GET / api / chores -
  GET / api / assignments -
  GET / api / dashboard / stats
```

#### States:

- **Loading**: Shows "Loading dashboard..." card
- **Error**: Shows error message with retry button
- **Loaded**: Shows all dashboard content

---

## User Management Flow

**Route**: `/users`  
**Component**: `UsersPage.tsx`  
**Permission**: All authenticated users can view; parents can add/edit/remove

### Page Layout

#### Header:

- Title: "Family Members"
- "Add Child Account" button (parents only)

#### User Table Columns:

1. **User**: Avatar + name + email
2. **Role**: Badge (parent/child)
3. **Points**: Total points earned
4. **Last Active**: Last login date
5. **Status**: Active/Inactive badge
6. **Actions**: Edit and Remove buttons (parents only)

### User Flow: Adding a Child

#### Steps:

1. Parent clicks "Add Child Account" button
2. **(Currently console.log - not implemented yet)**
3. **Expected**: Modal/form to create child account
4. Backend creates child user
5. Table refreshes to show new child

### User Flow: Editing a User

#### Steps:

1. Parent clicks "Edit" button on user row
2. **(Currently console.log - not implemented yet)**
3. **Expected**: Modal/form with user details
4. Parent updates name, birthdate, etc.
5. Backend updates user
6. Table refreshes

### User Flow: Removing a User

#### Steps:

1. Parent clicks "Remove" button (not shown for self)
2. **(Currently console.log - not implemented yet)**
3. **Expected**: Confirmation dialog
4. Backend soft-deletes or deactivates user
5. Table refreshes

### Empty State

When no users exist:

```
👥
No family members found
Start by adding child accounts to manage chores together.
[Add Your First Child]
```

### Data Flow:

```javascript
// On mount:
GET /api/users
Response: [{ id, name, email, role, totalPoints, lastLogin, isActive, ... }]
```

---

## Chores Management Flow

**Route**: `/chores`  
**Component**: `ChoresPage.tsx`  
**Permission**: All users can view; parents can create/edit/delete/assign

### Page Layout

#### Header:

- Title: "Chores"
- "Create New Chore" button (parents only)

#### Chore Cards (Grid Layout):

Each chore displays:

- **Title**: Chore name
- **Description**: What needs to be done
- **Points**: ⭐ point value
- **Difficulty Badge**: easy/medium/hard
- **Type Badge**: Recurring or One-time
- **Recurrence Pattern**: daily/weekly/monthly (if recurring)

#### Parent Actions (shown on each card):

- **Assign** button: Create assignment for this chore
- **Edit** button: Modify chore details
- **Delete** button: Remove chore

### Chore Flow: Creating a Chore

#### Steps:

1. Parent clicks "Create New Chore" button
2. **(Currently console.log - not implemented yet)**
3. **Expected**: Modal/form with fields:
   - Title (required)
   - Description (required)
   - Difficulty (easy/medium/hard)
   - Points value (number)
   - Is Recurring? (checkbox)
   - Recurrence Pattern (if recurring)
4. Parent submits form
5. Backend creates chore
6. Grid refreshes to show new chore

### Chore Flow: Assigning a Chore

#### Steps:

1. Parent clicks "Assign" button on chore card
2. **(Currently console.log - not implemented yet)**
3. **Expected**: Modal to select:
   - Which child
   - Assigned date (default: today)
   - Due date
   - Initial status (default: pending)
4. Parent submits
5. Backend creates assignment
6. User can navigate to Assignments to see it

### Chore Flow: Editing a Chore

#### Steps:

1. Parent clicks "Edit" button
2. **(Currently console.log - not implemented yet)**
3. **Expected**: Pre-filled form with chore details
4. Parent makes changes
5. Backend updates chore
6. Grid refreshes

### Chore Flow: Deleting a Chore

#### Steps:

1. Parent clicks "Delete" button
2. **(Currently console.log - not implemented yet)**
3. **Expected**: Confirmation dialog
4. Backend deletes chore
5. Grid refreshes

### Empty State

When no chores exist:

```
✅
No chores created yet
Create your first chore to start managing family tasks.
[Create Your First Chore]
```

### Data Flow:

```javascript
// On mount:
GET / api / chores
Response: [
  {
    id,
    title,
    description,
    difficulty,
    points,
    isRecurring,
    recurrencePattern,
  },
]
```

---

## Assignments Management Flow

**Route**: `/assignments`  
**Component**: `AssignmentsPage.tsx`  
**Permission**: All users can view their assignments; parents can manage all

### Page Layout

#### Header:

- Title: "Assignments"
- **Filters**:
  - Status filter: All/Pending/In Progress/Completed
  - Child filter: All Children/[Specific Child]
- "Create Assignment" button (parents only)

#### Assignment Table Columns:

1. **Chore**: Chore title + points display
2. **Assigned To**: Avatar + child name
3. **Assigned Date**: When assignment was created
4. **Due Date**: When assignment is due
5. **Status**: Badge (pending/in_progress/completed/overdue)
6. **Actions**: Context-specific buttons

### Assignment Flow: Creating an Assignment

#### Steps:

1. Parent clicks "Create Assignment" button
2. **(Currently console.log - not implemented yet)**
3. **Expected**: Modal/form with:
   - Select chore (dropdown)
   - Select child (dropdown)
   - Assigned date (date picker, default: today)
   - Due date (date picker)
   - Initial status (default: pending)
4. Parent submits
5. Backend creates assignment
6. Table refreshes

### Assignment Flow: Child Marks Complete

#### Steps (Child User Only):

1. Child sees their assignments in table
2. "Complete" button shown only for:
   - Assignments where `childId === currentUser.id`
   - Assignments where `status !== 'completed'`
3. Child clicks "Complete" button
4. **(Currently console.log - not implemented yet)**
5. **Expected**: Backend updates assignment:
   - `status = 'completed'`
   - `completedDate = now`
   - User `totalPoints` increased by chore points
6. Table refreshes
7. Dashboard stats update

### Assignment Flow: Parent Marks Done

#### Steps (Parent User Only):

1. Parent can mark any incomplete assignment done
2. Parent clicks "Mark Done" button
3. **(Currently console.log - not implemented yet)**
4. **Expected**: Same as child complete, but parent-initiated
5. Table refreshes

### Assignment Flow: Deleting an Assignment

#### Steps (Parent Only):

1. Parent clicks "Delete" button on assignment
2. **(Currently console.log - not implemented yet)**
3. **Expected**: Confirmation dialog
4. Backend deletes assignment
5. Table refreshes

### Filtering Logic

#### Status Filter:

- **All**: Shows all assignments
- **Pending**: Only `status === 'pending'`
- **In Progress**: Only `status === 'in_progress'`
- **Completed**: Only `status === 'completed'`

#### Child Filter:

- **All Children**: Shows all assignments
- **Specific Child**: Only assignments for that `childId`

### Overdue Detection

Assignments are marked overdue automatically:

```javascript
if (status !== 'completed' && new Date(dueDate) < new Date()) {
  displayStatus = 'overdue'
}
```

### Empty State

When no assignments match filters:

```
📋
No assignments found
No assignments match your current filters.
```

When no assignments exist at all:

```
📋
No assignments found
Start by creating assignments to track chore completion.
[Create Your First Assignment]
```

### Data Flow:

```javascript
// On mount - parallel requests:
GET / api / assignments
GET / api / chores // To lookup chore details
GET / api / users // To lookup child details

// Assignment structure:
{
  ;(id, childId, choreId, assignedDate, dueDate, status, completedDate)
}
```

---

## Role-Based Features

### Parent Role Capabilities

**Full Administrative Access**:

- ✅ Create/edit/delete chores
- ✅ Add/edit/remove family members
- ✅ Create/delete assignments
- ✅ Mark any assignment complete
- ✅ View all data

**UI Elements Shown**:

- "Add Child Account" button (Users page)
- "Create New Chore" button (Chores page)
- "Assign" / "Edit" / "Delete" buttons on chores
- "Create Assignment" button (Assignments page)
- "Mark Done" / "Delete" buttons on assignments
- "Edit" / "Remove" buttons on users

### Child Role Capabilities

**Limited Access**:

- ✅ View dashboard statistics
- ✅ View all chores (read-only)
- ✅ View all users (read-only)
- ✅ View assignments (filtered to see all, but only act on own)
- ✅ Mark their own assignments complete
- ❌ Cannot create/edit/delete anything
- ❌ Cannot manage other users
- ❌ Cannot assign chores

**UI Elements Shown**:

- Dashboard (read-only overview)
- "Complete" button (only on their own incomplete assignments)

### Permission Checks

All permission checks happen in two places:

#### 1. Frontend (UI Display)

```typescript
{
  state.user?.role === 'parent' && <Button>Admin Action</Button>
}
```

#### 2. Backend (API Authorization)

```typescript
// Middleware checks user role
if (user.role !== 'parent') {
  return res.status(403).json({
    success: false,
    error: 'Forbidden',
  })
}
```

---

## Technical Architecture

### Frontend Stack

- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: Styled Components (empty templates, CSS added separately)
- **State**: React Context API (`AuthContext`)
- **API Client**: Axios wrapper (`services/api.ts`)

### Authentication State Management

**Location**: `contexts/AuthContext.tsx`

#### Global State:

```typescript
interface AuthState {
  isLoading: boolean // Initial auth check
  isAuthenticated: boolean // User logged in?
  user: User | null // Current user data
  family: Family | null // Current family data
  error: string | null // Auth error messages
}
```

#### Actions:

- `login(email)` - Send magic link
- `signup(email, name, familyName, birthdate?)` - Create account
- `verifyMagicToken(token)` - Validate magic link
- `logout()` - End session
- `updateCurrentUser(updates)` - Modify user profile
- `clearError()` - Clear error message
- `refreshUser()` - Reload user data

### API Service Layer

**Location**: `services/api.ts`

#### Session Management:

```typescript
// Store session token
api.setSessionToken(token)

// Get current token
api.getSessionToken()

// Check if authenticated
api.isAuthenticated()

// Clear session
api.clearSession()
```

#### API Methods:

All methods return: `{ success: boolean, data?: any, error?: string }`

**Auth Endpoints**:

- `sendMagicLink({ email })`
- `signup({ email, name, familyName, birthdate? })`
- `verifyMagicToken(token)`
- `getCurrentUser()`
- `logout()`

**User Endpoints**:

- `getUsers()`
- `updateUser(id, updates)`

**Chore Endpoints**:

- `getChores()`

**Assignment Endpoints**:

- `getAssignments()`

**Dashboard Endpoints**:

- `getDashboardStats()`

### Backend API

**Base URL**: `http://localhost:3001`  
**Content-Type**: All requests require `application/json`

#### API Response Format:

```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: "Error message"
}
```

### Routing Architecture

**Public Routes** (no authentication required):

- `/login` - Login page
- `/signup` - Signup page
- `/verify` - Magic link verification

**Protected Routes** (authentication required):

- `/dashboard` - Dashboard home
- `/users` - User management
- `/chores` - Chore library
- `/assignments` - Assignment tracking

**Redirects**:

- `/` → `/dashboard`
- `/*` (404) → `/dashboard`

### Data Models

#### User

```typescript
{
  id: number
  email: string
  name: string
  role: 'parent' | 'child'
  familyId: number
  birthdate?: string
  totalPoints: number
  lastLogin?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### Family

```typescript
{
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
}
```

#### Chore

```typescript
{
  id: number
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  isRecurring: boolean
  recurrencePattern?: 'daily' | 'weekly' | 'monthly'
  familyId: number
  createdAt: Date
  updatedAt: Date
}
```

#### Assignment

```typescript
{
  id: number
  childId: number
  choreId: number
  assignedDate: string
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  completedDate?: string
  createdAt: Date
  updatedAt: Date
}
```

---

## Common User Journeys

### First-Time Parent Setup

1. Visit `/signup`
2. Fill out form (email, name, family name)
3. Submit → Magic link sent
4. Check email
5. Click magic link → `/verify?token=...`
6. Automatic verification
7. Redirect to `/dashboard`
8. See empty dashboard with 0 stats
9. Navigate to "Users" → Add first child
10. Navigate to "Chores" → Create first chore
11. Navigate to "Assignments" → Assign chore to child

### Child Daily Flow

1. Parent sends child their login email
2. Child enters email at `/login`
3. Child checks email, clicks magic link
4. Verification redirects to `/dashboard`
5. Child sees their stats and recent assignments
6. Child navigates to "Assignments"
7. Child filters to see only their assignments
8. Child marks completed chores as done
9. Child sees points increase on dashboard

### Parent Daily Management

1. Login via magic link
2. Dashboard shows overview
3. Check "Top Performers" leaderboard
4. Navigate to "Assignments"
5. Review pending/overdue assignments
6. Mark completed chores as done (if child forgot)
7. Navigate to "Chores"
8. Create new weekly chores
9. Click "Assign" on chores
10. Select child and due date
11. Return to dashboard to see updated stats

---

## Error States & Edge Cases

### No Network Connection

- API calls fail
- Error message shown: "Failed to load [resource]"
- Retry button provided

### Session Expired

- API returns 401
- User automatically logged out
- Redirected to `/login`
- Must verify with new magic link

### Invalid Magic Link Token

- Verification fails
- Error shown: "Verification failed. Please request a new magic link."
- "Back to Login" button shown

### No Data States

#### Empty Users:

- Message: "No family members found"
- Action: "Add Your First Child"

#### Empty Chores:

- Message: "No chores created yet"
- Action: "Create Your First Chore"

#### Empty Assignments:

- Message: "No assignments found"
- Action: "Create Your First Assignment"

### Permission Denied

- Child tries to access parent-only action
- Backend returns 403
- Error message shown

---

## Future Enhancements

**Currently Logged but Not Implemented**:

1. **User Management**:
   - Add child account form
   - Edit user details
   - Remove user confirmation

2. **Chore Management**:
   - Create chore form
   - Edit chore form
   - Delete chore confirmation
   - Assign chore modal

3. **Assignment Management**:
   - Create assignment form
   - Mark complete confirmation
   - Delete assignment confirmation

4. **Additional Features**:
   - Profile page
   - Settings page
   - Notifications
   - Reward system
   - Chore scheduling
   - Parent approval workflow

---

## Testing the Application

### Manual Testing Checklist

#### Authentication:

- [ ] Signup creates family and sends magic link
- [ ] Login sends magic link to existing user
- [ ] Magic link verification authenticates user
- [ ] Invalid token shows error
- [ ] Session persists on page refresh
- [ ] Logout clears session

#### Dashboard:

- [ ] Shows welcome message with user name
- [ ] Displays all 7 statistics correctly
- [ ] Family members preview shows first 3
- [ ] Recent assignments show last 5
- [ ] "Manage Users" link navigates correctly
- [ ] "View All" link navigates correctly

#### Users:

- [ ] Table shows all users
- [ ] Parent sees admin buttons
- [ ] Child sees read-only view
- [ ] Empty state shows for new families

#### Chores:

- [ ] Grid displays all chores
- [ ] Point values shown correctly
- [ ] Badges show difficulty and type
- [ ] Parent sees action buttons
- [ ] Empty state shows for new libraries

#### Assignments:

- [ ] Table shows all assignments
- [ ] Status filter works
- [ ] Child filter works
- [ ] Child sees only their complete buttons
- [ ] Parent sees all admin buttons
- [ ] Overdue status calculated correctly

---

## Conclusion

This guide covers all major user flows in the Family Chores Management application. The app follows a passwordless authentication pattern with role-based access control to enable families to collaboratively manage household chores.

For technical implementation details, see:

- `ENTERPRISE_STANDARDS.md` - Code quality standards
- `TESTING_GUIDE.md` - Testing requirements
- `DATA_ATTRIBUTES_GUIDE.md` - Testing attributes
- `E2E_WORKFLOW.md` - End-to-end testing

---

_Last Updated: September 30, 2025_  
_Version: 1.0_
