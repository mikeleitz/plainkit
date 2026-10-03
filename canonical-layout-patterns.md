# Canonical layout patterns

There are four page frames. Everything else is chrome or an inner region you drop into one of those frames. Copy a recipe. Do not invent a fifth frame.

How to call modules: `README.md`. Jobs while assembling: `how-do-i.md`. Assembly truths: `40k-foot-view.md`. Agent rules: `AGENTS.md`.

## The four frames

Pick one. The body class plus the outer wrapper *is* the page.

| Frame        | Body + wrapper                                | Width                     | When                                               | Copy                                       |
|--------------|-----------------------------------------------|---------------------------|----------------------------------------------------|--------------------------------------------|
| Cover        | `body.pk-page.pk-cover` + `main.pk-shell`     | `--pk-page-max` (28rem)   | Short centered job. Login, deny, 403/404/500, load | `login.html`, `pages/403.html`             |
| Shell        | `body.pk-page` + `div.pk-shell`               | `--pk-page-max`           | Default working page. Form, list, settings         | `items.html`, `settings.html`              |
| Wide shell   | `body.pk-page` + `div.pk-shell.pk-shell-wide` | `--pk-page-wide` (56rem)  | Live room. Not session or dashboard                | `room.html`                                |
| App          | `body.pk-page` + `div.pk-app`                 | `--pk-page-wide`          | Header plus optional side nav plus main            | `accounts.html`, `table.html`              |

Cover centers a short block. If the block is taller than the viewport, it scrolls from the top. Nested cover already fills the viewport, so `body.pk-page:has(> .pk-cover)` drops body padding.

App is header plus `.pk-app-body`. Put `.pk-side` in the body for a nav. Omit it, or `[hidden]` it, and main is full width. Same one breakpoint as `.pk-split` (`48rem`).

**Rule:** one frame per URL. Do not nest app inside cover, or shell inside app.

## Chrome that is not a router

Non-cover pages repeat this markup. Duplicate it. SSI it. Do not swap it in JS.

```html
<header class="pk-header">
  <div class="pk-header-start">
    <div class="pk-mark" aria-hidden="true">pk</div>
    <div>
      <p class="pk-sub">Account</p>
      <h1>Items</h1>
    </div>
  </div>
  <nav class="pk-nav" aria-label="App">
    <a href="./items.html">Items</a>
    <a href="./settings.html">Settings</a>
  </nav>
</header>

<nav aria-label="Breadcrumb">
  <ol class="pk-crumb">
    <li><a href="./">Home</a></li>
    <li><span aria-current="page">Items</span></li>
  </ol>
</nav>
```

| Piece           | Class         | Job                                             |
|-----------------|---------------|-------------------------------------------------|
| Header row      | `.pk-header`  | Mark, title, actions                            |
| Top nav         | `.pk-nav`     | Real links. `aria-current="page"` on here       |
| Breadcrumb      | `.pk-crumb`   | `ol` of links. No JS. Full page loads           |
| Side nav        | `.pk-side`    | Only inside `.pk-app-body`                      |
| Sheet menu      | `.pk-sheet`   | Header button. Dialog of links and actions      |
| Title + actions | `.pk-toolbar` | Inside a card, above a list or table            |
| Card hint       | `.pk-hint`    | Circle in the toolbar. Hover tip. Opens a tab   |
| Pager           | `.pk-pager`   | `ol` of page links. Prev/next always in the row |

`.pk-hint` sits in `.pk-toolbar` next to the title. Hover or focus
shows a short tip. Click opens a new tab. Not a popover. Recipe:
`hint.html`.

Pick one nav chrome per page. Persistent `.pk-side` or header
`.pk-nav` when people switch pages all day. A `.pk-sheet` when the
menu is sparse, especially on a phone. Not a fifth frame. Recipe:
`menu.html`.

Cover pages usually skip crumbs and top nav. Error pages skip the header too: one banner card and a home link.

## Inner regions (what you put in the frame)

These are the canonical *screens*. They live inside shell, wide shell, or app main. Mix them as stacked cards. Do not turn them into components.

### 1. Stack of cards (settings, invite)

Default interior. Vertical `.pk-stack` of `.pk-card`s.

```html
<section class="pk-card pk-stack">
  <h2 class="pk-card-title">Profile</h2>
  <form id="settings-form" class="pk-stack">…</form>
</section>

<section class="pk-card pk-stack">
  <h2 class="pk-card-title">Plan</h2>
  <dl class="pk-dl">…</dl>
</section>
```

Use when the page is a form, a read-only fact sheet, or a QR plus URL. Recipe: `settings.html`, `invite.html`.

### 2. Empty or list (items)

Two sections. Exactly one visible. `[hidden]` swaps them. Toolbar holds the primary action when the list exists. Empty holds the same action when it does not.

```html
<section class="pk-card pk-empty" id="empty">…</section>
<section class="pk-card" id="list-card" hidden>
  <div class="pk-toolbar">
    <h2 class="pk-card-title">Items</h2>
    <button type="button" class="pk-btn pk-btn-cta">New item</button>
  </div>
  <div class="pk-list" id="item-list"></div>
</section>
```

`bindHidden` on both. `bindList` paints rows from a `<template>`. Recipe: `items.html`.

### 3. Filter list (search + pager)

Shell page. Search is a GET form (full page load, `load({ q })` in the script). Empty and list swap with `[hidden]`. The pager stays when there are rows, even on one page. Prev and Next always occupy a slot.

```html
<section class="pk-card pk-stack"><form method="get" class="pk-stack">…</form></section>
<section class="pk-card pk-empty" id="empty" hidden>…</section>
<section class="pk-card" id="list-card" hidden>
  <div class="pk-toolbar">…</div>
  <div class="pk-list" id="item-list"></div>
  <nav aria-label="Pages"><ol class="pk-pager" id="pager" hidden></ol></nav>
</section>
```

Pager links are real URLs. Disabled prev/next stay in the row. Recipe: `list.html`.

### 4. Form card

A card that *is* the form, or a card that contains a form.

```html
<form id="login-form" class="pk-card pk-stack">
  <label class="pk-field">…</label>
  <div class="pk-form-actions">
    <button type="submit" class="pk-btn pk-btn-cta">Sign in</button>
  </div>
</form>
```

Cover + form card = login. Shell + form card = settings. Field errors stay in `.pk-field-error`. Put WHATWG `autocomplete` tokens on fields the browser should fill. Recipe: `login.html`, `settings.html`.

### 5. Read-only facts

`.pk-dl` for a plan, a status, a seat count. Not a table. Not a form. Recipe: settings plan block.

### 6. Simple table

Semantic `<table class="pk-table">` in a card. `.pk-num` right-aligns. Not a DataGrid. Lives naturally in app main. Recipe: `accounts.html`.

### 7. Bound table

App frame. HTML owns `caption`, `thead`, and `tfoot`. `bindList` paints `tbody` from a `<template>` of `<tr>`. `scope="col"` on column headers. `scope="row"` on the name cell. Empty vs table via `[hidden]`.

Search is a GET form in the toolbar. Submit `preventDefault`s, `replaceState`s `?q=`, and `load({ q, page: 1 })`. Refresh reloads the last query. Pager is `?page=2` links. Prev and Next always occupy a slot. Click `preventDefault`s, `replaceState`s, and `load`s. `aria-busy` on the table while loading. Checkbox column. Select-all is this page. A page-script `Set` of ids clears on `load`. New / Edit / Delete are native `<dialog>`s. After a write, `load(query)` again. Do not use collection `create()` as the snapshot. The `{ q, page, pages, total, items }` envelope lives in the recipe. Not a grid constructor.

Recipe: `table.html`.

### 8. Split: work + aside (live room)

Wide shell (or the split region of the kitchen sink). Primary column is `.pk-main`. Roster or help is `.pk-aside`. Stacks on a phone.

```html
<section class="pk-split">
  <div class="pk-main pk-stack">…</div>
  <aside class="pk-aside">
    <section class="pk-card">
      <h2 class="pk-card-title">People</h2>
      <div class="pk-roster" id="roster"></div>
    </section>
  </aside>
</section>
```

This is the live-page pattern. Link `live.css`. Recipe: `room.html`.

### 9. App with side nav (accounts)

The table (or list, or settings stack) sits in `.pk-main`. Section links sit in `.pk-side`. They are still full page loads.

```html
<div class="pk-app">
  <header class="pk-header">…</header>
  <div class="pk-app-body">
    <nav class="pk-side" aria-label="Account">
      <div class="pk-nav">
        <a href="./items.html">Items</a>
        <a href="./accounts.html" aria-current="page">Accounts</a>
      </div>
    </nav>
    <main class="pk-main pk-stack">…</main>
  </div>
</div>
```

Recipe: `accounts.html`.

### 10. Dashboard (stats plus table plus ranked list)

App frame. Interior, not a fifth frame. Main stacks a banner, a GET
filter form, a `.pk-cluster` of `.pk-stat` cards, then in-page tabs.
Overview is a ranked `<ol class="pk-list">` plus native `<progress>`
rows. Accounts is a `.pk-table`. Bind with a DataProvider.
`replaceState` of the filter query is allowed. `pushState` is not.
Not a constructor. Not a chart engine.

Recipe: `dashboard.html`.

### 11. Item status and activity

Shell frame. A `.pk-stack` of cards. First card is facts (`.pk-dl`)
plus `<ol class="pk-steps">`. English labels in the HTML. Script
marks the current step from `data.status`. Wide row at `48rem`.
Phone column. Second card is `<ol class="pk-timeline">` or empty.
`bindList` paints events. `[hidden]` swaps empty and log. The log
toolbar switches Local and UTC. `paintTimes` reads
`<time datetime>`. `timeZone()` keeps the choice in
`sessionStorage`. A page that already has a sheet may add a Times
group. Do not add a sheet to host it. No `src/timeline.js`. No
pager on this recipe.

Recipe: `activity.html`.

### 12. Related records

Shell frame. A `.pk-stack` of cards. First card is facts (`.pk-dl`).
Each relationship type is a `.pk-list` of real `<a href>` to other
item pages. Full page loads. The path is crumbs. Cycles are links
back. Empty vs groups swap with `[hidden]`. App owns the JSON.
English in the HTML. Not a graph view. No `src/graph.js`. Optional
activity because that recipe shipped.

Recipe: `related.html`.

## Four overlays that are not frames

They sit *beside* the frame, not inside a new layout system.

### Banner

A card above the work. Hidden until the provider says so.

```html
<div class="pk-card pk-banner pk-banner-err" id="banner-err" hidden>…</div>
```

Modifiers: `pk-banner-ok`, `pk-banner-err`, `pk-banner-warn`, `pk-banner-info`. Login, save-ok, send-dropped.

### Dialog

Native `<dialog class="pk-dialog">`. Lives at the end of `body`, outside the shell. `openDialog` / `closeDialog`. Create and confirm-delete are this. Recipe: `items.html`.

Optional menu chrome: add `pk-sheet` on that dialog. One header button. Pages are `<a href>`. Actions are `<button>`. Group nav first, then actions. An optional Times group after actions uses the same `timeZone()` choice. Do not add a sheet to host it. Bottom dock below `48rem` with a grabber and a slide. Compact panel when wide. `prefers-reduced-motion` skips the motion. Not a left drawer. Persistent `.pk-side` stays valid. Recipe: `menu.html`.

### Popover

Native `[popover]` plus `popovertarget`. Small overlay next to a control. Light dismiss. Fade. No dim backdrop. Not a sheet. Not a form dialog. Sheet and `.pk-side` stay. No `src/popover.js`. Recipe: `popover.html`.

### Load cover

The page *is* a cover until the provider is ready. Three siblings, `[hidden]` plus a body class toggle:

| Sibling          | Visible when            |
|------------------|-------------------------|
| `#cover-loading` | `status` is loading     |
| `#cover-error`   | `status === 'error'`    |
| `#ready`         | `status === 'ready'`    |

`#ready` is a normal shell (header, crumbs, card). The body keeps `pk-cover` until ready so the load and error states stay centered. Recipe: `status.html`.

A page that cannot render without its data uses this. A mixed page (session hide on one button) does not.

## Flow classes (glue, not pages)

Use these *inside* a frame. They are not a utility scale.

| Class         | Intent                                      |
|---------------|---------------------------------------------|
| `.pk-stack`   | Vertical flow, one gap                      |
| `.pk-cluster` | Horizontal wrap, aligned                    |
| `.pk-split`   | Two columns when wide, stack when narrow    |
| `.pk-toolbar` | Title left, actions right                   |
| `.pk-btn-row` | Action row under live or form work          |

`[hidden]` always wins over their `display: flex`. That is how empty/list, side nav, banners, and covers actually work.

## Decision tree

1. **Is the whole page a failure or a gate?** Cover. 403/404/500, login, denied, load-until-ready.
2. **Does it need a persistent side nav?** App frame.
3. **Does it need a main column plus a roster or help column?** Wide shell + `.pk-split`.
4. **Otherwise?** Shell. Forms, lists, settings, invite, crumbs, pager.

Then fill the interior:

| The page is mostly…          | Interior                            |
|------------------------------|-------------------------------------|
| Fields the user edits        | Form card plus autocomplete tokens  |
| A collection                 | Empty or list (+ dialogs)           |
| A searchable collection      | Filter list                         |
| Numbers in rows              | Table                               |
| A paged collection of rows   | Bound table                         |
| Facts you do not edit        | `.pk-dl`                            |
| A live room                  | Split + roster                      |
| A code or URL to copy        | Card + `.pk-qr` / `.pk-pre`         |
| A whole dashboard            | Stats, progress, table, ranked `ol` |
| An item with a process       | Facts, steps, activity log          |
| Related records              | Facts plus grouped neighbor lists   |

One HTML file. Duplicate the header. Steal the closest recipe from `demo/`. The kitchen sink is a catalog, not a layout.
