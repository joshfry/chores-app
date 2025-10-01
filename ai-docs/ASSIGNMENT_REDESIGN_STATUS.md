# Assignment Redesign - In Progress

## ✅ Completed:

1. **Database Schema Updated**
   - Assignment now contains multiple chores (many-to-many via AssignmentChore)
   - Added `startDate` and `endDate` to Assignment (always Sunday-Saturday)
   - Changed Chore `recurrencePattern` to `recurrenceDays` (JSON array)
   - Added `AssignmentChore` junction table with status tracking
   - Added `ChoreStatus` enum (pending, completed, skipped)

2. **Frontend Types Updated**
   - Updated `Assignment` interface with new structure
   - Added `AssignmentChore` interface
   - Updated `Chore` interface with `recurrenceDays` array

3. **UI Components Created**
   - `RecurrenceDaysSelector.tsx` - Checkbox UI for day selection

4. **Chore Modals Updated**
   - `CreateChoreModal` now uses day selector instead of dropdown
   - Updated to use `recurrenceDays` array

## 🚧 Still Need To Update:

### Frontend Components:

1. **EditChoreModal.tsx** - Update to use RecurrenceDaysSelector
2. **ChoresPage.tsx** - Update handlers to use new recurrenceDays structure
3. **AssignmentsPage.tsx** - Complete redesign to handle:
   - Assignments as collections of chores
   - Display multiple chores per assignment
   - Track individual chore completion within assignment
4. **CreateAssignmentModal.tsx** - Redesign to:
   - Select multiple chores
   - Set startDate (auto-calculate Sunday)
   - Create AssignmentChore records

### Backend Routes:

1. **routes/chores.ts** - Update to handle recurrenceDays
2. **routes/assignments.ts** - Complete rewrite to:
   - Create assignments with multiple chores
   - Return chores with assignment
   - Handle AssignmentChore status updates
3. **models/auth-prisma.ts** - Update seed data

### API Service:

1. **services/api.ts** - Update method signatures for new structure

## Next Steps:

Run this to continue: "Continue the assignment redesign implementation"
