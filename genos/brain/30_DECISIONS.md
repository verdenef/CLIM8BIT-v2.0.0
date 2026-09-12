# Decisions

Authoritative decision log. AI records entries; humans approve intent-affecting decisions.
See `AGENTS.md` → Ownership.

Record a decision when intent, architecture, or constraints change in a way future agents cannot infer from runtime environment or source code.

**ID format:** `DEC-001`, `DEC-002`, …  
**Status:** `proposed` | `accepted` | `superseded` | `rejected`

Do not duplicate implementation details. Link to systems or runtime paths when useful.
Keep the Index in sync with entries below. Do not leave blank placeholder rows.

---

## Index

| ID | Status | Date | Title |
|----|--------|------|-------|
| DEC-001 | accepted | 2026-09-13 | Database Migration to Firebase |

---

## Template

```markdown
### DEC-XXX: Title
- **Status:** proposed
- **Date:** YYYY-MM-DD
- **Reason:**
- **Impact:**
- **Supersedes:** none
```

---

## Decisions

<!-- Entries go below. Newest first preferred. -->

### DEC-001: Database Migration to Firebase
- **Status:** accepted
- **Date:** 2026-09-13
- **Reason:** Existing FreeDB MySQL instance expired (30-day limit). Need a reliable, persistent database to make the project accessible for the IT112 Activity Kanban lab submission.
- **Impact:** We will swap out the Laravel Eloquent usage for a NoSQL Firebase implementation (using `kreait/firebase-php`).
- **Supersedes:** none
