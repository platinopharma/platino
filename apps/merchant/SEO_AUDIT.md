# Platino Pharma — SEO Audit

_Snapshot audit for the current codebase. Prioritized fix list at the bottom._

## 1. Indexing & crawl controls

| Check | Status | Notes |
|---|---|---|
| `robots` meta on root | ✅ | `index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1` |
| `public/robots.txt` present | ✅ | Allows crawling; disallows `/live/` (auth console) and `/onboarding` |
| Sitemap discoverable | ⚠️ | Served at `/sitemap.xml` but `Sitemap:` directive missing from `robots.txt` — add once BASE_URL is set |
| No accidental sitewide `noindex` | ✅ | — |
| Auth-gated routes excluded | ✅ | `/live/*` disallowed |

## 2. Sitemap & canonicals

| Check | Status | Notes |
|---|---|---|
| `src/routes/sitemap[.]xml.ts` present | ✅ | Server route, dynamic |
| Contains public routes | ✅ | `/`, `/onboarding` |
| `BASE_URL` set | ❌ | Empty placeholder — **BLOCKER**, need production domain |
| Canonical on leaf routes only | ✅ | `/`, `/onboarding` |
| Canonicals self-reference | ✅ | — |
| `og:url` self-references | ✅ | — |
| Trailing slash consistency | ✅ | No trailing slashes |

## 3. Metadata coverage

| Route | title | description | og:* | canonical | JSON-LD |
|---|---|---|---|---|---|
| `/` | ✅ | ✅ | ✅ | ✅ | SoftwareApplication + WebSite |
| `/onboarding` | ✅ | ✅ | ✅ | ✅ | BreadcrumbList |
| `/live/*` | ⚠️ generic | — | — | — | — (correct — auth console, not indexed) |
| Root defaults | ✅ | ✅ | site_name, type, locale | n/a | Organization |

**Missing:** `og:image` on every route. Social previews will fall back to hosting-injected screenshot. Add a real 1200×630 OG image once brand asset is available.

## 4. Structured data

| Schema | Location | Status |
|---|---|---|
| `Organization` | `__root.tsx` | ✅ present, but `url` is `/` — should be absolute once BASE_URL set. `sameAs`, `logo`, `contactPoint` empty |
| `SoftwareApplication` | `/` | ✅ present. Missing `aggregateRating` (add when reviews exist) |
| `WebSite` + `SearchAction` | `/` | ⚠️ `SearchAction.target` points to `/?q=...` but no on-site search implemented — either build search or remove the `potentialAction` |
| `BreadcrumbList` | `/onboarding` | ✅ |
| `Article` / `Product` / `FAQPage` | — | n/a (no such routes) |

**Validate:** paste rendered HTML into <https://validator.schema.org/> and <https://search.google.com/test/rich-results> after deploy. Both should return zero errors.

## 5. Performance / Core Web Vitals

| Check | Status | Notes |
|---|---|---|
| Responsive image component | ✅ | `src/components/ui/optimized-image.tsx` — enforces `width`/`height`, lazy by default, `fetchpriority=high` for LCP |
| Native `<img>` audit | ✅ | Zero raw `<img>` tags in `src/` today — use `OptimizedImage` for anything future |
| Font loading | ⚠️ | Google Fonts loaded via stylesheet with `preconnect` — good. Consider `font-display=swap` (already in URL) and self-hosting for critical fonts to remove render-blocking round-trip |
| Theme flash prevention | ✅ | Pre-hydration script sets `.dark` class before paint |
| CSS bundled via Vite | ✅ | Single `styles.css?url` |
| No blocking third-party scripts | ✅ | — |

## 6. Accessibility signals (impact SEO)

- Semantic landmarks (`<main>`, `<nav>`, `<footer>`) in place on `/`. ✅
- Single `<h1>` per route. ✅
- `alt` text — `OptimizedImage` defaults to `""` (decorative). Set meaningful `alt` for content images.

## 7. Prioritized fix list

### P0 — blockers before public launch
1. **Set production `BASE_URL`** in `src/routes/sitemap[.]xml.ts` and switch all canonicals / `og:url` from relative to absolute.
2. **Insert Google Search Console verification meta** in `__root.tsx` head, then verify ownership at <https://search.google.com/search-console>.
3. **Add `Sitemap: https://<domain>/sitemap.xml`** line to `public/robots.txt` after BASE_URL is set.
4. **Add real `og:image`** (1200×630 PNG/JPG, absolute URL) on `/` and `/onboarding`.

### P1 — before scaling content
5. Fill in `Organization` JSON-LD: `logo`, `sameAs` (social profiles), `contactPoint.telephone`, `address`.
6. Remove `WebSite.potentialAction` until on-site search exists, OR ship search at `/?q=…`.
7. Submit sitemap to Google Search Console + Bing Webmaster Tools.
8. Add per-route `og:title` / `og:description` variants for every new public route (currently gated by convention, easy to forget).

### P2 — polish
9. Self-host Space Grotesk + DM Sans to drop the Google Fonts round-trip.
10. Add `AggregateRating` to `SoftwareApplication` once you collect reviews.
11. Generate AVIF + WebP variants at build time (vite-imagetools) and pass into `OptimizedImage.srcSetSources` once content images exist.
12. Wire up analytics + Search Console API to monitor Core Web Vitals in the field.

## 8. Validation checklist (post-deploy)

- [ ] `curl -sI https://<domain>/sitemap.xml` → 200, `Content-Type: application/xml`
- [ ] `curl -s https://<domain>/robots.txt` shows `Sitemap:` line
- [ ] <https://validator.schema.org/> — 0 errors on `/` and `/onboarding`
- [ ] <https://search.google.com/test/rich-results> — eligible for rich results
- [ ] <https://pagespeed.web.dev/> — LCP < 2.5s, CLS < 0.1, INP < 200ms on mobile
- [ ] Search Console → Coverage → all sitemap URLs "Indexed"