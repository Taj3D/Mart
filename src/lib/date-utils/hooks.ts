/**
 * IMS Date Utils - React Hooks
 * React integration for IMSDate with auto-updating relative time
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { IMSDate, ims, imsNow } from './ims-date';
import type { IMSLocaleCode, IMSStartOfUnit, IMSCalendarFormats } from './types';
import { getLocale, getCachedLocale, preloadLocale } from './locale';

// ============================================================================
// useIMSDate Hook
// ============================================================================

interface UseIMSDateOptions {
  /** Auto-update interval in ms for relative time (default: 60000 = 1 minute) */
  updateInterval?: number;
  /** Locale code */
  locale?: IMSLocaleCode;
  /** Whether to auto-update (default: true) */
  autoUpdate?: boolean;
}

/**
 * React hook for IMSDate with optional auto-updating relative time.
 *
 * @example
 * const { date, formatted, relative, calendar } = useIMSDate('2024-01-15');
 * const { relative } = useIMSDate(new Date(), { updateInterval: 1000 });
 */
export function useIMSDate(
  input: Date | string | number | IMSDate | null | undefined,
  options?: UseIMSDateOptions
) {
  const { updateInterval = 60000, locale, autoUpdate = true } = options || {};
  const [tick, setTick] = useState(0);

  // Create the IMSDate instance
  const imsDate = useMemo(() => {
    if (input === null || input === undefined) return null;
    const d = ims(input);
    if (locale) {
      const cachedLocale = getCachedLocale(locale);
      return d.locale(locale);
    }
    return d;
  }, [input, locale, tick]);

  // Auto-update timer for relative time
  useEffect(() => {
    if (!autoUpdate || !imsDate) return;

    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, updateInterval);

    return () => clearInterval(timer);
  }, [autoUpdate, updateInterval, imsDate]);

  const formatted = useMemo(() => {
    if (!imsDate || !imsDate.isValid()) return '';
    return imsDate.format();
  }, [imsDate]);

  const relative = useMemo(() => {
    if (!imsDate || !imsDate.isValid()) return '';
    return imsDate.fromNow();
  }, [imsDate, tick]);

  const calendar = useMemo(() => {
    if (!imsDate || !imsDate.isValid()) return '';
    return imsDate.calendar();
  }, [imsDate, tick]);

  return {
    date: imsDate,
    formatted,
    relative,
    calendar,
    isValid: imsDate?.isValid() ?? false,
    refresh: useCallback(() => setTick(t => t + 1), []),
  };
}

// ============================================================================
// useRelativeTime Hook
// ============================================================================

/**
 * React hook for auto-updating relative time strings.
 *
 * @example
 * const timeAgo = useRelativeTime('2024-01-15'); // "2 years ago"
 * const timeAgo = useRelativeTime(new Date(), 1000); // updates every second
 */
export function useRelativeTime(
  input: Date | string | number | IMSDate | null | undefined,
  updateInterval: number = 60000
): string {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), updateInterval);
    return () => clearInterval(timer);
  }, [updateInterval]);

  return useMemo(() => {
    if (input === null || input === undefined) return '';
    const d = ims(input);
    if (!d.isValid()) return 'Invalid date';
    return d.fromNow();
  }, [input, tick]);
}

// ============================================================================
// useCalendar Hook
// ============================================================================

/**
 * React hook for calendar-formatted date strings.
 *
 * @example
 * const cal = useCalendar('2024-01-15');
 * // "01/15/2024" or "Today at 2:30 PM" etc.
 */
export function useCalendar(
  input: Date | string | number | IMSDate | null | undefined,
  formats?: Partial<IMSCalendarFormats>,
  refTime?: Date | string | number
): string {
  return useMemo(() => {
    if (input === null || input === undefined) return '';
    const d = ims(input);
    if (!d.isValid()) return 'Invalid date';
    return d.calendar(refTime, formats);
  }, [input, formats, refTime]);
}

// ============================================================================
// useLocale Hook
// ============================================================================

/**
 * React hook for locale management with async loading.
 *
 * @example
 * const { locale, setLocale, isLoading } = useLocale('fr');
 */
export function useLocale(initialLocale?: IMSLocaleCode) {
  const [localeCode, setLocaleCode] = useState<IMSLocaleCode>(initialLocale || 'en-US');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const changeLocale = useCallback(async (code: IMSLocaleCode) => {
    setIsLoading(true);
    setError(null);
    try {
      await preloadLocale(code);
      setLocaleCode(code);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    locale: localeCode,
    setLocale: changeLocale,
    isLoading,
    error,
  };
}

// ============================================================================
// useCountdown Hook
// ============================================================================

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  total: number;
  isComplete: boolean;
  formatted: string;
}

/**
 * React hook for countdown timer.
 *
 * @example
 * const countdown = useCountdown('2024-12-31T23:59:59');
 * // { days: 300, hours: 5, minutes: 30, seconds: 15, ... }
 */
export function useCountdown(
  target: Date | string | number | IMSDate,
  interval: number = 1000
): CountdownResult {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), interval);
    return () => clearInterval(timer);
  }, [interval]);

  return useMemo(() => {
    const targetDate = ims(target);
    const now = imsNow();
    const diff = targetDate.diffMs(now.toDate());
    const isComplete = diff <= 0;
    const absDiff = Math.abs(diff);

    const days = Math.floor(absDiff / 86400000);
    const hours = Math.floor((absDiff % 86400000) / 3600000);
    const minutes = Math.floor((absDiff % 3600000) / 60000);
    const seconds = Math.floor((absDiff % 60000) / 1000);
    const milliseconds = absDiff % 1000;

    const formatted = isComplete
      ? '00:00:00'
      : `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return {
      days, hours, minutes, seconds, milliseconds,
      total: diff,
      isComplete,
      formatted,
    };
  }, [target, tick]);
}

// ============================================================================
// useTimeAgo Hook (alias for useRelativeTime with shorter updates)
// ============================================================================

/**
 * React hook for "time ago" display with smart interval selection.
 * Updates more frequently for recent times, less for older times.
 *
 * @example
 * const timeAgo = useTimeAgo('2024-01-15');
 */
export function useTimeAgo(
  input: Date | string | number | IMSDate | null | undefined
): string {
  const imsDate = useMemo(() => {
    if (input === null || input === undefined) return null;
    return ims(input);
  }, [input]);

  // Calculate smart interval
  const interval = useMemo(() => {
    if (!imsDate || !imsDate.isValid()) return 60000;
    const diffMs = Math.abs(Date.now() - imsDate.valueOf());
    if (diffMs < 60000) return 1000;       // < 1 min: update every second
    if (diffMs < 3600000) return 60000;     // < 1 hour: update every minute
    if (diffMs < 86400000) return 600000;   // < 1 day: update every 10 minutes
    return 3600000;                          // > 1 day: update every hour
  }, [imsDate]);

  return useRelativeTime(input, interval);
}
