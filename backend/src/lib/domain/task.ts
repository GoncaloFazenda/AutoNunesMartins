import { addMonths, addWeeks, addYears } from 'date-fns';
import type { Recurrence } from '@anm/types';

/**
 * Shift a date by one recurrence period. NONE returns the input unchanged.
 *
 * date-fns `addMonths` handles month overflow correctly: Jan 31 → Feb 28/29.
 */
export function shiftRecurrence(date: Date, recurrence: Recurrence): Date {
  switch (recurrence) {
    case 'WEEKLY':
      return addWeeks(date, 1);
    case 'MONTHLY':
      return addMonths(date, 1);
    case 'ANNUAL':
      return addYears(date, 1);
    case 'NONE':
      return new Date(date);
  }
}
