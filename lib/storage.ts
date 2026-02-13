import { Tracker, Entry } from '@/types';

const TRACKERS_KEY = 'trackmylife_trackers';
const ENTRIES_KEY = 'trackmylife_entries';

function safeParse<T>(str: string | null, fallback: T): T {
    try {
        return str ? JSON.parse(str) : fallback;
    } catch (e) {
        console.error('JSON parse error', e);
        return fallback;
    }
}

// Trackers
export function getTrackers(): Tracker[] {
    if (typeof window === 'undefined') return [];
    return safeParse<Tracker[]>(localStorage.getItem(TRACKERS_KEY), []);
}

function saveTrackers(trackers: Tracker[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TRACKERS_KEY, JSON.stringify(trackers));
}

export function addTracker(tracker: Omit<Tracker, 'id' | 'createdAt' | 'updatedAt'>): Tracker {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newTracker: Tracker = { ...tracker, id, createdAt: now, updatedAt: now };
    const trackers = getTrackers();
    trackers.push(newTracker);
    saveTrackers(trackers);
    return newTracker;
}

export function updateTracker(id: string, updates: Partial<Tracker>): Tracker | null {
    const trackers = getTrackers();
    const idx = trackers.findIndex(t => t.id === id);
    if (idx === -1) return null;
    trackers[idx] = { ...trackers[idx], ...updates, updatedAt: new Date().toISOString() };
    saveTrackers(trackers);
    return trackers[idx];
}

export function deleteTracker(id: string): void {
    const trackers = getTrackers().filter(t => t.id !== id);
    saveTrackers(trackers);
    // Удаляем все связанные entries
    const entries = getEntries().filter(e => e.trackerId !== id);
    saveEntries(entries);
}

// Entries
export function getEntries(): Entry[] {
    if (typeof window === 'undefined') return [];
    return safeParse<Entry[]>(localStorage.getItem(ENTRIES_KEY), []);
}

function saveEntries(entries: Entry[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function getEntry(trackerId: string, date: string): Entry | null {
    const entries = getEntries();
    return entries.find(e => e.trackerId === trackerId && e.date === date) || null;
}

export function saveEntry(entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): Entry {
    const entries = getEntries();
    const now = new Date().toISOString();
    const existing = entries.findIndex(e => e.trackerId === entry.trackerId && e.date === entry.date);

    if (existing !== -1) {
        entries[existing] = { ...entries[existing], ...entry, updatedAt: now };
    } else {
        entries.push({ ...entry, id: crypto.randomUUID(), createdAt: now, updatedAt: now });
    }

    saveEntries(entries);
    return entries.find(e => e.trackerId === entry.trackerId && e.date === entry.date) as Entry;
}

export function getEntriesForTracker(trackerId: string, startDate: string, endDate: string): Entry[] {
    const entries = getEntries();
    return entries.filter(e => e.trackerId === trackerId && e.date >= startDate && e.date <= endDate);
}

export function getEntriesForDate(date: string): Entry[] {
    const entries = getEntries();
    return entries.filter(e => e.date === date);
}
