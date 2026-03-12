# Deployment guide: Binary Tree Constructor

This file tracks **every command**, **why we run it**, and **in what order** so you can understand and repeat the process.

---

## Deploy on Vercel now (browser – no CLI login)

1. **Open this link** (imports your GitHub repo):  
   **https://vercel.com/new/import?s=https://github.com/krsinghshubham/binary-tree-constructor**

2. **Log in** to Vercel with GitHub if asked.

3. **If it says “GitHub integration is required”:**
   - **Option A:** On that same screen, click the **“Connect GitHub”** or **“Configure”** link that Vercel shows—it will take you to the right place to authorize.
   - **Option B:** Go to **https://vercel.com/account** (log in if needed). In the left sidebar, look for **“Git”** or **“Integrations”** and connect GitHub from there.
   - **Option C:** Go to **https://vercel.com/new**. If your repos don’t appear, click **“Adjust GitHub App Permissions”** or **“Connect different account”** and authorize the repo access.
   - In GitHub, approve Vercel (all repos or only `binary-tree-constructor`). Then go back to **Add New → Project** and import `krsinghshubham/binary-tree-constructor` again.

4. **Confirm settings** (Vercel usually detects them):
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Root Directory:** leave blank

5. **Environment Variables:** leave empty. This app doesn’t use any; you can skip that section.

6. Click **Deploy**. Wait 1–2 minutes. Your live URL will be shown (e.g. `binary-tree-constructor-xxx.vercel.app`).

**Commands we ran (for the record):**
- `cd /Users/shubsingh/Desktop/PlayArena/binary-tree-constructor` – go to project
- `npx vercel --yes` – failed because CLI needs `vercel login` first; using the browser import above avoids that.

---

## What we’re doing

- We have a **static website** (HTML, CSS, JS built by Vite).
- We want to **deploy it for free** so you get a public URL and don’t need to run `localhost` every time.
- We’ll record each step and command so you can learn and redo it yourself.

---

## Prerequisites (one-time)

- **Node.js** installed (you already have it).
- **Git** and the project in a **GitHub** repo (already done: `krsinghshubham/binary-tree-constructor`).
- **Project path**:  
  `~/Desktop/PlayArena/binary-tree-constructor`  
  (or `/Users/shubsingh/Desktop/PlayArena/binary-tree-constructor`)

---

## Step 1: Build the app (create the static files)

**Command:**

```bash
cd /Users/shubsingh/Desktop/PlayArena/binary-tree-constructor
npm run build
```

**Why:**

- `cd` moves you into the project folder so all later commands run in the right place.
- `npm run build` runs the `build` script from `package.json`, which does:
  - `tsc -b` → TypeScript type-check and emit (no files in `dist`, but ensures code is valid).
  - `vite build` → Bundles the app and writes output to the **`dist`** folder.

**Result:** A `dist/` folder with `index.html` and assets (JS, CSS). That folder is what we deploy as a static site.

---

## Step 2: Choose a free host and deploy

We use one of these (all free for static sites):

| Option              | Why use it                         | Bandwidth (free)      |
|---------------------|------------------------------------|------------------------|
| **Vercel**          | Easiest, auto-deploy from GitHub   | Generous free tier    |
| **Cloudflare Pages**| Often “unlimited” bandwidth        | No hard cap listed    |
| **GitHub Pages**    | Free, no extra account             | 100 GB/month soft cap |

Below are the **exact commands and steps** for each.

---

### Option A: Vercel (recommended – connect GitHub, then it deploys on every push)

**Reason:** One-time link of your repo; every `git push` triggers a new deploy. No need to run deploy commands from your machine after that.

**Steps:**

1. **Create account / log in**  
   Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).

2. **Import the GitHub repo**  
   - Dashboard → **Add New** → **Project**.  
   - Choose **Import Git Repository** and select `krsinghshubham/binary-tree-constructor`.  
   - Vercel will detect it’s a Vite app and suggest:
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
   - Click **Deploy**.

3. **What Vercel does (for your learning):**  
   On their servers they run something equivalent to:
   - `npm install`
   - `npm run build`
   - They then serve the contents of `dist/` on a URL like `binary-tree-constructor-xxx.vercel.app`.

**Optional – deploy from your machine once with Vercel CLI:**

```bash
cd /Users/shubsingh/Desktop/PlayArena/binary-tree-constructor
npx vercel
```

**Why:**

- `npx vercel` uses the Vercel CLI to deploy the current folder.
- First time it will ask you to log in and link a Vercel project.
- It uses your local `dist/` (or runs a build) and uploads it.  
So the **same idea** as the GitHub flow, but triggered from your terminal instead of a push.

---

### Option B: Cloudflare Pages (good if you want to avoid bandwidth limits)

**Reason:** Free static hosting; Cloudflare’s free tier doesn’t publish a strict bandwidth limit, so it’s often described as “unlimited” for typical use.

**Steps:**

1. **Create account / log in**  
   Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign in.

2. **Create a Pages project**  
   - **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
   - Select your GitHub account and repo `binary-tree-constructor`.
   - Configure build:
     - **Build command:** `npm run build`
     - **Build output directory:** `dist`
   - Click **Save and Deploy**.

3. **What Cloudflare does:**  
   Same idea as Vercel: they run `npm install` and `npm run build`, then serve the `dist/` folder. You get a URL like `binary-tree-constructor.pages.dev`.

**Optional – deploy from your machine with Wrangler (Cloudflare CLI):**

```bash
cd /Users/shubsingh/Desktop/PlayArena/binary-tree-constructor
npm run build
npx wrangler pages deploy dist --project-name=binary-tree-constructor
```

**Why:**

- `npm run build` creates/updates `dist/`.
- `npx wrangler pages deploy dist` uploads the `dist` folder to Cloudflare Pages.
- `--project-name=binary-tree-constructor` sets the project name. First time you may need to run `npx wrangler login` and create the project (CLI will prompt).

---

### Option C: GitHub Pages (free, no extra account)

**Reason:** Everything stays inside GitHub; no Vercel/Cloudflare account. Good for learning how “build on CI and serve static files” works.

**Steps:**

1. **Add a deploy workflow**  
   Create this file in your repo:

   **File:** `.github/workflows/deploy.yml`

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'

         - name: Install and build
           run: |
             npm ci
             npm run build

         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v4
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. **Enable GitHub Pages**  
   Repo → **Settings** → **Pages** → **Source**: “GitHub Actions”.

3. **Push to `main`**  
   On the next push to `main`, the workflow runs: checkout → `npm ci` → `npm run build` → publish `dist/` to the `gh-pages` branch. Your site will be at `https://krsinghshubham.github.io/binary-tree-constructor/`.

**Why each part:**

- `on: push: branches: [main]` → run this workflow on every push to `main`.
- `actions/checkout@v4` → get your repo code.
- `actions/setup-node@v4` with `cache: 'npm'` → install Node and cache `node_modules` for speed.
- `npm ci` → clean install from `package-lock.json` (reproducible).
- `npm run build` → same as on your machine; produces `dist/`.
- `peaceiris/actions-gh-pages@v4` → takes `dist/` and pushes it to the branch GitHub Pages serves.

---

## Command log (quick reference)

| Step | Command | Reason |
|------|--------|--------|
| 1 | `cd /Users/shubsingh/Desktop/PlayArena/binary-tree-constructor` | Go to project root |
| 2 | `npm run build` | Produce static files in `dist/` |
| 3a | (Vercel) Connect repo in dashboard or run `npx vercel` | Upload and serve `dist/` |
| 3b | (Cloudflare) Connect repo in dashboard or run `npx wrangler pages deploy dist --project-name=binary-tree-constructor` | Same for Cloudflare |
| 3c | (GitHub Pages) Add `.github/workflows/deploy.yml`, enable Pages, push | Build and publish from GitHub Actions |

---

## After deployment

- You get a **public URL** (e.g. `*.vercel.app`, `*.pages.dev`, or `*.github.io/...`).
- For **Vercel/Cloudflare**: every push to `main` can auto-deploy if you connected the repo.
- For **GitHub Pages**: every push to `main` runs the workflow and updates the site.

You no longer need to run `localhost`; you just push code and the host serves the built site.
