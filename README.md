# Violence-Free Schools Alliance (VFSA) Website

The official website for the Violence-Free Schools Alliance — the first national organization dedicated to passing Educator's Bill of Rights legislation in every state and at the federal level.

## Pages

- **Home** — Hero, stats, mission overview, key messages
- **About** — Mission, vision, core values, strategic approach
- **The Bill** — Educator's Bill of Rights model legislation summary
- **FAQ** — Comprehensive Q&A covering scope, SPED, equity, implementation
- **Get Involved** — Membership tiers, volunteer opportunities, legislative roadmap
- **Contact** — Contact form, email addresses, newsletter signup

## Tech Stack

- Pure HTML/CSS/JS (no framework dependencies)
- Google Fonts (Inter)
- Responsive design (mobile-first)
- CSS custom properties for theming
- Vanilla JS for accordion, counter animation, mobile nav

## Deployment

### Netlify
Push to GitHub and connect the repo in Netlify. Config is in `netlify.toml`.

### Docker (VPS / Hostinger)
```bash
docker-compose up -d --build
```

Or manually:
```bash
docker build -t vfsa-website .
docker run -d -p 80:80 --name vfsa-website --restart unless-stopped vfsa-website
```

## Brand Palette

| Element | Color |
|---------|-------|
| Navy | `#1B2A4A` |
| Slate | `#2C3E6B` |
| Silver | `#8C9BB5` |
| Light | `#E8ECF3` |
| Red Accent | `#C0392B` |
