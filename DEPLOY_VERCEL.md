# 🚀 Deploying TechSetu to Vercel

This application is fully pre-configured to deploy directly to **Vercel** with full-stack support (Vite React frontend + Express API serverless functions).

---

## ⚡ Option 1: Deploy with Vercel CLI (Fastest)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project root**:
   ```bash
   vercel
   ```
   Follow the interactive prompts:
   - *Set up and deploy?* **Y**
   - *Which scope?* Select your team/account
   - *Link to existing project?* **N**
   - *Project name?* `techsetu` (or your chosen name)
   - *In which directory is your code located?* `./`
   - *Auto-detected Project Settings (Vite)?* **Y**

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

---

## 🌐 Option 2: Deploy via GitHub & Vercel Dashboard (Continuous Deployment)

1. Push your repository to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: complete TechSetu platform"
   git branch -M main
   git remote add origin https://github.com/<your-username>/techsetu.git
   git push -u origin main
   ```

2. Open **[vercel.com/new](https://vercel.com/new)** and import your GitHub repository.

3. Under **Project Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Click **Deploy**! Vercel will automatically build the client and host the serverless functions defined in `/api`.
   Every future git push to `main` will automatically deploy!

---

## ⚡ Option 3: Automated GitHub Actions CI/CD Pipeline

This repository includes pre-configured GitHub Actions workflows in `.github/workflows/`:
- **`deploy-vercel.yml`**: Deploys automatically to Vercel on push to `main` branch or pull requests.
- **`ci.yml`**: Validates TypeScript typing and Vite production builds.

To use the GitHub Actions workflow, simply add three secrets in your GitHub repository (**Settings > Secrets and variables > Actions**):
- `VERCEL_TOKEN`: Obtained from [vercel.com/account/tokens](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID`: From `.vercel/project.json` or team settings
- `VERCEL_PROJECT_ID`: From `.vercel/project.json` or project settings

For the comprehensive guide, see **[GITHUB_TO_VERCEL.md](./GITHUB_TO_VERCEL.md)**.

---

## 🔐 Environment Variables for Vercel

In your Vercel Project Dashboard under **Settings > Environment Variables**, add the following variables:

| Variable | Description | Example / Recommended Value |
|---|---|---|
| `NODE_ENV` | Runtime environment | `production` |
| `JWT_SECRET` | Secret key for signing auth tokens | Any secure random string (e.g. `techsetu_super_secret_jwt_2026`) |
| `ADMIN_EMAIL` | Default administrator login email | `admin@techsetu.com` |
| `ADMIN_PASSWORD` | Default administrator password | `3234541` (or your custom password) |
| `GEMINI_API_KEY` | Optional: Gemini API key for AI features | Your Google Gemini API Key |

---

## 🛠️ Architecture on Vercel

- **Frontend**: Built with Vite and served statically through Vercel's global CDN Edge Network.
- **Serverless API**: Handled by `/api/index.ts` connecting all Express routes at `/api/*`.
- **Database**: In serverless runtime, `db.json` reads from bundled initial data with `/tmp` ephemeral cache support. For persistent cross-instance database storage across Vercel cold starts, you can connect PostgreSQL / Supabase / Neon or Firebase.
- **Routing**: Client-side SPA routes (like `/courses`, `/dashboard`, `/admin`) are redirected to `index.html` via `vercel.json` rewrites.
