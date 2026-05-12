/**
 * IMS Font Loader
 *
 * Loads the Lato font (and optional Poppins) using Next.js `next/font/google`.
 * Replaces the 6 @font-face declarations from File 33 with optimized,
 * self-hosted font loading.
 *
 * Benefits of next/font/google over @font-face CDN:
 * - No layout shift (font-display: swap built-in)
 * - Self-hosted (no external Google Fonts request = better privacy)
 * - Automatic subsetting (only loads needed glyphs)
 * - CSS variable generation (seamless Tailwind integration)
 * - Preloading for optimal performance
 *
 * Original File 33 loaded:
 *   Lato Italic 400    (latin-ext + latin)
 *   Lato Normal 400    (latin-ext + latin)
 *   Lato Normal 700    (latin-ext + latin)
 *
 * Usage in layout.tsx:
 *   import { lato, poppins } from '@/lib/ims-fonts/fonts'
 *   <body className={`${lato.variable} ${poppins.variable} ...`}>
 */

import { Lato, Poppins } from 'next/font/google'

// ---------------------------------------------------------------------------
// Lato Font — Primary IMS Body Font (File 33)
// ---------------------------------------------------------------------------

/**
 * Lato font configuration matching File 33's @font-face declarations.
 *
 * Original CSS loaded:
 *   - Lato Italic 400 (latin-ext + latin)
 *   - Lato Normal 400 (latin-ext + latin)
 *   - Lato Normal 700 (latin-ext + latin)
 *
 * next/font/google equivalent:
 *   - weights: [400, 700] (italic included via styles)
 *   - styles: ['normal', 'italic']
 *   - subsets: ['latin', 'latin-ext']
 *   - variable: '--font-lato'
 *   - display: 'swap' (matching original font-loading behavior)
 */
export const lato = Lato({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-lato',
  display: 'swap',
})

// ---------------------------------------------------------------------------
// Poppins Font — Sidebar/Body Font (File 31 Reference)
// ---------------------------------------------------------------------------

/**
 * Poppins font configuration.
 *
 * Referenced in File 31 CSS:
 *   body { font-family: 'Poppins', sans-serif; }
 *   p { font-family: 'Poppins', sans-serif; font-size: 1.1em; font-weight: 300; line-height: 1.7em; }
 *
 * Original was a commented-out Google Fonts import:
 *   @import "https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700";
 *
 * We load it with next/font/google for consistency.
 */
export const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal'],
  variable: '--font-poppins',
  display: 'swap',
})

// ---------------------------------------------------------------------------
// Font CSS Variable Classes
// ---------------------------------------------------------------------------

/**
 * CSS variable class strings for applying fonts in className.
 *
 * @example
 * ```tsx
 * <body className={`${fontClasses.lato} ${fontClasses.poppins}`}>
 * ```
 */
export const fontClasses = {
  /** Lato CSS variable class: applies --font-lato */
  lato: lato.variable,
  /** Poppins CSS variable class: applies --font-poppins */
  poppins: poppins.variable,
} as const

// ---------------------------------------------------------------------------
// Font Family CSS Values
// ---------------------------------------------------------------------------

/**
 * CSS font-family values for use in style attributes or Tailwind config.
 *
 * @example
 * ```tsx
 * <p style={{ fontFamily: fontFamilies.lato }}>Hello</p>
 * ```
 */
export const fontFamilies = {
  /** Lato font-family with fallbacks */
  lato: `var(--font-lato), system-ui, sans-serif`,
  /** Poppins font-family with fallbacks */
  poppins: `var(--font-poppins), system-ui, sans-serif`,
  /** Lato + Poppins combined (Lato primary, Poppins fallback) */
  imsBody: `var(--font-lato), var(--font-poppins), system-ui, sans-serif`,
} as const

// ---------------------------------------------------------------------------
// Font Application Utilities
// ---------------------------------------------------------------------------

/**
 * Get all font variable classes for the body element.
 * Apply this to the <body> in layout.tsx to make all fonts available.
 *
 * @example
 * ```tsx
 * <body className={getAllFontClasses()}>
 * ```
 */
export function getAllFontClasses(): string {
  return `${lato.variable} ${poppins.variable}`
}

/**
 * Get Tailwind CSS theme extension for font families.
 * Use this in tailwind.config.ts to add Lato and Poppins to Tailwind.
 *
 * @example
 * ```ts
 * // tailwind.config.ts
 * import { getTailwindFontConfig } from '@/lib/ims-fonts/fonts'
 *
 * export default {
 *   theme: {
 *     extend: {
 *       fontFamily: getTailwindFontConfig(),
 *     },
 *   },
 * }
 * ```
 */
export function getTailwindFontConfig(): Record<string, string> {
  return {
    lato: `var(--font-lato), system-ui, sans-serif`,
    poppins: `var(--font-poppins), system-ui, sans-serif`,
    ims: `var(--font-lato), var(--font-poppins), system-ui, sans-serif`,
  }
}
