import { Tracker, Entry } from '@/types';
import { createClient } from '@/lib/supabase';

// Helper to map Supabase row to Tracker type
function mapTracker(row: Record<string, unknown>): Tracker {
    return {
        id: row.id as string,
        name: row.name as string,
        type: row.type as Tracker['type'],
        unit: (row.unit as string) || undefined,
        color: row.color as string,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
    };
}

// Helper to map Supabase row to Entry type
function mapEntry(row: Record<string, unknown>): Entry {
    return {
        id: row.id as string,
        trackerId: row.tracker_id as string,
        date: row.date as string,
        valueBoolean: row.value_boolean as boolean | undefined,
        valueNumber: row.value_number as number | undefined,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
    };
}

// Trackers
export async function getTrackers(): Promise<Tracker[]> {
    if (typeof window === 'undefined') return [];
    const supabase = createClient();
    const { data, error } = await supabase
        .from('trackers')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching trackers:', error);
        return [];
    }
    return (data || []).map(mapTracker);
}

export async function addTracker(
    tracker: Omit<Tracker, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Tracker | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('trackers')
        .insert({
            user_id: user.id,
            name: tracker.name,
            type: tracker.type,
            unit: tracker.unit || null,
            color: tracker.color,
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding tracker:', error);
        return null;
    }
    return mapTracker(data);
}

export async function updateTracker(
    id: string,
    updates: Partial<Tracker>
): Promise<Tracker | null> {
    const supabase = createClient();

    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.unit !== undefined) updateData.unit = updates.unit || null;
    if (updates.color !== undefined) updateData.color = updates.color;

    const { data, error } = await supabase
        .from('trackers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating tracker:', error);
        return null;
    }
    return mapTracker(data);
}

export async function deleteTracker(id: string): Promise<void> {
    const supabase = createClient();
    // Entries are cascade-deleted via foreign key
    const { error } = await supabase
        .from('trackers')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting tracker:', error);
    }
}

// Entries
export async function getEntries(): Promise<Entry[]> {
    if (typeof window === 'undefined') return [];
    const supabase = createClient();
    const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('date', { ascending: true });

    if (error) {
        console.error('Error fetching entries:', error);
        return [];
    }
    return (data || []).map(mapEntry);
}

export async function getEntry(
    trackerId: string,
    date: string
): Promise<Entry | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('tracker_id', trackerId)
        .eq('date', date)
        .maybeSingle();

    if (error) {
        console.error('Error fetching entry:', error);
        return null;
    }
    return data ? mapEntry(data) : null;
}

export async function saveEntry(
    entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Entry | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('entries')
        .upsert(
            {
                user_id: user.id,
                tracker_id: entry.trackerId,
                date: entry.date,
                value_boolean: entry.valueBoolean ?? null,
                value_number: entry.valueNumber ?? null,
            },
            { onConflict: 'tracker_id,date' }
        )
        .select()
        .single();

    if (error) {
        console.error('Error saving entry:', error);
        return null;
    }
    return mapEntry(data);
}

export async function getEntriesForTracker(
    trackerId: string,
    startDate: string,
    endDate: string
): Promise<Entry[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('tracker_id', trackerId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

    if (error) {
        console.error('Error fetching entries for tracker:', error);
        return [];
    }
    return (data || []).map(mapEntry);
}

export async function getEntriesForDate(date: string): Promise<Entry[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('date', date);

    if (error) {
        console.error('Error fetching entries for date:', error);
        return [];
    }
    return (data || []).map(mapEntry);
}
