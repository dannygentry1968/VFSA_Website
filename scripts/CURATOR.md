# VFSA News Curator — US Domestic Only

**Scheduled task name:** `daily-vfsa-news-curator`  
**Writes:** `data/news.json` (top ~10 + rolling archive)  
**Filter module:** `scripts/us_domestic_news_filter.py`

## Hard rule (do not weaken)

> Curate **United States domestic school / educator violence coverage only**.  
> **No international stories** (Thailand, UK, Canada, Mexico, Asia/Europe/Africa school attacks, etc.).

VFSA’s mission is Violence-Free Schools Act legislation in **US states and federally**. International tragedies are out of scope for this feed.

## Pipeline checklist (every run)

1. Pull latest from GitHub.
2. WebSearch with **US-scoped** queries, e.g.:
   - `US school shooting OR school threat OR teacher assault`
   - `American high school lockdown gun`
   - Prefer state/local US outlets + national US education press.
3. **Reject** paywalled sources (nytimes, washingtonpost, wsj, latimes, …).
4. **Reject** any candidate that fails `is_us_domestic_article()`:
   ```bash
   python3 scripts/us_domestic_news_filter.py data/news.json --write
   ```
   Or call `filter_articles()` / `is_us_domestic_article()` in-process before write.
5. Prefer articles with a US `state` code (TN, TX, …). National US analysis OK if clearly US-framed and no foreign geography.
6. Filter for on-mission framing (educators / school staff safety).
7. Update `data/news.json`, commit `news: daily curation YYYY-MM-DD`, push.
8. After push, production VPS must refresh `data/news.json` + rebuild `vfsa-website` (or automated sync).

## Reject examples

- CNN Thailand / Bangkok / Debsirin school shooting (`…/asia/thailand-…`, `state: null`)
- Any URL path with `/asia/`, `/europe/`, `-intl-` plus foreign place names
- Stories whose only geography is outside the US / territories

## Accept examples

- Local US TV/radio on a named US district or campus
- State legislation (KY SB 101, LA Teacher Shield, HI educator protection, …)
- National US trackers explicitly about school shootings **in the US**
