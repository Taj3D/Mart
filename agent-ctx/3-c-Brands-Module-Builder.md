# Task 3-c: Brands Module Builder

## Task
Build Brands IMS Module with Company linkage, full CRUD API, and Triple Utilities

## Work Completed

### 1. Rewrote `/api/brands/route.ts`
- GET: List brands with `notDeleted()` filter, includes `company` relation (name, code), `_count` for products, supports `?all=true` and `?search=` for name/code/company search
- POST: Create brand with auto-code (BRD-00001) inside `$transaction`, includes `companyId`, audit logging
- PUT: Update brand with `$transaction`, code read-only, includes `companyId`, audit logging
- DELETE: Soft-delete with product count check, audit logging

### 2. Created `/api/brands/[id]/route.ts`
- GET: Single brand by ID with company relation
- PUT: Update with transaction, audit log, code read-only
- DELETE: Soft-delete with audit log and product count check

### 3. Created `/src/components/ims/brands-module.tsx`
- Full CRUD data grid with: Sl, Code, Name, Company/Manufacturer, Products Count, Status, Actions (Eye | Edit | Delete)
- Search with 400ms debounce across name/code/company
- Show Inactive toggle with row count indicator (filtered/total)
- Create/Edit Sheet with Company searchable select dropdown
- View Detail Dialog with company name, product count
- Delete AlertDialog with product count check
- Triple Utility Bundle: Import CSV, Export CSV, Export PDF
- Deep Navy Blue theme, responsive design

### 4. Updated `/src/app/page.tsx`
- Replaced BrandSection with BrandsModule
- Removed BrandSection import from @/components/erp

## Lint: 0 errors, only pre-existing warnings
