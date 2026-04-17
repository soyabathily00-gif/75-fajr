# 75 Fajr — Project Guide for Claude

## What this app is

A mobile-first PWA for tracking a personal 75-day discipline challenge ("75 Hard" variant focused on Fajr prayer). Three users — Soya, Imran, Souleman — each log 14 daily rules, accumulate penalties for missed days, and log penalty runs.

## Stack

- **React 19 + Vite** — no TypeScript
- **Tailwind CSS v3** — utility-first, mobile-first
- **Supabase** — Postgres DB, no Supabase Auth (PIN-based custom auth)
- **No router library yet** — page state managed in App.jsx

## Project structure

```
src/
  lib/
    supabase.js          # Supabase client (reads from .env.local)
  hooks/
    useAuth.js           # localStorage-based current user (id, name, avatar_color, wake_time)
  pages/
    Login.jsx            # Avatar card selection + PIN pad
  components/
    PinPad.jsx           # 4-digit numeric keypad with shake animation
  App.jsx                # Auth gate — renders Login or the main app
  main.jsx
  index.css              # Tailwind directives only
```

## Environment

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Copy `.env.local.example` to `.env.local` and fill in values. Never commit `.env.local`.

## Database tables

| Table | Purpose |
|---|---|
| `users` | The 3 fixed users with name, pin_hash, wake_time, avatar_color |
| `daily_logs` | One row per user × date × rule (R01–R14), tracks completion + photo |
| `penalties` | Triggered when a user misses a day; 5 km owed |
| `penalty_runs` | Records when a penalty km is run off |
| `weekly_challenges` | Optional weekly group challenge |
| `activity_feed` | Append-only log of actions for the feed UI |

All tables have RLS enabled. Current policy: allow all for `authenticated`. Tighten to per-user rules before going live.

## Auth model

- No Supabase Auth / no email / no JWT
- On login: fetch user row from `users`, compare raw PIN to `pin_hash`
- On success: store `{ id, name, avatar_color, wake_time }` in `localStorage` under key `75fajr_user`
- `useAuth()` reads/writes that key and provides `login()` / `logout()`
- **TODO:** hash PINs with bcrypt before production — currently stored as plain text

## Users

| Name | Wake time | Avatar color | PIN |
|---|---|---|---|
| Soya | 05:00 | #7F77DD | 1111 |
| Imran | 06:30 | #1D9E75 | 2222 |
| Souleman | 06:30 | #D85A30 | 3333 |

## Rules

14 daily rules tracked as `R01`–`R14`. Rule definitions to be confirmed, but the DB schema enforces the format with a check constraint: `rule_id ~ '^R(0[1-9]|1[0-4])$'`.

## Tailwind conventions

- Mobile-first — no desktop layout needed
- Shake animation defined in `tailwind.config.js` under `theme.extend.keyframes`
- Use `active:scale-95` / `active:shadow-none` for button press feedback
- Card style: `bg-white rounded-3xl shadow-sm`
- Accent colors come from each user's `avatar_color` — apply inline via `style`

## Dev commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # eslint check
```

## Git

- Feature branch: `claude/build-75-fajr-pwa-DjCQr`
- Commit style: `feat:`, `fix:`, `chore:` prefixes
```
