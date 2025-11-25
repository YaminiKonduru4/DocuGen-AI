# DocuGen (DocuGen-AI)

This repository contains a Vite + React (TypeScript) front-end for DocuGen. The app uses Supabase for authentication and persistence of user profiles and project data.

This README covers:
- Installation & setup
- Environment variables (what to set and why)
- How to run the frontend locally and build for production
- How to prepare the Supabase backend (minimal SQL + settings)

---

## Requirements
- Node.js (recommended >= 20.19.0 or 22.x) — Vite shows warnings when Node is older.
- npm (bundled with Node)
- A Supabase project for Auth + Postgres

---

## Installation & setup

1. Clone the repo and install dependencies:

```powershell
cd C:\Users\user\Desktop\CREW_AI\manava_seva\docugen
npm install
```

2. Create a `.env` file at the project root with the required Vite env variables (see next section). Example:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PASSWORD_RESET_REDIRECT=http://localhost:5174
# (Optional) Other VITE_ keys you configure
```

3. (Optional) If you will run the auth test script, ensure `dotenv` is installed (it is already a dependency):

```powershell
npm install
node scripts/test_auth.mjs
```

---

## Environment variables

Set these variables in `.env` (development) and in your hosting provider's environment settings for production.

- `VITE_SUPABASE_URL` — Your Supabase project URL (e.g. `https://abcxyz.supabase.co`). Used by the client to talk to Supabase.
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key (client-side). Do NOT store service-role keys here.
- `VITE_PASSWORD_RESET_REDIRECT` — The URL Supabase will redirect to after password reset (set to your dev URL like `http://localhost:5174` or your production domain).

Security notes:
- Never put Supabase service-role keys in client-side env variables. If you need server-only access, use a serverless function or backend that stores secrets securely.

---

## Prepare Supabase (backend)

1. Create a Supabase project at https://app.supabase.com.
2. In the SQL editor, run the provided migration to create the `profiles` table used by the app:

`db/create_profiles_table.sql`

Open that file and run it in the Supabase SQL editor (or use psql with the appropriate credentials).

3. In Supabase dashboard → Auth settings:
- Enable email sign-ups if you want users to register with email/password.
- Configure SMTP if you need reliable password reset / confirmation emails.
- Configure OAuth providers (Google) and add your app's redirect URLs (development and production). Example redirect for local dev: `http://localhost:5174`.

---

## Run frontend (local development)

Start the Vite dev server (PowerShell):

```powershell
npm run dev
# open http://localhost:5174 or the port shown by Vite
```

Build for production:

```powershell
npm run build
```

Preview the production build locally:

```powershell
npm run preview
# serves the built `dist` directory
```

Notes:
- The project outputs to `dist/`. The `build` command runs `tsc -b && vite build`.
- If Vite warns about your Node version, upgrade Node to the recommended version to remove warnings.

---

## Deploying (high-level)

Recommended: Vercel (easy Vite + React hosting). Alternatives: Netlify, Azure Static Web Apps.

Vercel quick steps:
1. Push your repo to GitHub.
2. In Vercel dashboard, import the repo.
3. Set Build Command: `npm run build` and Output Directory: `dist`.
4. Add Environment Variables in Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_PASSWORD_RESET_REDIRECT`.
5. Deploy and then add the production URL to Supabase Auth → Redirect URLs.

CLI deploy (interactive):

```powershell
npm i -g vercel
vercel login
vercel --prod
```

---

## Running backend & automated tests

- Backend (Supabase) is managed by Supabase cloud — you configure it in their dashboard.
- A simple test script exists at `scripts/test_auth.mjs` to exercise sign-up / reset flows. To run it locally:

```powershell
# ensure .env is present
node scripts/test_auth.mjs
```

It reads Vite env vars from `.env` using `dotenv`.

---

## Troubleshooting

- If password reset emails are not delivered: check Supabase SMTP settings and the redirect URL matches `VITE_PASSWORD_RESET_REDIRECT`.
- If OAuth (Google) fails: verify Google Cloud OAuth consent and the redirect URI configured in Supabase matches your deployed domain.
- If builds show large chunk warnings: consider code-splitting or adjusting `build.chunkSizeWarningLimit` in `vite.config.ts`.

---

## Useful commands

```powershell
npm install         # install deps
npm run dev         # start dev server (Vite)
npm run build       # production build (outputs to dist)
npm run preview     # preview built output
node scripts/test_auth.mjs  # run auth test script (requires .env)
```

---

If you want, I can:
- Add a GitHub Actions workflow to build and deploy to a chosen provider.
- Create a small `deploy.sh` / deployment guide tailored to Vercel/Netlify/Azure.

If you'd like, which provider should I prepare instructions for: Vercel, Netlify, or Azure Static Web Apps?


## Authentication (Supabase)

This project uses Supabase for authentication (email/password and Google OAuth). Provide the following environment variables in a Vite `.env` file at the project root:

- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key

Example `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
