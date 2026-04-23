-- ═══════════════════════════════════════════════════════════════
-- CraftLab LP&ET — Migration 003: Ferment Widget + demo data
-- Fecha: 2026-04-23
--
-- Agrega:
--  · Policies UPDATE para fb/cl orders (partner puede ajustar su own order)
--  · Demo: mueve la última CL order del user a fermentation
--  · Demo: asigna Tank B-1 (BIW-200) a esa orden
--  · Demo: inyecta 20 lecturas progresivas pH / Temp / Brix
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. UPDATE policies (para beta — partner puede auto-ajustar)
-- ───────────────────────────────────────────────────────────────

drop policy if exists "cl_orders_update_own" on public.cl_orders;
create policy "cl_orders_update_own" on public.cl_orders
    for update using (user_id = auth.uid());

drop policy if exists "fb_orders_update_own" on public.fb_orders;
create policy "fb_orders_update_own" on public.fb_orders
    for update using (user_id = auth.uid());

-- Inserts de tank assignments por el partner (para beta; luego lo hará el operario)
drop policy if exists "assignments_insert_any" on public.order_tank_assignments;
create policy "assignments_insert_any" on public.order_tank_assignments
    for insert with check (auth.role() = 'authenticated');

-- Inserts de sensor readings (para demo; luego lo hará el ESP32 con service role)
drop policy if exists "sensor_readings_insert_any" on public.sensor_readings;
create policy "sensor_readings_insert_any" on public.sensor_readings
    for insert with check (auth.role() = 'authenticated');

-- ───────────────────────────────────────────────────────────────
-- 2. DEMO SEED
--    Ajusta la última CL order del usuario Jhonatan → fermentation,
--    la asigna al Tank B-1 e inyecta 20 readings simuladas.
-- ───────────────────────────────────────────────────────────────

do $$
declare
    v_user_id uuid;
    v_order_id uuid;
    v_tank_id uuid;
    i int;
begin
    -- Jhonatan
    select id into v_user_id from auth.users where email = 'jbenavides@lapalmayeltucan.com';

    if v_user_id is null then
        raise notice 'User jbenavides not found — skipping demo seed';
        return;
    end if;

    -- Última CL order del usuario
    select id into v_order_id
        from public.cl_orders
        where user_id = v_user_id
        order by created_at desc
        limit 1;

    if v_order_id is null then
        raise notice 'No CL orders for user — skipping demo seed';
        return;
    end if;

    -- Tank B-1 (BIW-200 protocol — mucilage fermentation)
    select id into v_tank_id from public.tanks where name = 'Tank B-1';

    if v_tank_id is null then
        raise notice 'Tank B-1 not found — skipping demo seed';
        return;
    end if;

    -- Mover orden a fermentation
    update public.cl_orders
        set status = 'fermentation', updated_at = now()
        where id = v_order_id;

    -- Crear assignment (si no existe ya activo)
    if not exists (
        select 1 from public.order_tank_assignments
        where order_id = v_order_id and order_type = 'cl' and released_at is null
    ) then
        insert into public.order_tank_assignments (order_type, order_id, tank_id, assigned_by)
        values ('cl', v_order_id, v_tank_id, v_user_id);
    end if;

    -- Marcar el tank como in_use
    update public.tanks
        set status = 'in_use',
            current_order_type = 'cl',
            current_order_id = v_order_id,
            updated_at = now()
        where id = v_tank_id;

    -- Borrar readings previas del demo para no duplicar
    delete from public.sensor_readings where tank_id = v_tank_id;

    -- Inyectar 20 lecturas progresivas (últimos 100 minutos, 1 cada 5 min)
    -- pH baja de 5.4 → 4.1 (fermentación mucílago)
    -- Temp oscila 22-28°C
    -- Brix sube de 12 → 18 (azúcar liberado)
    for i in 0..19 loop
        insert into public.sensor_readings (tank_id, ph, temp_c, brix, recorded_at)
        values (
            v_tank_id,
            round((5.4 - (i * 0.065) + (random() * 0.08 - 0.04))::numeric, 2),
            round((22 + (i * 0.3) + (random() * 1.2 - 0.6))::numeric, 1),
            round((12 + (i * 0.3) + (random() * 0.4 - 0.2))::numeric, 1),
            now() - ((19 - i) * interval '5 minutes')
        );
    end loop;

    raise notice 'Demo seed OK — order % → tank B-1 with 20 readings', v_order_id;
end $$;
