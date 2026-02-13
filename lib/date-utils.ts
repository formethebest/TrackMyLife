import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';

export function formatDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, formatStr);
}

export function formatDateRu(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'd MMMM yyyy', { locale: ru });
}

export function getToday(): string {
    return formatDate(new Date());
}

export function getYesterday(): string {
    return formatDate(subDays(new Date(), 1));
}

export function getDaysAgo(days: number): string {
    return formatDate(subDays(new Date(), days));
}

export function getDateRange(days: number): { start: string; end: string } {
    const end = new Date();
    const start = subDays(end, days - 1);
    return {
        start: formatDate(start),
        end: formatDate(end),
    };
}
