/**
 * IMS Init - Global Initialization Provider
 *
 * React context provider that applies global IMS ERP initialization.
 * Replaces the jQuery $(function() { ... }) document-ready blocks.
 *
 * Original script's global initializations:
 * 1. Select2 theme → Already in SearchableSelect component
 * 2. Dropdown animations → DropdownMenu Framer Motion variants
 * 3. Login page body/footer classes → Route-based styling
 * 4. Order form column padding → Route-based styling
 * 5. Bootstrap table action buttons → DataTable action column
 * 6. Number input select on click → NumberSpinner component
 * 7. Label/status classes → Badge component variants
 * 8. Table text-nowrap → CSS utility class
 * 9. h4 inline-header → InlineHeader component
 * 10. Toastr progress bar → Sonner toast config
 *
 * This provider handles the remaining global concerns:
 * - Route-based CSS class injection
 * - Toast configuration
 * - Global CSS utility class application
 */

'use client';

import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from 'react';
import type { IMSInitConfig, IMSInitProviderProps } from './types';
import { getDefaultDropdownAnimation } from './dropdown-animations';
import { getDefaultRowStyleConfig, getDefaultActionButtons, getDefaultQueryParams } from './table-utils';
import { DEFAULT_STATUS_LABELS } from './label-utils';

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * Default IMS initialization configuration.
 * Matches the original script's behavior with Deep Navy Blue theme.
 */
export function getDefaultIMSConfig(): IMSInitConfig {
  return {
    select2Theme: {
      theme: 'navy',
      minimumInputLength: 0,
      allowClear: true,
      width: '100%',
    },
    dropdownAnimation: getDefaultDropdownAnimation(),
    rowStyle: getDefaultRowStyleConfig(),
    queryParams: getDefaultQueryParams(),
    actionButtons: getDefaultActionButtons(),
    routeStyles: [],
    statusLabels: DEFAULT_STATUS_LABELS,
    toast: {
      progressBar: true,    // toastr.options.progressBar = true
      position: 'top-right',
      duration: 5000,
      closeButton: true,
      preventDuplicates: true,
    },
    tableNoWrap: true,      // $(".table").addClass("text-nowrap")
    inlineHeaders: true,    // $("h4").addClass("inline-header")
  };
}

// ============================================================================
// Pathname Store (for route-based styling without usePathname)
// ============================================================================

class PathnameStore {
  private listeners = new Set<() => void>();
  private pathname: string;

  constructor() {
    this.pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): string => {
    if (typeof window !== 'undefined') {
      this.pathname = window.location.pathname;
    }
    return this.pathname;
  };

  getServerSnapshot = (): string => '/';
}

const globalPathnameStore = new PathnameStore();

// ============================================================================
// Context
// ============================================================================

const IMSInitContext = createContext<{
  config: IMSInitConfig;
} | null>(null);

IMSInitContext.displayName = 'IMSInitContext';

// ============================================================================
// Provider
// ============================================================================

/**
 * IMS Initialization Provider.
 *
 * Applies global ERP configuration and route-based styling.
 * Must wrap the application to enable IMS-specific behaviors.
 *
 * @example
 * ```tsx
 * <IMSInitProvider>
 *   <App />
 * </IMSInitProvider>
 * ```
 */
export function IMSInitProvider({
  children,
  config: customConfig,
}: IMSInitProviderProps) {
  const config = useMemo<IMSInitConfig>(() => {
    const defaults = getDefaultIMSConfig();
    if (!customConfig) return defaults;
    return {
      ...defaults,
      ...customConfig,
      select2Theme: { ...defaults.select2Theme, ...customConfig.select2Theme },
      dropdownAnimation: { ...defaults.dropdownAnimation, ...customConfig.dropdownAnimation },
      rowStyle: { ...defaults.rowStyle, ...customConfig.rowStyle },
      queryParams: { ...defaults.queryParams, ...customConfig.queryParams },
      toast: { ...defaults.toast, ...customConfig.toast },
    };
  }, [customConfig]);

  // Get current pathname
  const pathname = useSyncExternalStore(
    globalPathnameStore.subscribe,
    globalPathnameStore.getSnapshot,
    globalPathnameStore.getServerSnapshot
  );

  // Apply route-based styling
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const isLogin = pathname.toLowerCase().includes('/account/login');

    // Login page: body gets login-bg, footer gets login-footer-bg
    if (isLogin) {
      document.body.classList.add('ims-login-bg');
      const footer = document.getElementById('footer');
      if (footer) footer.classList.add('ims-login-footer-bg');
    } else {
      document.body.classList.remove('ims-login-bg');
      const footer = document.getElementById('footer');
      if (footer) footer.classList.remove('ims-login-footer-bg');

      // Non-login pages: navbar gets navbr-bg
      const navbar = document.getElementById('navbar');
      if (navbar) navbar.classList.add('ims-navbr-bg');
    }

    // Order form pages: compact column padding
    const isOrderForm = [
      '/creditsalesorder/create', '/creditsalesorder/edit',
      '/salesorder/create', '/salesorder/edit',
      '/purchaseorder/create', '/purchaseorder/edit',
      '/poreturn/create', '/transfer/create',
    ].some(route => pathname.toLowerCase().includes(route));

    if (isOrderForm) {
      document.body.classList.add('ims-order-form');
    } else {
      document.body.classList.remove('ims-order-form');
    }

    // Table text-nowrap (replaces $(".table").addClass("text-nowrap"))
    if (config.tableNoWrap) {
      document.body.classList.add('ims-table-nowrap');
    }

    // Inline headers (replaces $("h4").addClass("inline-header"))
    if (config.inlineHeaders) {
      document.body.classList.add('ims-inline-headers');
    }

    // Cleanup
    return () => {
      document.body.classList.remove('ims-login-bg', 'ims-order-form', 'ims-table-nowrap', 'ims-inline-headers');
      const footer = document.getElementById('footer');
      if (footer) footer.classList.remove('ims-login-footer-bg');
      const navbar = document.getElementById('navbar');
      if (navbar) navbar.classList.remove('ims-navbr-bg');
    };
  }, [pathname, config.tableNoWrap, config.inlineHeaders]);

  const value = useMemo(() => ({ config }), [config]);

  return (
    <IMSInitContext.Provider value={value}>
      {children}
    </IMSInitContext.Provider>
  );
}

// ============================================================================
// Context Hook
// ============================================================================

/**
 * Access the IMS initialization configuration from context.
 *
 * @example
 * ```tsx
 * const { config } = useIMSInit();
 * const statusVariant = config.statusLabels['Transfer'].variant;
 * ```
 */
export function useIMSInit(): { config: IMSInitConfig } {
  const context = useContext(IMSInitContext);
  if (!context) {
    // Return defaults if no provider
    return { config: getDefaultIMSConfig() };
  }
  return context;
}

/**
 * Get the IMS status label for a given status text.
 * Convenience hook that combines context with label lookup.
 */
export function useIMSStatusLabel(status: string) {
  const { config } = useIMSInit();
  const labels = config.statusLabels;
  const key = Object.keys(labels).find(
    (k) => k.toLowerCase() === status.toLowerCase()
  );

  if (key && labels[key]) {
    return labels[key];
  }

  return { label: status, variant: 'default' as const, cssClass: 'label label-default' };
}
