/**
 * IMS Date Utils - Locale Manager
 * Dynamically loads and caches date-fns locales
 * Supports all 60+ moment.js locales via date-fns equivalents
 */

import type { Locale } from 'date-fns';
import type { IMSLocaleCode } from './types';
import { MOMENT_TO_DATE_FNS_LOCALE } from './types';

// ============================================================================
// Locale Cache
// ============================================================================

/** Cache of loaded date-fns locales */
const localeCache: Map<string, Locale> = new Map();

/** Currently active global locale */
let globalLocale: IMSLocaleCode = 'en-US';

// ============================================================================
// Locale Loader
// ============================================================================

/**
 * Dynamically import a date-fns locale by code.
 * Uses dynamic imports for code-splitting.
 */
async function loadDateFnsLocale(code: string): Promise<Locale> {
  // Check cache first
  const cached = localeCache.get(code);
  if (cached) return cached;

  try {
    // Map of locale codes to their dynamic import paths
    const localeImports: Record<string, () => Promise<{ default: Locale }>> = {
      'af': () => import('date-fns/locale/af'),
      'ar': () => import('date-fns/locale/ar'),
      'ar-DZ': () => import('date-fns/locale/ar-DZ'),
      'ar-EG': () => import('date-fns/locale/ar-EG'),
      'ar-MA': () => import('date-fns/locale/ar-MA'),
      'ar-SA': () => import('date-fns/locale/ar-SA'),
      'ar-TN': () => import('date-fns/locale/ar-TN'),
      'az': () => import('date-fns/locale/az'),
      'be': () => import('date-fns/locale/be'),
      'be-tarask': () => import('date-fns/locale/be-tarask'),
      'bg': () => import('date-fns/locale/bg'),
      'bn': () => import('date-fns/locale/bn'),
      'bs': () => import('date-fns/locale/bs'),
      'ca': () => import('date-fns/locale/ca'),
      'ckb': () => import('date-fns/locale/ckb'),
      'cs': () => import('date-fns/locale/cs'),
      'cy': () => import('date-fns/locale/cy'),
      'da': () => import('date-fns/locale/da'),
      'de': () => import('date-fns/locale/de'),
      'de-AT': () => import('date-fns/locale/de-AT'),
      'el': () => import('date-fns/locale/el'),
      'en-AU': () => import('date-fns/locale/en-AU'),
      'en-CA': () => import('date-fns/locale/en-CA'),
      'en-GB': () => import('date-fns/locale/en-GB'),
      'en-IE': () => import('date-fns/locale/en-IE'),
      'en-IN': () => import('date-fns/locale/en-IN'),
      'en-NZ': () => import('date-fns/locale/en-NZ'),
      'en-US': () => import('date-fns/locale/en-US'),
      'en-ZA': () => import('date-fns/locale/en-ZA'),
      'eo': () => import('date-fns/locale/eo'),
      'es': () => import('date-fns/locale/es'),
      'et': () => import('date-fns/locale/et'),
      'eu': () => import('date-fns/locale/eu'),
      'fa-IR': () => import('date-fns/locale/fa-IR'),
      'fi': () => import('date-fns/locale/fi'),
      'fr': () => import('date-fns/locale/fr'),
      'fr-CA': () => import('date-fns/locale/fr-CA'),
      'fr-CH': () => import('date-fns/locale/fr-CH'),
      'fy': () => import('date-fns/locale/fy'),
      'gd': () => import('date-fns/locale/gd'),
      'gl': () => import('date-fns/locale/gl'),
      'gu': () => import('date-fns/locale/gu'),
      'he': () => import('date-fns/locale/he'),
      'hi': () => import('date-fns/locale/hi'),
      'hr': () => import('date-fns/locale/hr'),
      'ht': () => import('date-fns/locale/ht'),
      'hu': () => import('date-fns/locale/hu'),
      'hy': () => import('date-fns/locale/hy'),
      'id': () => import('date-fns/locale/id'),
      'is': () => import('date-fns/locale/is'),
      'it': () => import('date-fns/locale/it'),
      'it-CH': () => import('date-fns/locale/it-CH'),
      'ja': () => import('date-fns/locale/ja'),
      'ja-Hira': () => import('date-fns/locale/ja-Hira'),
      'ka': () => import('date-fns/locale/ka'),
      'kk': () => import('date-fns/locale/kk'),
      'km': () => import('date-fns/locale/km'),
      'kn': () => import('date-fns/locale/kn'),
      'ko': () => import('date-fns/locale/ko'),
      'lb': () => import('date-fns/locale/lb'),
      'lt': () => import('date-fns/locale/lt'),
      'lv': () => import('date-fns/locale/lv'),
      'mk': () => import('date-fns/locale/mk'),
      'mn': () => import('date-fns/locale/mn'),
      'ms': () => import('date-fns/locale/ms'),
      'mt': () => import('date-fns/locale/mt'),
      'nb': () => import('date-fns/locale/nb'),
      'nl': () => import('date-fns/locale/nl'),
      'nl-BE': () => import('date-fns/locale/nl-BE'),
      'nn': () => import('date-fns/locale/nn'),
      'oc': () => import('date-fns/locale/oc'),
      'pl': () => import('date-fns/locale/pl'),
      'pt': () => import('date-fns/locale/pt'),
      'pt-BR': () => import('date-fns/locale/pt-BR'),
      'ro': () => import('date-fns/locale/ro'),
      'ru': () => import('date-fns/locale/ru'),
      'se': () => import('date-fns/locale/se'),
      'sk': () => import('date-fns/locale/sk'),
      'sl': () => import('date-fns/locale/sl'),
      'sq': () => import('date-fns/locale/sq'),
      'sr': () => import('date-fns/locale/sr'),
      'sr-Latn': () => import('date-fns/locale/sr-Latn'),
      'sv': () => import('date-fns/locale/sv'),
      'ta': () => import('date-fns/locale/ta'),
      'te': () => import('date-fns/locale/te'),
      'th': () => import('date-fns/locale/th'),
      'tr': () => import('date-fns/locale/tr'),
      'ug': () => import('date-fns/locale/ug'),
      'uk': () => import('date-fns/locale/uk'),
      'uz': () => import('date-fns/locale/uz'),
      'uz-Cyrl': () => import('date-fns/locale/uz-Cyrl'),
      'vi': () => import('date-fns/locale/vi'),
      'zh-CN': () => import('date-fns/locale/zh-CN'),
      'zh-HK': () => import('date-fns/locale/zh-HK'),
      'zh-TW': () => import('date-fns/locale/zh-TW'),
    };

    const loader = localeImports[code];
    if (loader) {
      const mod = await loader();
      localeCache.set(code, mod.default);
      return mod.default;
    }

    // Fallback to en-US
    const enMod = await import('date-fns/locale/en-US');
    localeCache.set(code, enMod.default);
    return enMod.default;
  } catch {
    // Fallback to en-US on error
    const enMod = await import('date-fns/locale/en-US');
    localeCache.set(code, enMod.default);
    return enMod.default;
  }
}

// ============================================================================
// Synchronous Locale Access (for pre-loaded locales)
// ============================================================================

/**
 * Get a cached locale synchronously.
 * Returns undefined if locale hasn't been loaded yet.
 */
export function getCachedLocale(code: IMSLocaleCode): Locale | undefined {
  return localeCache.get(code);
}

/**
 * Load and return a date-fns locale.
 * Async - use this for dynamic locale switching.
 */
export async function getLocale(code: IMSLocaleCode): Promise<Locale> {
  return loadDateFnsLocale(code);
}

/**
 * Pre-load a locale into the cache.
 * Call this during app initialization for locales you know you'll need.
 */
export async function preloadLocale(code: IMSLocaleCode): Promise<void> {
  await loadDateFnsLocale(code);
}

/**
 * Pre-load multiple locales at once.
 */
export async function preloadLocales(codes: IMSLocaleCode[]): Promise<void> {
  await Promise.all(codes.map(loadDateFnsLocale));
}

// ============================================================================
// Global Locale Management
// ============================================================================

/**
 * Set the global default locale.
 * All new IMSDate instances will use this locale unless overridden.
 */
export function setGlobalLocale(code: IMSLocaleCode): void {
  globalLocale = code;
}

/**
 * Get the current global default locale code.
 */
export function getGlobalLocale(): IMSLocaleCode {
  return globalLocale;
}

/**
 * Convert a moment.js locale code to the corresponding date-fns code.
 */
export function momentLocaleToDateFns(momentCode: string): IMSLocaleCode {
  const lower = momentCode.toLowerCase();
  return MOMENT_TO_DATE_FNS_LOCALE[lower] || MOMENT_TO_DATE_FNS_LOCALE[momentCode] || 'en-US';
}

// ============================================================================
// Locale List
// ============================================================================

/** All supported locale codes */
export const SUPPORTED_LOCALES: IMSLocaleCode[] = [
  'af', 'ar', 'ar-DZ', 'ar-EG', 'ar-MA', 'ar-SA', 'ar-TN',
  'az', 'be', 'be-tarask', 'bg', 'bn', 'bs',
  'ca', 'ckb', 'cs', 'cy', 'da', 'de', 'de-AT',
  'el', 'en-AU', 'en-CA', 'en-GB', 'en-IE', 'en-IN', 'en-NZ', 'en-US', 'en-ZA',
  'eo', 'es', 'et', 'eu',
  'fa-IR', 'fi', 'fr', 'fr-CA', 'fr-CH', 'fy',
  'gd', 'gl', 'gu',
  'he', 'hi', 'hr', 'ht', 'hu', 'hy',
  'id', 'is', 'it', 'it-CH',
  'ja', 'ja-Hira',
  'ka', 'kk', 'km', 'kn', 'ko',
  'lb', 'lt', 'lv',
  'mk', 'mn', 'ms', 'mt',
  'nb', 'nl', 'nl-BE', 'nn',
  'oc',
  'pl', 'pt', 'pt-BR',
  'ro', 'ru',
  'se', 'sk', 'sl', 'sq', 'sr', 'sr-Latn', 'sv',
  'ta', 'te', 'th', 'tr',
  'ug', 'uk', 'uz', 'uz-Cyrl',
  'vi',
  'zh-CN', 'zh-HK', 'zh-TW',
];

/** All moment.js legacy locale codes that are mapped */
export const MOMENT_LOCALE_CODES = Object.keys(MOMENT_TO_DATE_FNS_LOCALE);
