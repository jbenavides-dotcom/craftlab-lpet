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

### North Star
> Turn process traceability into a **shared project (co-creation)**, not just a report.

### SDT Framework (Self-Determination Theory)
| Need | Implementation |
|------|----------------|
| Autonomy | Choose participation depth, control notifications |
| Competence | Clear explanations, "why this mattered" summaries |
| Relatedness | Human connection to origin, processing team |

### Docs de Referencia
- `docs/BEST_PRACTICES_SUMMARY.md` - UX, arquitectura, traceability
- `docs/BEST_PRACTICES_ROASTERS_PLATFORM.docx` - Documento completo

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
│   ├── lot-config.ts         # CRUD configuraciones lote
│   └── fb-utils.ts           # Utilidades adicionales
└── pages/
    ├── Login.tsx             # Autenticación
    ├── Home.tsx              # Dashboard principal
    ├── Orders.tsx            # Historial de pedidos
    └── craftlab/             # Flujo CraftLab
        ├── CraftLabOnboarding.tsx
        ├── CraftLabBasicEducation.tsx
        ├── CraftLabTechEducation.tsx
        ├── CraftLabQuiz.tsx
        ├── CraftLabWelcome.tsx
        ├── CraftLabConfigurator.tsx
        └── CraftLabSuccess.tsx
```

## Flujo Principal: CraftLab

```
Login → Home → CraftLab Modal
                    ↓
     ┌──────────────┴──────────────┐
     │                             │
[Education Tool]            [CraftLab Configurator]
     │                        (bloqueado hasta completar)
     ↓                             │
/education/basic                   ↓
/education/advanced         /craftlab/welcome
/education/quiz             /craftlab/configurator
     │                      /craftlab/success
     └──────────────────────────────┘
                    ↓
              /orders (ver lotes)
```

## Tablas Supabase
- `user_progress`: user_id, education_completed, updated_at
- `lot_configurations`: user_id, status, macro, flavor, variety, quantity, category, process, stabilization, cherry_ferm, mucilage_ferm, solar_dry, mech_dry, submitted_at

## Data Model: Processing Variables (Best Practices)

### "Digital Lot Passport"
Cada lote debe ser un **narrative + dataset** que:
1. Preserva identidad a través de transformaciones
2. Registra qué pasó y por qué
3. Soporta sharing selectivo
4. Sirve para auditorías y storytelling

### Variables de Fermentación/Secado
| Variable | Target | Propósito |
|----------|--------|-----------|
| Temperature | - | Control fermentación |
| Time | - | Duración por etapa |
| pH | - | Acidez |
| °Brix | - | Contenido azúcar |
| O₂/CO₂ | - | Condiciones aeróbicas/anaeróbicas |
| Moisture % | 10-12% | Endpoint secado |
| Water Activity (aw) | <0.70 | Estabilidad (SCA standard) |

### UX: Progressive Disclosure (3 capas)
| Capa | Contenido |
|------|-----------|
| 1. Fast scan | Qué pasa ahora, próximo milestone, flags, fotos |
| 2. Decision support | Trends, comparación vs targets, notas QC |
| 3. Expert mode | Logs completos, exports, lab results, audit trails |

## Configurador: Flujo de 4 Pasos (v2 - Marzo 2026)

| Step | Field | Options |
|------|-------|---------|
| 1 | Goal | Competition Lot, Retail/Café, Experimental, Blend Component |
| 2 | Variety | Geisha (350kg), Sidra (347kg), Yellow Bourbon (125kg), Java (75kg), Mokka (15kg) |
| 3 | Protocol | 5 protocolos LP&ET (ver abajo) |
| 4 | Quantity + Options | 1/2/3 boxes (12.5/25/37.5 kg) + Advanced params |

### 5 Fermentation Protocols (Real LP&ET Science)

| Protocol | Duration | pH | Temp | SCA | Flavor Profile |
|----------|----------|-----|------|-----|----------------|
| **Lactic LPX** | 96h cherry + 24-36h mucilage | 5.2→3.8 | 18-22°C | 89.5-90.5 | Citric, Floral, Lactic acidity, Clean |
| **Bio-Innovation Washed** | 90-110h cherry + 12-24h oxidative | 5.2→3.8 | 18-24°C | 89.5-91 | Winey, Florals, Persistence, Elegant |
| **Natural Oscillating 120** | 120h whole cherry | 5.2→3.9-4.1 | 16-26°C | 89-90.5 | Ripe fruit, Rum, Dark chocolate, Body |
| **Clarity Select pH** | 48h cherry + 24h mucilage | 5.2→3.9 | 20-24°C | 90-91.25 | Jasmine, Sweet lemon, White flower |
| **Bionatural Selection X** | 72-100h native inoculants | 5.2→3.8-4.0 | 18-24°C | 89-90 | Plum, Black grape, Cacao, Winey |

### Reference Lots (Past Successes)
- **WBC-2024-001**: Geisha + Clarity → SCA 91.25 (WBC Milan finalist)
- **COE-2023-015**: Sidra + Lactic → SCA 90.5 (COE Colombia #3)
- **RETAIL-2024-089**: Bourbon + Bio-Innovation → SCA 89.5 (12+ EU roasters)
- **EXP-2024-007**: Java + Bionatural → SCA 89.0 (CL-113 strain)
- **NAT-2023-042**: Geisha + Natural → SCA 90.0 (Perfect fruit bomb)

### Advanced Options Features
- **Lot Prediction**: SCA range, timeline, risk level, flavor profile
- **Reference Lots**: Similar successful lots with exact parameters
- **Smart Tips**: Protocol-specific recommendations from science team
- **Warnings**: Real-time alerts for risky parameter combinations
- **Parameter Controls**: Cherry ferm (24-144h), Mucilage ferm (12-48h), Solar days (10-50)

### Drying Methods
| Method | Duration | Best For |
|--------|----------|----------|
| 100% Solar | 15-45 days | Maximum aromatic preservation |
| Hybrid | 10-20 days + 12-24h | Balance quality/consistency |
| Controlled Mechanical | 24-48h | Maximum consistency |

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

## Cloudinary Assets
- **Base URL**: `https://res.cloudinary.com/dsylu9a7k/image/upload/`
- **CraftLab folder**: `lpet-craftlab/`
- **Images**:
  - `cultivo-cafetales.jpg` - Hero/farm view
  - `cereza-madura.jpg` - Ripe cherry
  - `fermentacion-tanques.jpg` - Fermentation tanks
  - `secado-marquesinas.jpg` - Solar drying beds
  - `cafe-pergamino.jpg` - Parchment coffee
  - `tostado-stronghold.jpg` - Roasting

## Team (Real LP&ET Data)
- **Sergio Barrera**: Head of Processing, fermentation science
- **Ismelda Cubillos**: Quality Lab Manager
- **Katherine**: Inventory & logistics

## Áreas de Mejora
- [x] ~~Persistencia de configuración en progreso~~ (auto-save implemented)
- [x] ~~Responsive/mobile optimization~~ (mobile-first CSS)
- [x] ~~Internacionalización (i18n)~~ (English UI implemented)
- [ ] Captura de datos del tostador post-configuración
- [ ] Dashboard de seguimiento del lote
- [ ] Sistema de notificaciones en tiempo real
- [ ] Feedback loop tostador ↔ finca
- [ ] Tracking module (lot status updates)
