/**
 * Returns the most recent Sunday at 00:00 local time.
 * Used by the task purge to decide whether the weekly wipe has already run.
 */
export function mostRecentSundayMidnight(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  // getDay(): 0 = Sunday, 1 = Monday, … 6 = Saturday
  d.setDate(d.getDate() - d.getDay());
  return d;
}
