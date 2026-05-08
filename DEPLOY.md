# News Section — Ready to Deploy

The commit `69a036b` is already staged in this folder's git repo. Just push it.

## Push to GitHub

```bash
cd "~/Documents/Claude/Projects/Violence-Free Schools Alliance/VFSA_Website_news_update"
git push origin main
```

Netlify will auto-deploy from GitHub (staging URL: https://vfsa.netlify.app).

## Sync with your Desktop working copy

Your local working copy at `~/Desktop/Claude - Educator Association/VFSA_Website` is now one commit behind. After the push lands, pull it there:

```bash
cd "~/Desktop/Claude - Educator Association/VFSA_Website"
git pull origin main
```

## Deploy to the VPS

Per your standard pipeline:

```bash
# On the Hostinger VPS via browser terminal
cd /root/VFSA_Website
git pull origin main
docker compose down
docker compose up -d --build
```

## What changed

- **New page:** `news.html` — "School Violence In The News" with featured card + 9-up grid
- **New page:** `news-archive.html` — 30-day archive view
- **New data:** `data/news.json` — 10 seeded stories (all paywall-free)
- **New JS:** `js/news.js` — fetches JSON, renders cards, graceful image fallback
- **CSS additions:** appended to `css/style.css` (~400 new lines for news styles)
- **Homepage:** new preview section "School Violence In The News" with 3-card grid linking to the full page
- **Nav:** "News" link added between Blog and FAQ on all 9 pages
- **Footer Quick Links:** "News" added everywhere (also fixed a pre-existing malformed `<li>` that had two `<a>` tags inside it)

## Daily automation

Scheduled task `daily-vfsa-news-curator` is registered and runs at 7:02 AM every day. It will:

1. Pull latest from GitHub
2. WebSearch for new school violence coverage
3. Filter out paywalled sources (nytimes, washingtonpost, wsj, latimes, etc.)
4. Filter for on-mission framing (educators as protected class)
5. Extract structured data with OG images
6. Update `data/news.json` (top 10, rolling 30-day archive)
7. Commit + push to GitHub
8. iMessage you a summary at 214-980-0924

## Verify after deploy

Visit these URLs in order:

1. https://vfsa.netlify.app/news.html — main news page
2. https://vfsa.netlify.app/news-archive.html — archive
3. https://vfsa.netlify.app/ — homepage preview section
4. https://violencefreeschools.org/news.html — production after VPS pull

Open the browser console — you should see no errors and a "last updated" indicator showing "just now" on the meta bar.
