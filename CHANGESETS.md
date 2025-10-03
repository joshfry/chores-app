# Changesets Guide

This project uses [Changesets](https://github.com/changesets/changesets) for version management and changelog generation in our monorepo.

## What are Changesets?

Changesets is a tool that helps manage versions and changelogs with a focus on monorepos. It allows you to:

- Track changes across multiple packages (backend & frontend)
- Generate automatic changelogs
- Coordinate version bumps
- Ensure proper semantic versioning

## Quick Start

### 1. Making Changes

When you make a change to the codebase:

```bash
pnpm changeset:add
```

This will:

1. Ask which packages changed (backend, frontend, or both)
2. Ask what type of change it was (patch, minor, major)
3. Ask for a summary of the changes
4. Create a changeset file in `.changeset/`

### 2. Version Bumping

When you're ready to release a new version:

```bash
pnpm version
```

This will:

1. Read all pending changesets
2. Update package.json versions accordingly
3. Generate/update CHANGELOG.md files
4. Delete consumed changeset files

### 3. Publishing (Optional)

If you want to publish to npm:

```bash
pnpm release
```

This will:

1. Build both packages
2. Publish to npm (if configured)

## Semantic Versioning

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (1.0.0 → 1.0.1): Bug fixes, minor changes
- **Minor** (1.0.0 → 1.1.0): New features, backwards compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes

## Common Workflows

### Workflow 1: Feature Development

```bash
# 1. Make your changes to code
git checkout -b feature/magic-link-improvements

# 2. Add a changeset
pnpm changeset:add
# Select: frontend (minor)
# Summary: "Add auto-redirect for magic link authentication"

# 3. Commit everything (including the changeset file)
git add .
git commit -m "(DEV): Add magic link auto-redirect with changeset"
git push

# 4. Merge PR to main
```

### Workflow 2: Bug Fix

```bash
# 1. Fix the bug
git checkout -b fix/login-redirect

# 2. Add a changeset
pnpm changeset:add
# Select: backend (patch)
# Summary: "Fix login redirect loop issue"

# 3. Commit and push
git add .
git commit -m "(DEV): Fix login redirect with changeset"
git push
```

### Workflow 3: Release Day

```bash
# 1. Check what changes are pending
pnpm changeset:status

# 2. Bump versions and generate changelogs
pnpm version

# 3. Review the changes
git diff

# 4. Commit the version bumps
git add .
git commit -m "(Release): Version packages"
git push

# 5. Tag the release (optional)
git tag -a v1.1.0 -m "Release v1.1.0"
git push --tags
```

## Changeset Types

### Patch Release (Bug Fixes)

```bash
# Example: Fixing a typo, small bug fix
pnpm changeset:add
# Select: backend (patch)
# Summary: "Fix email validation regex"
```

### Minor Release (New Features)

```bash
# Example: Adding new feature
pnpm changeset:add
# Select: frontend (minor)
# Summary: "Add dark mode support"
```

### Major Release (Breaking Changes)

```bash
# Example: Changing API structure
pnpm changeset:add
# Select: backend (major)
# Summary: "BREAKING: Change authentication API response format"
```

## Available Commands

| Command                 | Description                           |
| ----------------------- | ------------------------------------- |
| `pnpm changeset`        | Alias for `changeset add`             |
| `pnpm changeset:add`    | Create a new changeset                |
| `pnpm changeset:status` | View pending changesets               |
| `pnpm version`          | Bump versions and generate changelogs |
| `pnpm release`          | Build and publish packages            |

## Project Structure

```
chores/
├── .changeset/
│   ├── config.json           # Changeset configuration
│   ├── README.md             # Changeset docs
│   └── *.md                  # Individual changeset files
├── backend/
│   ├── package.json          # Version managed by changesets
│   └── CHANGELOG.md          # Auto-generated changelog
├── frontend/
│   ├── package.json          # Version managed by changesets
│   └── CHANGELOG.md          # Auto-generated changelog
└── CHANGESETS.md             # This file
```

## Tips & Best Practices

### 1. Write Good Changeset Summaries

**Bad:**

```
"Fix bug"
"Update stuff"
```

**Good:**

```
"Fix login redirect loop when sessionToken expires"
"Add cross-tab authentication detection via storage events"
```

### 2. Create Changesets Per Pull Request

- Each PR should have at least one changeset
- Group related changes in a single changeset
- Use multiple changesets if you're changing multiple packages

### 3. Review Changesets Before Versioning

```bash
# See what's pending
pnpm changeset:status

# Read the changeset files
cat .changeset/*.md
```

### 4. Keep Changesets Small and Focused

One changeset = One logical change

### 5. Use Conventional Commit Messages

```bash
git commit -m "(DEV): Add magic link flow with changeset"
git commit -m "(Release): Version packages"
```

## Configuration

The changeset configuration is in `.changeset/config.json`:

```json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false, // Don't auto-commit
  "access": "public", // Package access
  "baseBranch": "main", // Main branch name
  "updateInternalDependencies": "patch" // Update deps as patch
}
```

## Troubleshooting

### "No changesets present"

You forgot to add a changeset! Run:

```bash
pnpm changeset:add
```

### "Version bump seems wrong"

Check your changeset type:

- Bug fix? → **patch**
- New feature? → **minor**
- Breaking change? → **major**

### "I want to skip a changeset"

Sometimes you don't need a version bump (docs, tests, etc):

```bash
# Just commit without a changeset
git commit -m "(DEV): Update README (no version bump needed)"
```

## Example Changeset File

When you run `pnpm changeset:add`, it creates a file like:

```markdown
---
'@chores/frontend': minor
---

Add auto-redirect for magic link authentication

- Implement cross-tab communication via storage events
- Add single-tab experience for magic link flow
- Remove success screen for seamless UX
```

## Integration with CI/CD

You can automate version bumps and releases:

```yaml
# Example GitHub Action
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm changeset:status
      - run: pnpm version
      - run: git push --follow-tags
```

## Resources

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Quick Reference:**

```bash
# Add changeset
pnpm changeset:add

# Check status
pnpm changeset:status

# Bump versions
pnpm version

# Publish
pnpm release
```
