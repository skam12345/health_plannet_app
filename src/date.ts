export const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

const pad = (n: number) => String(n).padStart(2, '0');

export function toKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 오늘이 속한 주의 월요일~일요일 7일 */
export function getThisWeek(today = new Date()): Date[] {
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const offset = (base.getDay() + 6) % 7; // 월요일 = 0
  const monday = new Date(base);
  monday.setDate(base.getDate() - offset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function formatRange(days: Date[]): string {
  const a = days[0];
  const b = days[days.length - 1];
  return `${a.getMonth() + 1}.${a.getDate()} - ${b.getMonth() + 1}.${b.getDate()}`;
}
