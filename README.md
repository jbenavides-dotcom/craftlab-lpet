# CraftLab & Forward Booking — La Palma y el Tucán

App PWA exclusiva de **La Palma & El Tucán** para partners premium. Integra dos programas:

- **CraftLab** — "Your Coffee Playground": laboratorio experimental donde el usuario diseña el perfil de su café controlando variedad → fermentación → secado
- **Forward Booking** — "Neighbors & Crops": reserva anticipada (500 sacos/año) con 4 filtros cruzados (Fecha, Variedad, Perfil de sabor, Proceso)

**Live:** https://jbenavides-dotcom.github.io/craftlab-lpet/
**Cliente:** Felipe Sardi / La Palma & El Tucán
**Fase actual:** 🧪 **TESTING ACTIVO con usuarios** — priorizar estabilidad sobre features nuevas.

---

## Estado actual (2026-04-24)

- Supabase LIVE (proyecto `itafxhlhftayznpqsrxr`) con auth real, 4 migraciones aplicadas
- POST real de `fb_orders` y `cl_orders` funcionando
- Deploy automático a GitHub Pages vía CI (HashRouter por subpath)
- PWA instalable con safe-areas iOS + splash screen
- +117 commits ahead de `upstream` (David `davidsmdg/CraftLab`) — ya somos un repo independiente, no fork literal
- Widget LIVE de fermentación en Orders con lecturas de `sensor_readings`

### Páginas implementadas
- **Auth:** Login, ProtectedRoute
- **Home:** landing con 3 program cards (FB, CL, Community) + greeting integrado + contador de puntos
- **Forward Booking:** Route hub (tap + confirm) → Date → Flavor → Process → Variety → Quantity → Review & Confirm → Success
- **CraftLab Educación:** Onboarding → BasicEducation / TechEducation → Quiz → Welcome (hoja de ruta)
- **CraftLab Configurator:** wizard step-by-step con Macroprofile → Flavor → Variety → Quantity → Category → Method → Step 7 (fermentación) → Precision Parameters → Confirm
- **Cuenta:** Profile (layout 2-col desktop), Notifications, About Us
- **Orders:** grid responsive 1→2→3 cols con widget fermentación LIVE + modal detalle

---

## Stack

```
React 19.1 + TypeScript 5.8 + Vite 6.3
React Router 7.13 (HashRouter — obligatorio por GH Pages subpath)
Supabase JS 2.98 (auth + DB + RLS)
vite-plugin-pwa 1.2 (PWA con skipWaiting + clientsClaim)
lucide-react (iconos)
canvas-confetti (celebraciones unlock/success)
Deploy: GitHub Pages (CI) + Vercel (vercel.json presente)
```

## Setup local

```bash
npm install
npm run dev          # http://localhost:5173/
```

En dev, la ruta `/` redirige directamente a `/home` sin login (`import.meta.env.DEV`). En prod requiere Supabase auth.

### Variables de entorno
Crear `.env.local` con:
```
VITE_SUPABASE_URL=https://<proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```
**Nunca commitear credenciales.** `.env.local` y `.env.production` están en `.gitignore`.

---

## Supabase schema

**Migraciones** (en `supabase/migrations/`):
1. `001_initial_schema.sql` — tablas base
2. `002_tanks_and_orders_wiring.sql` — tanks + sensor_readings + assignments
3. `003_ferment_widget_demo.sql` — datos demo fermentación
4. `004_demo_users_elisa_laura.sql` — usuarios prueba

**Tablas:**
- `profiles` (roles: partner/admin/operator)
- `user_progress` (craftlab_unlocked, quiz_score, points)
- `fermentation_protocols` (referencia Katherine — pendiente cablear filtrado cruzado)
- `lotes`, `fb_orders`, `cl_orders`, `order_updates`, `notifications`
- `tanks`, `sensor_readings`, `order_tank_assignments`

---

## Componentes reutilizables

- **`AppShell`** — sidebar permanente desktop (≥900px) + mobile card flotante
- **`ExitConfirmModal`** — variantes `craftlab` (navy) / `forwardbooking` (ocre)
- **`InfoPopover`** — desktop popover / mobile bottom sheet
- **`FermentationWidget`** — widget LIVE en Orders con modal detalle
- **`ProtectedRoute`** — guard de auth
- **`Success.tsx`** (page) — pantalla reutilizable para FB y CL

---

## Git workflow

### Remotes
```
origin       → jbenavides-dotcom/craftlab-lpet    (push AQUÍ, propio)
upstream     → davidsmdg/CraftLab                 (INTOCABLE, referencia David)
fork-viejo   → jbenavides-dotcom/CraftLab         (respaldo fork antiguo)
```

**NUNCA** pushear a `upstream`. Siempre `git push origin <rama>`.

### Ramas activas
- `main` — producción (deploy automático a GH Pages)
- `feat/p0-fixes`, `feat/p1-fixes`, `feat/p2-fixes` — sesión auditoría 17-abr
- `feat/home-redesign` — rediseño home
- `feature/persist-configuration`

Para features nuevas: `git checkout -b feat/<descripción-corta>` desde `main`.

### Identity local
Seteada solo en este repo: `Jhonatan Esteban <jbenavides@lapalmayeltucan.com>`.

---

## Protocolo de continuidad entre sesiones

Regla del usuario (2026-04-24): **mantener este README actualizado cada sesión** para que la siguiente arranque con contexto fresco.

### Al terminar una sesión de cambios
1. Actualizar sección **"Estado actual"** con lo hecho
2. Registrar bugs encontrados en testing en **"Issues activos"** (abajo)
3. Mover TODOs resueltos desde **"Pendientes"** a **"Estado actual"**
4. Commitear con mensaje resumen

### Al empezar una sesión nueva
1. Leer este README completo
2. Leer `memory/la-palma-y-el-tucan/craftlab-proyecto.md`
3. Leer la nota de sesión más reciente si existe
4. `git log --oneline -20` para ver los últimos commits

---

## Issues activos (testing)

> Registrar aquí bugs reportados por usuarios de testing para que la siguiente sesión los priorice. Formato: `- [YYYY-MM-DD] <descripción>`. Mover a Estado actual cuando se resuelvan.

_Ninguno registrado aún._

---

## Pendientes

- [ ] Filtrado cruzado real Variety × Flavor × Process contra `fermentation_protocols` (tabla existe, falta cablear queries)
- [ ] Copy final de los 7 `InfoPopover` en Configurator (cata) — hoy placeholders marcados `// TODO cata: refine copy`
- [ ] Assets finales LP&ET:
  - `/public/hero-ferment.mp4` + poster (hoy placeholder Unsplash)
  - `/public/varieties/*.jpg` (10 variedades — algunas con Cloudinary, faltan otras)
  - Imagen Shipment step 8
- [ ] Panel admin para operarios (subir fotos/mensajes de seguimiento)
- [ ] Build warning: chunk >500 kB y dynamic import en `Home.tsx` (preexistentes)

---

## Arquitectura histórica

- Spec original: `instrucciones craftlab.txt` (1185 líneas, 36 interfaces) — referencia histórica, la implementación ya divergió
- Sesión auditoría 17-abr: rebrandeo componentes + fork creado + 10 fixes priorizados (ver `memory/la-palma-y-el-tucan/craftlab-sesion-2026-04-17.md`)
- Sesión validación 24-abr: reconcilió memoria con 114 commits nuevos + Supabase LIVE + testing (ver `memory/la-palma-y-el-tucan/craftlab-sesion-2026-04-24.md`)

---

## Créditos

- Diseño original: **David** (`davidsmdg`) — upstream intocable
- Implementación y evolución: **Jhonatan Benavides** (`jbenavides-dotcom`)
- Producto / Cliente: **Felipe Sardi** / La Palma & El Tucán
