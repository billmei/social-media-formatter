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

## Project notes

Create React App (`react-scripts` 5.0.1), deployed to GitHub Pages via `gh-pages`.

- **npm only.** `package-lock.json` is the lockfile. There is deliberately no
  `yarn.lock`: transitive security pins live in the `overrides` field of
  `package.json`, and yarn 1 ignores `overrides`, so a `yarn install` would
  silently reinstall vulnerable versions.
- **`postcss.config.js` and the `postcss` key in `package.json` have no effect.**
  CRA hardcodes `config: false` for postcss-loader and ignores both. It enables
  Tailwind only when `tailwind.config.js` exists at the project root, and loads
  the plugin under the bare name `tailwindcss`. Deleting `tailwind.config.js`
  silently disables Tailwind.
- **Tailwind is pinned to 3.x.** v4 moved its PostCSS plugin to
  `@tailwindcss/postcss`, which CRA cannot be pointed at without ejecting.
- **A green build does not mean working CSS.** A misconfigured Tailwind still
  exits 0 while emitting zero utilities. After touching anything in the CSS
  pipeline, check that the built file contains real utilities:

  ```sh
  grep -c '\.max-w-4xl' build/static/css/main.*.css   # expect 1, not 0
  ```
- **`parse5` is held at 7.x.** v8 is ESM-only and CRA's Jest 27 cannot resolve
  its `exports` subpaths.
- **`webpack-dev-server` cannot be upgraded past 4.** v5 removed the
  `onBeforeSetupMiddleware` / `onAfterSetupMiddleware` hooks CRA calls, so
  `npm start` fails against it. Its advisories are dev-server only and are not
  shipped to the deployed site.

Most of the above is downstream of `react-scripts` being unmaintained since 2022.
Migrating to Vite would resolve it and remove nearly all the `overrides`.
