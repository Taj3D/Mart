/**
 * IMS Sidebar Navigation Module
 *
 * Complete conversion of File 32 jQuery script to React hooks and components.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * ORIGINAL JQUERY → REACT HOOKS MAPPING
 * ═══════════════════════════════════════════════════════════════════════
 *
 * jQuery Code                                → React Equivalent
 * ───────────────────────────────────────────┼─────────────────────────────────────
 * $('#sidebarCollapse').on('click', ...)      → nav.toggleCollapsed()
 * $('#sidebar').toggleClass('active')         → nav.state.isCollapsed
 * $('a').find('i.fa-angle-right')             → nav.getAngleClass(id)
 *   .toggleClass('fa-rotate-90')              → returns 'rotate-90' | 'rotate-0'
 * openNav(id)                                 → nav.toggleSubmenu(id)
 * localStorage.setItem("sidebar", id)         → auto-persisted by toggleSubmenu
 * ColorNav(id)                                → nav.setActiveNavItem(id)
 * localStorage.setItem("colorsidebar", id)    → auto-persisted by setActiveNavItem
 * localStorage.getItem("sidebar")             → nav.state.openSubmenuId
 * localStorage.getItem("colorsidebar")        → nav.state.activeNavItemId
 * $(id + '~ ul').attr('class', '...in')       → nav.isSubmenuOpen(id)
 * $(id).find('i').toggleClass('fa-rotate-90') → nav.getAngleClass(id)
 * $('#' + colorMenueId).css('color','#cddc39')→ nav.getHighlightStyle(id)
 * $('#sidebar').addClass('active')            → default: isCollapsed = true
 *
 * ═══════════════════════════════════════════════════════════════════════
 * MIGRATION GUIDE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * BEFORE (jQuery + localStorage):
 * ```javascript
 * // Toggle sidebar collapse
 * $('#sidebarCollapse').on('click', function () {
 *     $('#sidebar').toggleClass('active');
 * });
 *
 * // Open sub-menu and save state
 * $('a.dropdown-toggle').on('click', function () {
 *     var id = $(this).attr('id');
 *     openNav(id);
 *     $(this).find('i.fa-angle-right').toggleClass('fa-rotate-90');
 * });
 *
 * // Highlight active item
 * $('a').not('.dropdown-toggle').on('click', function () {
 *     var id = $(this).attr('id');
 *     ColorNav(id);
 * });
 *
 * // Restore on page load
 * var ID = localStorage.getItem("sidebar");
 * if (ID != undefined) {
 *     $(id + '~ ul').attr('class', 'list-unstyled in');
 *     $(id).find('i.fa-angle-right').toggleClass('fa-rotate-90');
 * } else {
 *     $('#sidebar').addClass('active');
 * }
 * var colorMenueId = localStorage.getItem("colorsidebar");
 * if (colorMenueId != undefined) {
 *     $('#' + colorMenueId).css('color', '#cddc39');
 * }
 * ```
 *
 * AFTER (React + Hooks):
 * ```tsx
 * import { SidebarNavProvider, useSidebarNavContext, SidebarNavItem, SidebarCollapseButton } from '@/lib/ims-sidebar-nav'
 *
 * function App() {
 *   return (
 *     <SidebarNavProvider>
 *       <Sidebar />
 *     </SidebarNavProvider>
 *   )
 * }
 *
 * function Sidebar() {
 *   const nav = useSidebarNavContext()
 *   return (
 *     <aside className={nav.state.isCollapsed ? 'w-20' : 'w-64'}>
 *       <SidebarCollapseButton />
 *       <SidebarNavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
 *       <SidebarNavItem id="products" icon={Package} label="Products" hasSubmenu>
 *         <SidebarNavItem id="product-list" label="All Products" />
 *         <SidebarNavItem id="product-add" label="Add New" />
 *       </SidebarNavItem>
 *     </aside>
 *   )
 * }
 * ```
 *
 * OR using the hook directly without the provider:
 * ```tsx
 * import { useSidebarNav } from '@/lib/ims-sidebar-nav'
 *
 * function Sidebar() {
 *   const nav = useSidebarNav()
 *   return (
 *     <aside className={nav.state.isCollapsed ? 'w-20' : 'w-64'}>
 *       <button onClick={nav.toggleCollapsed}>Toggle</button>
 *       <button
 *         onClick={() => nav.toggleSubmenu('products')}
 *         style={nav.getHighlightStyle('products')}
 *       >
 *         Products
 *         <ChevronRight className={`${nav.getAngleClass('products')} transition-transform`} />
 *       </button>
 *       {nav.isSubmenuOpen('products') && <SubMenu />}
 *     </aside>
 *   )
 * }
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type {
  NavItemState,
  SidebarNavState,
  NavHighlightConfig,
  AngleRotationConfig,
  SidebarCollapseConfig,
  SidebarNavProviderProps,
  UseSidebarNavReturn,
} from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export {
  LS_KEY_SIDEBAR_STATE,
  LS_KEY_ACTIVE_NAV,
  LS_KEY_SIDEBAR_COLLAPSED,
  DEFAULT_SIDEBAR_NAV_STATE,
  DEFAULT_NAV_HIGHLIGHT,
  NAVY_NAV_HIGHLIGHT,
  DEFAULT_ANGLE_ROTATION,
  DEFAULT_COLLAPSE_CONFIG,
} from './types'

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export {
  useSidebarNav,
  useSidebarCollapse,
  useNavPersistence,
  useAngleRotation,
} from './sidebar-nav-hooks'

// ---------------------------------------------------------------------------
// Provider & Components
// ---------------------------------------------------------------------------
export {
  SidebarNavProvider,
  useSidebarNavContext,
  useSidebarNavContextSafe,
  SidebarNavItem,
  SidebarCollapseButton,
} from './sidebar-nav-provider'
