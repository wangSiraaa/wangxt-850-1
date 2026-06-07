import { format, parse, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const TIME_FORMAT = 'HH:mm';
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

export function formatDate(date: Date | string, fmt: string = DATE_FORMAT): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, fmt, { locale: zhCN });
}

export function formatTime(time: string): string {
  return time;
}

export function formatDateTime(datetime: string): string {
  return format(new Date(datetime), DATETIME_FORMAT, { locale: zhCN });
}

export function parseTime(timeStr: string): Date {
  return parse(timeStr, TIME_FORMAT, new Date());
}

export function isTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = parseTime(start1).getTime();
  const e1 = parseTime(end1).getTime();
  const s2 = parseTime(start2).getTime();
  const e2 = parseTime(end2).getTime();

  return !(e1 <= s2 || e2 <= s1);
}

export function isSameDate(date1: string, date2: string): boolean {
  return isSameDay(new Date(date1), new Date(date2));
}

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 8; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 22) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
}

export function getWeekDates(baseDate: Date): Date[] {
  const dates: Date[] = [];
  const day = baseDate.getDay();
  const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(baseDate.setDate(diff));

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
}

export function getMonthDays(year: number, month: number): Date[] {
  const dates: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  for (let i = startPadding - 1; i >= 0; i--) {
    dates.push(new Date(year, month, -i));
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    dates.push(new Date(year, month, i));
  }
  
  const remaining = 42 - dates.length;
  for (let i = 1; i <= remaining; i++) {
    dates.push(new Date(year, month + 1, i));
  }
  
  return dates;
}

export function getTodayString(): string {
  return formatDate(new Date());
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
