<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/094c2ef3-6cf6-41e9-9955-82b57a4729e1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure Appwrite (recommended via `.env.local`):
   - `VITE_APPWRITE_ENDPOINT` (default: `https://fra.cloud.appwrite.io/v1`)
   - `VITE_APPWRITE_PROJECT` (default: `69c8ee1b0037e381d046`)
   - `VITE_APPWRITE_DATABASE_ID` (optional, default: `kalakar_db`)
   - `VITE_APPWRITE_AVATARS_BUCKET_ID` (optional, default: `avatars`)
3. Optional observability:
   - `VITE_ANALYTICS_ENDPOINT` (POST endpoint for events/errors; if unset, logs to console only)
4. Appwrite Console checklist (required for production):
   - Add your deployed domain to **Web platform** allowlist (and localhost for dev).
   - Enable **Google OAuth** provider (recommended).
   - Enable **Email Magic URL** (aka magic link) authentication.
   - For Google OAuth, also configure the Google Cloud OAuth client:
     - Authorized JavaScript origins: your site (e.g. `http://localhost:3000`, `https://your-domain.com`)
     - Authorized redirect URI: use the exact callback URL shown in Appwrite for the Google provider
   - For Magic Link email delivery in production, configure SMTP in Appwrite (or ensure your Appwrite Cloud email sending is enabled).
   - Ensure these collections exist in database `VITE_APPWRITE_DATABASE_ID`:
     - `creators` (must allow user to read/create their own profile)
     - `posts` (must allow authenticated users to read; users can update/delete their own posts)
     - `notifications` (must allow user to read their own notifications)
4. Run the app:
   `npm run dev`

## Deploy (Today)

This app is a Vite static build (`npm run build` → `dist/`), so the fastest deploy is static hosting.

### Option A: Vercel (recommended)

1. Push this repo to GitHub (already configured).
2. Import the repo in Vercel.
3. Set environment variables:
   - `VITE_APPWRITE_ENDPOINT`
   - `VITE_APPWRITE_PROJECT`
   - `VITE_APPWRITE_DATABASE_ID` (if not using default)
   - `VITE_APPWRITE_AVATARS_BUCKET_ID` (if not using default)
4. Deploy.

### Option B: Netlify

1. Push this repo to GitHub.
2. Create a new Netlify site from the repo.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Set environment variables:
   - `VITE_APPWRITE_ENDPOINT`
   - `VITE_APPWRITE_PROJECT`
   - `VITE_APPWRITE_DATABASE_ID` (if not using default)
   - `VITE_APPWRITE_AVATARS_BUCKET_ID` (if not using default)
5. Deploy.
