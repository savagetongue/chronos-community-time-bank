# Chronos - Community Time Bank

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/savagetongue/chronos-community-time-bank)

## Overview

Chronos is a sophisticated, full-stack Community Time Bank application designed to facilitate the equitable exchange of skills and time within a community. Unlike traditional currency-based marketplaces, Chronos uses a 'time credit' system where 1 hour equals 1 credit, fostering community cohesion and valuing all skills equally.

The application is built as a modern Single Page Application (SPA) using React and TypeScript, hosted on Cloudflare's edge network. It relies exclusively on Supabase for its backend infrastructure, utilizing Supabase Auth for identity management, Postgres for relational data, Storage for evidence/media, and Edge Functions for atomic, secure business logic (escrow management, transaction ledgers).

### Key Features

- **Smart Escrow System**: Secure transaction engine that locks credits upon task acceptance and releases them upon verified completion, preventing fraud.
- **Dual-Mode Task Engine**: Supports 'Offers' (I can help) and 'Requests' (I need help) with workflows for Online (video link management), In-Person (geolocation/mapping), and Hybrid interactions.
- **Reputation & Governance**: Comprehensive trust system with admin approval, verified reviews, dispute resolution, and reputation scoring.
- **Real-time Scheduling**: Integrated calendar supporting timezone conversions, availability negotiation, and recurring sessions.
- **Admin Command Center**: Dashboard for user approvals, dispute management, ledger audits, and platform safety.
- **Responsive Design**: Beautiful, mobile-first UI with smooth interactions and accessibility features.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, React Router DOM, TanStack Query, Zustand (state management), Tailwind CSS, Shadcn UI, Lucide React (icons), Framer Motion (animations), React Hook Form, Zod (validation), Recharts (charts), Date-fns (date handling).
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions) – Single source of truth for all persistent data.
- **Hosting & Deployment**: Cloudflare Pages/Workers (no Cloudflare D1/KV/R2 for business data).
- **Build Tools**: Bun (package manager), Wrangler (Cloudflare deployment).
- **Other**: Hono (API routing in Edge Functions), Immer (immutable updates).

## Quick Start

### Prerequisites

- Bun 1.0+ installed (https://bun.sh/)
- Node.js 18+ (for some dev tools)
- A Supabase project (free tier sufficient for development):
  - Create a project at https://supabase.com/dashboard
  - Note your `SUPABASE_URL` and `SUPABASE_ANON_KEY` (add `SUPABASE_SERVICE_ROLE_KEY` for admin tasks)
  - Set up database tables using the provided SQL migrations in `/supabase/migrations` (see Setup below)

### Installation

1. Clone the repository:
   ```
   git clone <your-repo-url>
   cd chronos-community
   ```

2. Install dependencies using Bun:
   ```
   bun install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     VITE_GOOGLE_MAPS_KEY=your-google-maps-api-key
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     ```   - For Cloudflare deployment, add these to your Workers/Pages environment variables.
   - For Google Maps integration, set VITE_GOOGLE_MAPS_KEY=your_api_key from Google Cloud Console (enable Maps JavaScript API). Note: Free tier sufficient; fallback to city search if missing.
4. Initialize Supabase Database:
   - In your Supabase dashboard, go to SQL Editor.
   - Run the schema migrations (provided in project docs or generate from data model in client request).
   - Enable Row Level Security (RLS) policies as defined in the blueprint's data flow section.

5. Run the development server:
   ```
   bun run dev
   ```
   - The app will be available at `http://localhost:3000` (or your configured port).

## Usage

### Core User Flows

1. **Authentication**: Users sign up/login via Supabase Auth (email/password or OAuth). New users enter a pending approval state until admin approval.

2. **Task Creation**: Use the wizard to create Offers/Requests. Specify type, credits, mode (online/in-person/hybrid), scheduling, and location details.

3. **Discovery & Acceptance**: Browse tasks with filters (skills, location, credits). Accept tasks to lock escrow credits via Edge Function.

4. **Scheduling & Execution**: Negotiate times, confirm meetings, check-in, and upload evidence. Auto-release escrow on mutual completion.

5. **Reviews & Disputes**: Post-task reviews build reputation. Raise disputes for resolution by admins.

### Example API Calls (Frontend to Supabase)

- Auth: `supabase.auth.signUp({ email, password })`
- Create Task: `supabase.from('tasks').insert({ ...taskData })`
- Accept Task: Call Edge Function `supabase.functions.invoke('accept-task', { taskId, userId })`
- Real-time: Subscribe to channels like `tasks:${taskId}` for updates.

For full API details, refer to Supabase client integration in `/src/lib/supabase.ts` (add if not present).

## Development

### Scripts

- `bun run dev`: Start local dev server with hot reload.
- `bun run build`: Build for production (outputs to `/dist`).
- `bun run lint`: Run ESLint for code quality.
- `bun run preview`: Preview production build locally.
- `bun run cf-typegen`: Generate TypeScript types from Wrangler bindings.

### Local Development Tips

- Use Supabase Local CLI for offline backend testing: `supabase start`.
- Mock Edge Functions during dev by simulating calls in `/src/lib/supabase-functions.ts`.
- Test responsive design with browser dev tools (mobile-first approach).
- Debug RLS: Use Supabase dashboard to simulate user sessions.
- State Management: Use Zustand for client-side state; avoid infinite loops by selecting primitives only (see code guidelines).

### Adding Features

- New Pages: Add routes in `/src/main.tsx` using React Router.
- Supabase Queries: Use `@supabase/supabase-js` client; wrap with TanStack Query for caching.
- Components: Extend Shadcn UI primitives in `/src/components/ui`.
- Edge Functions: Deploy via Supabase CLI; call from frontend with `supabase.functions.invoke()`.

## Deployment

Deploy to Cloudflare Pages for the frontend and Workers for any edge logic (though primary backend is Supabase).

### Steps

1. Build the project:
   ```
   bun run build
   ```

2. Deploy to Cloudflare Pages (for static SPA):
   - Use Wrangler: `bun run deploy`
   - Or via dashboard: Connect GitHub repo and set build command to `bun run build`, output dir to `dist`.

3. Configure Environment Variables:
   - In Cloudflare dashboard (Pages > Settings > Environment Variables), add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - For Workers (if using custom routes): Add `SUPABASE_SERVICE_ROLE_KEY` etc.

4. Supabase Production Setup:
   - Run migrations on production DB.   - Enable production RLS and Edge Functions.
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/savagetongue/chronos-community-time-bank)

### Deployment to Cloudflare Pages

1. **Build the Project**:
   Run `bun run build` locally to generate the `dist` folder.

2. **Cloudflare Dashboard Setup**:
   - Go to Cloudflare Pages dashboard > Create project > Connect GitHub repo (or upload directly).
   - Set **Build command**: `bun run build` (or `npm run build` if using npm).   - Set **Build output directory**: `dist` (critical - matches wrangler.jsonc).
   - Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_MAPS_KEY`.
3. **Deploy**:
   Click Deploy. Pages will build and serve the SPA from `dist`.

4. **Verify wrangler.jsonc**:
   Ensure `"assets": { "directory": "dist", "not_found_handling": "single-page-application" }` for SPA routing.

**Troubleshooting**:
- **"Missing directory" Error**: Run `bun run build` first; check console for build failures.
- **RLS/Supabase Errors**: Confirm env vars in Pages settings > Environment Variables; test auth flows post-deploy.
- **SPA 404s**: Verify `not_found_handling: "single-page-application"` in wrangler.jsonc.
- **Bun Issues**: Switch to npm if Bun unavailable in CI (update scripts in package.json). For Workers integration, run `bun run deploy` separately.
For one-click deployment, use the Cloudflare button above to deploy directly from this template.

### Custom Domain & HTTPS

- Cloudflare automatically provides HTTPS.
- Add custom domain in Pages dashboard (free SSL included).

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit changes: `git commit -m 'Add amazing feature'`.
4. Push: `git push origin feature/amazing-feature`.
5. Open a Pull Request.

Please adhere to the code standards: TypeScript strict mode, Tailwind best practices, and no direct Durable Object modifications (use entities).

## License

This project is MIT licensed. See [LICENSE](LICENSE) for details.

## Support

- Supabase Docs: https://supabase.com/docs
- Cloudflare Workers/Pages: https://developers.cloudflare.com/pages/
- Issues: Report bugs or request features on GitHub.

Built with ❤️ for community-driven time banking.