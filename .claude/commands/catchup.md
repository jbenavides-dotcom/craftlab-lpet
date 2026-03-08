# Project Catchup

Read and summarize current project state.

## Steps

1. Read `.claude/SESSION_LOG.md` - last session activities
2. Read `.claude/PROGRESO.md` - feature status
3. Run `git status` - pending changes
4. Run `git log --oneline -5` - recent commits
5. Run `git branch` - current branch

## Output Format

```
ESTADO CRAFT LAB
================
📍 Rama: [branch]
📅 Última sesión: [fecha]

✅ COMPLETADO:
- item 1
- item 2

🔄 EN PROGRESO:
- item 1 (X%)

📋 PENDIENTE:
1. [ALTA] ...
2. [MEDIA] ...

⚠️ CAMBIOS SIN COMMIT:
- file1.tsx
- file2.ts

🔜 SUGERIDO PARA HOY:
- ...
```

Then ask: "¿Qué quieres lograr hoy?"
