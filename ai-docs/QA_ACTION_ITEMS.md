# 🎯 QA Action Items - Priority Order

**Last Updated:** September 30, 2025  
**Status:** 3 Critical | 1 High | 1 Low

---

## 🔴 CRITICAL PRIORITY

### 1. Add Frontend Test Coverage (Required for Enterprise Standard)

**Current:** 11 frontend tests  
**Target:** 40+ frontend tests  
**Estimated Time:** 4-6 hours

#### Tests to Create:

**Shared Components (2 files)**

- [ ] `frontend/src/components/__tests__/Modal.test.tsx`
  - [ ] Test modal open/close
  - [ ] Test click-outside-to-close
  - [ ] Test escape key handling
  - [ ] Test footer rendering

- [ ] `frontend/src/components/__tests__/ConfirmDialog.test.tsx`
  - [ ] Test confirm action
  - [ ] Test cancel action
  - [ ] Test custom button text
  - [ ] Test message rendering

**Users Page Tests (3 files)**

- [ ] `frontend/src/pages/users/__tests__/UsersPage.test.tsx`
  - [ ] Test user list rendering
  - [ ] Test loading state
  - [ ] Test error state
  - [ ] Test empty state
  - [ ] Test create user flow
  - [ ] Test edit user flow
  - [ ] Test delete user flow
  - [ ] Test role-based access (parent vs child)

- [ ] `frontend/src/pages/users/__tests__/CreateUserModal.test.tsx`
  - [ ] Test form submission
  - [ ] Test form validation
  - [ ] Test required fields
  - [ ] Test form reset on success
  - [ ] Test error handling

- [ ] `frontend/src/pages/users/__tests__/EditUserModal.test.tsx`
  - [ ] Test form pre-population
  - [ ] Test form submission
  - [ ] Test form validation
  - [ ] Test error handling

**Chores Page Tests (3 files)**

- [ ] `frontend/src/pages/chores/__tests__/ChoresPage.test.tsx`
  - [ ] Test chore grid rendering
  - [ ] Test loading state
  - [ ] Test error state
  - [ ] Test empty state
  - [ ] Test create chore flow
  - [ ] Test edit chore flow
  - [ ] Test delete chore flow
  - [ ] Test role-based access

- [ ] `frontend/src/pages/chores/__tests__/CreateChoreModal.test.tsx`
  - [ ] Test form submission
  - [ ] Test recurring checkbox behavior
  - [ ] Test conditional recurrence pattern field
  - [ ] Test form validation
  - [ ] Test error handling

- [ ] `frontend/src/pages/chores/__tests__/EditChoreModal.test.tsx`
  - [ ] Test form pre-population
  - [ ] Test recurring checkbox updates
  - [ ] Test form submission
  - [ ] Test error handling

**Assignments Page Tests (2 files)**

- [ ] `frontend/src/pages/assignments/__tests__/AssignmentsPage.test.tsx`
  - [ ] Test assignment table rendering
  - [ ] Test status filter
  - [ ] Test child filter
  - [ ] Test overdue detection logic ⚠️ (complex logic)
  - [ ] Test mark complete (child)
  - [ ] Test mark done (parent)
  - [ ] Test delete assignment
  - [ ] Test loading state
  - [ ] Test error state
  - [ ] Test empty state

- [ ] `frontend/src/pages/assignments/__tests__/CreateAssignmentModal.test.tsx`
  - [ ] Test form with populated dropdowns
  - [ ] Test form with empty dropdowns
  - [ ] Test form validation (all 3 required fields)
  - [ ] Test form submission
  - [ ] Test error handling

**Minimum Test Count:** 10 test files × 4 tests/file = **40 tests minimum**

---

## 🟡 HIGH PRIORITY

### 2. Replace All `any` Types (Enterprise Standard Violation)

**Current:** 20 instances of `any` type  
**Target:** 0 instances  
**Estimated Time:** 1-2 hours

#### Step 1: Create Error Utility

Create `frontend/src/utils/error.ts`:

```typescript
export type ApiError = {
  message: string
  response?: {
    data?: {
      error?: string
    }
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (isApiError(error)) {
    return error.response?.data?.error || error.message || 'Unknown error'
  }
  return 'An unexpected error occurred'
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'message' in error
}
```

#### Step 2: Replace in Files (13 files)

- [ ] `frontend/src/pages/users/UsersPage.tsx` (2 instances)

  ```typescript
  // ❌ BEFORE
  } catch (err: any) {
    setError(err.response?.data?.error || err.message || 'Failed to load users')
  }

  // ✅ AFTER
  } catch (err) {
    setError(getErrorMessage(err))
  }
  ```

- [ ] `frontend/src/pages/users/CreateUserModal.tsx` (1 instance)
- [ ] `frontend/src/pages/users/EditUserModal.tsx` (1 instance)
- [ ] `frontend/src/pages/chores/ChoresPage.tsx` (1 instance)
- [ ] `frontend/src/pages/chores/CreateChoreModal.tsx` (1 instance)
- [ ] `frontend/src/pages/chores/EditChoreModal.tsx` (1 instance)
- [ ] `frontend/src/pages/assignments/AssignmentsPage.tsx` (2 instances)
- [ ] `frontend/src/pages/assignments/CreateAssignmentModal.tsx` (1 instance)
- [ ] `frontend/src/pages/dashboard/DashboardPage.tsx` (check instances)
- [ ] `frontend/src/pages/auth/VerifyPage.tsx` (check instances)
- [ ] `frontend/src/contexts/AuthContext.tsx` (check instances)
- [ ] `frontend/src/services/api.ts` (check instances - may need custom types)
- [ ] `frontend/src/types/api.ts` (check if `ApiResponse<T = any>` needs fixing)

---

## 🟢 LOW PRIORITY

### 3. Fix UI Bug in ChoresPage

**File:** `frontend/src/pages/chores/ChoresPage.tsx`  
**Lines:** 198-201  
**Issue:** Points displayed twice in header  
**Estimated Time:** 5 minutes

#### Fix:

Remove duplicate `PointsDisplay` component:

```typescript
// ❌ BEFORE (lines 178-202)
<ChoreHeader>
  <div>
    <ChoreTitle data-testid="chore-title">
      {chore.title}
    </ChoreTitle>
    <ChoreStats>
      <PointsDisplay data-testid="chore-points">
        <span className="icon">⭐</span>
        {chore.points} points
      </PointsDisplay>
      <span>•</span>
      <Badge variant={chore.difficulty}>{chore.difficulty}</Badge>
      <span>•</span>
      <Badge variant={chore.isRecurring ? 'recurring' : 'one-time'}>
        {chore.isRecurring ? 'Recurring' : 'One-time'}
      </Badge>
    </ChoreStats>
  </div>
  <PointsDisplay data-testid="chore-points">  {/* ← DUPLICATE */}
    <span className="icon">⭐</span>
    <span>{chore.points}</span>
  </PointsDisplay>
</ChoreHeader>

// ✅ AFTER (remove lines 198-201)
<ChoreHeader>
  <div>
    <ChoreTitle data-testid="chore-title">
      {chore.title}
    </ChoreTitle>
    <ChoreStats>
      <PointsDisplay data-testid="chore-points">
        <span className="icon">⭐</span>
        {chore.points} points
      </PointsDisplay>
      <span>•</span>
      <Badge variant={chore.difficulty}>{chore.difficulty}</Badge>
      <span>•</span>
      <Badge variant={chore.isRecurring ? 'recurring' : 'one-time'}>
        {chore.isRecurring ? 'Recurring' : 'One-time'}
      </Badge>
    </ChoreStats>
  </div>
</ChoreHeader>
```

**Verification:** Check UI to ensure points display correctly.

---

## 📋 Completion Checklist

### Required for Enterprise Standard

- [ ] **40+ frontend tests added** (Critical)
- [ ] **All tests passing** (Critical)
- [ ] **Zero `any` types** (High)
- [ ] **UI bug fixed** (Low)

### Verification Commands

```bash
# Run all tests
pnpm test:all

# Check test count
pnpm --filter frontend test -- --watchAll=false --passWithNoTests --verbose

# Build production
pnpm --filter frontend build

# Check for `any` types
grep -r "any" frontend/src --include="*.tsx" --include="*.ts" | grep -v node_modules

# Lint check
pnpm --filter frontend lint
```

### Success Criteria

- ✅ Backend: 56 tests passing
- ✅ Frontend: 40+ tests passing (currently 11)
- ✅ Total: 96+ tests
- ✅ Zero `any` types (currently 20)
- ✅ Zero linting errors
- ✅ Production build successful
- ✅ No UI bugs

---

## 🎯 Priority Order

**Day 1: Fix Critical Issues**

1. Create error utility (30 min)
2. Replace all `any` types (1-2 hours)
3. Fix ChoresPage bug (5 min)
4. Run verification (10 min)

**Day 2-3: Add Test Coverage**

1. Shared components tests (2 hours)
2. Users page tests (4 hours)
3. Chores page tests (4 hours)
4. Assignments page tests (4 hours)

**Total Estimated Time:** 1-2 days of focused work

---

## ✅ When Complete

Run final verification:

```bash
# All tests
pnpm test:all

# No `any` types
! grep -r ": any" frontend/src --include="*.tsx" --include="*.ts" | grep -v node_modules

# Production build
pnpm --filter frontend build

# Lint
pnpm --filter frontend lint
```

**Expected Output:**

- ✅ Backend: 56/56 tests passing
- ✅ Frontend: 40+/40+ tests passing
- ✅ Zero `any` types found
- ✅ Build successful
- ✅ No linting errors

**Then update:** `QA_REPORT.md` status to **✅ PASS - Enterprise Ready**

---

**Questions?** See `QA_REPORT.md` for detailed analysis.
