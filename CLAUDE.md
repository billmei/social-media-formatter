# CLAUDE.md

## PR monitoring

Wait for GitHub webhook notifications. Do not schedule hourly (or any recurring)
self check-ins to poll PR state.

After opening or being asked to watch a PR, call `subscribe_pr_activity` and then
end the turn. Events — CI results, reviews, comments, merge-conflict transitions —
arrive on their own and wake the session. Ending the turn *is* how to wait.

Do not use `send_later` to re-check a PR, and do not poll with `sleep` or repeated
status calls. If a webhook is missed, the next real event or a message from the
user will surface it; a quiet PR needs no action.

## Project

React 19 + Vite, styled with Tailwind 4, deployed to GitHub Pages via `gh-pages`.
npm only — `package-lock.json` is the lockfile, and there is no `yarn.lock`.

```sh
npm run dev       # dev server
npm run build     # production build -> build/
npm run preview   # serve the production build
npm test          # vitest, single run
npm run deploy    # predeploy builds, then publishes build/ to gh-pages
```

### Things worth knowing

- **`base` must stay in sync with `homepage`.** The site is served from
  `https://billmei.github.io/social-media-formatter/`, so `vite.config.js` sets
  `base: "/social-media-formatter/"`. Assets 404 on GitHub Pages if this is
  dropped. The dev server also serves under that path, not `/`.
- **`build.outDir` is `build`, not Vite's default `dist`**, so that
  `gh-pages -d build` keeps working.
- **JSX only compiles in `.jsx` files.** Vite does not transform JSX inside
  `.js`. A `.js` file containing JSX fails to build.
- **A green build does not prove the CSS works.** A misconfigured Tailwind exits
  0 while emitting zero utilities — this actually happened during the CRA-era
  Tailwind 4 attempt. After touching the CSS pipeline, check for real utilities:

  ```sh
  grep -c '\.max-w-4xl' build/assets/index-*.css   # expect 1, not 0
  ```
- **Tailwind 4 has no `tailwind.config.js` and no PostCSS config.** It is wired
  through the `@tailwindcss/vite` plugin, and `src/index.css` is just
  `@import "tailwindcss";`. Content detection is automatic.
- **`parse5` is the core of the app's logic** (`ContentProcessor.jsx`). It
  converts pasted HTML into plaintext, renders headings as bold unicode, and
  numbers links as `[n]`. Worth exercising in a browser after upgrading it, not
  just unit-testing.

### History

This was a Create React App project until the migration in
[#2](https://github.com/billmei/social-media-formatter/pull/2). CRA pinned ~35
vulnerable transitive dependencies that could not be upgraded, needed a block of
npm `overrides` to patch what it could, ignored `postcss.config.js` entirely, and
blocked Tailwind 4, parse5 8, and webpack-dev-server 5. Moving to Vite removed
all of it: `npm audit` reports 0 vulnerabilities with no overrides.
