#!/usr/bin/env python3
"""
VFSA news gate: US domestic K-12 / school-staff violence ONLY.

RULE (do not weaken): Curated stories must be about United States schools
(or US territories). Reject international school violence (Thailand, UK,
Canada, Mexico, etc.) even if educators/teachers are victims.

Used by:
  - daily-vfsa-news-curator (must call is_us_domestic_article / filter_articles
    before writing data/news.json)
  - CLI: python3 scripts/us_domestic_news_filter.py data/news.json
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

# US state / DC / territory codes accepted in article["state"]
US_STATE_CODES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID",
    "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS",
    "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
    "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV",
    "WI", "WY", "DC", "PR", "GU", "VI", "AS", "MP",
}

# Clear international / non-US geography signals (reject if present and no US state)
INTERNATIONAL_PATTERNS = [
    r"\bthailand\b", r"\bthai\b", r"\bbangkok\b", r"\bnonthaburi\b",
    r"\bcanada\b", r"\btoronto\b", r"\bontario\b", r"\bbritish columbia\b",
    r"\bmexico\b", r"\bcanada\b",
    r"\bunited kingdom\b", r"\bengland\b", r"\bscotland\b", r"\bwales\b",
    r"\baustralia\b", r"\bnew zealand\b",
    r"\bjapan\b", r"\bchina\b", r"\bindia\b", r"\bbrazil\b", r"\bfrance\b",
    r"\bgermany\b", r"\bspain\b", r"\bitaly\b", r"\bsouth africa\b",
    r"\bphilippines\b", r"\bnigeria\b", r"\bisrael\b", r"\bpakistan\b",
    r"/asia/", r"/europe/", r"/middleeast/", r"/africa/", r"/americas/(?!us)",
    r"-intl-", r"/intl/", r"\binternational\b",
]

# Preferred search query fragments for the curator (US-scoped)
US_SEARCH_QUERIES = [
    "US school shooting OR school threat OR teacher assault 2026",
    "American high school lockdown gun OR threat",
    "US teacher assaulted by student OR parent school",
    "school resource officer arrest US campus",
    "clear backpack policy US school district",
]

PAYWALL_DOMAINS = [
    "nytimes.com", "washingtonpost.com", "wsj.com", "latimes.com",
    "ft.com", "bloomberg.com", "newyorker.com", "theatlantic.com",
]


def _blob(article: dict[str, Any]) -> str:
    parts = [
        article.get("id"),
        article.get("headline"),
        article.get("url"),
        article.get("excerpt"),
        article.get("image_alt"),
        article.get("source"),
        article.get("state"),
    ]
    return " ".join(str(p or "") for p in parts).lower()


def has_international_signal(article: dict[str, Any]) -> bool:
    text = _blob(article)
    return any(re.search(p, text, re.I) for p in INTERNATIONAL_PATTERNS)


def has_us_state(article: dict[str, Any]) -> bool:
    st = article.get("state")
    if st is None or st == "":
        return False
    return str(st).upper() in US_STATE_CODES


def is_us_domestic_article(article: dict[str, Any]) -> bool:
    """
    Accept if:
      - state is a US code, OR
      - no international geography signals and topic is clearly US national
        (e.g. EdWeek / AFT / CNN US school shootings fast facts)
    Reject if international geography is present (even with educators harmed).
    """
    if has_international_signal(article):
        return False
    if has_us_state(article):
        return True
    # National US coverage without a single state (analysis / policy)
    text = _blob(article)
    us_markers = (
        r"\bu\.?s\.?\b", r"\bunited states\b", r"\bamerican\b",
        r"\bnationwide\b", r"\bfederal\b", r"\bedweek\b", r"\baft\b",
        r"school shootings in the us", r"us school",
    )
    if any(re.search(m, text, re.I) for m in us_markers):
        return True
    # No state and no US marker → reject (too risky for intl slip-through)
    return False


def filter_articles(articles: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    kept, rejected = [], []
    for a in articles:
        if is_us_domestic_article(a):
            kept.append(a)
        else:
            rejected.append(a)
    return kept, rejected


def scrub_news_json(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text())
    arts, rej_a = filter_articles(data.get("articles") or [])
    arch, rej_b = filter_articles(data.get("archive") or [])
    data["articles"] = arts
    data["archive"] = arch
    return {"data": data, "rejected": rej_a + rej_b}


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: us_domestic_news_filter.py <news.json> [--write]", file=sys.stderr)
        return 2
    path = Path(sys.argv[1])
    write = "--write" in sys.argv
    result = scrub_news_json(path)
    rejected = result["rejected"]
    print(f"Rejected {len(rejected)} non-US/international article(s):")
    for a in rejected:
        print(f"  - {a.get('id')}: {a.get('headline')}")
    if write:
        path.write_text(json.dumps(result["data"], indent=2, ensure_ascii=False) + "\n")
        print(f"Wrote scrubbed file: {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
