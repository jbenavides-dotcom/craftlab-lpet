# PROMPT DE APERTURA — CRAFT LAB

```
================================================================================
                    INICIO DE SESIÓN — CRAFT LAB
================================================================================

📁 PROYECTO: cd ~/craft-lab-agent/craft-lab

================================================================================
                         CARGA DE CONTEXTO
================================================================================

Lee estos archivos EN ORDEN antes de actuar:

1. CLAUDE.md                    → Reglas y stack del proyecto
2. ARQUITECTURA_CRAFTLAB.md     → Estructura técnica detallada
3. .claude/SESSION_LOG.md       → Historial de sesiones (si existe)
4. .claude/PROGRESO.md          → Estado del trabajo (si existe)

Ejecuta:
```bash
git status && git branch && git log --oneline -5
```

================================================================================
                         HERRAMIENTAS DISPONIBLES
================================================================================

🔧 COMANDOS CLAVE:
| Comando    | Uso                                    |
|------------|----------------------------------------|
| /compact   | Cada 10-15 mensajes                    |
| /cost      | Monitorear gasto                       |
| /clear     | Al cambiar de tarea                    |
| Shift+Tab  | Plan Mode (2 veces) para cambios >5 archivos |

📋 REGLAS CRAFT LAB:
- NUNCA commits directos a main
- SIEMPRE trabajar en feature/[nombre]
- SIEMPRE crear PR antes de merge
- Supabase = backend (no hay API propia)

================================================================================
                         ESTADO RÁPIDO
================================================================================

Responde en bullets:
1. ¿En qué rama estamos?
2. ¿Qué se completó en la última sesión?
3. ¿Qué quedó pendiente?

Luego pregúntame: "¿Qué quieres lograr hoy?"

NO codifiques hasta que confirme el objetivo.

================================================================================
```
