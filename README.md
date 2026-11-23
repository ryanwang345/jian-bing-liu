# Jian Bing Liu (煎饼刘) — Restaurant Website

A warm, modern, responsive restaurant website for **Jian Bing Liu** (`124 Camden Rd, London NW1 9EE`), built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

## Features

- **Pages**: Home (`/`), Menu (`/menu`), Our Story (`/our-story`), Gallery (`/gallery`), and Visit Us (`/visit-us`).
- **Real Supplied Photography**: Curated and optimized local photography from the provided Google Drive folder rendered via `next/image` with AVIF/WebP support and descriptive `alt` text.
- **Brand-Aligned Visual System**: Warm kraft paper (`#FBF6EC` / `#F2E6CF`), vermilion seal cinnabar (`#B8251C`), cast-iron ink (`#1A1614`), and calligraphy accents (`Ma Shan Zheng`, `Fraunces`, `Plus Jakarta Sans` loaded via `next/font/google`).
- **Interactive Menu & Gallery**: Dietary filters (`All`, `Halal`, `Vegetarian`, `Vegan`) with category jump links on `/menu`, plus a category-filtered lightbox gallery with keyboard navigation on `/gallery`.
- **Verified Business Details & Clear Placeholders**: Address, opening hours, phone number, service options (Takeaway & No-contact delivery), verified menu items/prices, and official All Eat ordering link. Unverified optional details (email address, official social handles, founder bio dates, and unpriced photographed items) are clearly marked as placeholders rather than invented.
- **SEO & Accessibility**: Per-page metadata, Open Graph & Twitter previews, `Restaurant` JSON-LD structured data, dynamic `sitemap.xml` and `robots.txt`, skip-to-content link, keyboard navigation, and accessible color contrast.

## Easy Content Updates

All restaurant content lives in structured TypeScript files under `src/data/`:

- [`src/data/restaurant.ts`](src/data/restaurant.ts) — Address, opening hours, phone, verified ordering/map links, story copy, and clearly marked placeholders (`email`, `verifiedSocialLinks`, `founderStoryNote`).
- [`src/data/menu.ts`](src/data/menu.ts) — Menu categories, item descriptions, verified prices (or `null` for `Price TBC`), dietary badges, and dish imagery.
- [`src/data/gallery.ts`](src/data/gallery.ts) — Gallery images, categories, captions, and accessible `alt` descriptions.

## Local Development

### Prerequisites

- Node.js 20+ (tested on Node 24)
- pnpm 10+ (tested on pnpm 11)

### Setup & Run

```bash
# 1. Install dependencies
pnpm install

# 2. (Optional) Configure your public site URL
cp .env.example .env.local

# 3. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quality Checks

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Deployment

### 1. Local Docker Compose (Production Standalone Container)

```bash
make dev-docker
# Or: DOCKER_BUILDKIT=1 docker compose up --build
```

Runs the multi-stage standalone Next.js container (`read_only: true`, non-root UID `1001`, healthchecked at `/api/healthz`) on `http://localhost:3000`. Stop with `make dev-down`.

### 2. Jenkins CI (Kubernetes Agent + Rootless BuildKit)

The root [`Jenkinsfile`](Jenkinsfile) matches the `local-k8s` homelab setup:

1. Runs `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm lint`, and `pnpm build` inside `node:22-bookworm`.
2. Builds and pushes `docker.io/<DOCKERHUB_USER>/jian-bing-liu:<BUILD_NUMBER>` (and `:latest`) using `moby/buildkit:v0.34.2-rootless` (`buildctl-daemonless.sh`) with Jenkins credentials `DOCKERHUB_USER` and `DOCKERHUB_TOKEN`.

### 3. ArgoCD GitOps, Helm & Cloudflare Tunnel (`jianbingliu.uk`)

Kubernetes manifests and Helm charts live in the central **ProjectDesk-GitOps** repository under `helm/jian-bing-liu/` and `argocd-applications/`:

1. Push `ProjectDesk-GitOps` to `main` — `bootstrap.yaml` automatically creates the `jian-bing-liu` ArgoCD project along with `jian-bing-liu-staging` and `jian-bing-liu-prod`.
2. Bump the deployed image tag from `ProjectDesk-GitOps`:
   ```bash
   ./scripts/update-jian-bing-liu-tag.sh <BUILD_NUMBER> staging
   ./scripts/update-jian-bing-liu-tag.sh <BUILD_NUMBER> prod
   ```
3. In **Cloudflare Zero Trust Dashboard → Networks → Tunnels → Public Hostnames**, route `jianbingliu.uk`, `www.jianbingliu.uk`, and `staging.jianbingliu.uk` to `http://ingress-nginx-controller.ingress-nginx.svc.cluster.local:80` and enable **Always Use HTTPS**.

### 4. Vercel / Node.js Alternative

You can also deploy directly to Vercel (it detects `pnpm-lock.yaml` automatically) with `NEXT_PUBLIC_SITE_URL=https://jianbingliu.uk`, or self-host via:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```
