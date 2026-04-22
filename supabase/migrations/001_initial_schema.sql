-- ═══════════════════════════════════════════════════════════════
-- CraftLab LP&ET — Initial Schema
-- Proyecto: itafxhlhftayznpqsrxr
-- Fecha: 2026-04-22
-- ═══════════════════════════════════════════════════════════════

-- Habilitar extensión para UUIDs
create extension if not exists "uuid-ossp";

-- ───────────────────────────────────────────────────────────────
-- 1. PROFILES (extiende auth.users con datos del partner)
-- ───────────────────────────────────────────────────────────────
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    full_name text,
    role text not null default 'partner' check (role in ('partner', 'admin', 'operator')),
    company_name text,
    country text,
    joined_at timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────
-- 2. USER_PROGRESS (flags educativos + puntos acumulados)
-- ───────────────────────────────────────────────────────────────
create table public.user_progress (
    user_id uuid primary key references auth.users(id) on delete cascade,
    craftlab_unlocked boolean not null default false,
    quiz_score int,
    quiz_completed_at timestamptz,
    points int not null default 0,
    updated_at timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────
-- 3. FERMENTATION_PROTOCOLS (referencia inmutable de Katherine)
-- ───────────────────────────────────────────────────────────────
create table public.fermentation_protocols (
    id uuid primary key default uuid_generate_v4(),
    code text unique not null,
    name text not null,
    process_family text not null,
    variety text[],
    stabilization_min int,
    stabilization_max int,
    cherry_ferm_min int,
    cherry_ferm_max int,
    mucilage_ferm_min int,
    mucilage_ferm_max int,
    solar_dry_min int,
    solar_dry_max int,
    mech_dry_min int,
    mech_dry_max int,
    flavor_notes text,
    active boolean default true,
    created_at timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────
-- 4. LOTES (inventario FB — Neighbors & Crops)
-- ───────────────────────────────────────────────────────────────
create table public.lotes (
    id uuid primary key default uuid_generate_v4(),
    variety text not null,
    harvest_quarter text check (harvest_quarter in ('Q1','Q2','Q3','Q4')),
    harvest_year int not null,
    flavor_profile text,
    process text,
    stock_kg numeric(10,2) not null default 0,
    reserved_kg numeric(10,2) not null default 0,
    available_kg numeric(10,2) generated always as (stock_kg - reserved_kg) stored,
    notes text,
    created_at timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────
-- 5. FB_ORDERS (órdenes Forward Booking)
-- ───────────────────────────────────────────────────────────────
create table public.fb_orders (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete restrict,
    lote_id uuid references public.lotes(id),
    harvest_date text,
    variety text,
    flavor_profile text,
    process text,
    bag_size int not null check (bag_size in (35, 70)),
    quantity int not null check (quantity > 0),
    total_kg numeric(10,2) generated always as (bag_size * quantity) stored,
    agreed_to_terms boolean not null default false,
    status text not null default 'pending' check (
        status in ('pending', 'confirmed', 'fermentation', 'drying', 'ready', 'shipped', 'delivered', 'cancelled')
    ),
    points_earned int not null default 5000,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────
-- 6. CL_ORDERS (órdenes CraftLab — 12 decisiones)
-- ───────────────────────────────────────────────────────────────
create table public.cl_orders (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete restrict,
    protocol_id uuid references public.fermentation_protocols(id),
    -- Las 12 decisiones
    macro text,
    flavor text,
    variety text,
    quantity_kg numeric(10,2),
    category text,
    process text,
    stabilization_hrs int,
    cherry_ferm_hrs int,
    mucilage_ferm_hrs int,
    solar_dry_days int,
    mech_dry_hrs int,
    shipment_window text,
    --
    status text not null default 'pending' check (
        status in ('pending', 'confirmed', 'in_lab', 'fermentation', 'drying', 'ready', 'shipped', 'delivered', 'cancelled')
    ),
    agreed_to_terms boolean not null default false,
    points_earned int not null default 10000,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────
-- 7. ORDER_UPDATES (tracking con fotos del operario)
-- ───────────────────────────────────────────────────────────────
create table public.order_updates (
    id uuid primary key default uuid_generate_v4(),
    order_type text not null check (order_type in ('fb', 'cl')),
    order_id uuid not null,
    stage text not null,
    message text,
    image_url text,
    posted_by uuid references auth.users(id),
    created_at timestamptz default now()
);

create index idx_order_updates_order on public.order_updates(order_type, order_id);

-- ───────────────────────────────────────────────────────────────
-- 8. NOTIFICATIONS (notificaciones para usuarios)
-- ───────────────────────────────────────────────────────────────
create table public.notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    type text not null check (type in ('order', 'promo', 'system')),
    title text not null,
    body text,
    icon text,
    action_url text,
    read boolean not null default false,
    created_at timestamptz default now()
);

create index idx_notifications_user_unread on public.notifications(user_id, read) where read = false;

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

alter table public.profiles           enable row level security;
alter table public.user_progress      enable row level security;
alter table public.fb_orders          enable row level security;
alter table public.cl_orders          enable row level security;
alter table public.order_updates      enable row level security;
alter table public.notifications      enable row level security;
alter table public.lotes              enable row level security;
alter table public.fermentation_protocols enable row level security;

-- Profiles: user reads/updates su propio perfil
create policy "profiles_select_own" on public.profiles
    for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
    for update using (auth.uid() = id);

create policy "profiles_insert_self" on public.profiles
    for insert with check (auth.uid() = id);

-- User progress: user ve/actualiza su progreso
create policy "progress_select_own" on public.user_progress
    for select using (auth.uid() = user_id);

create policy "progress_update_own" on public.user_progress
    for update using (auth.uid() = user_id);

create policy "progress_insert_self" on public.user_progress
    for insert with check (auth.uid() = user_id);

-- FB Orders: user ve/crea sus propias órdenes
create policy "fb_orders_select_own" on public.fb_orders
    for select using (auth.uid() = user_id);

create policy "fb_orders_insert_self" on public.fb_orders
    for insert with check (auth.uid() = user_id);

-- CL Orders: idem
create policy "cl_orders_select_own" on public.cl_orders
    for select using (auth.uid() = user_id);

create policy "cl_orders_insert_self" on public.cl_orders
    for insert with check (auth.uid() = user_id);

-- Notifications: user ve y marca como leídas las suyas
create policy "notifications_select_own" on public.notifications
    for select using (auth.uid() = user_id);

create policy "notifications_update_own" on public.notifications
    for update using (auth.uid() = user_id);

-- Lotes y protocolos: lectura pública para cualquier auth user
create policy "lotes_select_auth" on public.lotes
    for select using (auth.role() = 'authenticated');

create policy "protocols_select_auth" on public.fermentation_protocols
    for select using (auth.role() = 'authenticated');

-- Order updates: user ve updates de sus propias órdenes
create policy "order_updates_select_own" on public.order_updates
    for select using (
        (order_type = 'fb' and exists (select 1 from public.fb_orders where id = order_id and user_id = auth.uid()))
        or
        (order_type = 'cl' and exists (select 1 from public.cl_orders where id = order_id and user_id = auth.uid()))
    );

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Auto-crear profile y user_progress cuando se crea un auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, email, full_name)
    values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));

    insert into public.user_progress (user_id)
    values (new.id);

    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger fb_orders_updated_at before update on public.fb_orders
    for each row execute procedure public.set_updated_at();

create trigger cl_orders_updated_at before update on public.cl_orders
    for each row execute procedure public.set_updated_at();

create trigger user_progress_updated_at before update on public.user_progress
    for each row execute procedure public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- SEED — 5 protocolos de Katherine
-- ═══════════════════════════════════════════════════════════════

insert into public.fermentation_protocols (code, name, process_family, flavor_notes) values
    ('LPX-500', 'La Palma Experimental 500',   'Bio-Innovation', 'Tropical · Floral · Complex'),
    ('BIW-200', 'Bio-Innovation Washed 200',    'Bio-Innovation', 'Clean · Bright · Stone fruit'),
    ('NO-120',  'Natural Open 120',             'Natural',        'Fermented · Red berry · Wine'),
    ('CSP-48',  'Cherry Stabilization Protocol 48', 'Natural',    'Fruit-forward · Balanced'),
    ('BNX-100', 'Bio-Natural Experimental 100', 'Bio-Innovation', 'Funky · Tropical · Boozy');
