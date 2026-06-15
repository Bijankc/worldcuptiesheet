# World Cup Tiesheet

A prediction bracket for the 2026 FIFA World Cup knockout stage.

Users sign in with Google, pick the country they think will win the whole
tournament, then fill in a 32-team knockout bracket. Points are awarded when
their picks match real results. The leaderboard is public — share the URL.

## Scoring

| Event | Points |
| --- | --- |
| Correct R32 pick | +2 each |
| Correct R16 / QF / SF / Final pick | +3 each |
| Champion (popup pick) actually wins the tournament | +10 |

The champion pick from the popup is **locked** as the user's final-winner: any
match their champion is in gets auto-filled with the champion winning.

## Stack

- Static HTML / CSS / JS frontend (no build step)
- Supabase — Postgres + Google OAuth
- Vercel — static hosting + serverless functions for admin actions

## Setup

### 1. Supabase

1. Create a new project at https://supabase.com.
2. Open the **SQL Editor** and run the contents of `supabase/schema.sql`.
3. In **Authentication → Providers**, enable **Google**. Add your Google OAuth
   credentials (Console: https://console.cloud.google.com → Credentials →
   OAuth 2.0 Client ID). Add the redirect URI Supabase shows you.
4. In **Authentication → URL Configuration**, set the Site URL to your Vercel
   URL (or `http://localhost:3000` for local dev) and add it to the redirect
   allowlist.
5. From **Settings → API**, copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY` (goes in `config.js`)
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (Vercel env var only,
     never commit)

### 2. Local config

Edit `config.js`:

```js
window.APP_CONFIG = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'eyJ...',
};
```

The anon key is safe to commit — row-level security in Supabase is what
protects the data.

### 3. Vercel

1. Push this repo to GitHub (already done).
2. Go to https://vercel.com → **Add New → Project** → import the repo.
3. Framework preset: **Other**. Root directory: `./`. Build/Output: leave
   defaults (Vercel auto-detects the `api/` folder for serverless functions).
4. **Environment Variables**:
   - `SUPABASE_URL` — your project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — your service role key
   - `ADMIN_PASSWORD` — pick a strong password
5. Deploy.

After the first deploy, copy the production URL back into Supabase
**Authentication → URL Configuration** so Google login redirects correctly.

### 4. Seed match lineups (when groups end)

The 31 matches are seeded empty. Once the group stage settles (~June 24,
2026), sign in to `/admin` with the password and fill in the home/away teams
for each R32 match. As the tournament progresses, set the winner on each
match — the leaderboard updates immediately.

## Local development

The frontend is plain static files. For Google OAuth to work locally you need
a real HTTP origin, so serve the folder with any static server, e.g.:

```bash
npx serve .
```

For the `/api/admin/*` serverless functions to work locally, use the Vercel
CLI:

```bash
npx vercel dev
```

## File map

```
worldcuptiesheet/
├── index.html              public leaderboard + signed-in user bracket
├── admin.html              password-gated admin page
├── config.js               Supabase URL + anon key (edit this)
├── assets/
│   ├── app.js              main app: auth, bracket, leaderboard
│   ├── admin.js            admin page logic
│   ├── data.js             48-team list + bracket helpers
│   └── styles.css
├── api/admin/
│   ├── verify.js           POST { password } → 200 if correct
│   ├── match.js            POST { password, id, team_home, team_away, winner }
│   ├── settings.js         POST { password, key, value }
│   └── _lib.js             shared helpers (password check, service-role client)
├── supabase/
│   └── schema.sql          tables, RLS, leaderboard function
├── package.json
├── vercel.json
└── .env.example            env vars to set on Vercel
```
