# 🐙 Connecting GitHub to Vercel (Continuous Deployment Guide)

This guide walks you through connecting your **TechSetu** repository on GitHub directly to **Vercel** for automatic, instant deployments on every commit or pull request.

---

## 🚀 Two Methods to Connect GitHub to Vercel

| Feature | Method 1: Native Vercel GitHub App (⭐ Recommended) | Method 2: GitHub Actions CI/CD Pipeline |
|---|---|---|
| **Setup Complexity** | Zero-config (3 clicks) | Requires 3 repository secrets |
| **Preview Branches** | Automatic on every Pull Request | Automated via workflow |
| **Instant Rollbacks** | Yes, 1-click in Vercel dashboard | Via Git commits or Vercel dashboard |
| **Maintenance** | None (managed by Vercel) | Custom workflow files in `.github` |

---

## 🛠️ Step 1: Push Your Project to GitHub

### Scenario A: If Your GitHub Repository Already Exists (Most Common)

If you already created the repository on GitHub (e.g., with a `README.md`, `.gitignore`, license, or existing commits):

```bash
# 1. Initialize local Git repository
git init

# 2. Add all files in this project
git add .

# 3. Create your commit
git commit -m "feat: complete TechSetu exam preparation and course selling platform"

# 4. Set branch to main
git branch -M main

# 5. Remove any old origin URL to avoid "remote origin already exists" error
git remote remove origin 2>/dev/null || true

# 6. Add your GitHub repository as origin
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git

# 7. Push and overwrite the initial GitHub files with this complete application
git push -u origin main --force
```

> **Why `--force`?** When GitHub creates a repository with an initial `README.md`, Git treats it as an independent history. Pushing with `--force` safely tells GitHub that this TechSetu application is the authoritative code for the `main` branch.

#### Alternative: If you want to merge instead of force-push:
```bash
git pull origin main --allow-unrelated-histories --no-rebase
git push -u origin main
```

---

### Scenario B: If Your GitHub Repository is Completely Empty

If the repository on GitHub is brand new and contains no commits:

```bash
git init
git add .
git commit -m "feat: complete TechSetu online exam preparation platform"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

---

## 🌟 Method 1: Native Vercel GitHub Integration (Recommended)

This is the official and easiest way to deploy:

1. **Log in to Vercel**:
   Go to [vercel.com](https://vercel.com) and log in with your GitHub account.

2. **Import Git Repository**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Under **"Import Git Repository"**, you will see your GitHub repositories.
   - If your repository isn't listed, click **"Adjust GitHub App Permissions"** or install the [Vercel GitHub App](https://github.com/apps/vercel).
   - Click **Import** next to your TechSetu repository.

3. **Configure Project Settings**:
   Vercel automatically detects the configuration from `vercel.json`:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**:
   Under the **Environment Variables** expandable section, add:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `<any-secure-random-token-e.g.-techsetu_super_secret_jwt_2026>`
   - `ADMIN_EMAIL` = `<your-admin-email-e.g.-admin@techsetu.com>`
   - `ADMIN_PASSWORD` = `<your-admin-password>`

5. **Click Deploy**:
   Vercel will build and deploy your application. You will receive a live URL like `https://techsetu.vercel.app`.

### 🎉 Continuous Deployment in Action:
- Every push to the `main` branch automatically deploys to production.
- Every Pull Request automatically generates a unique **Preview URL** with comments directly on your GitHub PR.

---

## ⚙️ Method 2: Deploy via GitHub Actions Workflow

This repository already contains ready-to-run GitHub Actions workflows in `.github/workflows/`:
- `.github/workflows/deploy-vercel.yml` (automated preview and production deployments)
- `.github/workflows/ci.yml` (automated TypeScript type checking & build verification)

### Setting Up GitHub Actions Secrets:

1. **Get Vercel Credentials**:
   - **`VERCEL_TOKEN`**: Create an access token in [vercel.com/account/tokens](https://vercel.com/account/tokens).
   - **`VERCEL_ORG_ID` & `VERCEL_PROJECT_ID`**:
     Run `vercel link` in your local terminal to link your project.
     Inspect `.vercel/project.json` to find your `orgId` and `projectId`.

2. **Add Secrets to GitHub**:
   - Open your GitHub repository in your browser.
   - Navigate to **Settings > Secrets and variables > Actions > New repository secret**.
   - Add:
     - `VERCEL_TOKEN`: Your Vercel token
     - `VERCEL_ORG_ID`: Your Organization ID
     - `VERCEL_PROJECT_ID`: Your Project ID

3. **Push to Trigger**:
   - Any push to `main` will automatically trigger the GitHub Actions workflow and deploy directly to Vercel!

---

## 📂 Project Architecture on Vercel

```
├── /api/index.ts         -> Serverless Function (Express API for /api/*)
├── /dist                 -> Vite production static build (HTML, JS, CSS)
├── vercel.json           -> Vercel routing rules & rewrites
├── .vercelignore         -> Excludes unwanted files from deployment package
├── .github/workflows/    -> CI & automated Vercel deployment workflows
└── DEPLOY_VERCEL.md      -> CLI and quick reference manual
```

---

## 🆘 Troubleshooting

- **Serverless API Errors**: Verify your environment variables are configured in Vercel Project Settings > Environment Variables.
- **Vercel Routing**: If client-side sub-routes return 404, verify that `vercel.json` has the SPA fallback rewrite `{"source": "/(.*)", "destination": "/index.html"}`. (Already configured in this project).
- **GitHub Permission**: If your repository doesn't show up on Vercel, grant permissions to the repository at [github.com/settings/installations](https://github.com/settings/installations).
