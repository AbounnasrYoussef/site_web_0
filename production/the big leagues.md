Big-Leagues Launch Checklist
Organized by phase, with rough time estimates. Do them in order — earlier items unblock later ones.

Phase 1 — Before you deploy (Week 1)
  SEO foundations
□ Fix canonical URLs per page — root sets the homepage as canonical for every route, which tells Google all pages are duplicates. Override per-page.
□ Add JSON-LD — Organization, WebSite (with SearchAction), and WebPage schemas in the root layout. For /paths, EducationalOccupationalProgram schema. For /map, nothing special needed.
□ Add metadataBase, OG image, Twitter card — the missing pieces from your metadata review.
□ Generate sitemap.ts — include /, /paths, /map, /login, /register. Exclude /profile, /admin, /verify-2fa, /reset-password, /force-change-password.
□ Add robots.ts — disallow auth-gated and token-bearing pages.
□ Verify hreflang — confirm x-default is present and language codes are BCP 47 (fr-MA, ar-MA).
  Security audit
□ Run through your auth flows — check for the issues we discussed: enumeration oracle in login (403 vs 401), the missing if (!storedToken.revoked_at) guard in refresh, rate limiter keys, lockout email throttle.
□ Add the auth/password_same_as_old and auth/2fa_admin_required messages if not already in errors/messages.js.
□ Add HSTS, CSP, and other security headers — at minimum Strict-Transport-Security, X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy: strict-origin-when-cross-origin. Configure via your reverse proxy (nginx/Caddy) or Next.js headers().
□ Rotate all secrets — every .env value: JWT_SECRET, PENDING_2FA_SECRET, RESEND_API_KEY, database password, Google OAuth credentials. Assume anything in dev has leaked.
□ Enable HTTPS everywhere — including the backend. Let's Encrypt via your reverse proxy.
□ Verify CORS — Access-Control-Allow-Origin should be a specific origin, not *, with credentials: true.
□ Check cookie flags — Secure, HttpOnly, SameSite=Lax on all cookies. Verify with browser DevTools in production.
  Legal & compliance
□ Terms of Service page — at minimum a plain-language summary of what users agree to.
□ Privacy Policy page — required by Moroccan law (Loi 09-08) and by every ad platform. List what data you collect, why, how long you keep it, and how to delete it.
□ Cookie banner — if you use any analytics or non-essential cookies. If you use only session cookies + a locale cookie, you're exempt under most interpretations, but check with a lawyer.
□ Contact page with a working email — no mailto: link that goes nowhere. A form that sends to a monitored inbox.
□ Accessibility statement — optional but shows polish. State your WCAG target and known limitations.

Phase 2 — Deployment infrastructure (Week 1)
  Hosting
□ Frontend — Vercel or self-hosted with a CDN. If you self-host, use Cloudflare in front.
□ Backend — a real host with: managed Postgres (or Postgres with automated backups), Node 20+, and HTTPS. Not a single VPS you SSH into — you want a platform with automated health checks and rollback.
□ Uploader service — same standard. Object storage (S3, R2, Backblaze B2) if you're storing user images, not local disk.
□ Postgres — managed service or self-hosted with automated daily backups. Test a restore before you need it.
  Domains & DNS
□ Apex domain — kharita.ma redirects to www.kharita.ma or vice versa (pick one, stick with it). Canonical should match.
□ Backend subdomain — api.kharita.ma. Set up CORS for exactly this origin.
□ Email subdomain — mail.kharita.ma for SPF/DKIM/DMARC records. Resend gives you the exact DNS records to add.
□ Verify email deliverability — send a test to Gmail, Yahoo, Outlook. Check the headers for spf=pass, dkim=pass, dmarc=pass. Without DMARC, your transactional emails will land in spam.
  CI/CD
□ Automated tests run on every push — even if it's just npm run build and a smoke test.
□ Preview deployments — Vercel does this out of the box; if self-hosted, add a staging environment.
□ Rollback plan — know exactly how to revert a bad deploy in under 5 minutes. Test it once.
□ Database migrations — versioned, tested, and applied automatically on deploy. Never run them by hand in production.

Phase 3 — Monitoring & reliability (Week 2)
Error tracking
□ Sentry on the frontend — client + server + edge. Catches unhandled exceptions with stack traces and session context.
□ Sentry on the backend — same. Wire your existing logger to forward errors to Sentry.
□ Set alerting rules — email or Slack on any new error type, or any error exceeding N occurrences per hour.
  Uptime monitoring
□ UptimeRobot, BetterStack, or Pingdom — pings /api/health every minute. Alerts you by SMS/email if it fails twice in a row.
□ Add a /api/health endpoint — returns 200 if the DB is reachable, 503 otherwise. Also checks the uploader service.
  Logs & observability
□ Centralized logs — if you have more than one server, ship logs to a service like Logtail, Papertrail, or Grafana Loki. Grep-able across all instances.
□ Request IDs — you already have req.requestId. Make sure it's returned in the response header (X-Request-Id) so you can correlate frontend errors with backend logs.
□ Log retention — 30 days minimum. Don't pay for a year of logs you'll never read.
  Backups
□ Automated daily Postgres backups — to a different region than your primary.
□ Test a restore — actually do it. Once. Know how long it takes and what's missing.
□ Object storage backup — if user uploads matter, back them up too.
  Analytics
□ Pick one product analytics tool — Plausible (privacy-first), Umami (self-hosted), PostHog (feature-rich), or Google Analytics 4 (free but heavy).
□ Track the funnel — visit → register → complete onboarding → log in again. You need to see where people drop off.
□ Track the key events — search on the map, view a path, save a favorite, click through to a university.
□ Don't double-track — one analytics platform is enough. Multiple platforms slow the site and give conflicting numbers.

Phase 4 — Performance (Week 2–3)
  Measure first
□ Run Lighthouse on /, /map, /paths in production. Record the scores.
□ Run WebPageTest from a Moroccan location (Casablanca or Rabat if available). This is what your real users experience.
□ Set targets — LCP < 2.5s, INP < 200ms, CLS < 0.1. If you miss, fix before launch.
  Frontend performance
□ Image optimization — Next.js <Image> everywhere. WebP/AVIF. Lazy load below-the-fold.
□ Font optimization — you're already using next/font. Subset the Arabic font — Cairo's Arabic glyph set is huge; you only need the characters your UI uses.
□ Code splitting — verify the map component (likely heavy) loads only on /map. Use dynamic(() => import(...), { ssr: false }).
□ Bundle analysis — @next/bundle-analyzer. Anything over 100 kB gzipped that isn't a framework should be justified.
□ Reduce client components — every 'use client' adds JS. Audit which of your components genuinely need interactivity.
  Backend performance
□ Database indexes — for every query that runs on a hot path (login, refresh, profile fetch, map load), check EXPLAIN ANALYZE. Add indexes where sequential scans appear.
□ N+1 queries — audit getFullUserProfile and any query that loops. Batch instead.
□ Connection pooling — pg.Pool with sane limits. With multiple backend instances, use PgBouncer.
□ Response caching — /api/categories, /api/diplomas, and any static reference data should be cached (Redis or in-memory). They change rarely.
□ Rate limiting — verify all limiters are tuned (not just enabled).

Phase 5 — Brand & content polish (Week 3)
  Visual identity
□ Final logo — the compass design we discussed. Get SVG + PNG at multiple sizes.
□ Favicon set — 16×16, 32×32, 180×180 (Apple), 192×192, 512×512. Use a generator like realfavicongenerator.net.
□ OG image template — dynamic for /paths/* and /map, static for the homepage.
□ Email template — make sure your Resend templates (reset, OTP, lockout, new device) all use the same brand colors and fonts as your site.
  Copy
□ Every page has a real title and description — no lorem ipsum, no placeholder. Read them aloud — do they sound like a human wrote them?
□ 404 page — the one your friend shared is a good model. Friendly, one clear action.
□ Empty states — what does the map show when no universities match? What does /paths show before the user searches? Design these, don't leave them blank.
□ Error messages — every error a user might see should be a full sentence in their language, not a code. "Something went wrong" is fine; "Error 500" is not.
  Localization QA
□ Test all three locales end to end — register, log in, edit profile, use the map, use the paths.
□ RTL audit — Arabic should flip the entire layout, not just the text. Check margins, icons, progress bars, modals.
□ Arabic typography — Cairo at the right weight and size. Arabic needs more line-height than Latin; make sure you're not using Western defaults.
□ Date and number formats — Arabic uses Eastern Arabic numerals in some contexts, Western in others. French uses , for decimals, English uses .. Get this right.

Phase 6 — Launch day
□ Register in Google Search Console — verify ownership, submit your sitemap, request indexing for the homepage.
□ Register in Bing Webmaster Tools — same.
□ Submit to Cloudflare / Google / Bing safe browsing — no reason, but if you get flagged for a false positive later, having a history helps.
□ Write a launch post — even a short one on LinkedIn or a Facebook group reaches real students.
□ Have a status page — status.kharita.ma using something like Instatus, Statuspage, or a simple static page. When something breaks, users check here first.
□ Set a monitoring channel — a Slack or Discord where Sentry and UptimeRobot alerts land. You need to see them within minutes, not hours.

Phase 7 — After launch (ongoing)
□ Weekly: review error logs — Sentry's "issues" tab. Fix the top 3 every week.
□ Weekly: check analytics — what pages do people actually use? What's the drop-off point?
□ Monthly: security patches — npm audit, npm outdated. Update everything except major versions.
□ Monthly: backup restore drill — verify the last backup is restorable.
□ Quarterly: dependency audit — remove unused packages, upgrade majors deliberately.
□ Quarterly: content refresh — update the homepage copy if it feels stale.
