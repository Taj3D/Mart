/**
 * IMS Date Utils - Utility Functions
 * Standalone utility functions that don't require IMSDate class
 */

import {
  format,
  parse,
  parseISO,
  isValid,
  isBefore,
  isAfter,
  isEqual,
  isWithinInterval,
  isToday as dateFnsIsToday,
  isTomorrow as dateFnsIsTomorrow,
  isYesterday as dateFnsIsYesterday,
  isWeekend as dateFnsIsWeekend,
  isLeapYear as dateFnsIsLeapYear,
  isPast as dateFnsIsPast,
  isFuture as dateFnsIsFuture,
  differenceInMilliseconds,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  addYears,
  addMonths,
  addWeeks,
  addDays,
  addHours,
  addMinutes,
  addSeconds,
  addMilliseconds,
  startOfYear,
  startOfMonth,
  startOfWeek,
  startOfDay,
  endOfYear,
  endOfMonth,
  endOfWeek,
  endOfDay,
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
  daysInMonth as dateFnsDaysInMonth,
  getISOWeek,
  getWeek,
  getQuarter,
  getDayOfYear,
  nextDay,
  previousDay,
  lastDayOfMonth,
  lastDayOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  eachHourOfInterval,
  eachMinuteOfInterval,
  formatDistance,
  formatDistanceToNow,
  formatDistanceStrict,
  formatDuration as dateFnsFormatDuration,
  max as dateFnsMax,
  min as dateFnsMin,
  closestTo,
  closestIndexTo,
  compareAsc,
  compareDesc,
  areIntervalsOverlapping,
  isDate,
  clamp,
  roundToNearestMinutes,
} from 'date-fns';
import type { Locale } from 'date-fns';
import { convertMomentFormat } from './ims-date';
import type { IMSLocaleCode, IMSStartOfUnit, IMSDateUnit, IMSRelativeTimeStrings } from './types';
import { DEFAULT_RELATIVE_TIME, DEFAULT_RELATIVE_TIME_THRESHOLDS } from './types';

// ============================================================================
// Quick Format Utilities
// ============================================================================

/** Format a date with moment.js-compatible format string */
export function imsFormat(date: Date, formatStr: string, locale?: Locale): string {
  const dateFnsFmt = convertMomentFormat(formatStr);
  return format(date, dateFnsFmt, { locale });
}

/** Format a date as ISO 8601 */
export function imsFormatISO(date: Date): string {
  return date.toISOString();
}

/** Format distance between two dates (e.g., "about 2 hours") */
export function imsFormatDistance(date: Date, baseDate: Date, options?: { locale?: Locale; addSuffix?: boolean }): string {
  return formatDistance(date, baseDate, options);
}

/** Format distance from now (e.g., "about 2 hours ago") */
export function imsFormatDistanceToNow(date: Date, options?: { locale?: Locale; addSuffix?: boolean }): string {
  return formatDistanceToNow(date, options);
}

/** Format distance strictly with specific unit */
export function imsFormatDistanceStrict(date: Date, baseDate: Date, options?: { locale?: Locale; unit?: IMSDateUnit; addSuffix?: boolean }): string {
  return formatDistanceStrict(date, baseDate, options);
}

/** Format a duration object */
export function imsFormatDuration(duration: Duration, options?: { locale?: Locale; format?: string[] }): string {
  return dateFnsFormatDuration(duration, options);
}

// ============================================================================
// Quick Parse Utilities
// ============================================================================

/** Parse a date string with a moment.js format string */
export function imsParse(dateStr: string, formatStr: string, referenceDate?: Date, locale?: Locale): Date {
  const dateFnsFmt = convertMomentFormat(formatStr);
  return parse(dateStr, dateFnsFmt, referenceDate || new Date(), { locale });
}

/** Parse an ISO 8601 date string */
export function imsParseISO(dateStr: string): Date {
  return parseISO(dateStr);
}

/** Check if a date string is valid */
export function imsIsValid(date: Date | string | number): boolean {
  if (isDate(date)) return isValid(date);
  if (typeof date === 'number') return !isNaN(date);
  if (typeof date === 'string') {
    const parsed = parseISO(date);
    if (isValid(parsed)) return true;
    const native = new Date(date);
    return !isNaN(native.getTime());
  }
  return false;
}

// ============================================================================
// Quick Comparison Utilities
// ============================================================================

export function imsIsBefore(date: Date, dateToCompare: Date): boolean {
  return isBefore(date, dateToCompare);
}

export function imsIsAfter(date: Date, dateToCompare: Date): boolean {
  return isAfter(date, dateToCompare);
}

export function imsIsEqual(dateLeft: Date, dateRight: Date): boolean {
  return isEqual(dateLeft, dateRight);
}

export function imsIsWithinInterval(date: Date, interval: { start: Date; end: Date }): boolean {
  try {
    return isWithinInterval(date, interval);
  } catch {
    return false;
  }
}

export function imsIsToday(date: Date): boolean { return dateFnsIsToday(date); }
export function imsIsTomorrow(date: Date): boolean { return dateFnsIsTomorrow(date); }
export function imsIsYesterday(date: Date): boolean { return dateFnsIsYesterday(date); }
export function imsIsWeekend(date: Date): boolean { return dateFnsIsWeekend(date); }
export function imsIsLeapYear(date: Date): boolean { return dateFnsIsLeapYear(date); }
export function imsIsPast(date: Date): boolean { return dateFnsIsPast(date); }
export function imsIsFuture(date: Date): boolean { return dateFnsIsFuture(date); }

// ============================================================================
// Quick Diff Utilities
// ============================================================================

export function imsDiffMs(dateLeft: Date, dateRight: Date): number {
  return differenceInMilliseconds(dateLeft, dateRight);
}

export function imsDiffSeconds(dateLeft: Date, dateRight: Date): number {
  return differenceInSeconds(dateLeft, dateRight);
}

export function imsDiffMinutes(dateLeft: Date, dateRight: Date): number {
  return differenceInMinutes(dateLeft, dateRight);
}

export function imsDiffHours(dateLeft: Date, dateRight: Date): number {
  return differenceInHours(dateLeft, dateRight);
}

export function imsDiffDays(dateLeft: Date, dateRight: Date): number {
  return differenceInDays(dateLeft, dateRight);
}

export function imsDiffWeeks(dateLeft: Date, dateRight: Date): number {
  return differenceInWeeks(dateLeft, dateRight);
}

export function imsDiffMonths(dateLeft: Date, dateRight: Date): number {
  return differenceInMonths(dateLeft, dateRight);
}

export function imsDiffYears(dateLeft: Date, dateRight: Date): number {
  return differenceInYears(dateLeft, dateRight);
}

// ============================================================================
// Quick Manipulation Utilities
// ============================================================================

export function imsAddYears(date: Date, amount: number): Date { return addYears(date, amount); }
export function imsAddMonths(date: Date, amount: number): Date { return addMonths(date, amount); }
export function imsAddWeeks(date: Date, amount: number): Date { return addWeeks(date, amount); }
export function imsAddDays(date: Date, amount: number): Date { return addDays(date, amount); }
export function imsAddHours(date: Date, amount: number): Date { return addHours(date, amount); }
export function imsAddMinutes(date: Date, amount: number): Date { return addMinutes(date, amount); }
export function imsAddSeconds(date: Date, amount: number): Date { return addSeconds(date, amount); }
export function imsAddMilliseconds(date: Date, amount: number): Date { return addMilliseconds(date, amount); }

export function imsSubYears(date: Date, amount: number): Date { return addYears(date, -amount); }
export function imsSubMonths(date: Date, amount: number): Date { return addMonths(date, -amount); }
export function imsSubWeeks(date: Date, amount: number): Date { return addWeeks(date, -amount); }
export function imsSubDays(date: Date, amount: number): Date { return addDays(date, -amount); }
export function imsSubHours(date: Date, amount: number): Date { return addHours(date, -amount); }
export function imsSubMinutes(date: Date, amount: number): Date { return addMinutes(date, -amount); }
export function imsSubSeconds(date: Date, amount: number): Date { return addSeconds(date, -amount); }
export function imsSubMilliseconds(date: Date, amount: number): Date { return addMilliseconds(date, -amount); }

// ============================================================================
// Quick Start/End Of Utilities
// ============================================================================

export function imsStartOfYear(date: Date): Date { return startOfYear(date); }
export function imsStartOfMonth(date: Date): Date { return startOfMonth(date); }
export function imsStartOfWeek(date: Date, locale?: Locale): Date { return startOfWeek(date, { locale }); }
export function imsStartOfDay(date: Date): Date { return startOfDay(date); }

export function imsEndOfYear(date: Date): Date { return endOfYear(date); }
export function imsEndOfMonth(date: Date): Date { return endOfMonth(date); }
export function imsEndOfWeek(date: Date, locale?: Locale): Date { return endOfWeek(date, { locale }); }
export function imsEndOfDay(date: Date): Date { return endOfDay(date); }

// ============================================================================
// Quick Get/Set Utilities
// ============================================================================

export function imsGetYear(date: Date): number { return getYear(date); }
export function imsGetMonth(date: Date): number { return getMonth(date); }
export function imsGetDate(date: Date): number { return getDate(date); }
export function imsGetDay(date: Date): number { return getDay(date); }
export function imsGetHours(date: Date): number { return getHours(date); }
export function imsGetMinutes(date: Date): number { return getMinutes(date); }
export function imsGetSeconds(date: Date): number { return getSeconds(date); }
export function imsGetMilliseconds(date: Date): number { return getMilliseconds(date); }
export function imsGetISOWeek(date: Date): number { return getISOWeek(date); }
export function imsGetWeek(date: Date, locale?: Locale): number { return getWeek(date, { locale }); }
export function imsGetQuarter(date: Date): number { return getQuarter(date); }
export function imsGetDayOfYear(date: Date): number { return getDayOfYear(date); }
export function imsDaysInMonth(date: Date): number { return dateFnsDaysInMonth(date); }

export function imsSetYear(date: Date, year: number): Date { return setYear(date, year); }
export function imsSetMonth(date: Date, month: number): Date { return setMonth(date, month); }
export function imsSetDate(date: Date, day: number): Date { return setDateFns(date, day); }
export function imsSetHours(date: Date, hours: number): Date { return setHours(date, hours); }
export function imsSetMinutes(date: Date, minutes: number): Date { return setMinutes(date, minutes); }
export function imsSetSeconds(date: Date, seconds: number): Date { return setSeconds(date, seconds); }
export function imsSetMilliseconds(date: Date, ms: number): Date { return setMilliseconds(date, ms); }

// ============================================================================
// Range/Interval Utilities
// ============================================================================

export function imsEachDay(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end });
}

export function imsEachWeek(start: Date, end: Date, locale?: Locale): Date[] {
  return eachWeekOfInterval({ start, end }, { locale });
}

export function imsEachMonth(start: Date, end: Date): Date[] {
  return eachMonthOfInterval({ start, end });
}

export function imsEachYear(start: Date, end: Date): Date[] {
  return eachYearOfInterval({ start, end });
}

export function imsEachHour(start: Date, end: Date): Date[] {
  return eachHourOfInterval({ start, end });
}

export function imsEachMinute(start: Date, end: Date): Date[] {
  return eachMinuteOfInterval({ start, end });
}

// ============================================================================
// Comparison Utilities
// ============================================================================

export function imsMax(dates: Date[]): Date {
  return dateFnsMax(dates);
}

export function imsMin(dates: Date[]): Date {
  return dateFnsMin(dates);
}

export function imsClosestTo(dateToCompare: Date, dates: Date[]): Date {
  return closestTo(dateToCompare, dates);
}

export function imsClosestIndexTo(dateToCompare: Date, dates: Date[]): number {
  return closestIndexTo(dateToCompare, dates);
}

export function imsCompareAsc(dateLeft: Date, dateRight: Date): number {
  return compareAsc(dateLeft, dateRight);
}

export function imsCompareDesc(dateLeft: Date, dateRight: Date): number {
  return compareDesc(dateLeft, dateRight);
}

export function imsAreIntervalsOverlapping(
  intervalLeft: { start: Date; end: Date },
  intervalRight: { start: Date; end: Date }
): boolean {
  return areIntervalsOverlapping(intervalLeft, intervalRight);
}

// ============================================================================
// Other Utilities
// ============================================================================

export function imsNextDay(date: Date, day: number): Date {
  return nextDay(date, day);
}

export function imsPreviousDay(date: Date, day: number): Date {
  return previousDay(date, day);
}

export function imsLastDayOfMonth(date: Date): Date {
  return lastDayOfMonth(date);
}

export function imsLastDayOfYear(date: Date): Date {
  return lastDayOfYear(date);
}

export function imsClamp(date: Date, interval: { start: Date; end: Date }): Date {
  return clamp(date, interval);
}

export function imsRoundToNearestMinutes(date: Date, options?: { nearestTo?: number }): Date {
  return roundToNearestMinutes(date, options);
}

// ============================================================================
// Moment.js Compatibility Shims
// ============================================================================

/**
 * Convert a moment.js format string to date-fns format string.
 * This is the most commonly needed utility for migration.
 */
export { convertMomentFormat } from './ims-date';

/**
 * Create a relative time string for a date.
 * Uses moment.js-compatible thresholds.
 */
export function imsFromNow(date: Date, withoutSuffix?: boolean): string {
  const now = new Date();
  const isFuture = date.getTime() > now.getTime();
  const diffMs = date.getTime() - now.getTime();
  const absDiffMs = Math.abs(diffMs);
  const absDiffSeconds = Math.round(absDiffMs / 1000);
  const absDiffMinutes = Math.round(absDiffSeconds / 60);
  const absDiffHours = Math.round(absDiffMinutes / 60);
  const absDiffDays = Math.round(absDiffHours / 24);
  const absDiffMonths = Math.round(absDiffDays / 30.44);
  const absDiffYears = Math.round(absDiffDays / 365.25);

  const strings = DEFAULT_RELATIVE_TIME;
  const thresholds = DEFAULT_RELATIVE_TIME_THRESHOLDS;

  let result: string;

  if (absDiffSeconds <= thresholds.ss) {
    result = strings.s;
  } else if (absDiffSeconds < thresholds.s) {
    result = strings.ss.replace('%d', String(absDiffSeconds));
  } else if (absDiffMinutes < thresholds.m) {
    result = absDiffMinutes === 1 ? strings.m : strings.mm.replace('%d', String(absDiffMinutes));
  } else if (absDiffHours < thresholds.h) {
    result = absDiffHours === 1 ? strings.h : strings.hh.replace('%d', String(absDiffHours));
  } else if (absDiffDays < thresholds.d) {
    result = absDiffDays === 1 ? strings.d : strings.dd.replace('%d', String(absDiffDays));
  } else if (absDiffMonths < thresholds.M) {
    result = absDiffMonths === 1 ? strings.M : strings.MM.replace('%d', String(absDiffMonths));
  } else {
    result = absDiffYears === 1 ? strings.y : strings.yy.replace('%d', String(absDiffYears));
  }

  if (withoutSuffix) return result;
  return isFuture ? strings.future.replace('%s', result) : strings.past.replace('%s', result);
}

/**
 * Format a calendar string for a date relative to now.
 * Matches moment.js .calendar() behavior.
 */
export function imsCalendar(date: Date, formats?: {
  sameDay?: string;
  nextDay?: string;
  nextWeek?: string;
  lastDay?: string;
  lastWeek?: string;
  sameElse?: string;
}): string {
  const now = new Date();
  const today = startOfDay(now);
  const target = startOfDay(date);
  const diffDays = differenceInDays(target, today);

  let formatStr: string;

  if (diffDays === 0) formatStr = formats?.sameDay || '[Today at] h:mm A';
  else if (diffDays === 1) formatStr = formats?.nextDay || '[Tomorrow at] h:mm A';
  else if (diffDays > 1 && diffDays < 7) formatStr = formats?.nextWeek || 'dddd [at] h:mm A';
  else if (diffDays === -1) formatStr = formats?.lastDay || '[Yesterday at] h:mm A';
  else if (diffDays < -1 && diffDays > -7) formatStr = formats?.lastWeek || '[Last] dddd [at] h:mm A';
  else formatStr = formats?.sameElse || 'MM/DD/YYYY';

  return imsFormat(date, formatStr);
}
