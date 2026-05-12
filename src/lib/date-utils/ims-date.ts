/**
 * IMS Date Utils - IMSDate Core Class
 * Chainable date manipulation class replacing moment.js
 * Part 1: Construction, Parsing, Formatting, Get/Set, Manipulation
 */

import {
  format,
  parse,
  parseISO,
  isValid,
  addYears,
  addMonths,
  addWeeks,
  addDays,
  addHours,
  addMinutes,
  addSeconds,
  addMilliseconds,
  addQuarters,
  subYears,
  subMonths,
  subWeeks,
  subDays,
  subHours,
  subMinutes,
  subSeconds,
  subMilliseconds,
  subQuarters,
  startOfYear,
  startOfQuarter,
  startOfMonth,
  startOfWeek,
  startOfISOWeek,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfSecond,
  endOfYear,
  endOfQuarter,
  endOfMonth,
  endOfWeek,
  endOfISOWeek,
  endOfDay,
  endOfHour,
  endOfMinute,
  endOfSecond,
  getYear,
  getMonth,
  getDate,
  getDay,
  getHours,
  getMinutes,
  getSeconds,
  getMilliseconds,
  setYear,
  setMonth,
  setDate as setDateFns,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  setDayOfYear,
  getDayOfYear,
  getISOWeek,
  getWeek,
  getQuarter,
  daysInMonth,
  isLeapYear,
  isDate,
} from 'date-fns';
import type { Locale } from 'date-fns';
import type {
  IMSDateUnit,
  IMSDateNormalizedUnit,
  IMSStartOfUnit,
  IMSLocaleCode,
  IMSManipulationInput,
  IMSDateObject,
  IMSDateConfig,
} from './types';
import {
  DEFAULT_IMS_DATE_CONFIG,
  MOMENT_TO_DATE_FNS_FORMAT,
  MOMENT_PARSE_FORMATS,
  IMS_INVALID_DATE,
  isIMSInvalidDate,
} from './types';
import { getLocale, getCachedLocale, getGlobalLocale } from './locale';

// ============================================================================
// Unit Normalization
// ============================================================================

const UNIT_ALIASES: Record<string, IMSDateNormalizedUnit> = {
  'year': 'year', 'years': 'year', 'y': 'year',
  'month': 'month', 'months': 'month', 'M': 'month',
  'week': 'week', 'weeks': 'week', 'w': 'week',
  'day': 'day', 'days': 'day', 'd': 'day',
  'hour': 'hour', 'hours': 'hour', 'h': 'hour',
  'minute': 'minute', 'minutes': 'minute', 'm': 'minute',
  'second': 'second', 'seconds': 'second', 's': 'second',
  'millisecond': 'millisecond', 'milliseconds': 'millisecond', 'ms': 'millisecond',
};

/** Normalize a unit string to singular full name */
function normalizeUnit(unit: IMSDateUnit): IMSDateNormalizedUnit {
  return UNIT_ALIASES[unit] || 'day';
}

// ============================================================================
// Format Conversion
// ============================================================================

/**
 * Convert a moment.js format string to date-fns format string.
 * Handles bracket-escaped text: [Today at] → 'Today at'
 */
export function convertMomentFormat(momentFormat: string): string {
  let result = momentFormat;

  // Replace bracket-escaped text with single-quoted text for date-fns
  result = result.replace(/\[([^\]]*)\]/g, "'$1'");

  // Sort tokens by length (longest first) to avoid partial replacements
  const tokens = Object.keys(MOMENT_TO_DATE_FNS_FORMAT).sort((a, b) => b.length - a.length);

  for (const token of tokens) {
    // Use a regex that matches the token not preceded/followed by same-type chars
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Only replace if the token is a standalone format token
    result = result.replace(new RegExp(escaped, 'g'), MOMENT_TO_DATE_FNS_FORMAT[token]);
  }

  return result;
}

/**
 * Convert moment.js parse format to date-fns parse format.
 */
export function convertParseFormat(momentFormat: string): string {
  let result = momentFormat;
  result = result.replace(/\[([^\]]*)\]/g, "''");

  const tokens = Object.keys(MOMENT_PARSE_FORMATS).sort((a, b) => b.length - a.length);
  for (const token of tokens) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), MOMENT_PARSE_FORMATS[token]);
  }

  return result;
}

// ============================================================================
// Common Parse Formats (moment.js fallback)
// ============================================================================

const FALLBACK_PARSE_FORMATS = [
  'yyyy-MM-ddTHH:mm:ss.SSSXXX',  // ISO 8601
  'yyyy-MM-ddTHH:mm:ssXXX',
  'yyyy-MM-ddTHH:mm:ss.SSS',
  'yyyy-MM-ddTHH:mm:ss',
  'yyyy-MM-dd HH:mm:ss',
  'yyyy-MM-dd HH:mm',
  'yyyy-MM-dd',
  'MM/dd/yyyy',
  'MM/dd/yyyy HH:mm:ss',
  'MM/dd/yyyy HH:mm',
  'dd/MM/yyyy',
  'dd/MM/yyyy HH:mm:ss',
  'dd/MM/yyyy HH:mm',
  'yyyy/MM/dd',
  'MMM dd, yyyy',
  'MMMM dd, yyyy',
  'MMM dd yyyy',
  'dd MMM yyyy',
  'dd MMMM yyyy',
  'yyyyMMdd',
  'HH:mm:ss',
  'HH:mm',
  'h:mm a',
  'h:mm:ss a',
  'MMMM Do yyyy, h:mm:ss a',
  'dddd, MMMM Do yyyy, h:mm:ss a',
];

// ============================================================================
// IMSDate Class
// ============================================================================

/**
 * IMSDate - Chainable date manipulation class replacing moment.js.
 *
 * Usage:
 *   const d = ims('2024-01-15');
 *   d.format('YYYY-MM-DD');           // '2024-01-15'
 *   d.add(1, 'month').format();       // '2024-02-15'
 *   d.startOf('month').format();      // '2024-01-01'
 *   d.fromNow();                       // '2 years ago'
 *   d.calendar();                      // '01/15/2024'
 */
export class IMSDate {
  private _date: Date;
  private _localeCode: IMSLocaleCode;
  private _locale: Locale | undefined;
  private _config: IMSDateConfig;
  private _isUTC: boolean;

  // ============================================================================
  // Construction
  // ============================================================================

  constructor(
    input?: Date | string | number | IMSDate | null | undefined,
    formatString?: string,
    localeCode?: IMSLocaleCode,
    strict?: boolean
  ) {
    this._config = { ...DEFAULT_IMS_DATE_CONFIG };
    this._isUTC = false;
    this._localeCode = localeCode || getGlobalLocale();

    // Try to get cached locale synchronously
    this._locale = getCachedLocale(this._localeCode);

    if (input === null || input === undefined || input === '') {
      this._date = new Date(NaN);
      return;
    }

    // IMSDate instance - clone it
    if (input instanceof IMSDate) {
      this._date = new Date(input._date.getTime());
      this._localeCode = input._localeCode;
      this._locale = input._locale;
      this._isUTC = input._isUTC;
      return;
    }

    // Date object
    if (isDate(input) && !isNaN(input.getTime())) {
      this._date = new Date(input.getTime());
      return;
    }

    // Number (timestamp)
    if (typeof input === 'number') {
      this._date = new Date(input);
      return;
    }

    // String parsing
    if (typeof input === 'string') {
      this._date = this._parseString(input, formatString, strict);
      return;
    }

    this._date = new Date(NaN);
  }

  // ============================================================================
  // Private Parsing
  // ============================================================================

  private _parseString(input: string, formatString?: string, strict?: boolean): Date {
    const isStrict = strict ?? this._config.strictParsing;

    // Try ISO 8601 first
    const isoDate = parseISO(input);
    if (isValid(isoDate)) {
      return isoDate;
    }

    // Try with provided format
    if (formatString) {
      const dateFnsFormat = convertParseFormat(formatString);
      const referenceDate = new Date();
      const locale = this._locale;

      if (isStrict) {
        const parsed = parse(input, dateFnsFormat, referenceDate, { locale });
        if (isValid(parsed)) {
          return parsed;
        }
      } else {
        const parsed = parse(input, dateFnsFormat, referenceDate, { locale });
        if (isValid(parsed)) {
          return parsed;
        }
      }
    }

    // Try native Date parsing
    const nativeDate = new Date(input);
    if (!isNaN(nativeDate.getTime())) {
      if (isStrict) {
        // In strict mode, only accept if format was specified
        return new Date(NaN);
      }
      return nativeDate;
    }

    // Try fallback formats
    if (!isStrict) {
      for (const fmt of FALLBACK_PARSE_FORMATS) {
        const referenceDate = new Date();
        const parsed = parse(input, fmt, referenceDate, { locale: this._locale });
        if (isValid(parsed)) {
          return parsed;
        }
      }
    }

    return new Date(NaN);
  }

  // ============================================================================
  // Clone
  // ============================================================================

  /** Create a clone of this IMSDate */
  clone(): IMSDate {
    return new IMSDate(this);
  }

  // ============================================================================
  // Validation
  // ============================================================================

  /** Check if the date is valid */
  isValid(): boolean {
    return isValid(this._date);
  }

  // ============================================================================
  // Formatting
  // ============================================================================

  /**
   * Format the date using moment.js-compatible format tokens.
   * If no format is provided, uses ISO 8601 format.
   */
  format(formatString?: string): string {
    if (!this.isValid()) return 'Invalid date';

    const momentFmt = formatString || this._config.defaultFormat;
    const dateFnsFmt = convertMomentFormat(momentFmt);

    try {
      return format(this._date, dateFnsFmt, { locale: this._locale });
    } catch {
      return 'Invalid date';
    }
  }

  /** Format as ISO 8601 string */
  toISOString(): string {
    if (!this.isValid()) return 'Invalid date';
    return this._date.toISOString();
  }

  /** Format as locale date string */
  toLocaleString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string {
    if (!this.isValid()) return 'Invalid date';
    return this._date.toLocaleString(locales, options);
  }

  /** Format as locale date string */
  toLocaleDateString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string {
    if (!this.isValid()) return 'Invalid date';
    return this._date.toLocaleDateString(locales, options);
  }

  /** Format as locale time string */
  toLocaleTimeString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string {
    if (!this.isValid()) return 'Invalid date';
    return this._date.toLocaleTimeString(locales, options);
  }

  /** Convert to JSON (ISO string) */
  toJSON(): string {
    return this.toISOString();
  }

  /** Convert to string (ISO format) */
  toString(): string {
    if (!this.isValid()) return 'Invalid date';
    return this._date.toString();
  }

  // ============================================================================
  // Getters
  // ============================================================================

  /** Get the native Date object */
  toDate(): Date {
    return new Date(this._date.getTime());
  }

  /** Get Unix timestamp (seconds) */
  valueOf(): number {
    return this._date.getTime();
  }

  /** Get Unix timestamp (milliseconds) */
  unixMs(): number {
    return this._date.getTime();
  }

  /** Get Unix timestamp (seconds) */
  unix(): number {
    return Math.floor(this._date.getTime() / 1000);
  }

  /** Get year */
  year(): number;
  year(value: number): IMSDate;
  year(value?: number): number | IMSDate {
    if (value === undefined) return getYear(this._date);
    return this._cloneSet(d => setYear(d, value));
  }

  /** Get/set month (0-11) */
  month(): number;
  month(value: number): IMSDate;
  month(value?: number): number | IMSDate {
    if (value === undefined) return getMonth(this._date);
    return this._cloneSet(d => setMonth(d, value));
  }

  /** Get/set day of month (1-31) */
  date(): number;
  date(value: number): IMSDate;
  date(value?: number): number | IMSDate {
    if (value === undefined) return getDate(this._date);
    return this._cloneSet(d => setDateFns(d, value));
  }

  /** Get/set day of week (0=Sunday, 6=Saturday) */
  day(): number;
  day(value: number): IMSDate;
  day(value?: number): number | IMSDate {
    if (value === undefined) return getDay(this._date);
    const currentDay = getDay(this._date);
    const diff = value - currentDay;
    return this._cloneSet(d => addDays(d, diff));
  }

  /** Get/set hour (0-23) */
  hours(): number;
  hours(value: number): IMSDate;
  hours(value?: number): number | IMSDate {
    if (value === undefined) return getHours(this._date);
    return this._cloneSet(d => setHours(d, value));
  }

  /** Get/set minutes (0-59) */
  minutes(): number;
  minutes(value: number): IMSDate;
  minutes(value?: number): number | IMSDate {
    if (value === undefined) return getMinutes(this._date);
    return this._cloneSet(d => setMinutes(d, value));
  }

  /** Get/set seconds (0-59) */
  seconds(): number;
  seconds(value: number): IMSDate;
  seconds(value?: number): number | IMSDate {
    if (value === undefined) return getSeconds(this._date);
    return this._cloneSet(d => setSeconds(d, value));
  }

  /** Get/set milliseconds (0-999) */
  milliseconds(): number;
  milliseconds(value: number): IMSDate;
  milliseconds(value?: number): number | IMSDate {
    if (value === undefined) return getMilliseconds(this._date);
    return this._cloneSet(d => setMilliseconds(d, value));
  }

  /** Get day of year (1-366) */
  dayOfYear(): number;
  dayOfYear(value: number): IMSDate;
  dayOfYear(value?: number): number | IMSDate {
    if (value === undefined) return getDayOfYear(this._date);
    return this._cloneSet(d => setDayOfYear(d, value));
  }

  /** Get ISO week number (1-53) */
  isoWeek(): number {
    return getISOWeek(this._date);
  }

  /** Get locale week number */
  week(): number {
    return getWeek(this._date, { locale: this._locale });
  }

  /** Get quarter (1-4) */
  quarter(): number {
    return getQuarter(this._date);
  }

  /** Get days in current month */
  daysInMonth(): number {
    return daysInMonth(this._date);
  }

  /** Check if the year is a leap year */
  isLeapYear(): boolean {
    return isLeapYear(this._date);
  }

  /** Get the number of days in the current year */
  daysInYear(): number {
    return this.isLeapYear() ? 366 : 365;
  }

  /** Get weeks in current year */
  isoWeeksInYear(): number {
    const dec28 = new Date(getYear(this._date), 11, 28);
    return getISOWeek(dec28) === 1 ? 52 : 53;
  }

  // ============================================================================
  // Set (multiple fields at once)
  // ============================================================================

  /** Set multiple date/time fields at once */
  set(values: IMSManipulationInput): IMSDate {
    let result = new Date(this._date.getTime());

    if (values.years !== undefined) result = setYear(result, values.years);
    if (values.months !== undefined) result = setMonth(result, values.months);
    if (values.quarters !== undefined) result = addQuarters(startOfQuarter(result), values.quarters);
    if (values.weeks !== undefined) result = addWeeks(result, values.weeks - getWeek(result));
    if (values.days !== undefined) result = setDateFns(result, values.days);
    if (values.hours !== undefined) result = setHours(result, values.hours);
    if (values.minutes !== undefined) result = setMinutes(result, values.minutes);
    if (values.seconds !== undefined) result = setSeconds(result, values.seconds);
    if (values.milliseconds !== undefined) result = setMilliseconds(result, values.milliseconds);

    const clone = this.clone();
    clone._date = result;
    return clone;
  }

  /** Get date as plain object */
  toObject(): IMSDateObject {
    return {
      years: getYear(this._date),
      months: getMonth(this._date),
      date: getDate(this._date),
      hours: getHours(this._date),
      minutes: getMinutes(this._date),
      seconds: getSeconds(this._date),
      milliseconds: getMilliseconds(this._date),
    };
  }

  /** Get date as array [year, month, day, hour, minute, second, millisecond] */
  toArray(): number[] {
    return [
      getYear(this._date),
      getMonth(this._date),
      getDate(this._date),
      getHours(this._date),
      getMinutes(this._date),
      getSeconds(this._date),
      getMilliseconds(this._date),
    ];
  }

  // ============================================================================
  // Manipulation - Add
  // ============================================================================

  /**
   * Add time to the date.
   * Returns a new IMSDate (immutable).
   */
  add(value: number, unit: IMSDateUnit): IMSDate;
  add(values: IMSManipulationInput): IMSDate;
  add(value: number | IMSManipulationInput, unit?: IMSDateUnit): IMSDate {
    if (typeof value === 'object') {
      return this._addObject(value);
    }
    const nUnit = normalizeUnit(unit!);
    return this._cloneSet(d => this._addUnit(d, value, nUnit));
  }

  private _addObject(values: IMSManipulationInput): IMSDate {
    let result = new Date(this._date.getTime());

    if (values.years) result = addYears(result, values.years);
    if (values.quarters) result = addQuarters(result, values.quarters);
    if (values.months) result = addMonths(result, values.months);
    if (values.weeks) result = addWeeks(result, values.weeks);
    if (values.days) result = addDays(result, values.days);
    if (values.hours) result = addHours(result, values.hours);
    if (values.minutes) result = addMinutes(result, values.minutes);
    if (values.seconds) result = addSeconds(result, values.seconds);
    if (values.milliseconds) result = addMilliseconds(result, values.milliseconds);

    const clone = this.clone();
    clone._date = result;
    return clone;
  }

  private _addUnit(d: Date, amount: number, unit: IMSDateNormalizedUnit): Date {
    switch (unit) {
      case 'year': return addYears(d, amount);
      case 'month': return addMonths(d, amount);
      case 'week': return addWeeks(d, amount);
      case 'day': return addDays(d, amount);
      case 'hour': return addHours(d, amount);
      case 'minute': return addMinutes(d, amount);
      case 'second': return addSeconds(d, amount);
      case 'millisecond': return addMilliseconds(d, amount);
    }
  }

  // ============================================================================
  // Manipulation - Subtract
  // ============================================================================

  /**
   * Subtract time from the date.
   * Returns a new IMSDate (immutable).
   */
  subtract(value: number, unit: IMSDateUnit): IMSDate;
  subtract(values: IMSManipulationInput): IMSDate;
  subtract(value: number | IMSManipulationInput, unit?: IMSDateUnit): IMSDate {
    if (typeof value === 'object') {
      return this._subtractObject(value);
    }
    const nUnit = normalizeUnit(unit!);
    return this._cloneSet(d => this._subtractUnit(d, value, nUnit));
  }

  private _subtractObject(values: IMSManipulationInput): IMSDate {
    let result = new Date(this._date.getTime());

    if (values.years) result = subYears(result, values.years);
    if (values.quarters) result = subQuarters(result, values.quarters);
    if (values.months) result = subMonths(result, values.months);
    if (values.weeks) result = subWeeks(result, values.weeks);
    if (values.days) result = subDays(result, values.days);
    if (values.hours) result = subHours(result, values.hours);
    if (values.minutes) result = subMinutes(result, values.minutes);
    if (values.seconds) result = subSeconds(result, values.seconds);
    if (values.milliseconds) result = subMilliseconds(result, values.milliseconds);

    const clone = this.clone();
    clone._date = result;
    return clone;
  }

  private _subtractUnit(d: Date, amount: number, unit: IMSDateNormalizedUnit): Date {
    switch (unit) {
      case 'year': return subYears(d, amount);
      case 'month': return subMonths(d, amount);
      case 'week': return subWeeks(d, amount);
      case 'day': return subDays(d, amount);
      case 'hour': return subHours(d, amount);
      case 'minute': return subMinutes(d, amount);
      case 'second': return subSeconds(d, amount);
      case 'millisecond': return subMilliseconds(d, amount);
    }
  }

  // ============================================================================
  // Start Of
  // ============================================================================

  /** Set to the start of a unit of time */
  startOf(unit: IMSStartOfUnit): IMSDate {
    return this._cloneSet(d => {
      switch (unit) {
        case 'year': return startOfYear(d);
        case 'quarter': return startOfQuarter(d);
        case 'month': return startOfMonth(d);
        case 'week': return this._config.isoWeek
          ? startOfISOWeek(d)
          : startOfWeek(d, { locale: this._locale, weekStartsOn: this._config.firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
        case 'isoWeek': return startOfISOWeek(d);
        case 'day': return startOfDay(d);
        case 'date': return startOfDay(d);
        case 'hour': return startOfHour(d);
        case 'minute': return startOfMinute(d);
        case 'second': return startOfSecond(d);
        default: return d;
      }
    });
  }

  // ============================================================================
  // End Of
  // ============================================================================

  /** Set to the end of a unit of time */
  endOf(unit: IMSStartOfUnit): IMSDate {
    return this._cloneSet(d => {
      switch (unit) {
        case 'year': return endOfYear(d);
        case 'quarter': return endOfQuarter(d);
        case 'month': return endOfMonth(d);
        case 'week': return this._config.isoWeek
          ? endOfISOWeek(d)
          : endOfWeek(d, { locale: this._locale, weekStartsOn: this._config.firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
        case 'isoWeek': return endOfISOWeek(d);
        case 'day': return endOfDay(d);
        case 'date': return endOfDay(d);
        case 'hour': return endOfHour(d);
        case 'minute': return endOfMinute(d);
        case 'second': return endOfSecond(d);
        default: return d;
      }
    });
  }

  // ============================================================================
  // Locale
  // ============================================================================

  /** Set locale for this instance */
  locale(code: IMSLocaleCode): IMSDate;
  locale(): IMSLocaleCode;
  locale(code?: IMSLocaleCode): IMSDate | IMSLocaleCode {
    if (code === undefined) return this._localeCode;
    const clone = this.clone();
    clone._localeCode = code;
    clone._locale = getCachedLocale(code);
    return clone;
  }

  /** Set locale asynchronously (loads locale if not cached) */
  async localeAsync(code: IMSLocaleCode): Promise<IMSDate> {
    const localeObj = await getLocale(code);
    const clone = this.clone();
    clone._localeCode = code;
    clone._locale = localeObj;
    return clone;
  }

  // ============================================================================
  // UTC
  // ============================================================================

  /** Get date in UTC mode */
  utc(): IMSDate {
    const clone = this.clone();
    clone._isUTC = true;
    return clone;
  }

  /** Get date in local mode */
  local(): IMSDate {
    const clone = this.clone();
    clone._isUTC = false;
    return clone;
  }

  /** Check if in UTC mode */
  isUTC(): boolean {
    return this._isUTC;
  }

  /** Get UTC offset in minutes */
  utcOffset(): number {
    return -this._date.getTimezoneOffset();
  }

  /** Get timezone offset string */
  formatOffset(): string {
    const offset = this.utcOffset();
    const sign = offset >= 0 ? '+' : '-';
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset / 60);
    const minutes = absOffset % 60;
    return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // ============================================================================
  // Internal Helpers
  // ============================================================================

  /** Clone and set date via a transformer function */
  private _cloneSet(fn: (d: Date) => Date): IMSDate {
    const clone = this.clone();
    clone._date = fn(new Date(this._date.getTime()));
    return clone;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create an IMSDate instance (factory function).
 * This is the primary way to create IMSDate objects, matching moment() API.
 */
export function ims(
  input?: Date | string | number | IMSDate | null | undefined,
  formatString?: string,
  localeCode?: IMSLocaleCode,
  strict?: boolean
): IMSDate {
  return new IMSDate(input, formatString, localeCode, strict);
}

/** Create an IMSDate from a Unix timestamp (seconds) */
export function imsUnix(timestamp: number): IMSDate {
  return new IMSDate(new Date(timestamp * 1000));
}

/** Create an IMSDate in UTC mode */
export function imsUtc(input?: Date | string | number | IMSDate | null | undefined, formatString?: string): IMSDate {
  const d = new IMSDate(input, formatString);
  return d.utc();
}

/** Get current date/time as IMSDate */
export function imsNow(): IMSDate {
  return new IMSDate(new Date());
}

/** Minimum of two IMSDate instances */
export function imsMin(d1: IMSDate, d2: IMSDate): IMSDate {
  return d1.valueOf() < d2.valueOf() ? d1 : d2;
}

/** Maximum of two IMSDate instances */
export function imsMax(d1: IMSDate, d2: IMSDate): IMSDate {
  return d1.valueOf() > d2.valueOf() ? d1 : d2;
}
