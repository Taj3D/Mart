/**
 * IMS Date Utils - IMSDate Extended Methods
 * Part 2: Query methods, Diff, Relative Time, Calendar, Duration
 */

import {
  differenceInMilliseconds,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInCalendarYears,
  differenceInBusinessDays,
  isBefore,
  isAfter,
  isEqual,
  isSameDay,
  isSameMonth,
  isSameYear,
  isSameHour,
  isSameMinute,
  isSameSecond,
  isSameWeek,
  isSameISOWeek,
  isWithinInterval,
  isPast,
  isFuture,
  isToday,
  isTomorrow,
  isYesterday,
  isWeekend,
  isSunday,
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  isSaturday,
  formatDistance,
  formatDistanceToNow,
  formatDistanceStrict,
} from 'date-fns';
import type { IMSDateUnit, IMSStartOfUnit, IMSLocaleCode, IMSRelativeTimeStrings, IMSCalendarFormats, IMSDurationInput } from './types';
import { DEFAULT_RELATIVE_TIME, DEFAULT_CALENDAR_FORMATS, DEFAULT_RELATIVE_TIME_THRESHOLDS, isIMSInvalidDate } from './types';
import { IMSDate, ims, normalizeUnit } from './ims-date';
import { getCachedLocale } from './locale';

// ============================================================================
// Extend IMSDate prototype with query & comparison methods
// ============================================================================

// We need to add methods to IMSDate. Since TypeScript doesn't allow
// partial class extensions easily, we'll use a helper approach.

declare module './ims-date' {
  interface IMSDate {
    // Query methods
    isBefore(compare: Date | IMSDate | string, unit?: IMSStartOfUnit): boolean;
    isAfter(compare: Date | IMSDate | string, unit?: IMSStartOfUnit): boolean;
    isSame(compare: Date | IMSDate | string, unit?: IMSStartOfUnit): boolean;
    isBetween(from: Date | IMSDate | string, to: Date | IMSDate | string, unit?: IMSStartOfUnit, inclusivity?: '()' | '[)' | '(]' | '[]'): boolean;
    isSameOrBefore(compare: Date | IMSDate | string, unit?: IMSStartOfUnit): boolean;
    isSameOrAfter(compare: Date | IMSDate | string, unit?: IMSStartOfUnit): boolean;
    isToday(): boolean;
    isTomorrow(): boolean;
    isYesterday(): boolean;
    isPast(): boolean;
    isFuture(): boolean;
    isWeekend(): boolean;
    isLeapYear(): boolean;
    isDST(): boolean;

    // Diff methods
    diff(compare: Date | IMSDate | string, unit?: IMSDateUnit, floating?: boolean): number;
    diffMs(compare: Date | IMSDate | string): number;
    diffSeconds(compare: Date | IMSDate | string): number;
    diffMinutes(compare: Date | IMSDate | string): number;
    diffHours(compare: Date | IMSDate | string): number;
    diffDays(compare: Date | IMSDate | string): number;
    diffWeeks(compare: Date | IMSDate | string): number;
    diffMonths(compare: Date | IMSDate | string): number;
    diffYears(compare: Date | IMSDate | string): number;
    diffCalendarDays(compare: Date | IMSDate | string): number;
    diffCalendarMonths(compare: Date | IMSDate | string): number;
    diffCalendarWeeks(compare: Date | IMSDate | string): number;
    diffCalendarYears(compare: Date | IMSDate | string): number;
    diffBusinessDays(compare: Date | IMSDate | string): number;

    // Relative time
    fromNow(withoutSuffix?: boolean): string;
    toNow(withoutSuffix?: boolean): string;
    from(compare: Date | IMSDate | string, withoutSuffix?: boolean): string;
    to(compare: Date | IMSDate | string, withoutSuffix?: boolean): string;
    humanize(withoutSuffix?: boolean): string;

    // Calendar
    calendar(refTime?: Date | IMSDate | string, formats?: Partial<IMSCalendarFormats>): string;

    // Days
    dayOfWeek(): number; // 0=Sun, 6=Sat
    isoWeekday(): number; // 1=Mon, 7=Sun
  }
}

// ============================================================================
// Helper: Resolve input to Date
// ============================================================================

function toDate(input: Date | IMSDate | string): Date {
  if (input instanceof IMSDate) return input.toDate();
  if (input instanceof Date) return input;
  return new IMSDate(input).toDate();
}

function toIMSDate(input: Date | IMSDate | string): IMSDate {
  if (input instanceof IMSDate) return input;
  return ims(input instanceof Date ? input : input);
}

// ============================================================================
// Query Methods Implementation
// ============================================================================

IMSDate.prototype.isBefore = function(compare: Date | IMSDate | string, unit?: IMSStartOfUnit): boolean {
  if (!this.isValid()) return false;
  const cmpDate = toDate(compare);
  if (isNaN(cmpDate.getTime())) return false;

  if (!unit || unit === 'millisecond') {
    return isBefore(this.toDate(), cmpDate);
  }

  const thisStart = this.startOf(unit);
  const cmpStart = toIMSDate(compare).startOf(unit);
  return isBefore(thisStart.toDate(), cmpStart.toDate());
};

IMSDate.prototype.isAfter = function(compare: Date | IMSDate | string, unit?: IMSStartOfUnit): boolean {
  if (!this.isValid()) return false;
  const cmpDate = toDate(compare);
  if (isNaN(cmpDate.getTime())) return false;

  if (!unit || unit === 'millisecond') {
    return isAfter(this.toDate(), cmpDate);
  }

  const thisStart = this.startOf(unit);
  const cmpStart = toIMSDate(compare).startOf(unit);
  return isAfter(thisStart.toDate(), cmpStart.toDate());
};

IMSDate.prototype.isSame = function(compare: Date | IMSDate | string, unit?: IMSStartOfUnit): boolean {
  if (!this.isValid()) return false;
  const cmpDate = toDate(compare);
  if (isNaN(cmpDate.getTime())) return false;

  if (!unit || unit === 'millisecond') {
    return isEqual(this.toDate(), cmpDate);
  }

  const thisDate = this.toDate();
  const locale = (this as unknown as { _locale: unknown })._locale as Parameters<typeof isSameWeek>[1] extends object ? Parameters<typeof isSameWeek>[1] : undefined;

  switch (unit) {
    case 'year': return isSameYear(thisDate, cmpDate);
    case 'month': return isSameMonth(thisDate, cmpDate);
    case 'day': case 'date': return isSameDay(thisDate, cmpDate);
    case 'hour': return isSameHour(thisDate, cmpDate);
    case 'minute': return isSameMinute(thisDate, cmpDate);
    case 'second': return isSameSecond(thisDate, cmpDate);
    case 'week': return isSameWeek(thisDate, cmpDate, { locale });
    case 'isoWeek': return isSameISOWeek(thisDate, cmpDate);
    case 'quarter': return isSameYear(thisDate, cmpDate) && getQuarterEq(thisDate, cmpDate);
    default: return isEqual(thisDate, cmpDate);
  }
};

function getQuarterEq(a: Date, b: Date): boolean {
  const qa = Math.floor(a.getMonth() / 3);
  const qb = Math.floor(b.getMonth() / 3);
  return qa === qb;
}

IMSDate.prototype.isBetween = function(
  from: Date | IMSDate | string,
  to: Date | IMSDate | string,
  unit?: IMSStartOfUnit,
  inclusivity: '()' | '[)' | '(]' | '[]' = '()'
): boolean {
  if (!this.isValid()) return false;
  const fromDate = unit ? toIMSDate(from).startOf(unit).toDate() : toDate(from);
  const toDate2 = unit ? toIMSDate(to).startOf(unit).toDate() : toDate(to);
  const thisDate = unit ? this.startOf(unit!).toDate() : this.toDate();

  if (isNaN(fromDate.getTime()) || isNaN(toDate2.getTime())) return false;

  try {
    switch (inclusivity) {
      case '()': return isWithinInterval(thisDate, { start: fromDate, end: toDate2 }) && !isEqual(thisDate, fromDate) && !isEqual(thisDate, toDate2);
      case '[)': return isAfter(thisDate, fromDate) || isEqual(thisDate, fromDate) ? isBefore(thisDate, toDate2) : false;
      case '(]': return isBefore(thisDate, toDate2) || isEqual(thisDate, toDate2) ? isAfter(thisDate, fromDate) : false;
      case '[]': return isWithinInterval(thisDate, { start: fromDate, end: toDate2 });
      default: return isWithinInterval(thisDate, { start: fromDate, end: toDate2 });
    }
  } catch {
    return false;
  }
};

IMSDate.prototype.isSameOrBefore = function(compare: Date | IMSDate | string, unit?: IMSStartOfUnit): boolean {
  return this.isSame(compare, unit) || this.isBefore(compare, unit);
};

IMSDate.prototype.isSameOrAfter = function(compare: Date | IMSDate | string, unit?: IMSStartOfUnit): boolean {
  return this.isSame(compare, unit) || this.isAfter(compare, unit);
};

IMSDate.prototype.isToday = function(): boolean {
  if (!this.isValid()) return false;
  return isToday(this.toDate());
};

IMSDate.prototype.isTomorrow = function(): boolean {
  if (!this.isValid()) return false;
  return isTomorrow(this.toDate());
};

IMSDate.prototype.isYesterday = function(): boolean {
  if (!this.isValid()) return false;
  return isYesterday(this.toDate());
};

IMSDate.prototype.isPast = function(): boolean {
  if (!this.isValid()) return false;
  return isPast(this.toDate());
};

IMSDate.prototype.isFuture = function(): boolean {
  if (!this.isValid()) return false;
  return isFuture(this.toDate());
};

IMSDate.prototype.isWeekend = function(): boolean {
  if (!this.isValid()) return false;
  return isWeekend(this.toDate());
};

IMSDate.prototype.isDST = function(): boolean {
  if (!this.isValid()) return false;
  const d = this.toDate();
  const jan = new Date(d.getFullYear(), 0, 1);
  const jul = new Date(d.getFullYear(), 6, 1);
  const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  return d.getTimezoneOffset() < stdOffset;
};

// ============================================================================
// Day of Week
// ============================================================================

IMSDate.prototype.dayOfWeek = function(): number {
  return this.toDate().getDay();
};

IMSDate.prototype.isoWeekday = function(): number {
  const day = this.toDate().getDay();
  return day === 0 ? 7 : day;
};

// ============================================================================
// Diff Methods
// ============================================================================

IMSDate.prototype.diff = function(
  compare: Date | IMSDate | string,
  unit?: IMSDateUnit,
  floating?: boolean
): number {
  if (!this.isValid()) return NaN;
  const cmpDate = toDate(compare);
  if (isNaN(cmpDate.getTime())) return NaN;

  const nUnit = unit ? normalizeUnit(unit) : 'millisecond';

  switch (nUnit) {
    case 'millisecond': return differenceInMilliseconds(this.toDate(), cmpDate);
    case 'second': return differenceInSeconds(this.toDate(), cmpDate);
    case 'minute': return differenceInMinutes(this.toDate(), cmpDate);
    case 'hour': return differenceInHours(this.toDate(), cmpDate);
    case 'day': return differenceInDays(this.toDate(), cmpDate);
    case 'week': return differenceInWeeks(this.toDate(), cmpDate);
    case 'month': return differenceInMonths(this.toDate(), cmpDate);
    case 'year': return differenceInYears(this.toDate(), cmpDate);
    default: return differenceInMilliseconds(this.toDate(), cmpDate);
  }
};

IMSDate.prototype.diffMs = function(compare: Date | IMSDate | string): number {
  return this.diff(compare, 'ms');
};

IMSDate.prototype.diffSeconds = function(compare: Date | IMSDate | string): number {
  return this.diff(compare, 's');
};

IMSDate.prototype.diffMinutes = function(compare: Date | IMSDate | string): number {
  return this.diff(compare, 'm');
};

IMSDate.prototype.diffHours = function(compare: Date | IMSDate | string): number {
  return this.diff(compare, 'h');
};

IMSDate.prototype.diffDays = function(compare: Date | IMSDate | string): number {
  return this.diff(compare, 'd');
};

IMSDate.prototype.diffWeeks = function(compare: Date | IMSDate | string): number {
  return this.diff(compare, 'w');
};

IMSDate.prototype.diffMonths = function(compare: Date | IMSDate | string): number {
  return this.diff(compare, 'M');
};

IMSDate.prototype.diffYears = function(compare: Date | IMSDate | string): number {
  return this.diff(compare, 'y');
};

IMSDate.prototype.diffCalendarDays = function(compare: Date | IMSDate | string): number {
  return differenceInCalendarDays(this.toDate(), toDate(compare));
};

IMSDate.prototype.diffCalendarMonths = function(compare: Date | IMSDate | string): number {
  return differenceInCalendarMonths(this.toDate(), toDate(compare));
};

IMSDate.prototype.diffCalendarWeeks = function(compare: Date | IMSDate | string): number {
  return differenceInCalendarWeeks(this.toDate(), toDate(compare));
};

IMSDate.prototype.diffCalendarYears = function(compare: Date | IMSDate | string): number {
  return differenceInCalendarYears(this.toDate(), toDate(compare));
};

IMSDate.prototype.diffBusinessDays = function(compare: Date | IMSDate | string): number {
  return differenceInBusinessDays(this.toDate(), toDate(compare));
};

// ============================================================================
// Relative Time (fromNow, toNow, from, to)
// ============================================================================

/**
 * Compute relative time string with moment.js-compatible thresholds.
 * Uses date-fns formatDistance under the hood but applies moment.js thresholds.
 */
function computeRelativeTime(
  date: Date,
  baseDate: Date,
  withoutSuffix: boolean,
  isFuture: boolean,
  strings: IMSRelativeTimeStrings,
  thresholds = DEFAULT_RELATIVE_TIME_THRESHOLDS
): string {
  const diffMs = date.getTime() - baseDate.getTime();
  const absDiffMs = Math.abs(diffMs);
  const absDiffSeconds = Math.round(absDiffMs / 1000);
  const absDiffMinutes = Math.round(absDiffSeconds / 60);
  const absDiffHours = Math.round(absDiffMinutes / 60);
  const absDiffDays = Math.round(absDiffHours / 24);
  const absDiffWeeks = Math.round(absDiffDays / 7);
  const absDiffMonths = Math.round(absDiffDays / 30.44);
  const absDiffYears = Math.round(absDiffDays / 365.25);

  let result: string;

  if (absDiffSeconds <= thresholds.ss) {
    // A few seconds
    result = strings.s;
  } else if (absDiffSeconds < thresholds.s) {
    // N seconds
    result = strings.ss.replace('%d', String(absDiffSeconds));
  } else if (absDiffMinutes < thresholds.m) {
    // N minutes
    result = absDiffMinutes === 1 ? strings.m : strings.mm.replace('%d', String(absDiffMinutes));
  } else if (absDiffHours < thresholds.h) {
    // N hours
    result = absDiffHours === 1 ? strings.h : strings.hh.replace('%d', String(absDiffHours));
  } else if (absDiffDays < thresholds.d) {
    // N days
    result = absDiffDays === 1 ? strings.d : strings.dd.replace('%d', String(absDiffDays));
  } else if (absDiffWeeks < thresholds.w) {
    // N weeks
    result = absDiffWeeks === 1 ? strings.w : strings.ww.replace('%d', String(absDiffWeeks));
  } else if (absDiffMonths < thresholds.M) {
    // N months
    result = absDiffMonths === 1 ? strings.M : strings.MM.replace('%d', String(absDiffMonths));
  } else {
    // N years
    result = absDiffYears === 1 ? strings.y : strings.yy.replace('%d', String(absDiffYears));
  }

  if (withoutSuffix) return result;
  return isFuture ? strings.future.replace('%s', result) : strings.past.replace('%s', result);
}

IMSDate.prototype.fromNow = function(withoutSuffix?: boolean): string {
  if (!this.isValid()) return 'Invalid date';
  const now = new Date();
  const isFuture = this.toDate().getTime() > now.getTime();
  return computeRelativeTime(this.toDate(), now, !!withoutSuffix, isFuture, DEFAULT_RELATIVE_TIME);
};

IMSDate.prototype.toNow = function(withoutSuffix?: boolean): string {
  if (!this.isValid()) return 'Invalid date';
  const now = new Date();
  const isFuture = now.getTime() > this.toDate().getTime();
  return computeRelativeTime(now, this.toDate(), !!withoutSuffix, isFuture, DEFAULT_RELATIVE_TIME);
};

IMSDate.prototype.from = function(compare: Date | IMSDate | string, withoutSuffix?: boolean): string {
  if (!this.isValid()) return 'Invalid date';
  const cmpDate = toDate(compare);
  const isFuture = this.toDate().getTime() > cmpDate.getTime();
  return computeRelativeTime(this.toDate(), cmpDate, !!withoutSuffix, isFuture, DEFAULT_RELATIVE_TIME);
};

IMSDate.prototype.to = function(compare: Date | IMSDate | string, withoutSuffix?: boolean): string {
  if (!this.isValid()) return 'Invalid date';
  const cmpDate = toDate(compare);
  const isFuture = cmpDate.getTime() > this.toDate().getTime();
  return computeRelativeTime(cmpDate, this.toDate(), !!withoutSuffix, isFuture, DEFAULT_RELATIVE_TIME);
};

IMSDate.prototype.humanize = function(withoutSuffix?: boolean): string {
  return this.fromNow(withoutSuffix);
};

// ============================================================================
// Calendar
// ============================================================================

IMSDate.prototype.calendar = function(
  refTime?: Date | IMSDate | string,
  formats?: Partial<IMSCalendarFormats>
): string {
  if (!this.isValid()) return 'Invalid date';

  const ref = refTime ? toIMSDate(refTime) : ims(new Date());
  if (!ref.isValid()) return 'Invalid date';

  const mergedFormats: IMSCalendarFormats = {
    ...DEFAULT_CALENDAR_FORMATS,
    ...formats,
  };

  const thisDay = this.startOf('day');
  const refDay = ref.startOf('day');
  const diffDays = thisDay.diffCalendarDays(refDay.toDate());

  let formatStr: string;

  if (diffDays === 0) {
    formatStr = mergedFormats.sameDay;
  } else if (diffDays === 1) {
    formatStr = mergedFormats.nextDay;
  } else if (diffDays > 1 && diffDays < 7) {
    formatStr = mergedFormats.nextWeek;
  } else if (diffDays === -1) {
    formatStr = mergedFormats.lastDay;
  } else if (diffDays < -1 && diffDays > -7) {
    formatStr = mergedFormats.lastWeek;
  } else {
    formatStr = mergedFormats.sameElse;
  }

  return this.format(formatStr);
};

// ============================================================================
// Duration Class
// ============================================================================

/**
 * IMSDuration - Duration representation matching moment.duration()
 */
export class IMSDuration {
  private _milliseconds: number;
  private _days: number;
  private _months: number;
  private _years: number;

  constructor(input: IMSDurationInput | number | string, unit?: IMSDateUnit) {
    if (typeof input === 'string') {
      // Parse ISO 8601 duration: P1Y2M3DT4H5M6S
      const parsed = parseISODuration(input);
      this._milliseconds = parsed.milliseconds || 0;
      this._days = parsed.days || 0;
      this._months = parsed.months || 0;
      this._years = parsed.years || 0;
      this._milliseconds += (parsed.hours || 0) * 3600000;
      this._milliseconds += (parsed.minutes || 0) * 60000;
      this._milliseconds += (parsed.seconds || 0) * 1000;
      this._days += (parsed.weeks || 0) * 7;
    } else if (typeof input === 'number') {
      const nUnit = unit ? normalizeUnit(unit) : 'millisecond';
      this._years = nUnit === 'year' ? input : 0;
      this._months = nUnit === 'month' ? input : 0;
      this._days = nUnit === 'week' ? input * 7 : nUnit === 'day' ? input : 0;
      this._milliseconds = nUnit === 'hour' ? input * 3600000
        : nUnit === 'minute' ? input * 60000
        : nUnit === 'second' ? input * 1000
        : nUnit === 'millisecond' ? input : 0;
    } else {
      // Object input
      this._years = input.years || 0;
      this._months = input.months || 0;
      this._days = (input.weeks || 0) * 7 + (input.days || 0);
      this._milliseconds = (input.hours || 0) * 3600000
        + (input.minutes || 0) * 60000
        + (input.seconds || 0) * 1000
        + (input.milliseconds || 0);
    }
  }

  /** Total milliseconds */
  asMilliseconds(): number {
    return this._milliseconds
      + this._days * 86400000
      + this._months * 30.44 * 86400000
      + this._years * 365.25 * 86400000;
  }

  /** Total seconds */
  asSeconds(): number {
    return this.asMilliseconds() / 1000;
  }

  /** Total minutes */
  asMinutes(): number {
    return this.asMilliseconds() / 60000;
  }

  /** Total hours */
  asHours(): number {
    return this.asMilliseconds() / 3600000;
  }

  /** Total days */
  asDays(): number {
    return this.asMilliseconds() / 86400000;
  }

  /** Total weeks */
  asWeeks(): number {
    return this.asMilliseconds() / 604800000;
  }

  /** Total months (approximate) */
  asMonths(): number {
    return this.asDays() / 30.44;
  }

  /** Total years (approximate) */
  asYears(): number {
    return this.asDays() / 365.25;
  }

  /** Milliseconds component (0-999) */
  milliseconds(): number {
    return Math.floor(this._milliseconds % 1000);
  }

  /** Seconds component (0-59) */
  seconds(): number {
    return Math.floor((this._milliseconds / 1000) % 60);
  }

  /** Minutes component (0-59) */
  minutes(): number {
    return Math.floor((this._milliseconds / 60000) % 60);
  }

  /** Hours component (0-23) */
  hours(): number {
    return Math.floor(this._milliseconds / 3600000);
  }

  /** Days component */
  days(): number {
    return this._days;
  }

  /** Months component */
  months(): number {
    return this._months;
  }

  /** Years component */
  years(): number {
    return this._years;
  }

  /** Humanized duration string */
  humanize(withSuffix?: boolean): string {
    const ms = this.asMilliseconds();
    const absMs = Math.abs(ms);
    const suffix = withSuffix ? (ms >= 0 ? 'from now' : 'ago') : '';

    let result: string;

    if (absMs < 45000) {
      result = 'a few seconds';
    } else if (absMs < 90000) {
      result = 'a minute';
    } else if (absMs < 2700000) {
      result = `${Math.round(absMs / 60000)} minutes`;
    } else if (absMs < 5400000) {
      result = 'an hour';
    } else if (absMs < 79200000) {
      result = `${Math.round(absMs / 3600000)} hours`;
    } else if (absMs < 151200000) {
      result = 'a day';
    } else if (absMs < 2268000000) {
      result = `${Math.round(absMs / 86400000)} days`;
    } else if (absMs < 3888000000) {
      result = 'a month';
    } else if (absMs < 27560000000) {
      result = `${Math.round(absMs / 2592000000)} months`;
    } else if (absMs < 47304000000) {
      result = 'a year';
    } else {
      result = `${Math.round(absMs / 31557600000)} years`;
    }

    return suffix ? `${result} ${suffix}` : result;
  }

  /** Format as ISO 8601 duration string */
  toISOString(): string {
    const parts: string[] = ['P'];

    if (this._years) parts.push(`${this._years}Y`);
    if (this._months) parts.push(`${this._months}M`);
    if (this._days) parts.push(`${this._days}D`);

    const totalMs = this._milliseconds;
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const ms = Math.floor(totalMs % 1000);

    if (hours || minutes || seconds || ms) {
      parts.push('T');
      if (hours) parts.push(`${hours}H`);
      if (minutes) parts.push(`${minutes}M`);
      if (seconds || ms) {
        if (ms) {
          parts.push(`${seconds}.${String(ms).padStart(3, '0')}S`);
        } else {
          parts.push(`${seconds}S`);
        }
      }
    }

    // Minimal ISO duration
    if (parts.length === 1) parts.push('0D');

    return parts.join('');
  }

  /** Format as JSON */
  toJSON(): string {
    return this.toISOString();
  }

  /** Add to duration */
  add(input: IMSDurationInput | number | string, unit?: IMSDateUnit): IMSDuration {
    const other = new IMSDuration(input, unit);
    const totalMs = this.asMilliseconds() + other.asMilliseconds();
    return new IMSDuration({ milliseconds: totalMs });
  }

  /** Subtract from duration */
  subtract(input: IMSDurationInput | number | string, unit?: IMSDateUnit): IMSDuration {
    const other = new IMSDuration(input, unit);
    const totalMs = this.asMilliseconds() - other.asMilliseconds();
    return new IMSDuration({ milliseconds: totalMs });
  }

  /** Check if duration is zero */
  isZero(): boolean {
    return this.asMilliseconds() === 0;
  }

  /** Get plain object representation */
  toObject(): IMSDurationInput {
    return {
      years: this._years,
      months: this._months,
      weeks: Math.floor(this._days / 7),
      days: this._days % 7,
      hours: Math.floor(this._milliseconds / 3600000),
      minutes: Math.floor((this._milliseconds % 3600000) / 60000),
      seconds: Math.floor((this._milliseconds % 60000) / 1000),
      milliseconds: Math.floor(this._milliseconds % 1000),
    };
  }
}

// ============================================================================
// ISO 8601 Duration Parser
// ============================================================================

function parseISODuration(iso: string): IMSDurationInput {
  const match = iso.match(/^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/);
  if (!match) return {};

  return {
    years: match[1] ? parseInt(match[1], 10) : 0,
    months: match[2] ? parseInt(match[2], 10) : 0,
    weeks: match[3] ? parseInt(match[3], 10) : 0,
    days: match[4] ? parseInt(match[4], 10) : 0,
    hours: match[5] ? parseInt(match[5], 10) : 0,
    minutes: match[6] ? parseInt(match[6], 10) : 0,
    seconds: match[7] ? parseFloat(match[7]) : 0,
  };
}

// ============================================================================
// Duration Factory
// ============================================================================

/** Create a duration matching moment.duration() */
export function imsDuration(input: IMSDurationInput | number | string, unit?: IMSDateUnit): IMSDuration {
  return new IMSDuration(input, unit);
}
