-- ============================================
-- TrackMyLife Database Schema for Supabase
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- Trackers table
-- ============================================
create table public.trackers (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    type text not null check (type in ('boolean', 'quantitative')),
    unit text,
    color text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================
-- Entries table
-- ============================================
create table public.entries (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    tracker_id uuid not null references public.trackers(id) on delete cascade,
    date date not null,
    value_boolean boolean,
    value_number double precision,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(tracker_id, date)
);

-- ============================================
-- Indexes
-- ============================================
create index idx_trackers_user_id on public.trackers(user_id);
create index idx_entries_user_id on public.entries(user_id);
create index idx_entries_tracker_id on public.entries(tracker_id);
create index idx_entries_date on public.entries(date);
create index idx_entries_tracker_date on public.entries(tracker_id, date);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Trackers RLS
alter table public.trackers enable row level security;

create policy "Users can view own trackers"
    on public.trackers for select
    using (auth.uid() = user_id);

create policy "Users can create own trackers"
    on public.trackers for insert
    with check (auth.uid() = user_id);

create policy "Users can update own trackers"
    on public.trackers for update
    using (auth.uid() = user_id);

create policy "Users can delete own trackers"
    on public.trackers for delete
    using (auth.uid() = user_id);

-- Entries RLS
alter table public.entries enable row level security;

create policy "Users can view own entries"
    on public.entries for select
    using (auth.uid() = user_id);

create policy "Users can create own entries"
    on public.entries for insert
    with check (auth.uid() = user_id);

create policy "Users can update own entries"
    on public.entries for update
    using (auth.uid() = user_id);

create policy "Users can delete own entries"
    on public.entries for delete
    using (auth.uid() = user_id);

-- ============================================
-- Updated_at trigger function
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_trackers_updated_at
    before update on public.trackers
    for each row execute function public.handle_updated_at();

create trigger set_entries_updated_at
    before update on public.entries
    for each row execute function public.handle_updated_at();
