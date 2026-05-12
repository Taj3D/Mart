/**
 * IMS Fonts Module
 *
 * Complete conversion of File 33 (Lato @font-face CSS) to Next.js font optimization.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * ORIGINAL CSS → NEXT.JS FONT MAPPING
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @font-face Declaration               → next/font/google Config
 * ──────────────────────────────────────┼─────────────────────────────────
 * font-family: 'Lato'                  → Lato({ ... })
 * font-style: italic; font-weight: 400 → style: ['normal', 'italic']
 * font-style: normal; font-weight: 400 → weight: ['400', '700']
 * font-style: normal; font-weight: 700 → (combined above)
 * src: url(gstatic...woff2)            → automatic (self-hosted by Next.js)
 * unicode-range: U+0100-02BA...        → subsets: ['latin', 'latin-ext']
 * unicode-range: U+0000-00FF...        → (automatic subset selection)
 *
 * Also includes Poppins from File 31 CSS:
 *   @import "fonts.googleapis.com/css?family=Poppins:300,400,500,600,700"
 *   body { font-family: 'Poppins', sans-serif; }
 *
 * ═══════════════════════════════════════════════════════════════════════
 * MIGRATION GUIDE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * BEFORE (CSS @font-face from CDN):
 * ```css
 * / * latin-ext * /
 * @font-face {
 *   font-family: 'Lato';
 *   font-style: italic;
 *   font-weight: 400;
 *   src: url(https://fonts.gstatic.com/s/lato/v25/S6u8w4BMUTPHjxsAUi-qJCY.woff2) format('woff2');
 *   unicode-range: U+0100-02BA, ...;
 * }
 * / * latin * /
 * @font-face {
 *   font-family: 'Lato';
 *   font-style: italic;
 *   font-weight: 400;
 *   src: url(https://fonts.gstatic.com/s/lato/v25/S6u8w4BMUTPHjxsAXC-q.woff2) format('woff2');
 *   unicode-range: U+0000-00FF, ...;
 * }
 * / * ...4 more @font-face rules for normal 400, normal 700 * /
 *
 * body { font-family: 'Lato', sans-serif; }
 * ```
 *
 * AFTER (Next.js font optimization):
 * ```tsx
 * // In layout.tsx:
 * import { lato, poppins } from '@/lib/ims-fonts'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body className={`${lato.variable} ${poppins.variable} font-[family-name:var(--font-lato)]`}>
 *         {children}
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 *
 * ═══════════════════════════════════════════════════════════════════════
 * FONT APPLICATION IN TAILWIND
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Apply fonts using Tailwind classes:
 *   font-[family-name:var(--font-lato)]     → Lato font
 *   font-[family-name:var(--font-poppins)]  → Poppins font
 *
 * Or using CSS:
 *   style={{ fontFamily: 'var(--font-lato)' }}
 *
 * ═══════════════════════════════════════════════════════════════════════
 * BENEFITS OVER @font-face CDN
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 1. No layout shift — font-display: swap is automatic
 * 2. Self-hosted — no external Google Fonts request (privacy + GDPR)
 * 3. Automatic subsetting — only loads needed glyphs
 * 4. CSS variable generation — seamless Tailwind integration
 * 5. Preloading — fonts are preloaded for optimal performance
 * 6. No FOUT — Next.js injects @font-face rules at build time
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type {
  FontWeight,
  FontStyle,
  FontVariant,
  IMSFontFamily,
  IMSFontConfig,
  TailwindFontMapping,
} from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export {
  ORIGINAL_LATO_DECLARATIONS,
  LATO_FONT,
  POPPINS_FONT,
  GEIST_FONT,
  GEIST_MONO_FONT,
  DEFAULT_TAILWIND_FONT_MAPPING,
} from './types'

// ---------------------------------------------------------------------------
// Font Loaders
// ---------------------------------------------------------------------------
export {
  lato,
  poppins,
  fontClasses,
  fontFamilies,
  getAllFontClasses,
  getTailwindFontConfig,
} from './fonts'
