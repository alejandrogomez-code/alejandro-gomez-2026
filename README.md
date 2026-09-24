# Vida

Aplicación web personal para seguir objetivos, hábitos, peso, IMC y pasos.

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Auth + PostgreSQL + RLS) · Recharts · Lucide.

---

## 1. Instalar

```bash
npm install
```

Requiere Node.js 18.17 o superior.

---

## 2. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto nuevo.
2. Abrí **Project Settings → API**.
3. Copiá estos dos valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys → anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

La clave `service_role` no se usa en este proyecto y nunca debe ir al frontend.

### Crear tu usuario

La app es personal y no tiene registro público. Creá tu usuario a mano:

**Authentication → Users → Add user → Create new user**, con email y contraseña, y marcá *Auto Confirm User*.

El trigger de la migración crea el `profile` automáticamente.

---

## 3. Ejecutar el SQL

1. En Supabase, abrí **SQL Editor → New query**.
2. Copiá el contenido completo de `supabase/migrations/001_initial_schema.sql`.
3. Pegalo y ejecutá con **Run**.

Eso crea las tablas (`profiles`, `goals`, `habits`, `weight_records`, `step_records`, `habit_records`), los índices, las constraints, las políticas RLS de `SELECT`, `INSERT`, `UPDATE` y `DELETE` para cada tabla, y los triggers de `updated_at` y de creación automática del perfil.

La migración es idempotente: podés volver a ejecutarla sin romper nada.

---

## 4. Variables de entorno

Creá un archivo `.env.local` en la raíz, tomando `.env.example` como base:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

`.env.local` está en `.gitignore` y no se sube al repositorio.

---

## 5. Ejecutar

```bash
npm run dev
```

Abrí `http://localhost:3000`. Vas a llegar a `/login`; ingresá con el usuario que creaste.

La primera vez aparece un onboarding con altura, peso inicial y objetivo diario de pasos. Al guardarlo se crea el primer registro de peso con la fecha elegida.

Otros comandos:

```bash
npm run build      # build de producción
npm run typecheck  # TypeScript sin emitir
npm run lint       # ESLint
```

---

## 6. GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

---

## 7. Vercel

1. Entrá a [vercel.com](https://vercel.com) → **Add New → Project**.
2. Importá el repositorio de GitHub.
3. Framework Preset: **Next.js** (se detecta solo). No hace falta cambiar build command ni output.
4. En **Environment Variables** agregá, para Production, Preview y Development:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Deploy**.
6. En Supabase, **Authentication → URL Configuration**, agregá la URL de Vercel en *Site URL* y en *Redirect URLs*.

Cada push a `main` dispara un deploy nuevo.

---

## Estructura

```
app/
  layout.tsx                 tema y tamaño de fuente antes del primer pintado
  login/                     pantalla de acceso (email + password)
  (app)/                     rutas protegidas
    layout.tsx               verifica sesión, carga perfil, monta el shell
    dashboard/
    objetivos/
    salud/
      resumen/ peso/ pasos/ habitos/ calendario/
    configuracion/
components/
  ui/                        Button, Card, Input, Select, Modal, Dialog,
                             Progress, Badge, Tabs, Calendar, DatePicker,
                             Toast, States
  layout/                    Sidebar, BottomNav, MobileHeader, AppShell
  providers/                 perfil y tema
  dashboard/                 DashboardStats, TodaySummary, WeeklySummary,
                             GoalOverview, QuickActions
  health/                    WeightChart, StepsChart, WeightForm, StepsForm,
                             HealthSummary, SaludNav
  habits/                    HabitCard, HabitForm, HabitCalendar, HabitStats,
                             WeeklyHabitSummary
  goals/                     GoalCard, GoalForm, GoalProgress
  onboarding/                OnboardingGate
hooks/                       useProfile, useGoals, useHabits,
                             useWeightRecords, useStepRecords, useHabitRecords
lib/
  supabase/client.ts         cliente de navegador
  supabase/server.ts         cliente de servidor (cookies)
  supabase/middleware.ts     refresco de sesión y protección de rutas
  calculations/              bmi, goals, habits, steps, weight, dates
types/database.ts            tipos de todas las tablas
supabase/migrations/         001_initial_schema.sql
middleware.ts                protege todo salvo /login
```

---

## Decisiones importantes

**Fechas.** Todos los registros diarios usan `DATE` de PostgreSQL y strings `YYYY-MM-DD` armados con los componentes locales de la fecha. No se usa `toISOString()` para días, así que no hay corrimientos de zona horaria.

**IMC.** Nunca se guarda en la base. Se calcula con `calculateBMI(weightKg, heightCm)` y se muestra con un decimal. Con 104.5 kg y 178 cm da 33,0.

**Progreso de objetivos cuantitativos.** `(actual - inicial) / (objetivo - inicial) * 100`, acotado a 0–100 solo para la barra. Con 0 → 12 y actual 5 da 41,7%.

**Días esperados de un hábito.** Se calculan según su frecuencia: `daily` son 7 días por semana; `weekly_days` y `custom` cuentan solo los días de `weekdays` (0 = domingo … 6 = sábado). Un martes nunca cuenta como incumplimiento de un hábito de lunes, miércoles y viernes. Gym con 2 de 3 días da 66,7%.

**Cumplimiento general.** Es `instancias cumplidas / instancias previstas * 100` sobre todos los hábitos juntos, no el promedio de los porcentajes individuales. 8 de 10 instancias da 80%.

**Hábitos de pasos.** La tabla `habits` tiene una columna extra, `use_step_records`. Si está activa en un hábito cuantitativo, el valor del día se lee de `step_records` y el cumplimiento se calcula contra la meta del hábito, así que los pasos se cargan una sola vez. Con 8.432 sobre 10.000 el hábito queda en 84,3% y no cumplido; con 10.500 queda en 105% y cumplido.

**Consultas.** Cada hook pide solo las columnas que usa y filtra por rango de fechas, de modo que los gráficos traen únicamente el período visible.

---

## Preparado para crecer

`Gestión de Economía` todavía no está implementada, pero la estructura la soporta sin refactor: se agrega una migración nueva con sus tablas y RLS, sus tipos en `types/database.ts`, un hook en `hooks/`, sus cálculos en `lib/calculations/` y una entrada en `components/layout/nav-items.ts`. El mismo camino sirve para alimentación, sueño o integraciones con wearables.
