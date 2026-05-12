/**
 * IMS Init - Route-Based Styling System
 *
 * Replaces the route-based jQuery DOM manipulation from the original script:
 *
 * ```js
 * $(function () {
 *     if (window.location.pathname.toLowerCase().indexOf("/account/login") != -1) {
 *         $("body").addClass("login-bg");
 *         $("#footer").addClass("login-footer-bg");
 *     }
 *     else {
 *         $("#navbar").addClass("navbr-bg");
 *     }
 *     if (pathname.indexOf("/creditsalesorder/create") != -1 || ...) {
 *         $(".col-md-6").css("padding-left", "5px");
 *         $(".col-md-6").css("padding-right", "5px");
 *     }
 * })
 * ```
 *
 * In Next.js:
 * - Route detection is done via usePathname() hook
 * - Class injection is done via className props on components
 * - No global DOM manipulation needed
 */

'use client';

import type { RouteStyleConfig } from './types';

// ============================================================================
// Route Pattern Definitions
// ============================================================================

/**
 * Check if a pathname matches a route pattern.
 * Supports string patterns (indexOf match) and RegExp.
 *
 * Replaces the original `pathname.toLowerCase().indexOf(pattern) != -1` pattern.
 */
export function matchRoute(
  pathname: string,
  pattern: string | RegExp
): boolean {
  const lowerPath = pathname.toLowerCase();

  if (typeof pattern === 'string') {
    return lowerPath.includes(pattern.toLowerCase());
  }

  return pattern.test(lowerPath);
}

// ============================================================================
// Predefined Route Style Rules
// ============================================================================

/**
 * Default route style configurations matching the original IMS ERP routes.
 *
 * Original patterns:
 * - /account/login → body.login-bg, footer.login-footer-bg
 * - /creditsalesorder/create, /creditsalesorder/edit → col padding 5px
 * - /salesorder/create, /salesorder/edit → col padding 5px
 * - /purchaseorder/create, /purchaseorder/edit → col padding 5px
 * - /poreturn/create → col padding 5px
 * - /transfer/create → col padding 5px
 * - All other pages → navbar.navbr-bg
 */
export function getDefaultRouteStyles(): RouteStyleConfig[] {
  return [
    // Login page
    {
      pattern: '/account/login',
      bodyClasses: ['ims-login-bg'],
      footerClasses: ['ims-login-footer-bg'],
      navbarClasses: [],
    },

    // Credit Sales Order create/edit
    {
      pattern: '/creditsalesorder/create',
      elementClasses: {
        '.col-md-6': ['ims-col-compact'],
      },
    },
    {
      pattern: '/creditsalesorder/edit',
      elementClasses: {
        '.col-md-6': ['ims-col-compact'],
      },
    },

    // Sales Order create/edit
    {
      pattern: '/salesorder/create',
      elementClasses: {
        '.col-md-6': ['ims-col-compact'],
      },
    },
    {
      pattern: '/salesorder/edit',
      elementClasses: {
        '.col-md-6': ['ims-col-compact'],
      },
    },

    // Purchase Order create/edit
    {
      pattern: '/purchaseorder/create',
      elementClasses: {
        '.col-md-6': ['ims-col-compact'],
      },
    },
    {
      pattern: '/purchaseorder/edit',
      elementClasses: {
        '.col-md-6': ['ims-col-compact'],
      },
    },

    // PO Return create
    {
      pattern: '/poreturn/create',
      elementClasses: {
        '.col-md-6': ['ims-col-compact'],
      },
    },

    // Transfer create
    {
      pattern: '/transfer/create',
      elementClasses: {
        '.col-md-6': ['ims-col-compact'],
      },
    },

    // Default (all other pages) - add navbar background
    {
      pattern: /^\/(?!account\/login).*/,
      navbarClasses: ['ims-navbr-bg'],
    },
  ];
}

/**
 * Combined route style rule for order form pages.
 * These pages all share the same compact column styling.
 */
export const ORDER_FORM_ROUTES = [
  '/creditsalesorder/create',
  '/creditsalesorder/edit',
  '/salesorder/create',
  '/salesorder/edit',
  '/purchaseorder/create',
  '/purchaseorder/edit',
  '/poreturn/create',
  '/transfer/create',
] as const;

/**
 * Check if the current path is an order form page.
 */
export function isOrderFormPage(pathname: string): boolean {
  const lower = pathname.toLowerCase();
  return ORDER_FORM_ROUTES.some((route) => lower.includes(route));
}

/**
 * Check if the current path is the login page.
 */
export function isLoginPage(pathname: string): boolean {
  return pathname.toLowerCase().includes('/account/login');
}

// ============================================================================
// Computed Style Resolution
// ============================================================================

/**
 * Result of route style resolution.
 * Contains the computed CSS classes for each element.
 */
export interface RouteStyleResult {
  /** Classes for the body/main container */
  bodyClasses: string[];
  /** Classes for the navbar */
  navbarClasses: string[];
  /** Classes for the footer */
  footerClasses: string[];
  /** Whether this is the login page */
  isLoginPage: boolean;
  /** Whether this is an order form page */
  isOrderForm: boolean;
}

/**
 * Resolve route-based styles for a given pathname.
 * Replaces the original $(function() { if (pathname...) }) pattern.
 *
 * @param pathname - Current route pathname
 * @param configs - Route style configurations (defaults if not provided)
 * @returns Computed style classes for each element
 *
 * @example
 * ```tsx
 * const styles = resolveRouteStyles('/account/login');
 * // { bodyClasses: ['ims-login-bg'], navbarClasses: [], footerClasses: ['ims-login-footer-bg'], ... }
 * ```
 */
export function resolveRouteStyles(
  pathname: string,
  configs?: RouteStyleConfig[]
): RouteStyleResult {
  const rules = configs || getDefaultRouteStyles();

  const result: RouteStyleResult = {
    bodyClasses: [],
    navbarClasses: [],
    footerClasses: [],
    isLoginPage: isLoginPage(pathname),
    isOrderForm: isOrderFormPage(pathname),
  };

  for (const rule of rules) {
    if (matchRoute(pathname, rule.pattern)) {
      if (rule.bodyClasses) result.bodyClasses.push(...rule.bodyClasses);
      if (rule.navbarClasses) result.navbarClasses.push(...rule.navbarClasses);
      if (rule.footerClasses) result.footerClasses.push(...rule.footerClasses);
    }
  }

  return result;
}

/**
 * Get CSS class string for the body element.
 * Convenience function for the most common use case.
 */
export function getBodyClasses(pathname: string): string {
  const styles = resolveRouteStyles(pathname);
  return styles.bodyClasses.join(' ');
}

/**
 * Get CSS class string for the navbar element.
 */
export function getNavbarClasses(pathname: string): string {
  const styles = resolveRouteStyles(pathname);
  return styles.navbarClasses.join(' ');
}

/**
 * Get CSS class string for the footer element.
 */
export function getFooterClasses(pathname: string): string {
  const styles = resolveRouteStyles(pathname);
  return styles.footerClasses.join(' ');
}
