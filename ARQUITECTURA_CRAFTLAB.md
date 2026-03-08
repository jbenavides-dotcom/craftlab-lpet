# ARQUITECTURA CRAFT LAB — Análisis Completo

## 1. Stack Tecnológico

| Capa | Tecnología | Versión | Notas |
|------|------------|---------|-------|
| Frontend | React | 19.1.0 | Última versión estable |
| Build Tool | Vite | 6.3.5 | Con HMR |
| Lenguaje | TypeScript | 5.8.3 | Strict mode |
| Routing | react-router-dom | 7.13.1 | BrowserRouter |
| Backend | Supabase | 2.98.0 | BaaS completo |
| Auth | Supabase Auth | - | Email/Password |
| Database | PostgreSQL | - | Via Supabase |
| Icons | Lucide React | 0.577.0 | SVG icons |
| Animations | canvas-confetti | 1.9.4 | Celebraciones |
| Deploy | Vercel | - | Con PWA |
| PWA | vite-plugin-pwa | 1.2.0 | Offline support |

## 2. Mapa de Carpetas

```
craft-lab/
├── public/                    # Assets estáticos
├── src/
│   ├── assets/               # Imágenes locales
│   ├── components/
│   │   └── ui/               # Design system
│   │       ├── Button.tsx    # Botón primario/outline/ghost
│   │       ├── Input.tsx     # Input con validación
│   │       ├── Modal.tsx     # Modal overlay
│   │       ├── Slider.tsx    # Slider para parámetros
│   │       └── Stepper.tsx   # Indicador de pasos
│   ├── lib/
│   │   ├── supabase.ts       # Cliente singleton
│   │   ├── user-progress.ts  # CRUD progreso usuario
│   │   └── fb-utils.ts       # Utilidades Facebook/tracking
│   ├── pages/
│   │   ├── craftlab/         # Módulo educativo + configurador
│   │   └── [otros]           # Forward booking, orders, etc.
│   ├── App.tsx               # Definición de rutas
│   ├── App.css
│   ├── index.css             # Variables CSS globales
│   └── main.tsx              # ReactDOM.createRoot
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json               # Rewrites para SPA
```

## 3. Flujo de Datos

### 3.1 Autenticación
```
Usuario → Login.tsx → supabase.auth.signInWithPassword()
                              ↓
                    Supabase valida credenciales
                              ↓
                    Session almacenada (Supabase SDK)
                              ↓
                    Redirect → /home
```

### 3.2 Progreso Educativo
```
CraftLabOnboarding → checkEducationCompletion()
                              ↓
                    supabase.from('user_progress').select()
                              ↓
                    education_completed: boolean
                              ↓
                    Desbloquea Configurador si true
```

### 3.3 Configurador (Estado Local)
```
CraftLabConfigurator → useState<ConfigState>
        ↓
    Selección progresiva:
    macro → flavor → variety → quantity → category → process → params
        ↓
    "Continue to Fulfillment" → [SIN IMPLEMENTAR]
```

## 4. Modelo de Datos (Supabase)

### Tablas Identificadas
```sql
-- Inferido del código
CREATE TABLE user_progress (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    education_completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### Tablas Probables (No Confirmadas)
- `orders` - Pedidos de café
- `lots` - Lotes de café en proceso
- `users` - Perfil extendido del tostador

## 5. Rutas de la Aplicación

| Ruta | Componente | Protección | Descripción |
|------|------------|------------|-------------|
| `/login` | Login | Ninguna | Entrada |
| `/home` | Home | Auth | Dashboard |
| `/craftlab/onboarding` | CraftLabOnboarding | Auth | Selector educación/config |
| `/craftlab/education/basic` | CraftLabBasicEducation | Auth | Educación básica |
| `/craftlab/education/advanced` | CraftLabTechEducation | Auth | Educación técnica |
| `/craftlab/education/quiz` | CraftLabQuiz | Auth | Quiz desbloqueador |
| `/craftlab/welcome` | CraftLabWelcome | Auth + Education | Bienvenida al config |
| `/craftlab/configurator` | CraftLabConfigurator | Auth + Education | Configurador |
| `/forward-booking/*` | [Varios] | Auth | Flujo reserva |
| `/orders` | Orders | Auth | Historial |

## 6. Puntos de Dolor Identificados (UX/UI)

### Críticos
1. **No hay persistencia de configuración**: Si el usuario sale del configurador, pierde todo
2. **Sin feedback post-configuración**: El botón "Continue to Fulfillment" solo hace `alert()`
3. **No hay tracking de lotes**: Usuario no puede ver estado de su café

### Mayores
4. **Sin notificaciones**: Usuario no sabe cuándo hay actualizaciones de su lote
5. **Imágenes externas**: Dependencia de Unsplash para imágenes del configurador
6. **Sin i18n**: Solo inglés, clientes son globales
7. **Sin modo offline real**: PWA configurada pero sin service worker activo

### Menores
8. **Loading genérico**: "Loading..." sin skeleton UI
9. **Sin validación de cantidad máxima**: UI dice max 500 boxes pero no valida
10. **Exit modal poco claro**: "Your configuration will be lost" pero no guarda nada

## 7. Oportunidades de Mejora en Captura de Datos

| Dato | Estado Actual | Propuesta |
|------|---------------|-----------|
| Perfil de sabor preferido | No se guarda | Persistir en `user_preferences` |
| Decisiones de proceso | Solo en memoria | Guardar en `lot_configurations` |
| Feedback post-compra | No existe | Crear `lot_feedback` |
| NPS implícito | No existe | Tracking de comportamiento |
| País/región tostador | No se captura | Agregar al onboarding |
| Tipo de tostión habitual | No se captura | Agregar a perfil |

## 8. Deuda Técnica Visible

1. **localStorage como fallback de auth**: `craftlab_unlocked` en localStorage no es seguro
2. **Sin manejo de errores centralizado**: Try/catch por componente
3. **CSS por componente**: No hay sistema de design tokens
4. **Sin tests**: No hay carpeta de tests ni configuración
5. **Sin tipos para Supabase**: No hay generación automática de tipos
6. **Hardcoded data**: Perfiles, variedades, métodos están en el componente

## 9. Seguridad

### Bien Implementado
- Variables de entorno para keys de Supabase
- Autenticación manejada por Supabase SDK
- No hay credenciales hardcodeadas

### Riesgos
- Sin RLS visible (Row Level Security) - verificar en Supabase
- localStorage para estado de desbloqueo (bypass posible)
- Sin rate limiting visible en el frontend

## 10. Performance

### Actual
- Bundle size: ~280KB (package-lock.json indica deps ligeras)
- Imágenes: Externas de Unsplash/Cloudinary (no optimizadas localmente)
- Code splitting: No configurado

### Recomendaciones
- Lazy loading de rutas con React.lazy()
- Optimización de imágenes con next/image o similar
- Service worker activo para caching
