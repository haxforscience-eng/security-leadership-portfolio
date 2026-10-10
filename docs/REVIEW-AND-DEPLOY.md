# Review and deployment checklist

## Content review

- Add the owner's preferred public name and an approved contact destination.
- Add verified roles, dates, credentials and career outcomes with supporting evidence; avoid implied certifications or invented metrics.
- Decide which draft perspectives the owner is comfortable explaining and endorsing.
- Preserve the disclosure that code, design and draft analysis were prepared with OpenAI Codex assistance.
- Verify that every statistic is a synthetic demo result, not a professional achievement.

## Functional review

- Run the Python project's tests and synthetic demo.
- Run `node scripts/check-site.mjs` in the portfolio repository.
- Serve `dist/` over HTTP and inspect both pages at desktop and mobile widths.
- Select all nine scenarios; inspect the raw receipt and audit table.
- Download the evidence brief, operating model, evidence JSON and source archive.
- Inspect keyboard focus, reduced-motion behavior, links and readable contrast.

## Deployment choices

### GitHub Pages

The repository workflow uploads only `dist/`; it needs no package installation or server. Enable GitHub Actions as the Pages source in Settings → Pages. The workflow requests read-only repository contents and only the Pages/OIDC permissions required to deploy. Action commits are pinned and were verified against official action repositories at development time.

Repository Pages uses a subpath; all local links and assets are relative. A custom domain requires a separate DNS and certificate review. Do not add a CNAME until its ownership is confirmed.

### Private Sites preview

The `.openai/hosting.json` identity records the private preview. A private preview is suitable for review and does not substitute for a public portfolio launch. Sites publication and GitHub Pages publication are independent; inspect the returned deployment status for each.

### Any static host

Upload `dist/` as the document root. Keep HTTPS enabled. Add response headers for CSP, `X-Content-Type-Options: nosniff` and `Referrer-Policy: no-referrer` when the host supports them. GitHub Pages does not offer arbitrary custom security headers; this site uses a meta CSP for its supported directives. Add `frame-ancestors 'none'` as an HTTP header on a host that supports it—meta CSP cannot enforce that directive.

## Regenerate demo evidence

From the companion project, run the `demo` CLI to a local report directory. Copy its `evidence.json` into `dist/data/` and its executive brief into `dist/downloads/`. Rebuild the source archive without `.git`, local databases, keys or caches. Run the artifact checker and inspect the nine outcomes before deployment.

## Maintenance

Review dependency/action pins and primary framework references periodically. The browser site is buildless and has no third-party runtime packages. Treat new analytics, embeds, forms or live API integrations as changes to privacy and trust boundaries, requiring explicit design review.
