# 75 Fajr

Mobile-first PWA for a 75-day discipline challenge. Three users track 14 daily rules, accumulate penalties for missed days, and log penalty runs.

## Stack

- React 19 + Vite
- Tailwind CSS v3
- Supabase (Postgres, Storage)
- vite-plugin-pwa (installable)

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `supabase/schema.sql`
3. In **Storage**, create a public bucket named `walk-photos`
4. Copy your project URL and anon key from **Settings → API**

## 2. Local environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — login with PIN 1111, 2222, or 3333.

## 4. Deploy to Vercel

```bash
npx vercel --prod
```

**After deploying**, add these two environment variables in the Vercel dashboard under **Settings → Environment Variables**:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

Then redeploy:

```bash
npx vercel --prod
```

## 5. Penalty Edge Function (optional)

To auto-generate penalties at midnight, deploy the Edge Function:

```bash
supabase functions deploy check-penalties --project-ref your-project-ref
```

Then create a cron job in **Supabase → Edge Functions → check-penalties → Schedule**: `0 0 * * *`
