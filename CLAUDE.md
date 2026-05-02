# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev                            # Next.js 16 dev server
npm run build                          # prisma generate && prisma migrate deploy && next build
npm run lint                           # ESLint (flat config, next/core-web-vitals + TS)
npm run test                           # Vitest, run-once
npm run test:watch                     # Vitest, watch mode
npm run db:reset                       # prisma migrate reset --force (DESTRUCTIVE)
npx prisma generate                    # Regenerate client to lib/generated/prisma
npx prisma migrate dev --name <name>   # Create and apply a migration during development
npx prisma migrate deploy              # Apply pending migrations to the target DB (used by build)
```

Run a single test file: `npx vitest run lib/__tests__/revenue-calculator.test.ts`.
Run a single test by name: `npx vitest run -t "FX advantage"`.

## Architecture

**OonkoO Talent** is an internal staffing app for OonkoO Software Agency. It tracks Bangladeshi developers placed at North American clients, manages billing/pay rates, generates invoices (Company, Agent, Owner Report), and computes a four-layer revenue model (gross margin → agent split → role-revised saving → FX advantage).

### Tech Stack

- **Next.js 16.2.1** App Router (RSC, server actions) + **React 19**
- **Kinde Auth** (`@kinde-oss/kinde-auth-nextjs`) — single-owner gating
- **Prisma 6** on **Prisma Postgres** — client output to `lib/generated/prisma`
- **shadcn/ui** + **Tailwind CSS v4** (oklch tokens in `app/globals.css`)
- **@json-render/react-pdf** for PDF invoices; **jspdf** + **jspdf-autotable** also present
- **UploadThing** for employee document uploads
- **Vitest** for unit tests (currently scoped to pure utilities)

Path alias: `@/*` → project root (`tsconfig.json`, `components.json`).

### Auth model — owner-only, two layers

This app has exactly one allowed user, configured via the `OWNER_EMAIL` env var and enforced in `lib/auth.ts`. Auth is layered:

1. **Edge** — `proxy.ts` at the project root (Next.js 16 renamed `middleware.ts` → `proxy.ts`). It checks for any Kinde session cookie and redirects unauthenticated requests to `/api/auth/login`. The matcher excludes `api/auth`, `_next/*`, and static files.
2. **Server** — `requireOwner()` from `lib/auth.ts` is awaited in `app/dashboard/layout.tsx` and any server action that needs protection. It rejects authenticated-but-wrong-email users by logging them out.

If you add a new top-level route group outside `dashboard/`, you still get edge protection from `proxy.ts`, but you must call `requireOwner()` yourself for the email check.

### Prisma + serialization

- Schema at `prisma/schema.prisma` defines 8 models: `Company`, `Agent`, `EmployeeRole`, `RateConfig`, `Employee`, `EmployeeDocument`, `InvoiceBatch`, `InvoiceLineItem`. Money fields are `Decimal`, dates use `@db.Date`.
- Use the singleton client from `lib/db.ts` (`import { db } from "@/lib/db"`). Don't instantiate `PrismaClient` directly — dev hot-reload will leak connections.
- **Always pipe Prisma results through `serialize()` from `lib/serialize.ts` before returning from a server action to a client component.** Prisma `Decimal` objects are not JSON-serializable across the RSC boundary. The helper recurses and converts `.toNumber()`-able objects to numbers. Search the `actions.ts` files for examples.
- Generated client lives at `lib/generated/prisma/` and is **gitignored** — regenerated automatically by the `postinstall` script (and pre-build via `prisma generate && next build`). Re-run `npx prisma generate` manually after schema edits during dev to refresh local types.
- `prisma.config.ts` uses the classic engine and loads `.env` via dotenv.

### Server actions convention

Each dashboard entity has `app/dashboard/<entity>/actions.ts` with `"use server"`. The pattern is:

- `getX()` / `getX(id)` — list and detail queries, always returning `serialize(...)` output.
- Export the inferred type next to the query: `export type CompanyFull = Awaited<ReturnType<typeof getCompany>>;`. Pages and forms import the type from the actions file.
- `upsertX(parentId, data)` — create when `data.id` is absent, update when present. Used for agents, rate configs, etc.
- Mutations call `revalidatePath` themselves; pages don't refetch manually.

### Revenue model — pure function, fully tested

`lib/revenue-calculator.ts` exports `calculateRevenue(employees, config)`. It is a **pure function with zero database access** — all inputs are passed in. The four layers (per architecture doc §3-7):

1. Gross profit = Σ(billRate × hours) − Σ(payRate × hours)
2. Agent share = grossProfit × agentSplitPct (0 when company has no active agent)
3. Role-revised saving = Σ((payRate × hours × agreedRate − actualSalaryBdt) / agreedRate) — pocket between billing-equivalent BDT and the developer's real BDT salary
4. FX advantage = Σ(actualSalaryBdt / agreedRate − actualSalaryBdt / sendingRate) — gain when the market rate beats the rate quoted to the client

`ownerTotalCad = ownerBaseShareCad + roleRevisedSavingCad + fxAdvantageCad`, with the last two each gated by their own `*Enabled` toggle on the invoice batch. Tests in `lib/__tests__/revenue-calculator.test.ts` lock in the canonical "Flow" sample (28 employees, agreed=88, sending=89) — if you change the formulas, the test deltas must be intentional and re-derived from the architecture doc.

### Pay rate guard

`lib/pay-rate-guard.ts` exports `validatePayRate(newRate, maxRate)`. **Call it before any write that sets `Employee.payRateCad` or `RateConfig.defaultPayRateCad`.** The maximum lives on `RateConfig.maxPayRateCad` per (company, role). The guard throws a user-facing error with the exact rates so server actions can surface it via the standard error path.

### PDF invoices

`lib/pdf-templates.ts` builds `@json-render/core` `Spec` documents — **not** raw `@react-pdf/renderer` JSX. Two builders:

- `buildCompanyInvoiceSpec` — supports `scope` of `all` / `by_role` / `individual`, which controls table columns and grouping. Company invoice never shows pay rates or profit.
- `buildAgentInvoiceSpec` — single breakdown table ending in `agentShareCad`. Never shows employee names or pay rates.

The Owner Report is a **server-rendered HTML view** under `app/dashboard/invoices/[id]/report/`, not a PDF. It is the only document that exposes role-revised and FX figures.

### App layout

- `app/dashboard/layout.tsx` sets up `SidebarProvider` (with cookie-persisted `sidebar_state`), `BreadcrumbProvider`, and `requireOwner()`. All dashboard pages assume these wrappers.
- `lib/nav.ts` is the source of truth for sidebar entries and `isNavActive()` matching.
- `components/breadcrumb-context.tsx` lets pages set the header breadcrumbs from a server component via context, instead of computing them from the pathname.

### Fonts

Three fonts loaded in the root layout: **Figtree** (`--font-sans`, primary), **Geist** (`--font-geist-sans`), **Geist Mono** (`--font-geist-mono`).

### Architecture doc

Before working on invoice or revenue features, read `documents/oonkoo_talent_architecture_final.md` §3-7 (Exchange Rate Model, Pay Rate Model, Revenue Calculator interfaces, Invoice document visibility rules). The doc is the spec — the code mirrors it.
