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

## Contexto y Referencias

| Símbolo | Uso | Ejemplo |
|---------|-----|---------|
| `@` | Añadir archivo como contexto | `@src/pages/Login.tsx` |
| `#` | Guardar memoria/regla | `# No preguntar npm run dev` |
| `?` | Cheat sheet de comandos | `?` |

## Comandos Personalizados

Ubicación: `.claude/commands/[nombre].md`

### design-mode.md (prototipar UI)
```markdown
You are in DESIGN MODE:
- Use dummy JSON data only
- Focus on UI/UX, not backend logic
- Create visual prototypes
- Don't connect to database yet
```

### review-code.md (pre-PR)
```markdown
Review this code for:
- Security vulnerabilities
- Performance issues
- React best practices
- TypeScript strict compliance
```

## Permisos y Hooks

### Permisos (`.claude/settings.local.json`)
```json
{
  "permissions": {
    "allow": ["npm run dev", "npm run build", "git *"],
    "deny": ["rm -rf", "sudo *", "drop table"]
  }
}
```

### Hooks útiles
```bash
# Notificación audio cuando Claude termina
# Instalar: npx claude-code-hooks
# Ver: github.com/PascualPeredaHN/awesome-claude-code
```

## Tips de Desarrollo

1. **Skeleton first** - Estructura app antes de features
2. **Commit frecuente** - Después de cada cambio exitoso
3. **Branches experimentales** - Cambios arriesgados en branch separado
4. **Múltiples agentes** - Correr 2+ Claude en paralelo (frontend + backend)
5. **Context7** - Usar web search para docs actualizados
6. **Git diff review** - Revisar cambios en VS Code/Cursor antes de commit
7. **Don't ask npm dev** - Ya está corriendo, agregar a memorias

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

## Sub-agentes

### Crear sub-agente
```bash
/agents → Create New Agent → Generate with Claude
```

### Activos para CRAFT LAB
| Agente | Trigger | Uso |
|--------|---------|-----|
| ui-ux-specialist | Cambios UI | Revisar diseño |
| code-reviewer | Pre-PR | Calidad código |
| api-security-auditor | Cambios auth | Vulnerabilidades |
| react-production-engineer | Post-feature | Production readiness |

### Tip
Escribir buena descripción → Claude los llama automáticamente cuando corresponde

## Comandos Claude Code

### Esenciales
| Comando | Cuándo usar |
|---------|-------------|
| `/context` | Verificar tokens antes de cada fase |
| `/compact` | Cada 10-15 mensajes |
| `/cost` | Monitorear gasto |
| `/clear` | Cambiar de tarea |
| `?` | Cheat sheet rápido |
| `Shift+Tab x2` | Plan Mode |

### Nuevos (2025)
| Comando | Cuándo usar |
|---------|-------------|
| `/simplify` | **MUY ÚTIL** - Revisa código: reuse, quality, efficiency |
| `/batch` | Migraciones grandes (usa worktrees + agentes paralelos) |
| `/remote` | Controlar sesión desde teléfono/otra máquina |
| `/memory` | Ver/editar reglas + auto-memory on/off |

### Agent Teams (Opus 4.6)
Orquestar múltiples agentes trabajando en paralelo.

**Activar:** Agregar a `.claude/settings.json`:
```json
{
  "enableAgentTeams": true
}
```

**Ejemplo de uso:**
```
Create an agent team:
- UX specialist
- Technical architect
- Devil's advocate
```

**Controles:**
| Tecla | Acción |
|-------|--------|
| `Shift+Up` | Expandir vista de agentes |
| `Shift+Down` | Contraer |
| `Shift+Up/Down` | Navegar entre sub-agentes |

**Cuándo usar:**
- Explorar problema desde múltiples ángulos
- Diseño + arquitectura + crítica simultánea
- Features complejos que necesitan perspectivas

**Costo:** Alto (múltiples agentes Opus). Usar selectivamente.

### Configuración
| Comando | Cuándo usar |
|---------|-------------|
| `/init` | Crear CLAUDE.md inicial |
| `/ide` | Verificar conexión Cursor/VS Code |
| `/agents` | Crear/ver sub-agentes |

### Terminal
| Comando | Uso |
|---------|-----|
| `claude` | Iniciar sesión |
| `claude -c` | Continuar última |
| `claude -r` | Elegir sesión anterior |
| `Ctrl+C x2` | Salir |

## Modelos y Cuándo Usarlos

### Opus 4.6 (Junio 2025)
- **Context:** 1M tokens (pero gestionar igual)
- **Mejor para:** Prototipos, diseño, features nuevos, entusiasmo creativo
- **Agent Teams:** Orquestación de múltiples agentes
- **Advanced compaction:** Compactación automática mejorada
- **Costo:** Alto (~$15 input, ~$75 output por 1M tokens)

### Sonnet (default)
- **Mejor para:** Tareas diarias, balance costo/calidad
- **Costo:** Moderado

### Cuándo usar GPT (Codex 5.3)
- **Refactors quirúrgicos:** Más preciso, menos "entusiasta"
- **Brownfield projects:** Cambios específicos en código existente
- **Costo:** ~75% más barato que Opus

### Recomendación CRAFT LAB
| Tarea | Modelo |
|-------|--------|
| Prototipos UI | Opus/Sonnet |
| Features nuevos | Opus |
| Refactors | GPT Codex |
| Tareas diarias | Sonnet |
| Agent Teams | Opus |

## Advertencias

### Auto-memory: usar con cuidado
- Puede confundir al modelo
- Mejor: código limpio > muchas reglas
- Si usas, podar regularmente

### Outages
- Claude tiene outages frecuentes
- **Backup**: tener Cursor configurado
- Cursor respeta settings de Claude Code

### /simplify > documentación excesiva
Estudios muestran que CLAUDE.md muy largo puede **bajar** eficacia del agente.
Mejor: código limpio + reglas mínimas.

### Context window 1M
No significa 4x más código. Mismos problemas de antes.
Seguir gestionando contexto con /compact y /clear.

## Áreas de Mejora Identificadas (Pendiente Análisis Detallado)
1. [ ] Captura de datos del tostador post-configuración
2. [ ] Dashboard de seguimiento del lote
3. [ ] Sistema de notificaciones en tiempo real
4. [ ] Feedback loop tostador ↔ finca
5. [ ] Persistencia de configuración en progreso
6. [ ] Responsive/mobile optimization
7. [ ] Internacionalización (i18n)
