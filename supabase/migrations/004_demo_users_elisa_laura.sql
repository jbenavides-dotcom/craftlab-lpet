-- ═══════════════════════════════════════════════════════════════
-- CraftLab LP&ET — Migration 004: Crear usuarios demo (Elisa + Laura)
-- Fecha: 2026-04-24
--
-- Crea 2 usuarios nuevos con:
--  · Email confirmado inmediato
--  · Password: CraftLab2026!
--  · Trigger handle_new_user auto-crea profile + user_progress
-- ═══════════════════════════════════════════════════════════════

do $$
declare
    v_elisa_id uuid;
    v_laura_id uuid;
begin
    -- ───────────────────────────────────────────────
    -- 1. ELISA
    -- ───────────────────────────────────────────────
    select id into v_elisa_id from auth.users where email = 'elisa@lapalmayeltucan.com';

    if v_elisa_id is null then
        v_elisa_id := gen_random_uuid();
        insert into auth.users (
            instance_id, id, aud, role, email,
            encrypted_password, email_confirmed_at,
            created_at, updated_at,
            raw_user_meta_data, raw_app_meta_data,
            confirmation_token, recovery_token,
            email_change_token_new, email_change
        ) values (
            '00000000-0000-0000-0000-000000000000',
            v_elisa_id,
            'authenticated',
            'authenticated',
            'elisa@lapalmayeltucan.com',
            crypt('CraftLab2026!', gen_salt('bf')),
            now(),
            now(), now(),
            '{"full_name":"Elisa Maria Madriñán"}'::jsonb,
            '{"provider":"email","providers":["email"]}'::jsonb,
            '', '', '', ''
        );

        -- identities row (requerido para auth)
        insert into auth.identities (
            id, user_id, provider_id, identity_data, provider,
            last_sign_in_at, created_at, updated_at
        ) values (
            gen_random_uuid(),
            v_elisa_id,
            v_elisa_id::text,
            jsonb_build_object('sub', v_elisa_id::text, 'email', 'elisa@lapalmayeltucan.com'),
            'email',
            now(), now(), now()
        );

        raise notice 'Created user: Elisa (%)', v_elisa_id;
    else
        update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where id = v_elisa_id;
        raise notice 'Elisa already existed — confirmed email';
    end if;

    -- Asegurar profile + user_progress (idempotent)
    insert into public.profiles (id, email, full_name, role)
    values (v_elisa_id, 'elisa@lapalmayeltucan.com', 'Elisa Maria Madriñán', 'partner')
    on conflict (id) do update set full_name = excluded.full_name;

    insert into public.user_progress (user_id, points, craftlab_unlocked)
    values (v_elisa_id, 0, false)
    on conflict (user_id) do nothing;

    -- ───────────────────────────────────────────────
    -- 2. LAURA
    -- ───────────────────────────────────────────────
    select id into v_laura_id from auth.users where email = 'lauraescovarc@gmail.com';

    if v_laura_id is null then
        v_laura_id := gen_random_uuid();
        insert into auth.users (
            instance_id, id, aud, role, email,
            encrypted_password, email_confirmed_at,
            created_at, updated_at,
            raw_user_meta_data, raw_app_meta_data,
            confirmation_token, recovery_token,
            email_change_token_new, email_change
        ) values (
            '00000000-0000-0000-0000-000000000000',
            v_laura_id,
            'authenticated',
            'authenticated',
            'lauraescovarc@gmail.com',
            crypt('CraftLab2026!', gen_salt('bf')),
            now(),
            now(), now(),
            '{"full_name":"Laura Escovar"}'::jsonb,
            '{"provider":"email","providers":["email"]}'::jsonb,
            '', '', '', ''
        );

        insert into auth.identities (
            id, user_id, provider_id, identity_data, provider,
            last_sign_in_at, created_at, updated_at
        ) values (
            gen_random_uuid(),
            v_laura_id,
            v_laura_id::text,
            jsonb_build_object('sub', v_laura_id::text, 'email', 'lauraescovarc@gmail.com'),
            'email',
            now(), now(), now()
        );

        raise notice 'Created user: Laura (%)', v_laura_id;
    else
        update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where id = v_laura_id;
        raise notice 'Laura already existed — confirmed email';
    end if;

    insert into public.profiles (id, email, full_name, role)
    values (v_laura_id, 'lauraescovarc@gmail.com', 'Laura Escovar', 'partner')
    on conflict (id) do update set full_name = excluded.full_name;

    insert into public.user_progress (user_id, points, craftlab_unlocked)
    values (v_laura_id, 0, false)
    on conflict (user_id) do nothing;
end $$;

-- Verificación
select
    u.email,
    u.email_confirmed_at is not null as email_confirmed,
    p.full_name,
    up.points,
    up.craftlab_unlocked
from auth.users u
left join public.profiles p on p.id = u.id
left join public.user_progress up on up.user_id = u.id
where u.email in ('elisa@lapalmayeltucan.com', 'lauraescovarc@gmail.com');
