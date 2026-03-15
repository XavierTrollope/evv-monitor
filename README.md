# evv-monitor

Backend service that discovers and monitors EVV (Electronic Visit Verification) regulatory websites for content changes, then sends formatted Slack alerts.

## Architecture

| Module | Purpose |
|---|---|
| **Discovery Engine** | Finds new EVV-related URLs via Google Custom Search on a cron schedule |
| **Watchlist Engine** | Polls curated URLs at configurable intervals, captures snapshots, detects changes |
| **Change Detector** | Produces human-readable diffs with noise filtering (timestamps, ads, whitespace) |
| **Notification Dispatcher** | Sends Slack Block Kit alerts with rate limiting and channel routing |
| **Watchlist API** | REST endpoints for CRUD on the watchlist, approval workflow, and change history |

## Deploy to a NAS / Server (Docker)

The recommended way to run evv-monitor permanently is with Docker Compose. This bundles the app, PostgreSQL, and Playwright into containers that auto-restart.

### Prerequisites on the server

- **Docker Engine** >= 20 and **Docker Compose** v2 (plugin)
- For OMV: install via OMV-Extras > Docker + Compose plugin
- x86_64 (Intel/AMD) processor required for Playwright/Chromium

### One-command deploy from your Mac

```bash
# Upload the project to your NAS (replace with your NAS IP and user)
./deploy.sh 192.168.1.50 root
```

Then SSH into the NAS and start it:

```bash
ssh root@192.168.1.50
cd /opt/evv-monitor

# Configure your secrets
cp .env.example .env
nano .env    # set SLACK_WEBHOOK_URL, SEARCH_API_KEY, etc.

# Build and start (first time takes ~3-5 minutes)
docker compose up -d --build

# Verify it's running
docker compose logs -f app     # watch logs (Ctrl+C to exit)
```

The dashboard is now at **http://YOUR_NAS_IP:3000** from any device on your network.

### Useful Docker commands

```bash
docker compose ps              # check status
docker compose logs -f app     # stream app logs
docker compose restart app     # restart after config change
docker compose down            # stop everything
docker compose up -d --build   # rebuild after code changes
```

### Expose outside your network (optional)

To access from outside your home:
1. **Port forward** port 3000 on your router to the NAS IP, or
2. Use a reverse tunnel like [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) (free, no port forwarding needed), or
3. Set up a VPN (Tailscale, WireGuard) for secure remote access

> **Security note:** Add token auth before exposing to the public internet. The API is currently unauthenticated.

---

## Local Development

### Prerequisites

- **Node.js** >= 18 (recommend 22 LTS)
- **npm** >= 9
- Playwright browsers: `npx playwright install chromium`

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and edit environment variables
cp .env.example .env
# Edit .env — for local dev you can use SQLite by changing the
# Prisma schema provider back to "sqlite" and setting:
#   DATABASE_URL=file:./evv_monitor.db

# 3. Generate Prisma client and create database
npx prisma generate
npx prisma db push

# 4. Seed the watchlist with known EVV URLs
npm run db:seed

# 5. Start the service (API + schedulers)
npm start          # production (from dist/)
npm run dev        # development (tsx watch)
```

## API Endpoints

> **Security note:** Token-based authentication should be added before any public exposure. All endpoints are currently unauthenticated.

| Method | Path | Description |
|---|---|---|
| `GET` | `/watchlist` | List all watched URLs with status and last-checked time |
| `POST` | `/watchlist` | Add a new URL (body: `{ url, tags, interval_minutes }`) |
| `PATCH` | `/watchlist/:id` | Update tags, interval, or status |
| `DELETE` | `/watchlist/:id` | Remove a URL from monitoring |
| `POST` | `/watchlist/:id/approve` | Promote a discovered URL to active monitoring |
| `GET` | `/changes` | List recent change events (filterable: `?state=TX&from=2026-01-01`) |
| `GET` | `/changes/:id/diff` | Full diff for a specific change event |
| `GET` | `/health` | Health check |

## Configuration

All configuration is via `.env` and JSON files in `config/`.

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `SLACK_WEBHOOK_URL` | — | Slack Incoming Webhook URL |
| `SEARCH_API_KEY` | — | Google Custom Search API key |
| `SEARCH_ENGINE_ID` | — | Google Custom Search engine ID |
| `DATABASE_URL` | (set by Docker Compose) | PostgreSQL connection string |
| `POSTGRES_PASSWORD` | `evv_monitor_secret` | PostgreSQL password (Docker Compose) |
| `DISCOVERY_CRON` | `0 8 * * *` | Cron schedule for discovery runs |
| `DEFAULT_POLL_INTERVAL_MIN` | `60` | Default polling interval (minutes) |
| `CHANGE_THRESHOLD_PCT` | `5` | Minimum change % to trigger an alert |
| `PLAYWRIGHT_TIMEOUT_MS` | `15000` | Page load timeout |
| `PORT` | `3000` | API server port |
| `DIFF_VIEWER_BASE_URL` | — | Base URL for "View full diff" links |

### Config files

- **`config/evv-queries.json`** — search queries for the discovery engine
- **`config/noise-filters.json`** — regex patterns to ignore during diffing
- **`config/slack-routing.json`** — route alerts to Slack channels by tag

## Database

Docker Compose runs PostgreSQL automatically. For local development, you can switch to SQLite by changing the `provider` in `prisma/schema.prisma` to `"sqlite"` and setting `DATABASE_URL=file:./evv_monitor.db` in `.env`.

### Schema

- **watched_urls** — monitored URLs with status, tags, polling interval
- **snapshots** — compressed HTML + extracted text for each fetch
- **change_events** — detected changes with diff preview and score
- **discovery_runs** — audit log of search queries and results

## Error Handling

- Failed page fetches increment `consecutiveFailures`; after 5 consecutive failures the URL is paused (`error_paused`) and a Slack alert is sent
- PDF URLs are flagged as `pending_review` — no parsing is attempted
- All scheduler errors are caught per-URL; the process never crashes from a single fetch failure

## Seed Data

The seed script (`npm run db:seed`) pre-populates the watchlist with:

- **HHAeXchange** (68 URLs): corporate pages, state EVV status, provider info hubs across 16 states (AL, AR, FL, HI, IL, MI, MN, MS, NJ, NY, NC, OK, PA, TX, VA, WV), payer-specific hubs, consumer portals, press releases
- **Other aggregators:** Sandata, Netsmart/AuthentiCare, Tellus
- **State Medicaid portals:** Texas HHSC, Ohio Medicaid, Florida AHCA, New York DOH, Illinois HFS, California DHCS
- **Federal:** Medicaid.gov EVV page

Total: **81 URLs** actively monitored
