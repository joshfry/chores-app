/*
  Warnings:

  - You are about to drop the column `assigned_date` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `chore_id` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `completed_date` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `due_date` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `recurrence_pattern` on the `chores` table. All the data in the column will be lost.
  - Added the required column `start_date` to the `assignments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "assignment_chores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assignment_id" INTEGER NOT NULL,
    "chore_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "completed_on" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "assignment_chores_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "assignment_chores_chore_id_fkey" FOREIGN KEY ("chore_id") REFERENCES "chores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_assignments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "child_id" INTEGER NOT NULL,
    "start_date" TEXT NOT NULL,
    "end_date" TEXT,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "notes" TEXT,
    "family_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "assignments_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "assignments_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_assignments" ("child_id", "created_at", "family_id", "id", "notes", "status", "updated_at") SELECT "child_id", "created_at", "family_id", "id", "notes", "status", "updated_at" FROM "assignments";
DROP TABLE "assignments";
ALTER TABLE "new_assignments" RENAME TO "assignments";
CREATE TABLE "new_chores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'easy',
    "category" TEXT,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence_days" TEXT,
    "family_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "chores_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_chores" ("category", "created_at", "description", "difficulty", "family_id", "id", "is_recurring", "title", "updated_at") SELECT "category", "created_at", "description", "difficulty", "family_id", "id", "is_recurring", "title", "updated_at" FROM "chores";
DROP TABLE "chores";
ALTER TABLE "new_chores" RENAME TO "chores";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "assignment_chores_assignment_id_chore_id_key" ON "assignment_chores"("assignment_id", "chore_id");
