# CRAFT LAB — Agente de Desarrollo

## Estilo de Comunicación
**Be extremely concise. Sacrifice grammar for concision.**
- Planes, commits, respuestas: mínimas palabras, máximo valor
- No explicar lo obvio
- Bullets > párrafos
- Código > explicación

## Contexto del Proyecto
Plataforma web colaborativa para tostadores especializados que interactúan
con procesos de fermentación, secado y beneficio de cafés especiales de
La Palma y El Tucán (Colombia). Los clientes co-crean su perfil de sabor
en tiempo real desde cualquier parte del mundo.

## Mi Rol Como Agente
- Analizar la arquitectura existente sin modificar producción
- Proponer y ejecutar mejoras de UX/UI en ramas paralelas (feature branches)
- Mejorar la captura y visualización de datos del cliente
- Garantizar que ningún cambio afecte la rama `main` en producción

## Reglas Obligatorias
- NUNCA commits directos a `main`
- SIEMPRE rama `feature/[nombre]`
- SIEMPRE PR antes de merge
- Plan Mode (Shift+Tab x2) para cambios >3 archivos
- /compact cada 10-15 mensajes
- /context antes de cada fase

## Workflow para Features Complejos

### 1. PLAN FIRST (siempre)
```
Shift+Tab x2 → Plan Mode → Explorar → Preguntas → Plan Multi-fase
```

### 2. Al final de cada plan, incluir:
```markdown
## Unresolved Questions
- [ ] Pregunta 1?
- [ ] Pregunta 2?
- [ ] Pregunta 3?
```

### 3. Si feature > 1 context window → GitHub Issue
```bash
gh issue create --title "Plan: [feature]" --body "[plan completo]"
```
Luego en nueva sesión:
```
get GitHub issue #XX and execute Phase N
```

### 4. Template Plan Multi-fase
```markdown
## Plan: [Feature Name]

### Phase 1: [nombre]
- [ ] Tarea 1
- [ ] Tarea 2
Files: `file1.ts`, `file2.ts`

### Phase 2: [nombre]
- [ ] Tarea 1
- [ ] Tarea 2
Files: `file3.ts`

### Phase 3: [nombre]
...

## Unresolved Questions
- [ ] ...
```

### 5. Entre fases
```bash
git add -A  # o commit
/context    # verificar tokens
```

### 6. Retomar sesión
```bash
claude --continue  # después de Ctrl+C
```

## Stack Confirmado
- [x] Frontend: React 19 + TypeScript + Vite
- [x] Backend: Supabase (Auth + Database)
- [x] Base de datos: PostgreSQL (via Supabase)
- [x] Auth: Supabase Auth (email/password)
- [x] Deploy: Vercel + PWA (vite-plugin-pwa)
- [x] UI: Componentes custom + Lucide icons
- [x] Routing: react-router-dom v7
- [x] Assets: Cloudinary (imágenes)

## Estructura del Proyecto
```
src/
├── App.tsx                    # Router principal
├── main.tsx                   # Entry point
├── index.css                  # Estilos globales
├── components/ui/             # Componentes reutilizables
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Slider.tsx
│   └── Stepper.tsx
├── lib/                       # Utilidades y servicios
│   ├── supabase.ts           # Cliente Supabase
│   ├── user-progress.ts      # Progreso educativo usuario
│   └── fb-utils.ts           # Utilidades adicionales
└── pages/
    ├── Login.tsx             # Autenticación
    ├── Home.tsx              # Dashboard principal
    ├── Orders.tsx            # Historial de pedidos
    ├── craftlab/             # Flujo CraftLab
    │   ├── CraftLabOnboarding.tsx
    │   ├── CraftLabBasicEducation.tsx
    │   ├── CraftLabTechEducation.tsx
    │   ├── CraftLabQuiz.tsx
    │   ├── CraftLabWelcome.tsx
    │   └── CraftLabConfigurator.tsx
    └── [Forward Booking]/    # Flujo de reserva
        ├── ForwardBookingRoute.tsx
        ├── DateSelector.tsx
        ├── VarietySelector.tsx
        ├── FlavorSelector.tsx
        ├── ProcessSelector.tsx
        ├── QuantitySelector.tsx
        ├── ReviewConfirm.tsx
        └── Success.tsx
```

## Flujos Principales

### 1. Flujo CraftLab (Educación + Configurador)
```
Login → Home → /craftlab/onboarding
                    ↓
          [Education Tool]        [CraftLab] (bloqueado hasta completar educación)
                ↓                       ↓
    /education/basic            /craftlab/welcome
    /education/advanced         /craftlab/configurator
    /education/quiz
```

### 2. Flujo Forward Booking (Reserva tradicional)
```
/forward-booking/route → /date → /variety → /flavor → /process → /quantity → /review → /success
```

## Tablas Supabase (Identificadas)
- `user_progress`: user_id, education_completed, updated_at

## Configurador: Opciones Disponibles
| Paso | Campo | Opciones |
|------|-------|----------|
| 1 | Macro Profile | Fermented, Bright, Classic |
| 2 | Flavor Profile | Depende del macro seleccionado |
| 3 | Variety | Geisha, Sidra, Gesha/Sidra Blend |
| 4 | Quantity | 35kg, 70kg, 105kg (boxes) |
| 5 | Category | Bio-Innovation, Lactic, Natural, Washed, Honey |
| 6 | Method | Mucilage, Cherry fermentation, etc. |
| 7 | Parameters | Stabilization, Fermentation time, Solar/Mech dry |

## Variables de Entorno Requeridas
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Comandos de Desarrollo
```bash
npm install          # Instalar dependencias
npm run dev          # Servidor desarrollo (Vite)
npm run build        # Build producción
npm run preview      # Preview build
npm run lint         # ESLint
```

## Subagentes Activos
- ui-ux-specialist → mejoras de interfaz
- code-reviewer → antes de cada PR
- api-security-auditor → cambios en auth/datos
- fullstack-developer → features completos

## Comandos Claude Code
| Comando | Cuándo usar |
|---------|-------------|
| `/context` | Antes de cada fase, verificar tokens |
| `/compact` | Cada 10-15 mensajes |
| `/cost` | Monitorear gasto |
| `/clear` | Cambiar de tarea |
| `/memory` | Ver/editar reglas |
| `Shift+Tab x2` | Plan Mode |
| `Ctrl+C x2` | Salir |
| `claude --continue` | Retomar sesión |

## Áreas de Mejora Identificadas (Pendiente Análisis Detallado)
1. [ ] Captura de datos del tostador post-configuración
2. [ ] Dashboard de seguimiento del lote
3. [ ] Sistema de notificaciones en tiempo real
4. [ ] Feedback loop tostador ↔ finca
5. [ ] Persistencia de configuración en progreso
6. [ ] Responsive/mobile optimization
7. [ ] Internacionalización (i18n)
