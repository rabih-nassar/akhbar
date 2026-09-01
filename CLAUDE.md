# Akhbar.FYI — notes for Claude

## Deployment: `index.html` and `dist/index.html` are parallel copies

There is no build step. Cloudflare serves `./dist` (see `wrangler.jsonc`
`assets.directory`), but development edits happen in the root `index.html`.
Any change to one MUST be mirrored to the other, or the change ships to
source control without shipping to production.

When editing `index.html`, after the edit copy it over:

```
cp index.html dist/index.html
```

Then commit both files together.
