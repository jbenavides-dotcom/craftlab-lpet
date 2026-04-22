-- ═══════════════════════════════════════════════════════════════
-- CraftLab LP&ET — Migration 002: Tanks + Order wiring
-- Proyecto: itafxhlhftayznpqsrxr
-- Fecha: 2026-04-22
--
-- Agrega:
--  · Tabla tanks (canecas físicas)
--  · Tabla sensor_readings (pH/Temp/Brix time-series)
--  · Tabla order_tank_assignments (match orden ↔ tanque)
--  · Triggers para auto-sumar puntos y crear notificaciones al ordenar
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. TANKS (canecas físicas del lab)
-- ───────────────────────────────────────────────────────────────
create table if not exists public.tanks (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null,
    capacity_kg numeric(10,2) not null default 500,
    status text not null default 'available' check (
        status in ('available', 'in_use', 'cleaning', 'maintenance')
    ),
    protocol_id uuid references public.fermentation_protocols(id),
    current_order_type text check (current_order_type in ('fb', 'cl')),
    current_order_id uuid,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────
-- 2. SENSOR_READINGS (time-series de pH / Temp / Brix)
-- ───────────────────────────────────────────────────────────────
create table if not exists public.sensor_readings (
    id uuid primary key default uuid_generate_v4(),
    tank_id uuid not null references public.tanks(id) on delete cascade,
    ph numeric(4,2),
    temp_c numeric(5,2),
    brix numeric(4,2),
    recorded_at timestamptz default now()
);

create index idx_sensor_readings_tank_time on public.sensor_readings(tank_id, recorded_at desc);

-- ───────────────────────────────────────────────────────────────
-- 3. ORDER_TANK_ASSIGNMENTS (match orden ↔ tanque)
-- ───────────────────────────────────────────────────────────────
create table if not exists public.order_tank_assignments (
    id uuid primary key default uuid_generate_v4(),
    order_type text not null check (order_type in ('fb', 'cl')),
    order_id uuid not null,
    tank_id uuid not null references public.tanks(id),
    assigned_at timestamptz default now(),
    released_at timestamptz,
    assigned_by uuid references auth.users(id)
);

create index idx_assignments_order on public.order_tank_assignments(order_type, order_id);
create index idx_assignments_tank on public.order_tank_assignments(tank_id);

-- ───────────────────────────────────────────────────────────────
-- 4. RLS
-- ───────────────────────────────────────────────────────────────
alter table public.tanks enable row level security;
alter table public.sensor_readings enable row level security;
alter table public.order_tank_assignments enable row level security;

-- Tanques: lectura pública para cualquier auth user (ver estado del lab)
create policy "tanks_select_auth" on public.tanks
    for select using (auth.role() = 'authenticated');

-- Sensor readings: el partner ve las del tanque asignado a sus órdenes
create policy "sensor_readings_select_own" on public.sensor_readings
    for select using (
        exists (
            select 1 from public.order_tank_assignments a
            where a.tank_id = sensor_readings.tank_id
            and a.released_at is null
            and (
                (a.order_type = 'fb' and exists (select 1 from public.fb_orders where id = a.order_id and user_id = auth.uid()))
                or
                (a.order_type = 'cl' and exists (select 1 from public.cl_orders where id = a.order_id and user_id = auth.uid()))
            )
        )
    );

-- Assignments: el partner ve las de sus órdenes
create policy "assignments_select_own" on public.order_tank_assignments
    for select using (
        (order_type = 'fb' and exists (select 1 from public.fb_orders where id = order_id and user_id = auth.uid()))
        or
        (order_type = 'cl' and exists (select 1 from public.cl_orders where id = order_id and user_id = auth.uid()))
    );

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS — Sumar puntos + crear notificación al ordenar
-- ═══════════════════════════════════════════════════════════════

-- FB order insertada → +puntos + notif
create or replace function public.handle_fb_order_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    -- Sumar puntos al user
    update public.user_progress
        set points = points + coalesce(new.points_earned, 5000)
        where user_id = new.user_id;

    -- Crear notificación
    insert into public.notifications (user_id, type, title, body, icon)
    values (
        new.user_id,
        'order',
        'Order received',
        'Your Forward Booking reservation for ' || coalesce(new.variety, 'coffee') ||
            ' (' || (new.bag_size * new.quantity) || ' kg) is confirmed.',
        'package'
    );

    return new;
end;
$$;

drop trigger if exists on_fb_order_insert on public.fb_orders;
create trigger on_fb_order_insert
    after insert on public.fb_orders
    for each row execute procedure public.handle_fb_order_insert();

-- CL order insertada → +puntos + notif
create or replace function public.handle_cl_order_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    update public.user_progress
        set points = points + coalesce(new.points_earned, 10000)
        where user_id = new.user_id;

    insert into public.notifications (user_id, type, title, body, icon)
    values (
        new.user_id,
        'order',
        'CraftLab build confirmed',
        'Your custom ' || coalesce(new.variety, 'coffee') || ' (' ||
            coalesce(new.quantity_kg::text, '0') || ' kg) is entering the lab.',
        'flask-conical'
    );

    return new;
end;
$$;

drop trigger if exists on_cl_order_insert on public.cl_orders;
create trigger on_cl_order_insert
    after insert on public.cl_orders
    for each row execute procedure public.handle_cl_order_insert();

-- ═══════════════════════════════════════════════════════════════
-- SEED — 5 tanques matching los 5 protocolos de Katherine
-- ═══════════════════════════════════════════════════════════════

insert into public.tanks (name, capacity_kg, status, protocol_id)
select
    name, capacity_kg, 'available',
    (select id from public.fermentation_protocols where code = code_match)
from (values
    ('Tank A-1',  500, 'LPX-500'),
    ('Tank B-1',  200, 'BIW-200'),
    ('Tank C-1',  120, 'NO-120'),
    ('Tank D-1',   48, 'CSP-48'),
    ('Tank E-1',  100, 'BNX-100')
) as t(name, capacity_kg, code_match)
on conflict (name) do nothing;
