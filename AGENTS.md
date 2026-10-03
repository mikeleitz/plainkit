# AGENTS.md: plainkit

This file is the agent brief for this repo. Purpose, architecture,
and hard rules live here. How to call the modules lives in
`README.md`. Assembly truths live in `40k-foot-view.md`. Jobs while
assembling live in `how-do-i.md`. Frames live in
`canonical-layout-patterns.md`.

**public-8 is done.** Do not start another release unless a human
names it. Track: `docs/agents/public-milestones.md`.

What shipped and which recipe to copy: `README.md`, `how-do-i.md`,
`CHANGELOG.md`.

`CHANGELOG.md` is Keep a Changelog 1.1.0. Do not add token counts,
size trailers, or a ledger file to this repo.

## Purpose

Vanilla JS + CSS toolkit for HTML pages served by nginx (or anything
that serves files). Boring multi-page business software: dashboards,
data entry, settings, lists, the occasional live page.

Two cost goals, equal weight:

1. **Apps built with the kit** stay cheap for AI and humans: small
   examples, one way to load data, lego pieces, no SPA stack.
2. **The kit itself** stays cheap to change: same concepts in every
   file, one prefix, one concern per module, docs that only describe
   this repo.

Not a general SPA framework. Not a desktop clone. Not a place to
re-litigate React, Vue, Angular, HTMX, Alpine, npm, or a bundler.

## What it is

```
src/     interceptor, pubsub, provider, live, session, locale, bind, dialog, tabs, time, index
css/     tokens, base, layout, forms, components, live
pages/   403, 404, 500
demo/    recipe list, kitchen sink, session, recipes (no bundler)
```

Copy `src/` and `css/` into a site's static tree. ESM `type="module"`.
No package manager. A CDN URL of those same files is fine.
`node_modules` is not.

`css/base.css` imports layout, forms, and components. Linking
`tokens.css` and `base.css` is enough for the default kit. Live
session pages also link `live.css`.

## Hard architecture

Keep this shape. Do not add a second one.

- **DataProvider** owns HTTP.
- **LiveProvider** owns the socket.
- **Interceptor** is the only `fetch` path (auth headers and other
  cross-cutting concerns).
- **Pub/Sub** is how widgets hear about changes.
- Widgets **subscribe**. They do not call `fetch` or `WebSocket`.
- **SessionProvider** is a DataProvider. Roles are strings on
  `data.roles`. `guard(role)` sends the browser to the 403 page.

Public API is object-oriented: `new DataProvider(...)`,
`new LiveProvider(...)`. Page scripts compose providers. The app owns
JSON schemas. The kit does not.

LiveProvider is a pipe plus snapshot and command. A live room is still
a page, not a reason to add a client router. The timer widget renders
`seconds` from a provider. It does not start its own clock.
`tick: 'seconds'` is the provider's job.

Bind is paint. HTML is structure. No component constructor per widget.
Theme is CSS `--pk-*` and a class on `html`. No JS theme object.

## AI friendly

For app work and for kit work:

- Consistent concepts. Do not invent a second data layer, a JS theme
  object, or a client router "just this once."
- Examples stay simple. Prefer a whole HTML page plus a small script.
- Lego pieces: CSS intent classes, bind helpers, providers. They snap
  together. They are not a component framework with a constructor per
  widget.
- No reliance on external JS projects: no React, Angular, Vue, Svelte,
  Alpine, HTMX, Node, npm, Vite, or Tailwind. No JS that only exists
  as an npm package. Script tags and ESM imports of files in this repo
  (or the same files on a CDN) are the whole story.
- Keep files small. One prefix. No other product's screens as a
  completeness checklist.

## Boring webapps

- Dashboards, forms, lists, settings, simple tables.
- Always multiple pages. Full page loads. No hash router, no
  history API app shell that swaps `<main>`.
- Shared chrome is duplicated markup, a server include (nginx SSI),
  or a later static snippet. It is not client-side routing.
- Looks good on a phone and a desktop. One breakpoint. Intent layout
  (`.pk-split`, `.pk-cover`, `.pk-cluster`), not a utility scale.

## Easy to do

- Override colors, type, glow, and density with `--pk-*` on `:root`.
- Switch palettes with a class on `html` (`pk-theme-light`).
  `html[data-theme="light"]` is a kept alias.
  `html.pk-density-compact` is a bundled density. No `setTheme()` and
  no per-component theme API.
- Layout classes say what a region is for, not how many pixels.
- Session and roles as a **provider**. Hide or disable controls with
  `bindHidden` / `bindDisabled`. Deny a whole page with a 403 page.
- Interceptor attaches credentials. Login is a recipe (cover + form +
  DataProvider), not an auth framework.
- Autofill is WHATWG `autocomplete` tokens on labeled fields. Copy
  `demo/recipes/settings.html`. Sign-in email stays `username`.

Client hide is UX. The server still enforces access. The kit does not
implement OIDC, an identity-provider SDK, or a permission language.

## Error pages

Full page failure is an HTML page, not a JS overlay on a half-drawn
app.

Static kit-styled files the server can return live in `pages/`:

| File       | When                          |
|------------|-------------------------------|
| `403.html` | Authenticated but not allowed |
| `404.html` | Missing page                  |
| `500.html` | Server failure                |

Copy `pages/` into the site. Point stylesheet hrefs at kit CSS and
the home link at the app home. nginx (or the app gateway) returns
those files with the real HTTP status.

If a page loaded and then session data says no access, send the
browser to `403.html` or show the same cover. Do not keep going.

A DataProvider error on a page that cannot render without that data
uses the same idea: banner or cover, not a blank broken layout.

## Localization

English is the default and ships in the page. Other languages are
JSON from the server, loaded with DataProvider, overlaid onto
`[data-pk-i18n]`. Missing keys keep the English in the markup. No
`t()`, no ICU, no auto-detect, no catalog for English. Call
`applyLocale` as in `README.md`. Demo: `demo/locale.html`. Dates:
`formatTime` / `paintTimes`. No `timeAgo`. `dir="rtl"` is CSS later.

## Scope

Fill the constrained space. Do everything boring business software
needs inside these rules. Do not leave obvious gaps (session hide,
error pages, a settings recipe) on the table.

That is a **ceiling**, not a mandate to implement every widget that
could fit. Extra controls and polish come after the boring pages
work. A feature that fits is still not automatic. It waits for a
named pass.

Stick to the initial approach: vanilla JS toolkit for HTML pages.
DataProvider owns HTTP. LiveProvider owns the socket. Theme with CSS
variables. UI never calls `fetch` or `WebSocket`. Not a SPA
framework. No React, Vue, or build step.

Prefer semantic HTML (`button`, `input`, `dialog`, `nav`, `table`).
JS only where behavior is required (dialog, tabs, bindings, providers).

## This is not for

- Single page apps. No client router. No reliance on non-HTML
  navigation.
- High-functioning apps like Google Docs. No replicating complex
  desktop or phone apps. No CRDT, canvas editor, or spreadsheet
  clone.
- Consuming-app protocols. Do not put a site's room JSON, SSO, or
  brand into the kit.

## Always do

- `subscribe()` to a provider. Never `fetch` or `WebSocket` from UI.
- All HTTP through Interceptor.
- Object-oriented public API.
- Files small. One concern per module.
- New work uses `--pk-*` and `.pk-*`.
- Dark-first tokens. Solid `#2563eb` plus white is for real CTAs
  only. Chrome stays quiet.
- `[hidden]` must hide. Do not add `display: flex` rules that skip it.
- Copy: no em dashes, no en dashes, no decorative dash pauses.
- Demo and recipe copy stays generic: account, item, list, settings,
  vote, room, option. No other product's marketing names.
- When a named pass or substantial feature ships, add a Keep a
  Changelog bullet under `## [Unreleased]`. Do not add token counts
  or a ledger file.

## Never do

- React, Vue, Svelte, Alpine, HTMX, Angular.
- Node toolchain, npm, Vite, Tailwind, CSS preprocessor.
- A JS theme object.
- A client-side router. No `pushState` / `popstate`. Same-path
  `replaceState` of the query string is allowed.
- Spreadsheet DataGrid, SSE, or a Users CRUD demo.
- `new DataGrid({ columns })` or any grid constructor.
- `src/table.js`, `src/pager.js`, `src/sheet.js`, `src/drawer.js`,
  `src/menu.js`, `src/graph.js`, `src/popover.js`, `src/hint.js`,
  `src/timeline.js`, `src/steps.js`, `src/autofill.js`, `src/toast.js`,
  `src/dashboard.js`, `src/chart.js`, `src/metric.js`, `src/motion.js`,
  or `src/animate.js`.
- OIDC or an identity-provider SDK in the kit.
- ICU or extracting English out of demos.
- Implement a consuming app's JSON schema.
- Encode QR codes. Display an image the app already has. Same
  for charts: do not draw series in the kit.
- A chart engine, widget `data-src`, or `data-chart-type`.
  DataProvider owns HTTP.
- Toasts, a notification center, or `dash-*` classes.
- `timeAgo` or a TimezoneProvider. Timezone toggle is a recipe.
  Copy `demo/recipes/activity.html`.
- A left drawer or hamburger library.
- An `.ee-*` stylesheet in this repo. Default sheets stay `--pk-*`
  and `.pk-*` only.

## Later work

Work **one named pass**. Do not treat shipped work as a license to
invent a framework. If a human names a pass, do that one.

**public-8 is done.** Do not start another release unless a human
names it.

Recipe lists and copy targets live in `README.md` and `how-do-i.md`.
Do not dump shipped-feature inventory back into this brief.

## Commands

```bash
make help
make check
make preview
make release VERSION=X.Y.Z
```

`make release` writes `VERSION` only. It does not commit, tag, or
push. `file://` can load CSS. ESM needs `make preview`.
