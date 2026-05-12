/**
 * IMS Date Utils - Types and Configuration
 * Replaces moment.js v2.18.1 with date-fns v4 based implementation
 * Part of IMS ERP System - Deep Navy Blue Theme
 */

// ============================================================================
// Unit Types
// ============================================================================

/** All supported time units matching moment.js */
export type IMSDateUnit =
  | 'year' | 'years' | 'y'
  | 'month' | 'months' | 'M'
  | 'week' | 'weeks' | 'w'
  | 'day' | 'days' | 'd'
  | 'hour' | 'hours' | 'h'
  | 'minute' | 'minutes' | 'm'
  | 'second' | 'seconds' | 's'
  | 'millisecond' | 'milliseconds' | 'ms';

/** Normalized unit type (always singular full name) */
export type IMSDateNormalizedUnit =
  | 'year' | 'month' | 'week' | 'day'
  | 'hour' | 'minute' | 'second' | 'millisecond';

/** Start/end of unit types */
export type IMSStartOfUnit =
  | 'year' | 'quarter' | 'month' | 'week' | 'isoWeek'
  | 'day' | 'date' | 'hour' | 'minute' | 'second';

// ============================================================================
// Locale Types
// ============================================================================

/** Locale identifier matching date-fns locale names */
export type IMSLocaleCode =
  | 'af' | 'ar' | 'ar-DZ' | 'ar-EG' | 'ar-MA' | 'ar-SA' | 'ar-TN'
  | 'az' | 'be' | 'be-tarask' | 'bg' | 'bn' | 'bs'
  | 'ca' | 'ckb' | 'cs' | 'cy' | 'da' | 'de' | 'de-AT'
  | 'el' | 'en-AU' | 'en-CA' | 'en-GB' | 'en-IE' | 'en-IN' | 'en-NZ' | 'en-US' | 'en-ZA'
  | 'eo' | 'es' | 'et' | 'eu'
  | 'fa-IR' | 'fi' | 'fr' | 'fr-CA' | 'fr-CH' | 'fy'
  | 'gd' | 'gl' | 'gu'
  | 'he' | 'hi' | 'hr' | 'ht' | 'hu' | 'hy'
  | 'id' | 'is' | 'it' | 'it-CH'
  | 'ja' | 'ja-Hira'
  | 'ka' | 'kk' | 'km' | 'kn' | 'ko'
  | 'lb' | 'lt' | 'lv'
  | 'mk' | 'mn' | 'ms' | 'mt'
  | 'nb' | 'nl' | 'nl-BE' | 'nn'
  | 'oc'
  | 'pl' | 'pt' | 'pt-BR'
  | 'ro' | 'ru'
  | 'se' | 'sk' | 'sl' | 'sq' | 'sr' | 'sr-Latn' | 'sv'
  | 'ta' | 'te' | 'th' | 'tr'
  | 'ug' | 'uk' | 'uz' | 'uz-Cyrl'
  | 'vi'
  | 'zh-CN' | 'zh-HK' | 'zh-TW';

/** Moment.js legacy locale code mapping to date-fns locale codes */
export const MOMENT_TO_DATE_FNS_LOCALE: Record<string, IMSLocaleCode> = {
  'af': 'af',
  'ar': 'ar', 'ar-dz': 'ar-DZ', 'ar-kw': 'ar-SA', 'ar-ly': 'ar-SA',
  'ar-ma': 'ar-MA', 'ar-sa': 'ar-SA', 'ar-tn': 'ar-TN',
  'az': 'az',
  'be': 'be',
  'bg': 'bg',
  'bn': 'bn',
  'bo': 'zh-CN',
  'br': 'fr',
  'bs': 'bs',
  'ca': 'ca',
  'cs': 'cs',
  'cv': 'ru',
  'cy': 'cy',
  'da': 'da',
  'de': 'de', 'de-at': 'de-AT', 'de-ch': 'de',
  'dv': 'ar',
  'el': 'el',
  'en': 'en-US', 'en-au': 'en-AU', 'en-ca': 'en-CA', 'en-gb': 'en-GB',
  'en-ie': 'en-IE', 'en-nz': 'en-NZ',
  'eo': 'eo',
  'es': 'es', 'es-do': 'es',
  'et': 'et',
  'eu': 'eu',
  'fa': 'fa-IR',
  'fi': 'fi',
  'fo': 'da',
  'fr': 'fr', 'fr-ca': 'fr-CA', 'fr-ch': 'fr-CH',
  'fy': 'fy',
  'gd': 'gd',
  'gl': 'gl',
  'gom-latn': 'en-US',
  'he': 'he',
  'hi': 'hi',
  'hr': 'hr',
  'hu': 'hu',
  'hy-am': 'hy',
  'id': 'id',
  'is': 'is',
  'it': 'it',
  'ja': 'ja',
  'jv': 'id',
  'ka': 'ka',
  'kk': 'kk',
  'km': 'km',
  'kn': 'kn',
  'ko': 'ko',
  'ky': 'ru',
  'lb': 'lb',
  'lo': 'th',
  'lt': 'lt',
  'lv': 'lv',
  'me': 'sr',
  'mi': 'en-GB',
  'mk': 'mk',
  'ml': 'en-IN',
  'mr': 'hi',
  'ms': 'ms', 'ms-my': 'ms',
  'my': 'th',
  'nb': 'nb',
  'ne': 'hi',
  'nl': 'nl', 'nl-be': 'nl-BE',
  'nn': 'nn',
  'pa-in': 'hi',
  'pl': 'pl',
  'pt': 'pt', 'pt-br': 'pt-BR',
  'ro': 'ro',
  'ru': 'ru',
  'sd': 'ar',
  'se': 'se',
  'si': 'en-GB',
  'sk': 'sk',
  'sl': 'sl',
  'sq': 'sq',
  'sr': 'sr', 'sr-cyrl': 'sr',
  'ss': 'en-US',
  'sv': 'sv',
  'sw': 'en-GB',
  'ta': 'ta',
  'te': 'te',
  'tet': 'pt',
  'th': 'th',
  'tl-ph': 'en-US',
  'tlh': 'en-US',
  'tr': 'tr',
  'tzl': 'en-US',
  'tzm': 'fr',
  'tzm-latn': 'fr',
  'uk': 'uk',
  'ur': 'ar',
  'uz': 'uz', 'uz-latn': 'uz',
  'vi': 'vi',
  'x-pseudo': 'en-US',
  'yo': 'en-GB',
  'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW', 'zh-hk': 'zh-HK',
};

// ============================================================================
// Relative Time Thresholds
// ============================================================================

/** Configuration for relative time thresholds (matching moment.js) */
export interface IMSRelativeTimeThresholds {
  ss: number;
  s: number;
  m: number;
  h: number;
  d: number;
  w: number;
  M: number;
}

/** Default thresholds matching moment.js defaults */
export const DEFAULT_RELATIVE_TIME_THRESHOLDS: IMSRelativeTimeThresholds = {
  ss: 44,
  s: 45,
  m: 45,
  h: 22,
  d: 26,
  w: Infinity,
  M: 11,
};

// ============================================================================
// Relative Time Formatting
// ============================================================================

/** Relative time string formatters matching moment.js locale */
export interface IMSRelativeTimeStrings {
  future: string;
  past: string;
  s: string;
  ss: string;
  m: string;
  mm: string;
  h: string;
  hh: string;
  d: string;
  dd: string;
  w: string;
  ww: string;
  M: string;
  MM: string;
  y: string;
  yy: string;
}

/** Default English relative time strings */
export const DEFAULT_RELATIVE_TIME: IMSRelativeTimeStrings = {
  future: 'in %s',
  past: '%s ago',
  s: 'a few seconds',
  ss: '%d seconds',
  m: 'a minute',
  mm: '%d minutes',
  h: 'an hour',
  hh: '%d hours',
  d: 'a day',
  dd: '%d days',
  w: 'a week',
  ww: '%d weeks',
  M: 'a month',
  MM: '%d months',
  y: 'a year',
  yy: '%d years',
};

// ============================================================================
// Calendar Formatting
// ============================================================================

/** Calendar format strings matching moment.js calendar() */
export interface IMSCalendarFormats {
  sameDay: string;
  nextDay: string;
  nextWeek: string;
  lastDay: string;
  lastWeek: string;
  sameElse: string;
}

/** Default English calendar formats */
export const DEFAULT_CALENDAR_FORMATS: IMSCalendarFormats = {
  sameDay: '[Today at] h:mm A',
  nextDay: '[Tomorrow at] h:mm A',
  nextWeek: 'dddd [at] h:mm A',
  lastDay: '[Yesterday at] h:mm A',
  lastWeek: '[Last] dddd [at] h:mm A',
  sameElse: 'MM/DD/YYYY',
};

// ============================================================================
// Duration Types
// ============================================================================

/** Duration input object matching moment.duration() */
export interface IMSDurationInput {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

/** ISO 8601 duration string format */
export type IMSISODuration = string;

// ============================================================================
// Format Token Mapping
// ============================================================================

/**
 * Mapping from moment.js format tokens to date-fns format tokens.
 * Key differences:
 * - Year: YYYY → yyyy (ISO week year vs calendar year)
 * - Day of year: DDDD → DDD
 * - Day of month: DD → dd
 * - Epoch: X → t (seconds), x → T (milliseconds)
 */
export const MOMENT_TO_DATE_FNS_FORMAT: Record<string, string> = {
  'YYYY': 'yyyy',
  'YY': 'yy',
  'Y': 'yyyy',
  'GGGG': 'RRRR',
  'GG': 'RR',
  'Q': 'q',
  'Qo': 'qo',
  'MMMM': 'MMMM',
  'MMM': 'MMM',
  'MM': 'MM',
  'M': 'M',
  'Mo': 'Mo',
  'ww': 'II',
  'w': 'I',
  'Wo': 'Io',
  'DDDD': 'DDD',
  'DDD': 'D',
  'DD': 'dd',
  'D': 'd',
  'Do': 'do',
  'dddd': 'EEEE',
  'ddd': 'EEE',
  'dd': 'EE',
  'd': 'e',
  'A': 'a',
  'a': 'a',
  'HH': 'HH',
  'H': 'H',
  'hh': 'hh',
  'h': 'h',
  'mm': 'mm',
  'm': 'm',
  'ss': 'ss',
  's': 's',
  'SSSS': 'SSSS',
  'SSS': 'SSS',
  'SS': 'SS',
  'S': 'S',
  'Z': 'XXX',
  'ZZ': 'XX',
  'X': 't',
  'x': 'T',
};

// ============================================================================
// Parse Format Mapping
// ============================================================================

export const MOMENT_PARSE_FORMATS: Record<string, string> = {
  'YYYY': 'yyyy', 'YY': 'yy',
  'MMMM': 'MMMM', 'MMM': 'MMM', 'MM': 'MM', 'M': 'M',
  'DD': 'dd', 'D': 'd',
  'HH': 'HH', 'H': 'H', 'hh': 'hh', 'h': 'h',
  'mm': 'mm', 'm': 'm',
  'ss': 'ss', 's': 's',
  'A': 'a', 'a': 'a',
  'ZZ': 'XX', 'Z': 'XXX',
};

// ============================================================================
// IMSDate Configuration
// ============================================================================

/** Global configuration for IMSDate */
export interface IMSDateConfig {
  defaultLocale: IMSLocaleCode;
  thresholds: IMSRelativeTimeThresholds;
  calendarFormats: IMSCalendarFormats;
  strictParsing: boolean;
  defaultFormat: string;
  firstDayOfWeek: number;
  isoWeek: boolean;
}

/** Default configuration */
export const DEFAULT_IMS_DATE_CONFIG: IMSDateConfig = {
  defaultLocale: 'en-US',
  thresholds: DEFAULT_RELATIVE_TIME_THRESHOLDS,
  calendarFormats: DEFAULT_CALENDAR_FORMATS,
  strictParsing: false,
  defaultFormat: 'MM/DD/YYYY',
  firstDayOfWeek: 0,
  isoWeek: false,
};

// ============================================================================
// Manipulation Types
// ============================================================================

/** Duration addition/subtraction input */
export interface IMSManipulationInput {
  years?: number;
  quarters?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

/** Object returned by .toObject() */
export interface IMSDateObject {
  years: number;
  months: number;
  date: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

// ============================================================================
// Invalid Date Handling
// ============================================================================

export const IMS_INVALID_DATE = new Date(NaN);

export function isIMSInvalidDate(date: Date): boolean {
  return isNaN(date.getTime());
}
