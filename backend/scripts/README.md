# Backend Scripts

Database management scripts for local development and production.

## 🌱 Development Seeds

### Quick Start (Recommended)

```bash
npm run db:seed
```

**What it does:**

- Clears your local database
- Creates the Fry family with 5 users (Josh, Lori, Jackson, Jett, Elsie)
- Creates 21 household chores
- Ready to test immediately!

**Use this when:**

- Starting fresh local development
- After pulling changes that affect the database
- Need to reset to a known state for testing

---

## 🗄️ Database Management

### Clear Database

```bash
npm run db:clear
```

Deletes all data from the database (tables remain intact).

### Export Database

**From Production (Render Shell):**

```bash
npm run db:export > data-export.json
cat data-export.json  # Copy the JSON
```

**From Local:**

```bash
npm run db:export > data-export.json
```

### Import Database

```bash
npm run db:import data-export.json
```

Imports data from a JSON export file. Automatically handles ID mapping for foreign keys.

---

## 📋 Command Reference

| Command                    | Description                     |
| -------------------------- | ------------------------------- |
| `npm run db:seed`          | Quick seed with Fry family data |
| `npm run db:clear`         | Delete all data                 |
| `npm run db:export`        | Export database to JSON         |
| `npm run db:import <file>` | Import database from JSON       |
| `npm run db:push`          | Sync Prisma schema to database  |

---

## 🔄 Common Workflows

### Reset Local Database

```bash
npm run db:seed
```

### Copy Production to Local

1. **On Render.com Shell:**

   ```bash
   npm run db:export > data-export.json
   cat data-export.json  # Copy output
   ```

2. **On your Mac:**
   ```bash
   cd backend
   # Paste JSON into data-export.json file
   npm run db:import data-export.json
   ```

### Fresh Database Schema

```bash
rm prisma/database.sqlite
npm run db:push
npm run db:seed
```

---

## ⚠️ Production Usage

**On Render.com Shell:**

```bash
# Clear production database (DANGEROUS!)
npm run db:clear

# Export production data
npm run db:export > backup.json
cat backup.json  # Save this somewhere safe!
```

---

## 📝 Notes

- All scripts use plain JavaScript (not TypeScript) for production compatibility
- ID mapping is automatic during imports
- Magic tokens and WebAuthn credentials are imported when available
- Seed script creates users with `lastLogin: new Date()` for immediate login
