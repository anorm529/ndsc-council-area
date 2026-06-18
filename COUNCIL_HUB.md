# NDSC Council Hub – Developer Guide

## Overview

The NDSC Council Hub is a governance platform for North Down Softball Club's council and committee. It lives at `council.northdownsoftballclub.co.uk` and is built with:

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Prisma 7** with `@prisma/adapter-pg` (driver-adapter for Neon Postgres)
- **Neon Postgres** (serverless Postgres)
- **Zod** (form validation utilities, available for future use)

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string (pooled endpoint) |

Both `.env` (for Prisma CLI) and `.env.local` (for Next.js dev server) must contain `DATABASE_URL`.

---

## Getting Started

```bash
npm install

# Push schema to database (dev)
npx prisma db push

# Generate Prisma client
npx prisma generate

# Run dev server
npm run dev
```

---

## Running Migrations

This project uses Prisma's schema-push approach for development. For production, switch to `prisma migrate`:

```bash
# Development – push schema directly
npx prisma db push

# Production – use migrations
npx prisma migrate deploy

# Generate new migration after schema changes
npx prisma migrate dev --name <migration-name>
```

---

## Seed Data

Populate the database with sample data for development:

```bash
npx tsx prisma/seed.ts
```

This creates:
- 6 council members (chair, secretary, treasurer, welfare officer, two captains)
- 1 upcoming meeting
- 4 actions
- 2 decisions
- 3 finance items
- 4 equipment items
- 1 membership snapshot
- 1 grant
- 2 documents

---

## Tables Created

All tables are prefixed with `council_` to avoid conflicts with other databases.

| Table | Purpose |
|---|---|
| `council_members` | Council membership linked to central auth |
| `council_permissions` | Fine-grained permission overrides per member |
| `council_meetings` | All meeting types (council, AGM, EGM, etc.) |
| `council_meeting_attendees` | Meeting attendance records |
| `council_actions` | Action tracker with priority/status/due dates |
| `council_decisions` | Permanent decision log with vote counts |
| `council_officer_reports` | Pre/post-meeting officer updates |
| `council_finance_items` | Lightweight income/expense tracking |
| `council_membership_snapshots` | Point-in-time membership counts |
| `council_team_reports` | Captain reports per team |
| `council_welfare_cases` | Confidential welfare/conduct log |
| `council_equipment` | Equipment register with condition tracking |
| `council_events` | Event planning with task lists |
| `council_event_tasks` | Tasks linked to events |
| `council_grants` | Grant applications with deadline tracking |
| `council_sponsorships` | Sponsor tracking with renewal alerts |
| `council_communications` | Media/comms planning board |
| `council_documents` | Policy register with review dates |
| `council_audit_log` | Action audit trail |
| `council_settings` | Configurable hub settings (key/value store) |

---

## Routes Added

```
/council                   → redirects to /council/dashboard
/council/dashboard         → Dashboard with stats and quick links
/council/meetings          → Meeting list
/council/meetings/new      → Create meeting
/council/meetings/[id]     → Meeting detail (agenda, minutes, actions, decisions)
/council/meetings/[id]/edit → Edit meeting
/council/actions           → Action tracker
/council/actions/new       → Create action
/council/decisions         → Decision log
/council/decisions/new     → Log decision
/council/reports           → Officer reports list
/council/reports/new       → Create officer report
/council/reports/[id]      → Report detail
/council/finance           → Finance overview (permission-gated)
/council/finance/new       → Add finance item
/council/membership        → Membership snapshots
/council/membership/new    → Record snapshot
/council/teams             → Team reports list
/council/teams/new         → Create team report
/council/welfare           → Welfare log (permission-gated)
/council/welfare/new       → New welfare case
/council/welfare/[id]      → Case detail
/council/equipment         → Equipment register
/council/equipment/new     → Add equipment
/council/events            → Events list
/council/events/new        → Create event
/council/events/[id]       → Event detail with task tracker
/council/grants            → Grants tracker
/council/grants/new        → Add grant
/council/sponsorship       → Sponsorship tracker
/council/sponsorship/new   → Add sponsor
/council/communications    → Communications planner
/council/communications/new → Plan communication
/council/documents         → Documents register
/council/documents/new     → Add document
/council/settings          → Settings + council member management
```

---

## Auth Integration

### Current state (mock)

`src/lib/auth.ts` exports `getCurrentUser()` which returns a hardcoded admin user. This lets the hub function without a login system.

### Connecting the central login

When the centralised auth system is ready:

1. **Replace `getCurrentUser()`** in `src/lib/auth.ts` with a real session lookup:

```typescript
import { getServerSession } from 'next-auth' // or your auth library
import { authOptions } from '@/lib/auth-options'

export async function getCurrentUser(): Promise<CouncilUser | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return getCouncilMemberByExternalUserId(session.user.id)
}
```

2. **Link users** by setting `council_members.external_user_id` to match the central login's user ID.

3. **`getCouncilMemberByExternalUserId(externalUserId)`** is already implemented — it queries `council_members` by `external_user_id` and resolves permissions.

### Central login fields expected

The centralised login will provide:

| Field | How it maps |
|---|---|
| `userId` | → `council_members.external_user_id` |
| `email` | → `council_members.email` |
| `name` | → `council_members.name` |
| `role` | → `council_members.role` |
| `linkedPlayerId` | → `council_members.player_id` |

---

## Permissions

Permissions are resolved in `src/lib/permissions.ts`:

1. Explicit `council_permissions` records for the member (from the DB)
2. Role-based defaults (hardcoded map by role name)
3. `owner` and `chair` roles bypass all checks

### Available permission keys

```
meetings:view / meetings:edit
actions:view / actions:edit
decisions:view / decisions:edit
finance:view / finance:edit
welfare:view / welfare:edit
documents:view / documents:edit
equipment:view / equipment:edit
communications:view / communications:edit
settings:manage
```

### Sensitive sections

- **Welfare** (`/council/welfare`) — requires `welfare:view` permission. Denied with an access warning if not permitted.
- **Finance** (`/council/finance`) — requires `finance:view` permission.

---

## Component Structure

```
src/
  app/council/           # All council routes
  components/council/
    layout/
      Sidebar.tsx        # Desktop sidebar (client component for active state)
      MobileNav.tsx      # Mobile slide-out nav
    ui/
      StatusBadge.tsx    # Coloured status labels
      PriorityBadge.tsx  # Priority indicators
      EmptyState.tsx     # Empty state with optional CTA
      PageHeader.tsx     # Page title + action button
      StatsCard.tsx      # Dashboard metric card
      FormField.tsx      # FormField, SelectField, TextareaField, SubmitButton
  lib/
    auth.ts              # getCurrentUser, requireCouncilAccess, helpers
    permissions.ts       # hasCouncilPermission, role defaults
    utils.ts             # formatDate, formatCurrency, isOverdue, isDueWithin
    prisma.ts            # Prisma client singleton
    actions/             # Server actions per section
      meetings.ts
      council-actions.ts
      decisions.ts
      reports.ts
      finance.ts
      membership.ts
      teams.ts
      welfare.ts
      equipment.ts
      events.ts
      grants.ts          # also contains createSponsorship
      communications.ts  # also contains createDocument
      settings.ts
```

---

## Future Improvements

1. **Real auth** — Connect `getCurrentUser()` to the centralised login system
2. **Audit logging** — Wire `CouncilAuditLog` into all mutating server actions
3. **Council settings** — UI to manage `council_settings` key/value store
4. **Attendance management** — Form to add/update meeting attendees
5. **Decision follow-up linking** — UI to link decisions to follow-up actions
6. **Email notifications** — Alert owners when actions are assigned or overdue
7. **File uploads** — Replace `document_url` text field with direct upload to S3/Cloudflare R2
8. **Pagination** — Add pagination to large table views
9. **Search** — Global search across actions, decisions, and meetings
10. **Finance reports** — Monthly/yearly finance summary exports
11. **Mobile push** — Push notifications for overdue actions
12. **AGM mode** — Special view for preparing AGM documentation
