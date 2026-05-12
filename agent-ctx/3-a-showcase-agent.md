# Task 3-a: Pickers and Selects Showcase Components

## Summary
Created two showcase component files that demonstrate the Pickers and Selects modules in the ERP system with Deep Navy Blue theme.

## Files Created

### 1. `/src/components/showcase/pickers-showcase.tsx`
- **DatePicker**: Basic with value, min/max date restrictions, disabled state (3 demos)
- **DateTimePicker**: 24h format, 12h AM/PM format, with seconds (3 demos)
- **TimePicker**: Basic 24h, 12h AM/PM, quick select (interval=15), with seconds (4 demos)
- **IMSDateTimePicker**: Inline mode, popover mode, min/max+disabled dates+disabled weekends, side-by-side, time restrictions (stepping+disabledHours), view modes (years/calendarWeeks), 12h AM/PM (7 demos)

### 2. `/src/components/showcase/selects-showcase.tsx`
- **SearchableSelect**: Grouped products with custom icons, grouped categories, size variants (3 demos)
- **MultiSelect**: Product selection with tag removal, category selection with maxCount=2, size variants (3 demos)
- **AsyncSelect**: Simulated API customer search (800ms delay), configuration stats (2 demos)
- **ClassicSelect**: Status with gradient arrow, warehouse selection, size variants (3 demos)
- **Comparison table**: Quick reference for all 4 select components

## Key Decisions
- All props verified against actual source code before usage
- TimePicker uses string values ("HH:mm") not Date objects
- IMSDateTimePicker auto-detects 12/24h from format string (presence of "a" token)
- SelectOption type imported from searchable-select and reused by ClassicSelect
- All state management uses React.useState with proper TypeScript types
- ERP sample data includes products, categories, customers, statuses, warehouses

## No Issues Found
All components compile cleanly. Lint passes with only the known TanStack Table warning.
