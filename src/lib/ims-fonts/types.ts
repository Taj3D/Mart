/**
 * IMS Font Types and Configuration
 *
 * TypeScript interfaces for the IMS font system.
 * Converted from File 33 which loaded Lato font (3 variants, 6 @font-face rules)
 * via Google Fonts CDN with latin + latin-ext subsets.
 *
 * Next.js `next/font/google` provides:
 * - Automatic font optimization (no layout shift)
 * - Self-hosted fonts (privacy, no external requests)
 * - Automatic subset selection
 * - CSS variable generation for Tailwind integration
 *
 * Original @font-face declarations:
 *   Lato Italic 400    (latin-ext + latin)
 *   Lato Normal 400    (latin-ext + latin)
 *   Lato Normal 700    (latin-ext + latin)
 */

// ---------------------------------------------------------------------------
// Font Variant Definitions
// ---------------------------------------------------------------------------

/** Font weight type matching CSS font-weight values */
export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

/** Font style type */
export type FontStyle = 'normal' | 'italic'

/**
 * A single font variant (weight + style combination).
 * Matches one @font-face declaration from the original CSS.
 */
export interface FontVariant {
  /** Font weight (original: 400, 700) */
  weight: FontWeight
  /** Font style (original: normal, italic) */
  style: FontStyle
  /** CSS variable name for this variant */
  variable: string
}

// ---------------------------------------------------------------------------
// Font Family Configuration
// ---------------------------------------------------------------------------

/**
 * Configuration for a font family used in the IMS system.
 *
 * Replaces the original @font-face CSS blocks with a structured config
 * that next/font/google uses to load and optimize the font.
 */
export interface IMSFontFamily {
  /** Font family name as recognized by next/font/google */
  name: string
  /** Display name for documentation/UI */
  displayName: string
  /** Font weights to load (original Lato: [400, 700]) */
  weights: FontWeight[]
  /** Font styles to load (original Lato: ['normal', 'italic']) */
  styles: FontStyle[]
  /** Unicode subsets (original: ['latin', 'latin-ext']) */
  subsets: string[]
  /** CSS variable name for the font family */
  variable: string
  /** Whether this is the primary body font */
  isPrimary: boolean
  /** Fallback font stack */
  fallback: string[]
  /** Description for migration docs */
  description: string
}

// ---------------------------------------------------------------------------
// IMS Font System Configuration
// ---------------------------------------------------------------------------

/**
 * Complete IMS font system configuration.
 *
 * Combines the original Lato font from File 33 with the project's
 * existing Geist font and any additional fonts.
 */
export interface IMSFontConfig {
  /** Primary body font (original: Lato, File 31 CSS also referenced Poppins) */
  primary: IMSFontFamily
  /** Heading/display font */
  heading: IMSFontFamily
  /** Monospace font for code/data */
  mono: IMSFontFamily
  /** Additional fonts */
  additional: IMSFontFamily[]
}

// ---------------------------------------------------------------------------
// Original File 33 Font Declarations
// ---------------------------------------------------------------------------

/**
 * The 6 @font-face declarations from File 33, mapped to their configs.
 * This is for documentation/reference purposes.
 */
export const ORIGINAL_LATO_DECLARATIONS = [
  {
    family: 'Lato',
    style: 'italic' as FontStyle,
    weight: 400 as FontWeight,
    src: 'https://fonts.gstatic.com/s/lato/v25/S6u8w4BMUTPHjxsAUi-qJCY.woff2',
    unicodeRange: 'U+0100-02BA, U+02BD-02C5, ...',
    subset: 'latin-ext',
  },
  {
    family: 'Lato',
    style: 'italic' as FontStyle,
    weight: 400 as FontWeight,
    src: 'https://fonts.gstatic.com/s/lato/v25/S6u8w4BMUTPHjxsAXC-q.woff2',
    unicodeRange: 'U+0000-00FF, U+0131, ...',
    subset: 'latin',
  },
  {
    family: 'Lato',
    style: 'normal' as FontStyle,
    weight: 400 as FontWeight,
    src: 'https://fonts.gstatic.com/s/lato/v25/S6uyw4BMUTPHjxAwXjeu.woff2',
    unicodeRange: 'U+0100-02BA, U+02BD-02C5, ...',
    subset: 'latin-ext',
  },
  {
    family: 'Lato',
    style: 'normal' as FontStyle,
    weight: 400 as FontWeight,
    src: 'https://fonts.gstatic.com/s/lato/v25/S6uyw4BMUTPHjx4wXg.woff2',
    unicodeRange: 'U+0000-00FF, U+0131, ...',
    subset: 'latin',
  },
  {
    family: 'Lato',
    style: 'normal' as FontStyle,
    weight: 700 as FontWeight,
    src: 'https://fonts.gstatic.com/s/lato/v25/S6u9w4BMUTPHh6UVSwaPGR_p.woff2',
    unicodeRange: 'U+0100-02BA, U+02BD-02C5, ...',
    subset: 'latin-ext',
  },
  {
    family: 'Lato',
    style: 'normal' as FontStyle,
    weight: 700 as FontWeight,
    src: 'https://fonts.gstatic.com/s/lato/v25/S6u9w4BMUTPHh6UVSwiPGQ.woff2',
    unicodeRange: 'U+0000-00FF, U+0131, ...',
    subset: 'latin',
  },
] as const

// ---------------------------------------------------------------------------
// Font Family Presets
// ---------------------------------------------------------------------------

/** Lato font family configuration (from File 33) */
export const LATO_FONT: IMSFontFamily = {
  name: 'Lato',
  displayName: 'Lato',
  weights: [400, 700],
  styles: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-lato',
  isPrimary: true,
  fallback: ['system-ui', 'sans-serif'],
  description: 'Primary IMS body font. Original: 6 @font-face rules (italic 400, normal 400, normal 700) with latin + latin-ext subsets from Google Fonts CDN.',
}

/** Poppins font family configuration (referenced in File 31 CSS) */
export const POPPINS_FONT: IMSFontFamily = {
  name: 'Poppins',
  displayName: 'Poppins',
  weights: [300, 400, 500, 600, 700],
  styles: ['normal'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-poppins',
  isPrimary: false,
  fallback: ['system-ui', 'sans-serif'],
  description: 'Sidebar/body font referenced in File 31 CSS. Original: @import from Google Fonts (commented out in favor of Lato).',
}

/** Geist font family configuration (project default) */
export const GEIST_FONT: IMSFontFamily = {
  name: 'Geist',
  displayName: 'Geist',
  weights: [400, 500, 700],
  styles: ['normal'],
  subsets: ['latin'],
  variable: '--font-geist-sans',
  isPrimary: false,
  fallback: ['system-ui', 'sans-serif'],
  description: 'Default Next.js project font. Used as primary sans-serif alongside Lato.',
}

/** Geist Mono font family configuration (project default) */
export const GEIST_MONO_FONT: IMSFontFamily = {
  name: 'Geist_Mono',
  displayName: 'Geist Mono',
  weights: [400],
  styles: ['normal'],
  subsets: ['latin'],
  variable: '--font-geist-mono',
  isPrimary: false,
  fallback: ['monospace'],
  description: 'Default monospace font for code and data display.',
}

// ---------------------------------------------------------------------------
// Tailwind Integration
// ---------------------------------------------------------------------------

/**
 * Font family mapping for Tailwind CSS configuration.
 * Maps Tailwind font family names to CSS variable references.
 */
export interface TailwindFontMapping {
  /** Tailwind font-sans CSS variable */
  sans: string
  /** Tailwind font-mono CSS variable */
  mono: string
  /** Custom ims-lato CSS variable */
  lato: string
  /** Custom ims-poppins CSS variable */
  poppins: string
}

/** Default Tailwind font mappings */
export const DEFAULT_TAILWIND_FONT_MAPPING: TailwindFontMapping = {
  sans: 'var(--font-geist-sans)',
  mono: 'var(--font-geist-mono)',
  lato: 'var(--font-lato)',
  poppins: 'var(--font-poppins)',
}
