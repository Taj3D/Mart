# Task 3-a — Warehouses UI Builder

## Task
Build `/home/z/my-project/src/components/ims/warehouses-module.tsx` — a complete Warehouses (Godowns) management UI.

## What was done
1. Read worklog.md, investment-heads-module.tsx (pattern reference), warehouses API routes, and Prisma schema
2. Created `/src/components/ims/warehouses-module.tsx` with full WarehousesModule component following the investment-heads pattern exactly
3. Updated `/src/components/layout/app-sidebar.tsx` — added 'warehouses' to NavItem type, added Godowns sub-item under Basic Modules
4. Updated `/src/app/page.tsx` — imported WarehousesModule, added breadcrumb, added renderSection case
5. Ran lint: 0 errors, only pre-existing warnings

## Key decisions
- API returns array directly (not `{data, pagination}`) — useAllData hook handles this
- Sheet header uses `bg-slate-900 dark:bg-slate-800` per spec
- Warehouse icon from lucide-react used for module header and sidebar sub-item
- Type badges: General=slate, Cold Storage=sky, Hazardous=rose
- PDF uses navy header [25,42,86] per spec
- Sidebar label "Godowns" with Warehouse icon (matching target site terminology)

## Files modified
- `/src/components/ims/warehouses-module.tsx` (NEW)
- `/src/components/layout/app-sidebar.tsx` (added 'warehouses' NavItem + sub-item)
- `/src/app/page.tsx` (added import + breadcrumb + renderSection)
- `/home/z/my-project/worklog.md` (appended work log)
