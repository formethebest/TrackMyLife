export type TrackerType = 'boolean' | 'quantitative';

export interface Tracker {
    id: string; // UUID v4
    name: string;
    type: TrackerType;
    unit?: string; // только для quantitative
    color: string; // HEX color
    createdAt: string; // ISO 8601 date string
    updatedAt: string; // ISO 8601 date string
}

export interface Entry {
    id: string; // UUID v4
    trackerId: string; // ссылка на Tracker.id
    date: string; // YYYY-MM-DD формат
    valueBoolean?: boolean; // для boolean трекеров
    valueNumber?: number; // для quantitative трекеров
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
}

export interface StorageData {
    trackers: Tracker[];
    entries: Entry[];
}
