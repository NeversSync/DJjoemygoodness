## Website for DJ Joe My Goodness

Static Next.js site deployed on Netlify.

### Local development

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Production build (writes static files to `out/`):

```bash
npm run build
```

### Netlify

Build settings are in [`netlify.toml`](netlify.toml):

| Setting | Value |
|---------|--------|
| Build command | `npm run build` |
| Publish directory | `out` |
| Node version | `20` |

Confirm the Netlify site dashboard matches those values (they override older Gatsby settings of `gatsby build` → `public`).

The nightly GitHub Action in [`.github/workflows/main.yml`](.github/workflows/main.yml) still triggers a Netlify rebuild via the `NETLIFY_CRON_BUILD_HOOK` secret.
