# Task 7a: Add ERP Design System Styles to globals.css

## Summary
Added comprehensive ERP design system CSS styles to `/home/z/my-project/src/app/globals.css`, converting Bootstrap 3 Bootswatch patterns to Deep Navy Blue theme.

## Changes Made

### 1. ERP Semantic Color Variables (added to `:root` and `.dark`)
- `--erp-primary` / `--erp-primary-hover` - Deep Navy Blue for primary actions
- `--erp-success` / `--erp-success-hover` - Emerald green (#18bc9c)
- `--erp-info` / `--erp-info-hover` - Amber (#f9b31f)
- `--erp-warning` / `--erp-warning-hover` - Orange (#f39c12)
- `--erp-danger` / `--erp-danger-hover` - Red (#e74c3c)
- `--erp-breadcrumb-bg`, `--erp-breadcrumb-text`, `--erp-modal-header`
- `--erp-panel-border`, `--erp-table-border`, `--erp-form-border`, `--erp-form-focus`, `--erp-form-focus-shadow`

### 2. ERP Typography Styles (14 new CSS rules)
- `.ims-heading-1` through `.ims-heading-6`
- `.ims-text-muted`, `.ims-text-primary`, `.ims-text-success`, `.ims-text-info`, `.ims-text-warning`, `.ims-text-danger`
- `.ims-hr`

### 3. ERP Form Styles (replacing Bootstrap .form-control, .has-success, .has-warning, .has-error)
- `.ims-form-control:focus` - Navy Blue focus ring
- `.ims-has-success`, `.ims-has-warning`, `.ims-has-error` - Validation states
- `.ims-help-block` - Help text

### 4. ERP Panel/Card Styles (replacing Bootstrap .panel)
- `.ims-panel`, `.ims-panel-heading`, `.ims-panel-body`, `.ims-panel-footer`
- Variants: default, primary, success, info, warning, danger

### 5. ERP Breadcrumb Styles (replacing Bootstrap .breadcrumb)
- `.ims-breadcrumb`, `.ims-breadcrumb-item` - Arrow (→) separator

### 6. ERP Modal/Dialog Styles (replacing Bootstrap .modal-header)
- `.ims-modal-header`, `.ims-modal-close`, `.ims-modal-title`, `.ims-modal-body`, `.ims-modal-footer`

### 7. ERP Navbar Styles
- `.ims-navbar`, `.ims-navbar-brand`, `.ims-navbar-nav`

### 8. ERP Table Extensions
- `.ims-table-striped`, `.ims-table-bordered`, `.ims-table-hover`

### 9. ERP Pagination Styles
- `.ims-pagination` with Navy Blue buttons

### 10. ERP Label Styles (replacing Bootstrap .label)
- `.ims-label` with default, primary, success, info, warning, danger variants

### 11. ERP Dropdown Menu Styles
- `.ims-dropdown-menu` with Navy Blue hover/active

### 12. ERP Alert Styles (replacing Bootstrap .alert)
- `.ims-alert-success`, `.ims-alert-info`, `.ims-alert-warning`, `.ims-alert-danger`

### 13. ERP Progress Bar Variants
- `.ims-progress-success`, `.ims-progress-info`, `.ims-progress-warning`, `.ims-progress-danger`

### 14. ERP Well/Callout Styles
- `.ims-well` with Navy Blue tinted background

## Lint Result
- 0 errors, 1 warning (pre-existing TanStack Table `useReactTable()` incompatible library warning)
