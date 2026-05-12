# Task: Create 3 jQuery UI Widget Replacement Components

## Task ID: jui-widget-replacement

## Summary
Created 3 React/TypeScript component files that replace jQuery UI 1.12.1 widgets, all placed in `/home/z/my-project/src/lib/ims-jquery-ui/`.

## Files Created

### 1. ims-selectmenu.tsx
Replaces jQuery UI selectmenu widget using shadcn/ui Select component as base.

**Exports:**
- `ImsJuiSelectMenu` - Main select menu component (controlled/uncontrolled, custom width, appendTo, position, renderValue)
- `ImsJuiSelectMenuOption` - Individual option (icon support, disabled, data payload, navy-600 focus/selected)
- `ImsJuiSelectMenuGroup` - Option group / optgroup (label, disabled)
- `ImsJuiSelectMenuSeparator` - Visual separator
- `ImsJuiSelectMenuData` - Convenience component for data-driven rendering (options/groups arrays)
- `ImsJuiSelectMenuContext` - Context for advanced usage

**Theme:** Trigger uses --navy-600 border, focused state has --navy-500 ring. Selected item uses --navy-600 background with white text.

**Events:** onCreate, onChange, onOpen, onClose, onFocus, onSelect

### 2. ims-button.tsx
Replaces jQuery UI button.js, checkboxradio.js, and controlgroup.js using shadcn/ui Button, Checkbox, RadioGroup as base.

**Exports:**
- `ImsJuiButton` - Button with icon support (primary/secondary), icon positions, variants (primary/secondary/outline/ghost/danger/success), sizes
- `ImsJuiCheckboxRadio` - Checkbox/radio with labels, custom icons, disabled state
- `ImsJuiCheckboxRadioGroup` - Radio group container (horizontal/vertical)
- `ImsJuiControlGroup` - Control group container (horizontal/vertical, shared disabled/size)
- `ImsJuiControlGroupItem` - Individual button in control group (active state, connected borders)
- `ImsJuiControlGroupLabel` - Section label
- `ImsJuiControlGroupSeparator` - Visual separator
- `ImsJuiControlGroupContext` - Context for advanced usage

**Theme:** Primary buttons use --navy-600 background. Checkbox/Radio use --navy-600 when checked.

### 3. effects.ts
Replaces jQuery UI effects core + all 15 effect animations.

**Effect Functions (15):**
- effectBlind, effectBounce, effectClip, effectDrop, effectExplode
- effectFade, effectFold, effectHighlight, effectPuff, effectPulsate
- effectScale, effectShake, effectSize, effectSlide, effectTransfer

**Core Utilities:**
- `animateEffect(element, effectName, options, duration, callback)` - Main animation function
- `showEffect(element, effectName, options, duration, callback)` - Show with effect
- `hideEffect(element, effectName, options, duration, callback)` - Hide with effect
- `toggleClassEffect(element, className, effectName, options, duration)` - Toggle class with effect

**React Hooks:**
- `useJuiEffect()` - Hook providing animate/show/hide/toggleClass/highlight/shake/bounce/pulsate/cancelAll
- `useEffectAnimation(ref, effectName, options)` - Hook for triggering effects on ref elements

**CSS Animation Classes:**
- `CSS_CLASSES` constant object with class names for all effects

**Theme:** All highlight effects use Deep Navy Blue (#1e3a5f / --navy-600) instead of jQuery UI's yellow.

## Verification
- ✅ TypeScript compilation: 0 errors in new files
- ✅ ESLint: 0 errors, 0 warnings in new files
- ✅ All imports from ./types correctly reference existing type definitions
- ✅ All shadcn/ui components properly imported from @/components/ui/
