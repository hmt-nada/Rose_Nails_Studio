-- =============================================================================
-- Rosé Nails Studio — Database Schema Reference
-- =============================================================================
-- Note: Review this SQL script before running it in the Supabase SQL Editor.
-- Ensure extensions and project settings are configured appropriately.

-- 1. Enable UUID Extension (built into modern PostgreSQL / Supabase)
create extension if not exists "pgcrypto";

-- =============================================================================
-- Table: services
-- Description: Salon service catalog with prices, durations, and sort orders
-- =============================================================================
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null check (price >= 0),
  duration_min integer not null default 45 check (duration_min > 0),
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- Index for ordering active services in the booking form and admin
create index if not exists idx_services_position on public.services(position asc);
create index if not exists idx_services_active on public.services(active);

-- =============================================================================
-- Table: reservations
-- Description: Client appointment bookings, snapshots of service/price, and status
-- =============================================================================
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  service_id uuid references public.services(id) on delete set null,
  service text not null,          -- Snapshot of service name at booking time
  price numeric not null,         -- Snapshot of service price at booking time (server-verified)
  date text not null,             -- Local booking date (YYYY-MM-DD)
  time text not null,             -- Time slot string (e.g. "10:00 AM", "11:30 AM")
  note text,                      -- Optional client note or demo identifier tag
  status text not null default 'new' check (status in ('new', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Indexes for time-slot conflict checking, date filters, and status badges
create index if not exists idx_reservations_date_time on public.reservations(date, time);
create index if not exists idx_reservations_status on public.reservations(status);
create index if not exists idx_reservations_created_at on public.reservations(created_at desc);

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================
alter table public.services enable row level security;
alter table public.reservations enable row level security;

-- Services Policies:
-- 1. Public can read active services to populate the booking form
create policy "Public can read active services"
  on public.services
  for select
  to anon, authenticated
  using (active = true);

-- 2. Authenticated admins can view, insert, update, and delete all services
create policy "Admins can manage services"
  on public.services
  for all
  to authenticated
  using (true)
  with check (true);

-- Reservations Policies:
-- 1. Public can create reservation requests (also protected server-side with rate limiting & Zod)
create policy "Allow insert for appointment booking"
  on public.reservations
  for insert
  to anon, authenticated
  with check (true);

-- 2. Only authenticated admin users can view, update status, and manage reservations
create policy "Admins can view and update reservations"
  on public.reservations
  for all
  to authenticated
  using (true)
  with check (true);

-- =============================================================================
-- Realtime Subscriptions
-- =============================================================================
-- Enables realtime broadcast events so the admin dashboard updates live upon
-- new bookings, status updates, or service changes without manual page refreshes.
alter publication supabase_realtime add table public.reservations;
alter publication supabase_realtime add table public.services;

-- =============================================================================
-- Initial Default Services (Optional Seed)
-- =============================================================================
insert into public.services (name, price, duration_min, active, position)
values
  ('Express Classic Manicure', 1800, 30, true, 1),
  ('Gel Polish Application', 2500, 45, true, 2),
  ('BIAB Nail Strengthening', 3800, 60, true, 3),
  ('Russian Manicure & Nail Art', 4200, 75, true, 4),
  ('Haute Couture Extensions', 5500, 90, true, 5),
  ('Spa Pedicure & Gel Polish', 3200, 60, true, 6)
on conflict do nothing;
