# PROMPT DE CIERRE — CRAFT LAB

```
================================================================================
                    CIERRE DE SESIÓN — CRAFT LAB
================================================================================

                         FASE 1: DOCUMENTAR
================================================================================

Actualiza .claude/SESSION_LOG.md:

```markdown
## Sesión: [FECHA]
**Costo:** [/cost]

### Completado
- [ ] ...

### Archivos Modificados
| Archivo | Cambio |
|---------|--------|
| ... | ... |

### Pendiente (próxima sesión)
1. [ALTA] ...
2. [MEDIA] ...

### Notas
- ...
```

================================================================================
                         FASE 2: VERIFICAR
================================================================================

```bash
# Estado de cambios
git status
git diff --stat

# Si hay cambios, commit
git add -A
git commit -m "feat/fix: [descripción]

- Detalle 1
- Detalle 2

Sesión: [fecha]"

# Verificar rama (NUNCA en main)
git branch

# Costo final
/cost
```

================================================================================
                         FASE 3: ACTUALIZAR PROGRESO
================================================================================

Actualiza .claude/PROGRESO.md:

```markdown
# Progreso CRAFT LAB
**Última actualización:** [FECHA]

## Features
| Feature | Estado | % |
|---------|--------|---|
| Persistir configuración | 🔄 | 30% |
| Dashboard lotes | 📋 | 0% |
| ... | ... | ... |

## Próximos Pasos
1. ...
2. ...
```

================================================================================
                         CHECKLIST FINAL
================================================================================

□ SESSION_LOG.md actualizado
□ PROGRESO.md actualizado
□ Cambios commiteados
□ Estamos en feature branch (NO main)
□ /cost anotado

================================================================================
                         RESUMEN RÁPIDO
================================================================================

Dame esto antes de cerrar:

```
RESUMEN SESIÓN
==============
📅 Fecha:
💰 Costo:
🌿 Rama:

✅ LOGRADO:
1.
2.

⏳ PENDIENTE:
1. [ALTA]
2. [MEDIA]

🔜 PRÓXIMA SESIÓN:
-
```

================================================================================
                         CERRAR
================================================================================

1. /compact
2. Cerrar terminal

================================================================================
```
