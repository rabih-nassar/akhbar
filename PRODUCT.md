# Akhbar.FYI

## What it is
A personal, single-file (client-side only) Arabic news aggregator that scrapes
live sections from Lebanese news sites (tayyar.org: Featured News, Exclusive,
Live News; elnashra.com: unread news digest) directly in the browser and
displays them in a fast, readable feed. No backend, no build step — runs from
`file://` or a static host (Cloudflare Workers static assets).

## Users
A single user (the site owner) who wants a quick, elegant personal news
dashboard to skim Lebanese political/news headlines in Arabic (RTL) without
visiting multiple sites. Casual, at-a-glance reading — often on mobile.

## Register
product — this is a personal reading tool/dashboard. Design serves fast
scanning and reading, not brand storytelling.

## Tone / brand
Minimal, editorial, calm. Content (Arabic headlines) is the star. Currently:
light theme, red (`#e02424`-ish) accent header, three-column layout
(Featured / Live / Exclusive) collapsing to Live-first on mobile, tabbed
Live News (Tayyar / Elnashra), full-screen article reader popup.

## Anti-references
Not a typical "SaaS dashboard" look (no gradient hero cards, no glassmorphism,
no generic Bootstrap news-template feel). Not overly playful — this is a
serious news reading tool.

## Strategic principles
- RTL Arabic content must always read naturally and be typographically solid.
- Speed and clarity over decoration; the user reads dozens of headlines fast.
- Any embellishment must not compromise scanability of headlines.
