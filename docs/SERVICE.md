# Plan de servicio e-learning — AI Dev Accelerator

> Documento de planificación para evolucionar el sitio de un curso estático
> a una plataforma de e-learning completa. Este documento describe lo que
> **tendría que implementarse** para convertir el sitio actual en un servicio
> gestionado, con usuarios, sincronización, métricas y verificación.
>
> Estado actual: **Nivel 0** (curso estático enriquecido, sin backend). Este
> documento cubre los Niveles 1 y 2.

---

## 1. Estado actual (Nivel 0 — completado)

El sitio es un Astro Starlight estático desplegado en GitHub Pages con:

- 11 módulos + 5 labs + cheatsheets, plantillas y ejemplos
- Progreso persistido en localStorage (`aida:done:`, `aida:quiz:`)
- Badges desbloqueables (`aida:badge:`)
- Export/import de progreso (JSON descargable/subible)
- Quizzes, simulador de terminal, playground JS, notas IndexedDB
- Command palette (Cmd+K), view transitions, scroll-spy, reading bar
- Mermaid para diagramas en cheatsheets
- PWA (manifest + service worker)

**Lo que NO tiene (y este documento cubre):**
- Cuentas de usuario / autenticación
- Sincronización de progreso entre dispositivos
- Dashboard de instructores con métricas
- Verificación server-side de progreso/certificados
- Feedback que llega al instructor
- Sistema de pagos / suscripciones

---

## 2. Nivel 1 — Curso con identidad de usuario

**Objetivo:** El usuario entra con GitHub, su progreso lo sigue entre
dispositivos, el feedback llega al instructor. Cero costo de infraestructura.

### 2.1. Autenticación GitHub OAuth

**Por qué GitHub:** La audiencia del curso es desarrolladores. GitHub es
natural para ellos y evita implementar un sistema de cuentas propio.

**Flujo (PKCE + Worker mínimo):**
1. Usuario clickea "Entrar con GitHub" en el landing
2. Frontend genera `code_verifier` + `code_challenge` (PKCE)
3. Redirect a `github.com/login/oauth/authorize?client_id=...&code_challenge=...`
4. GitHub redirecta de vuelta con `?code=...`
5. Frontend POST al Cloudflare Worker con `{code, code_verifier}`
6. Worker intercambia `{code, code_verifier}` por `access_token` usando
   `client_secret` (que vive solo en el Worker)
7. Worker devuelve `{access_token, user: {login, name, avatar}}` al cliente
8. Cliente guarda el token en localStorage/sessionStorage

**Infraestructura:**
- Registrar OAuth App en GitHub (gratis): `Settings → Developer settings → OAuth Apps`
- Callback URL: `https://sayecalmadagpi.github.io/ai-dev-accelerator/auth/`
- Cloudflare Worker (free tier: 100k req/día) — solo el intercambio de tokens
- Sin base de datos propia en este nivel

**Scope del token:** `gist` (para sync de progreso via Gist) + `repo:read`
(opcional, para futuras features). **Sin `user:email`** — no se necesita email
en Nivel 1.

**Security notes:**
- El `client_secret` NUNCA toca el frontend — solo el Worker
- PKCE evita interceptación del code en el redirect
- El token se guarda en localStorage (mismo threat model que el progreso)
- Para más seguridad: usar `sessionStorage` + refresh via Worker en cada visita

### 2.2. Sync de progreso via GitHub Gist

**Mecánica:**
1. Tras auth exitosa, el cliente busca un gist con descripción
   `ai-dev-accelerator-progress`
2. Si no existe, lo crea (privado) con archivo `progress.json`
3. El contenido es el mismo JSON del export actual (versión 1)
4. En cada cambio de progreso (evento `aida:progress`), debounce 3s y
   actualiza el gist via API `PATCH /gists/:id`
5. Al cargar el sitio, si hay token, fetch el gist y merge con localStorage
   (gist wins en conflictos de fecha)

**Rate limits:** 5k req/hora por token autenticado. Para un curso con
cambios de progreso esporádicos, imposible de agotar.

**Fallback:** si el gist fetch falla o no hay token, el sitio funciona
normal con localStorage (Nivel 0).

### 2.3. Feedback via GitHub Issues

**Mecánica:**
1. Al final de cada módulo, widget "¿Te fue útil?" (sí/no + textarea opcional)
2. Si el usuario está autenticado, crea un issue en el repo del curso:
   `POST /repos/:owner/:repo/issues`
3. Label automático: `feedback`, label del módulo: `mod-06`
4. Título: `[Feedback] Módulo 06 — Verificación`
5. Body: rating + comentario + metadata (slug, fecha, progreso del módulo)
6. Si NO está autenticado: fallback a Formspree (50 envíos/mes free) o
   simplemente localStorage (el instructor no lo ve)

**Ventaja:** Los issues viven en el repo del curso, al lado del código.
El instructor los gestiona en su flujo normal de GitHub.

### 2.4. Archivos a crear/modificar

| Archivo | Acción | Descripción |
|---|---|---|
| `src/scripts/auth.ts` | Crear | OAuth PKCE flow + gestión de token |
| `src/components/AuthButton.astro` | Crear | Botón "Entrar con GitHub" en el header |
| `src/scripts/sync.ts` | Crear | Sync de progreso via Gist API |
| `src/scripts/feedback.ts` | Crear | Widget de feedback + creación de issues |
| `src/components/Feedback.astro` | Crear | Widget al final de cada módulo |
| `worker/auth.ts` | Crear | Cloudflare Worker para token exchange |
| `astro.config.mjs` | Modificar | Añadir página `/auth/` (callback) |
| `SiteTitle.astro` | Modificar | Boot de auth + sync |
| `ProgressOverview.astro` | Modificar | Mostrar estado de sync |
| `package.json` | Modificar | Sin nuevas deps (todo con fetch nativo) |

### 2.5. Costos

- GitHub OAuth App: **gratis**
- Cloudflare Worker (token exchange): **gratis** (100k req/día)
- GitHub API (gists + issues): **gratis** (5k req/hora)
- Formspree (fallback de feedback): **gratis** (50 envíos/mes)

**Total Nivel 1: USD 0/mes**

---

## 3. Nivel 2 — Curso como servicio

**Objetivo:** Plataforma completa con métricas, dashboard de instructores,
verificación server-side, y base de datos persistente.

### 3.1. Base de datos

**Opción A — Cloudflare D1 (SQLite edge):**
- Free tier: 5M reads/día, 5M writes/día, 5GB storage
- Misma cuenta que el Worker del Nivel 1
- Latencia baja (edge, mismo DC que el Worker)
- SQL estándar (SQLite)
- Ideal para un curso con cientos-miles de usuarios

**Opción B — Supabase (PostgreSQL):**
- Free tier: 500MB DB, 50k MAU, auth incluido
- Auth propia (no necesita GitHub OAuth)
- Realtime subscriptions (para dashboard en vivo)
- Row Level Security (RLS) para multi-tenant

**Recomendación:** Empezar con D1 (misma infra que el Worker, sin cuenta
nueva). Migrar a Supabase solo si se necesita realtime o auth propia.

### 3.2. Schema (D1)

```sql
-- Usuarios (sync desde GitHub OAuth)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id INTEGER UNIQUE NOT NULL,
  login TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  last_login TEXT
);

-- Progreso por módulo/lab
CREATE TABLE progress (
  user_id INTEGER NOT NULL,
  slug TEXT NOT NULL,
  done INTEGER DEFAULT 0,
  quiz_score INTEGER,
  quiz_total INTEGER,
  completed_at TEXT,
  PRIMARY KEY (user_id, slug),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Badges desbloqueados
CREATE TABLE badges (
  user_id INTEGER NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, badge_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Feedback por sección
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  slug TEXT NOT NULL,
  rating INTEGER NOT NULL,  -- 1 = útil, 0 = no útil
  comment TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sesiones (para analytics de uso)
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  started_at TEXT DEFAULT (datetime('now')),
  ended_at TEXT,
  pages_visited INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3.3. API (Cloudflare Worker + D1)

```
POST /api/auth/login          # OAuth exchange (Nivel 1) + create/update user
POST /api/progress/sync       # Upload progreso del cliente → DB
GET  /api/progress/:user      # Download progreso → cliente
POST /api/feedback            # Recibir feedback → DB
GET  /api/badges/:user        # Lista de badges del usuario

# Dashboard de instructores (protegido)
GET  /api/admin/metrics        # Pasarate, quiz pass rate, módulos más abandonados
GET  /api/admin/users          # Lista de usuarios con progreso
GET  /api/admin/feedback        # Agregado de feedback por módulo
```

**Auth del dashboard:** El Worker valida que el usuario tenga acceso admin
(hardcodear `ADMIN_GITHUB_IDS` en el Worker, o una tabla `admins`).

### 3.4. Dashboard de instructores

Página Astro separada (`/admin/`) protegida por auth del Worker:

- **Pasarate general:** total usuarios, activos (7 días), completaron curso
- **Funnel por módulo:** cuántos llegan, cuántos completan, cuántos abandonan
- **Quiz analytics:** pass rate por quiz, preguntas más falladas
- **Feedback agregado:** rating promedio por módulo, comentarios recientes
- **Heatmap de abandono:** dónde deja la gente de leer

Tecnología: Astro page con gráficos simples en vanilla (SVG o Chart.js
ligero). No necesita React.

### 3.5. Verificación server-side de certificados

1. Cliente completa los 11 módulos + 5 labs (verificado en DB, no solo localStorage)
2. Cliente solicita certificado → Worker valida progreso completo en DB
3. Worker genera certificado con UUID firmado (HMAC con secret del Worker)
4. Certificado se guarda en DB con `{user_id, uuid, issued_at, hash}`
5. URL pública de verificación: `/cert/:uuid` — muestra el certificado válido

El hash ahora es verificable server-side (no solo client-side como en Nivel 0).

### 3.6. Sistema de pagos (opcional)

Si el curso pasa a ser de pago:

**Opción A — Stripe Checkout:**
- Página de pago redirige a Stripe (sin manejar tarjetas)
- Webhook → Worker actualiza `users.paid = true` + `paid_until`
- Middleware del Worker valida pago antes de servir contenido premium
- Free tier: no hay (Stripe cobra % por transacción: 2.9% + 30¢)

**Opción B — GitHub Sponsors:**
- Sin manejar pagos directamente
- Usuario debe ser sponsor activo (API de GitHub lo verifica)
- Más simple pero menos control

### 3.7. Archivos a crear/modificar

| Archivo | Acción | Descripción |
|---|---|---|
| `worker/index.ts` | Expandir | API completa (auth, progress, feedback, admin, certs) |
| `worker/schema.sql` | Crear | Schema D1 |
| `src/scripts/sync-db.ts` | Crear | Sync bidireccional con DB (reemplaza sync via Gist) |
| `src/scripts/cert-verify.ts` | Crear | Solicitud + verificación de certificado |
| `src/pages/admin.astro` | Crear | Dashboard de instructores |
| `src/scripts/dashboard.ts` | Crear | Gráficos del dashboard |
| `src/components/Certificate.astro` | Crear | Generación de certificado con verificación server-side |
| `src/components/Feedback.astro` | Modificar | Enviar a DB en lugar de issues |

### 3.8. Costos estimados

| Servicio | Free tier | Paid (estimado) |
|---|---|---|
| Cloudflare Workers | 100k req/día | USD 5/mes (10M req) |
| Cloudflare D1 | 5M reads, 5M writes/día, 5GB | USD 5/mes (incluirá 25M) |
| GitHub Pages | Ilimitado (público) | Gratis |
| Stripe | — | 2.9% + 30¢ por transacción |
| Dominio propio (opcional) | — | USD 10-15/año |

**Estimación Nivel 2 sin pagos:** USD 0-10/mes (hasta ~1000 usuarios activos)
**Estimación Nivel 2 con pagos:** USD 0-10/mes + comisión Stripe por venta

---

## 4. Roadmap de implementación

### Fase 1 — Auth + sync (1-2 semanas)
1. Registrar OAuth App en GitHub
2. Crear Worker de token exchange
3. Implementar `auth.ts` (PKCE flow)
4. Implementar `sync.ts` (Gist API)
5. Añadir `AuthButton.astro` al header
6. Mostrar estado de sync en `ProgressOverview`

### Fase 2 — Feedback (3-5 días)
1. Implementar `feedback.ts` (GitHub Issues API)
2. Crear `Feedback.astro` al final de módulos
3. Fallback Formspree para no autenticados

### Fase 3 — DB + API (1-2 semanas)
1. Crear D1 database + schema
2. Expandir Worker con endpoints de API
3. Reemplazar sync via Gist por sync via DB
4. Implementar middleware de auth en las rutas

### Fase 4 — Dashboard (1 semana)
1. Crear `/admin/` con auth
2. Gráficos de funnel y quiz analytics
3. Tabla de feedback agregado
4. Heatmap de abandono

### Fase 5 — Certificados verificables (3-5 días)
1. Endpoint de generación con HMAC
2. Página de verificación `/cert/:uuid`
3. Actualizar `ProgressOverview` para mostrar estado

### Fase 6 — Pagos (opcional, 1 semana)
1. Integrar Stripe Checkout
2. Webhook de confirmación
3. Middleware de acceso premium

---

## 5. Decisiones de arquitectura

### ¿Por qué Cloudflare y no Vercel/Netlify?

- El sitio ya vive en GitHub Pages (gratis, sin límites de build)
- Cloudflare Workers + D1 es el free tier más generoso para backend
- Edge runtime = latencia baja global
- Misma cuenta para Worker + D1 + (opcional) dominio

### ¿Por qué no Supabase desde el inicio?

- Supabase es excelente pero añade una cuenta/dependencia más
- D1 reusa la infra del Worker del Nivel 1 (cero accounts nuevas)
- Para un curso con <1000 usuarios, D1 es suficiente
- Migrar D1 → Supabase es directo (SQL estándar)

### ¿Por qué GitHub OAuth y no auth propia?

- La audiencia del curso es desarrolladores (todos tienen GitHub)
- Evita implementar password reset, email verification, 2FA
- El token de GitHub ya da acceso a Gist API (sync Nivel 1)
- Para un curso de AI dev training, usar GitHub es coherente

### ¿Por qué no React/Next.js para el dashboard?

- El sitio es 100% vanilla JS (principio del handoff)
- El dashboard son gráficos simples + tablas (no necesita React)
- Mantiene el bundle ligero y la arquitectura consistente

---

## 6. Migración Nivel 0 → Nivel 1 → Nivel 2

### Nivel 0 → Nivel 1
- El export/import de JSON existente se convierte en el formato de sync via Gist
- Los badges en localStorage se sync al Gist
- No hay migración de datos: el usuario entra con GitHub y se le ofrece sync
  de su progreso local al Gist

### Nivel 1 → Nivel 2
- El Gist se lee una última vez y se migra a D1
- El Worker de token exchange se expande a API completa
- Los issues de feedback se migran a DB (opcional, los issues pueden seguir)
- El certificado client-side se reemplaza por el server-side verificado

---

## 7. Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| GitHub cambie su API/OAuth | Baja | OAuth es estándar, poco cambio |
| Cloudflare cambie free tier | Media | D1 es core product, unlikely que reduzcan |
| Usuario pierde token de GitHub | Media | Re-auth genera nuevo token, progreso en Gist persiste |
| Rate limit de Gist API | Baja | 5k/hora es enorme para sync de progreso |
| Mermaid CDN cae | Baja | Fallback deja el código visible |
| View transitions en navegadores viejos | Baja | astro-vtbot tiene fallback (swap sin animación) |
| Dashboard expuesto sin auth | Alta (sin mitigación) | Worker valida admin en cada request |