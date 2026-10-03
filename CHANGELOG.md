# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- MIT license (`LICENSE`).

- `make release VERSION=X.Y.Z` writes `VERSION`. No commit, tag, or push.

- Circle hint on a card toolbar. Hover or focus shows a short tip.
  Click opens a new tab. Variants: info, warn, err. Copy
  `demo/recipes/hint.html`. No JS module. hint-2.

- Planned hint: circle info control on card toolbars. Hover shows a
  short tip. Click opens a new tab. hint-1 is the plan. Do not start
  hint-2 unless a human names it. Product track is dashboard.

- Local and UTC clicks show a native popover note for 5 seconds with
  the IANA name and UTC offset. Semi-transparent. Not a toast.

- Optional Times group on an existing sheet. Nav, then actions, then
  Local/UTC. Same `timeZone()` choice. Copy `menu.html`. Do not add a
  sheet just to host it. Activity toolbar stays the recipe.

- Settings shows the same Local/UTC choice as the activity toolbar.
  Same `timeZone()` key. Not account JSON. Activity stays the recipe.

- Local/UTC choice persists in `sessionStorage` across timestamp
  pages. `timeZone()` in `src/time.js`. Same tab, full page loads.

- How-do-i, README, sink catalog, and Makefile check for Local and
  UTC times. Copy `demo/recipes/activity.html`.

- Activity toolbar switches Local and UTC from `<time datetime>`.
  Tiny `formatTime` / `paintTimes` helper. Frozen `when` strings
  dropped. Default Local. Not a TimezoneProvider. Copy
  `demo/recipes/activity.html`.

- Timezone toggle plan. UTC or the locale zone. Toolbar next to
  `<time>` on the activity recipe. Not the sheet menu. No recipe code yet.

- HTML popover recipe. Native `popover` plus `popovertarget` for a
  small overlay next to a control. Not a sheet. Sheet and side nav
  stay. Copy `demo/recipes/popover.html`. No JS module.

- Related records recipe. Shell page with facts, crumbs as a path,
  and grouped neighbor lists as real links. Cycles are links back.
  Copy `demo/recipes/related.html`. Not a graph view.

- How-do-i and canonical chrome for item status and activity.
  Copy `demo/recipes/activity.html`.

- Status stepper. `.pk-steps` on the activity recipe. Facts plus
  steps in one card. Current step is weight and `aria-current`. Wide
  horizontal at `48rem`. Phone vertical. Copy `demo/recipes/activity.html`.

- Activity log. Vertical `.pk-timeline` with `bindList` and `<time>`.
  Copy `demo/recipes/activity.html`. No stepper. No JS module.

- CSS motion. Dialogs fade. Phone sheets slide up and show a grabber.
  `--pk-motion` and `prefers-reduced-motion`. No animation library.
  Copy `demo/recipes/menu.html`.

- Autofill as markup. Settings recipe has given name, family name,
  phone, and an address group with WHATWG `autocomplete` tokens.
  Login and settings use `method="post"`. `bindField` writes back on
  `change` as well as `input`. Filled fields keep kit colors.
  Copy `demo/recipes/settings.html`.

- How-do-i and canonical chrome for the sheet menu. Optional. Not a
  fifth frame. Persistent side nav stays.
- Optional sheet menu. One header button opens a native dialog of
  page links and actions. Bottom sheet on a phone. Compact panel
  when wide. Copy `demo/recipes/menu.html`. Side nav stays.
- Dashboard composition recipe. App frame, metric cards, native
  progress, ranked list, table, filter form, banner, tabs, and
  checks. Copy `demo/recipes/dashboard.html`.
- Pager chrome on the diet table and the filter list. Previous and Next
  always occupy a slot. Disabled and greyed when they do not apply.
  Visible label is a glyph. The word is `title` and `aria-label`. Hide
  the pager only when there are no rows.
- A Keep a Changelog file.

### Changed

- `main` is one commit of the current tree. The repository is public
  at https://github.com/mikeleitz/plainkit.

- Docs now start from copy, preview, and check. The login demo uses a
  second button that does not call an identity provider. Changelog
  bullets no longer carry session-cost trailers.

- Living docs match shipped kit: current release is hint-2, wide
  shell is the live room, class table lists card/hint pieces, forbidden
  JS matches the Makefile.

- Re-centered the kit on the northstar without shrinking the product.
  The sink timer uses LiveProvider `tick`. `[hidden]` hides zone notes.
  `AGENTS.md` is a brief plus pointers. Docs have one job each.
  `make check` is architecture gates.

- Zone note hides after 3.5 seconds and uses a more transparent fill.

- Later work uses `docs/agents/timeline-milestones.md`. `AGENTS.md`
  keeps a pointer. Patterned from the dashboard member-space file.
- `AGENTS.md` later work names Related records after Timeline copy.
  Item page with facts and neighbor lists. Not a graph view. Do not
  implement in this change.
- Split Timeline later work into Activity (M), Stepper (S), and
  Timeline copy (XS). Still not implemented.
- `AGENTS.md` later work names Timeline as activity log plus status
  stepper. CSS and one recipe when a human asks to ship it. Not a
  JS component. Do not implement in this change.
- `AGENTS.md` later work names Sheet as optional chrome after
  Dashboard. Persistent side nav and top nav stay. A sheet is not
  the right nav for every app in this genre.
- `AGENTS.md` later work names Dashboard as the next pass after pager
  chrome, with a recipe map for dashboard pieces.
- Named later-work passes carry a t-shirt size for agent session cost.
- Changelog bullets include both t-shirt size and token count.

### Removed

- The legacy `.ee-*` stylesheet and the internal planning files that
  are not part of the kit.

### Fixed

- Zone note places with JS so Safari can see it. Larger two-line
  name and UTC offset. CSS anchor is not used for this hint.

- Dialog enter motion. Keyframe animation so sheets slide and dialogs
  fade. Closed dialogs are `display: none`, so transitions never ran
  on open.
