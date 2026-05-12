/**
 * IMS Date Utils - Main Entry Point
 * Complete moment.js replacement built on date-fns v4
 *
 * Usage:
 *   import { ims, imsDuration, imsFormat, useIMSDate } from '@/lib/date-utils';
 *
 *   // Chainable API (moment.js compatible)
 *   const date = ims('2024-01-15');
 *   date.format('YYYY-MM-DD');           // '2024-01-15'
 *   date.add(1, 'month').format();       // '2024-02-15'
 *   date.startOf('month').format();      // '2024-01-01'
 *   date.fromNow();                       // '2 years ago'
 *   date.calendar();                      // '01/15/2024'
 *
 *   // Duration
 *   const dur = imsDuration({ hours: 2, minutes: 30 });
 *   dur.humanize();                       // '2 hours'
 *   dur.toISOString();                    // 'PT2H30M'
 *
 *   // Utility functions
 *   imsFormat(new Date(), 'YYYY-MM-DD HH:mm');
 *   imsFromNow(new Date('2024-01-01'));
 *
 *   // React hooks
 *   const { relative, calendar } = useIMSDate('2024-01-15');
 *   const timeAgo = useTimeAgo('2024-01-15');
 *   const countdown = useCountdown('2025-12-31');
 */

// ============================================================================
// Core Class & Factory
// ============================================================================

export { IMSDate, ims, imsUnix, imsUtc, imsNow, imsMin, imsMax, convertMomentFormat, convertParseFormat } from './ims-date';

// ============================================================================
// Extended Methods (query, diff, relative, calendar)
// ============================================================================

export { IMSDuration, imsDuration } from './ims-date-extended';

// ============================================================================
// Types
// ============================================================================

export type {
  IMSDateUnit,
  IMSDateNormalizedUnit,
  IMSStartOfUnit,
  IMSLocaleCode,
  IMSRelativeTimeThresholds,
  IMSRelativeTimeStrings,
  IMSCalendarFormats,
  IMSDurationInput,
  IMSISODuration,
  IMSDateConfig,
  IMSManipulationInput,
  IMSDateObject,
} from './types';

export {
  MOMENT_TO_DATE_FNS_LOCALE,
  MOMENT_TO_DATE_FNS_FORMAT,
  MOMENT_PARSE_FORMATS,
  DEFAULT_RELATIVE_TIME_THRESHOLDS,
  DEFAULT_RELATIVE_TIME,
  DEFAULT_CALENDAR_FORMATS,
  DEFAULT_IMS_DATE_CONFIG,
  IMS_INVALID_DATE,
  isIMSInvalidDate,
} from './types';

// ============================================================================
// Locale Manager
// ============================================================================

export {
  getLocale,
  getCachedLocale,
  preloadLocale,
  preloadLocales,
  setGlobalLocale,
  getGlobalLocale,
  momentLocaleToDateFns,
  SUPPORTED_LOCALES,
  MOMENT_LOCALE_CODES,
} from './locale';

// ============================================================================
// React Hooks
// ============================================================================

export {
  useIMSDate,
  useRelativeTime,
  useCalendar,
  useLocale,
  useCountdown,
  useTimeAgo,
} from './hooks';

// ============================================================================
// Utility Functions
// ============================================================================

export {
  // Format
  imsFormat,
  imsFormatISO,
  imsFormatDistance,
  imsFormatDistanceToNow,
  imsFormatDistanceStrict,
  imsFormatDuration,
  // Parse
  imsParse,
  imsParseISO,
  imsIsValid,
  // Compare
  imsIsBefore,
  imsIsAfter,
  imsIsEqual,
  imsIsWithinInterval,
  imsIsToday,
  imsIsTomorrow,
  imsIsYesterday,
  imsIsWeekend,
  imsIsLeapYear,
  imsIsPast,
  imsIsFuture,
  // Diff
  imsDiffMs,
  imsDiffSeconds,
  imsDiffMinutes,
  imsDiffHours,
  imsDiffDays,
  imsDiffWeeks,
  imsDiffMonths,
  imsDiffYears,
  // Manipulation (add)
  imsAddYears,
  imsAddMonths,
  imsAddWeeks,
  imsAddDays,
  imsAddHours,
  imsAddMinutes,
  imsAddSeconds,
  imsAddMilliseconds,
  // Manipulation (subtract)
  imsSubYears,
  imsSubMonths,
  imsSubWeeks,
  imsSubDays,
  imsSubHours,
  imsSubMinutes,
  imsSubSeconds,
  imsSubMilliseconds,
  // Start/End
  imsStartOfYear,
  imsStartOfMonth,
  imsStartOfWeek,
  imsStartOfDay,
  imsEndOfYear,
  imsEndOfMonth,
  imsEndOfWeek,
  imsEndOfDay,
  // Get/Set
  imsGetYear,
  imsGetMonth,
  imsGetDate,
  imsGetDay,
  imsGetHours,
  imsGetMinutes,
  imsGetSeconds,
  imsGetMilliseconds,
  imsGetISOWeek,
  imsGetWeek,
  imsGetQuarter,
  imsGetDayOfYear,
  imsDaysInMonth,
  imsSetYear,
  imsSetMonth,
  imsSetDate,
  imsSetHours,
  imsSetMinutes,
  imsSetSeconds,
  imsSetMilliseconds,
  // Range
  imsEachDay,
  imsEachWeek,
  imsEachMonth,
  imsEachYear,
  imsEachHour,
  imsEachMinute,
  // Comparison
  imsMax,
  imsMin,
  imsClosestTo,
  imsClosestIndexTo,
  imsCompareAsc,
  imsCompareDesc,
  imsAreIntervalsOverlapping,
  // Other
  imsNextDay,
  imsPreviousDay,
  imsLastDayOfMonth,
  imsLastDayOfYear,
  imsClamp,
  imsRoundToNearestMinutes,
  // Moment.js compatibility
  imsFromNow,
  imsCalendar,
} from './utils';
