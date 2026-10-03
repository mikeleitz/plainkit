# How do I

Jobs you hit while assembling a page. One question, one answer, a
recipe to copy. Not a second manual.

Call the modules from `README.md`. Truths live in `40k-foot-view.md`.
Frames live in `canonical-layout-patterns.md`. Agent rules live in
`AGENTS.md`. Steal a whole page from `demo/recipes/`.

Page CSS is allowed when the kit has no class. Do not add a kit API
for a one-off. Generic copy only: account, item, list, room, related.

## Index

1. [How do I make two or more elements the same size?](#how-do-i-make-two-or-more-elements-the-same-size)
2. [How do I put a QR in a card?](#how-do-i-put-a-qr-in-a-card)
3. [How do I hide a control vs deny the whole page?](#how-do-i-hide-a-control-vs-deny-the-whole-page)
4. [How do I handle load, error, and empty without a blank main?](#how-do-i-handle-load-error-and-empty-without-a-blank-main)
5. [How do I attach a bearer token?](#how-do-i-attach-a-bearer-token)
6. [How do I overlay another language without extracting English?](#how-do-i-overlay-another-language-without-extracting-english)
7. [How do I build a live room that is still a page?](#how-do-i-build-a-live-room-that-is-still-a-page)
8. [How do I search and page a list with full page loads?](#how-do-i-search-and-page-a-list-with-full-page-loads)
9. [How do I bind a table to a DataProvider?](#how-do-i-bind-a-table-to-a-dataprovider)
10. [How do I search a table without leaving the page?](#how-do-i-search-a-table-without-leaving-the-page)
11. [How do I page a table without leaving the page?](#how-do-i-page-a-table-without-leaving-the-page)
12. [How do I select table rows?](#how-do-i-select-table-rows)
13. [How do I add, edit, and delete table rows?](#how-do-i-add-edit-and-delete-table-rows)
14. [How do I add horizontal spacing between elements?](#how-do-i-add-horizontal-spacing-between-elements)
15. [How do I add vertical spacing between elements?](#how-do-i-add-vertical-spacing-between-elements)
16. [How do I build a dashboard?](#how-do-i-build-a-dashboard)
17. [How do I put nav and actions behind one button?](#how-do-i-put-nav-and-actions-behind-one-button)
18. [How do I make the browser autofill a form?](#how-do-i-make-the-browser-autofill-a-form)
19. [How do I show status and activity on an item?](#how-do-i-show-status-and-activity-on-an-item)
20. [How do I show related records on an item?](#how-do-i-show-related-records-on-an-item)
21. [How do I show a small overlay next to a control?](#how-do-i-show-a-small-overlay-next-to-a-control)
22. [How do I show times in UTC or the locale zone?](#how-do-i-show-times-in-utc-or-the-locale-zone)
23. [How do I put an info button on a card?](#how-do-i-put-an-info-button-on-a-card)

## How do I make two or more elements the same size?

Matching is a parent job. Do not size `.pk-card`. Do not reuse
`.pk-selectable-grid` (that is live choices in `live.css`).

Two images that are already squares: two `.pk-qr` in a `.pk-cluster`.

A QR plus a card (image or text): cluster, then a **page** class that
copies `--pk-qr-size`. Use `height`, not `min-height`, so the twin
cannot grow.

```html
<div class="pk-cluster">
  <div class="pk-qr">
    <img src="/invite.png" width="160" height="160" alt="Invite QR">
  </div>
  <section class="pk-card my-twin">
    <p class="pk-muted">Scan to join this room.</p>
  </section>
</div>
```

```css
/* page stylesheet, not the kit */
.my-twin {
  box-sizing: border-box;
  width: var(--pk-qr-size);
  height: var(--pk-qr-size);
  padding: 0.65rem;
}
```

`.pk-split` is the wrong intent. It is main plus aside, unequal
columns, and it never splits inside a 28rem shell.

Copy `demo/recipes/invite.html` for the QR.

## How do I put a QR in a card?

Server PNG or SVG. The kit frames it. It does not encode.

```html
<section class="pk-card pk-stack">
  <h2 class="pk-card-title">Join link</h2>
  <div class="pk-qr">
    <img id="invite-qr" src="/invite.png" width="160" height="160" alt="Invite QR">
  </div>
  <p class="pk-pre" id="invite-url"></p>
</section>
```

```js
bindAttr('#invite-qr', invite, 'src', (e) => e.data && e.data.qr);
```

Size is `--pk-qr-size` (10rem default). Override on `:root` or a page
class. `.pk-mark` is the tiny header tile. Do not use it here.

Copy `demo/recipes/invite.html`.

## How do I hide a control vs deny the whole page?

Client hide is UX. The server still enforces access.

Mixed page: `bindHidden` / `bindDisabled` with `lacksRole`.

```js
bindHidden('#admin-save', session, lacksRole('admin'));
bindDisabled('#export', session, lacksRole('admin'));
session.load();
```

Whole page requires the role: `guard`, then `load`. On fail or missing
role, `location.replace` the 403 page. Do not keep rendering.

```js
session.guard('admin');
session.load();
```

HTTP 401 and 403 from the API are a page choice via `redirectOnStatus`.
Opt in on that page.

Copy `demo/session.html` and `demo/recipes/denied.html`. Static deny
page: `pages/403.html`.

## How do I handle load, error, and empty without a blank main?

A page that cannot render without its data is a cover until ready.
Three siblings. `[hidden]` swaps them.

| Sibling          | Visible when            |
|------------------|-------------------------|
| `#cover-loading` | `status` is loading     |
| `#cover-error`   | `status === 'error'`    |
| `#ready`         | `status === 'ready'`    |

Keep `pk-cover` on the body until ready so load and error stay
centered. Bind text from `e.error`.

A collection that loaded and has no rows is not an error. Two
sections, exactly one visible: `.pk-card.pk-empty` and the list card.

Copy `demo/recipes/status.html` for load and error. Copy
`demo/recipes/items.html` for empty vs list.

## How do I attach a bearer token?

Interceptor is the only HTTP seam. Widgets still do not call `fetch`.

```js
import { defaultInterceptor } from './kit/interceptor.js';

defaultInterceptor.use('request', ({ url, opts }) => {
  const token = sessionStorage.getItem('token');
  if (token) opts.headers.set('Authorization', 'Bearer ' + token);
  return { url, opts };
});
```

401 to login, 403 to the deny page:

```js
defaultInterceptor.use('error', redirectOnStatus({
  401: '/login.html',
  403: '/403.html',
}));
```

Do not attach `redirectOnStatus` on every interceptor by default. The
page opts in. Live sockets use `access_token` on the URL or
`authMessage` as the first JSON, not this hook.

Copy `demo/recipes/denied.html` and `demo/recipes/login.html`.

## How do I overlay another language without extracting English?

English stays in the HTML. First paint does not wait on a catalog.
Other languages are one JSON map from the server, loaded with
DataProvider.

```html
<button type="button" data-pk-i18n="save">Save</button>
```

```js
const locale = new DataProvider({ name: 'locale', url: '/locales/de.json' });
locale.subscribe((e) => {
  if (e.data) applyLocale(document.body, e.data, { lang: 'de' });
});
locale.load();
```

Missing keys keep the English in the markup. No `t()`, no ICU, no
auto-detect. The kit does not wrap `Intl`.

Copy `demo/locale.html`.

## How do I build a live room that is still a page?

Wide shell plus `.pk-split`. Main column is work. Aside is the roster.
Link `live.css`. `LiveProvider` owns the socket. Widgets `subscribe`
and `send`. They do not construct `WebSocket`.

```js
const room = new LiveProvider({
  name: 'room',
  url: 'wss://example.test/rooms/1',
  token: () => sessionStorage.getItem('token'),
  tick: 'seconds',
});
room.connect();
room.send({ type: 'vote', optionId: 'a1' });
```

A message with `data` replaces the payload. No merge. `send` while
not open is dropped (`meta.source` `send-dropped`). There is no
outbox. The timer widget renders `seconds`. It does not start its own
clock.

Copy `demo/recipes/room.html`. The kitchen sink only proves the
widgets exist.

## How do I search and page a list with full page loads?

Shell page. Search is a GET form. `load({ q })` appends query params.
Pager is an `ol` of real `?page=2` links. No JS pager. Prev and Next
always occupy a slot. Disable when they do not apply. The visible
label is a glyph. The word is `title` and `aria-label`. Hide the
pager only when there are no rows.

Empty and list swap with `[hidden]`. `bindList` paints rows from a
`<template>`. Small lists only. Focus in a row does not survive.

Copy `demo/recipes/list.html`. Crumbs plus toolbar plus pager also
show up on `demo/recipes/items.html`.

## How do I bind a table to a DataProvider?

App frame. HTML owns `caption`, `thead`, `tfoot`, and the column
list. `bindList` paints `tbody` from a `<template>` of `<tr>`. Name
cells are `<th scope="row">`. Column headers use `scope="col"`.

The recipe envelope `{ q, page, pages, total, items }` lives in the
page script. The kit does not own that shape. Search is a GET form
in the toolbar. Pager is an `ol` of real `?page=2` links. Prev and
Next always occupy a slot. Empty vs table swap with `[hidden]`.
Hide the pager only when there are no rows.

Do not generate columns in JS. Do not add a grid constructor.

Copy `demo/recipes/table.html`. The static table stays
`demo/recipes/accounts.html`. The filter list stays
`demo/recipes/list.html`.

## How do I search a table without leaving the page?

Keep the GET form. The page script `preventDefault`s submit, sets
`query = { q, page: 1 }`, `history.replaceState`s that query string
on the same path, and calls `items.load(query)`. Refresh calls
`load` with the last query. Do not debounce as the user types.

The list recipe stays full page GET. Without JS, the form still
submits. HTML stays honest.

Copy `demo/recipes/table.html`.

## How do I page a table without leaving the page?

Keep enabled pager steps as `<a href="?page=2">`. Click
`preventDefault`s (plain left click only), reads `q` and `page`
from the href, `replaceState`s, and `load`s. Modifier clicks still
open the href. `aria-busy` on the table while loading.
`aria-disabled` on the pager so links do not take a second click.
Do not blank rows. Do not `pushState`.

Prev and Next always occupy a slot so the row does not jump.
Disable and grey the control when it does not apply (`disabled` on
a `<button>`, or `aria-disabled="true"` on an `<a>`). Visible
prev/next is a glyph. The word is `title` and `aria-label`. Page
numbers stay digits. Hide the pager only when there are no rows.

Without JS, the hrefs still navigate. Disabled prev/next do not
navigate. No JS pager widget. The list recipe stays full page
links.

Copy `demo/recipes/table.html`.

## How do I select table rows?

Checkbox column. Select-all means this page. A page-script `Set` of
ids. `bindList` `apply` sets `checked` from the Set after it replaces
`tbody` children. `load` clears the Set. Highlight is CSS
`tr:has(input:checked)`.

Edit is enabled when exactly one row is selected. Delete when one or
more. Selection does not span pages.

Copy `demo/recipes/table.html`.

## How do I add, edit, and delete table rows?

Native `<dialog>`. New and Edit write the catalog (or POST/PUT in an
app), then `load(query)` again. Delete confirms, then `load(query)`.
Do not use collection `create()` as the live snapshot. A paged
envelope is an object. The table is a view of a query.

Copy `demo/recipes/table.html`. The list plus dialogs recipe stays
`demo/recipes/items.html`.

## How do I add horizontal spacing between elements?

Put them in a row intent. The gap is already `--pk-space`.

| Class             | Intent                         |
|-------------------|--------------------------------|
| `.pk-cluster`     | Horizontal wrap, aligned       |
| `.pk-toolbar`     | Title left, actions right      |
| `.pk-btn-row`     | Action row under live or form  |
| `.pk-form-actions`| Submit plus extra buttons      |

```html
<div class="pk-cluster">
  <button type="button" class="pk-btn">Cancel</button>
  <button type="button" class="pk-btn pk-btn-cta">Save</button>
</div>
```

Tighten every gap on the page with `html.pk-density-compact`, or set
`--pk-space` on `:root`. Do not add `.pk-gap-2` or `margin-left` on
each child. There is no spacing scale.

`.pk-split` is two columns when wide, not a button row.

## How do I add vertical spacing between elements?

Wrap them in `.pk-stack`. That is a column with `gap: var(--pk-space)`.

```html
<div class="pk-stack">
  <section class="pk-card">…</section>
  <section class="pk-card">…</section>
</div>
```

A `.pk-shell` does not gap its children. Two cards as direct shell
siblings sit flush. Nested stacks are fine: a card that is also
`.pk-stack` spaces its fields.

Region gaps are larger on purpose (`.pk-split`, `.pk-app-body`). Leave
those alone. Change density with `--pk-space` or
`html.pk-density-compact`, not a per-card margin class.

`[hidden]` still wins over the stack's `display: flex`.

## How do I build a dashboard?

App frame. One page, one script. Metric cards are `.pk-card.pk-stat`
with a number, a trend, and optional native `<progress>`. Ranked
accounts are `<ol class="pk-list">`. Charts are progress rows or a
table. Not a chart engine. Filter is a GET form. Tabs are in-page
panels. Bind with a DataProvider. `replaceState` of the filter query
is allowed. `pushState` is not. `role="alert"` only on a hard error
banner.

Copy `demo/recipes/dashboard.html`. Piece recipes stay for pages that
are only a table, only a list, or only settings. The kitchen sink is
a catalog, not the dashboard recipe.

## How do I put nav and actions behind one button?

Optional chrome. Not a replacement for `.pk-side` or header
`.pk-nav`. Persistent nav is still right when people switch pages
all day.

One header button opens `<dialog class="pk-dialog pk-sheet">`.
`openDialog` / `closeDialog`. Pages are real `<a href>`. Actions
are `<button>`. Group nav first, then actions. Reuse `.pk-list-row`.
An optional Times group after actions uses the same `timeZone()`
choice.
Below `48rem` the dialog docks to the bottom. Phone sheets slide
up and show a grabber. When wide it stays a compact panel and
fades like other dialogs. `prefers-reduced-motion` skips that.
Backdrop tap may close this sheet in the page script. Do not make
every form dialog dismiss on backdrop. There is no swipe-to-dismiss.

Copy `demo/recipes/menu.html`. The kitchen sink is a catalog, not
the menu recipe.

## How do I make the browser autofill a form?

Autofill is markup. There is no kit helper and no `src/autofill.js`.
Use a real `<form>`, wrap each control in `<label class="pk-field">`,
set `type`, and put a WHATWG `autocomplete` token on the control.
`name` can match the token. Search boxes that should not fill use
`autocomplete="off"`.

Sign-in (password manager):

```html
<form id="login-form" class="pk-card pk-stack" method="post">
  <label class="pk-field">
    <span class="pk-field-label">Email</span>
    <input class="pk-input" name="email" type="email" autocomplete="username">
  </label>
  <label class="pk-field">
    <span class="pk-field-label">Password</span>
    <input class="pk-input" name="password" type="password" autocomplete="current-password">
  </label>
</form>
```

On sign-in, email uses `autocomplete="username"` so the password
manager treats it as the account key. Do not change that to `email`
on a login form. Use `method="post"` so a missing script does not
put the password on the query string.

Profile and address. `name` matches the token:

```html
<label class="pk-field">
  <span class="pk-field-label">First name</span>
  <input class="pk-input" name="given-name" type="text" autocomplete="given-name">
</label>
```

| Field         | `autocomplete`     | `type` / notes                         |
|---------------|--------------------|----------------------------------------|
| Display name  | `nickname`         | `text`                                 |
| First name    | `given-name`       | `text`                                 |
| Last name     | `family-name`      | `text`                                 |
| Email         | `email`            | `email` (not on a login form)          |
| Phone         | `tel`              | `tel`, `inputmode="tel"`               |
| Street        | `street-address`   | `text`                                 |
| City          | `address-level2`   | `text`                                 |
| Region        | `address-level1`   | `text`                                 |
| Postal code   | `postal-code`      | `text` (letters are allowed)           |
| Country       | `country`          | `<select>` of ISO 3166-1 alpha-2 codes |

Group the address fields in a `<fieldset>`. Bind with `bindField`.
Hyphenated names use `form.elements['given-name']`. Do not use
`form.name` for a control named `name`. That is the form's own name.
`bindField` writes back on `input` and `change` so Autofill reaches
the provider before submit.

Copy `demo/recipes/settings.html` for a profile. Copy
`demo/recipes/login.html` for sign-in. The kitchen sink catalogs
`tel`, `url`, `time`, and radio. Do not paste the sink.

## How do I show status and activity on an item?

Shell frame. Two cards in a `.pk-stack`. Facts and
`<ol class="pk-steps">` in the first. English labels stay in the
HTML. Page script marks `pk-steps-done` / `pk-steps-now` and
`aria-current="step"` from `data.status`. Upcoming is the default.
Current step is weight plus `aria-current`, not a CTA pill. Wide
stepper is a row at `48rem`. Phone stepper is a column.

The second card is the log. `bindList` paints
`<ol class="pk-timeline">` from a `<template>` of `<li>` with
`<time>`, title, and meta. App owns JSON order. The kit does not
sort. Empty and log swap with `[hidden]`. The log toolbar switches
Local and UTC. See How do I show times in UTC or the locale zone.
No pager on this recipe.
Copy `list.html` later if an app pages events. No `src/timeline.js`
or `src/steps.js`.

```html
<div class="pk-stack">
  <section class="pk-card pk-stack">
    <h2 class="pk-card-title">Item</h2>
    <dl class="pk-dl">…</dl>
    <ol class="pk-steps" aria-label="Status">
      <li data-step="created">Created</li>
      <li data-step="review">Review</li>
    </ol>
  </section>
  <section class="pk-card pk-empty" id="empty">…</section>
  <section class="pk-card" id="log-card" hidden>
    <div class="pk-toolbar">
      <h2 class="pk-card-title">Activity</h2>
      <div class="pk-cluster" role="group" aria-label="Time zone">
        <button type="button" class="pk-btn" id="zone-local" aria-pressed="true">Local</button>
        <button type="button" class="pk-btn" id="zone-utc" aria-pressed="false">UTC</button>
      </div>
    </div>
    <ol class="pk-timeline" id="activity"></ol>
  </section>
</div>
```

Copy `demo/recipes/activity.html`. The kitchen sink is a catalog,
not the activity recipe. Leave `status.html` as load cover, error
cover, ready.

## How do I show related records on an item?

Shell frame. Facts in `.pk-dl`. Each relationship type is its own
card with a `.pk-list` of real `<a href>`. Full page loads. The
path is crumbs. Cycles are links back to this item. App owns the
JSON. `DataProvider` loads it. English stays in the HTML. Generic
copy: item, account, related.

`bindList` paints each group from a `<template>` of
`<a class="pk-list-row">`. `[hidden]` swaps empty vs groups. No
pager on this recipe. No `src/graph.js`. Not a drawing. Stack the
activity log from `activity.html` if this page also needs a log.

```html
<div class="pk-stack">
  <section class="pk-card pk-stack">
    <h2 class="pk-card-title">Item</h2>
    <dl class="pk-dl">…</dl>
  </section>
  <section class="pk-card pk-empty" id="empty" hidden>…</section>
  <section class="pk-card" id="items-card">
    <div class="pk-toolbar">
      <h2 class="pk-card-title">Related items</h2>
    </div>
    <nav class="pk-list" aria-label="Related items">
      <a class="pk-list-row" href="./related.html?id=gadget">
        <span class="pk-list-title">Gadget</span>
      </a>
    </nav>
  </section>
</div>
```

Copy `demo/recipes/related.html`. The kitchen sink is a catalog,
not the related recipe. Leave `activity.html` as status and log.

## How do I show a small overlay next to a control?

Native HTML `popover`. A button with `popovertarget` toggles it.
Light dismiss: click outside or Escape. No `src/popover.js`. No
`openDialog`. This is not a sheet and not a form dialog.

Put a few item actions or a short hint in the overlay. Do not put
the app nav in it. Persistent `.pk-side` or header `.pk-nav` stay
for pages people switch all day. A `.pk-sheet` is still the sparse
page menu.

```html
<button type="button" class="pk-btn" id="open-more" popovertarget="item-more">More</button>

<div id="item-more" class="pk-popover" popover="auto" anchor="open-more" aria-label="More">
  <div class="pk-list">
    <a class="pk-list-row" href="./activity.html">
      <span class="pk-list-title">Activity</span>
    </a>
    <button type="button" class="pk-list-row" popovertarget="item-more" popovertargetaction="hide">
      <span class="pk-list-title">Copy link</span>
    </button>
  </div>
</div>
```

Copy `demo/recipes/popover.html`. The kitchen sink is a catalog,
not the popover recipe. Leave `menu.html` as the sheet.

## How do I put an info button on a card?

A circle `<a>` in the card toolbar. Hover or keyboard focus shows a
short tip in the page. Click opens the long page in a new tab. On a
phone, tap opens the tab. No `src/hint.js`. No `popovertarget` on
the same control. Not `.pk-btn-icon`. Not CTA blue fill.

Variants: `.pk-hint` (info), `.pk-hint-warn`, `.pk-hint-err`. Put
the wrap in `.pk-toolbar` next to `.pk-card-title`. A lone hint
after a label is allowed when there is no title.

```html
<div class="pk-toolbar">
  <h2 class="pk-card-title">Status</h2>
  <span class="pk-hint-wrap">
    <a
      class="pk-hint"
      href="./hint-help.html"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="About this status"
      aria-describedby="status-hint-tip"
    ><span aria-hidden="true">i</span></a>
    <span id="status-hint-tip" class="pk-hint-tip" role="tooltip">
      Status is a short fact. Open the guide for the long version.
    </span>
  </span>
</div>
```

`aria-label` names the action. The tip is the accessible description.
Copy `demo/recipes/hint.html`. The click-through page in that demo is
`hint-help.html`. The kitchen sink is a catalog, not the hint recipe.
Leave `popover.html` as the click overlay.

## How do I show times in UTC or the locale zone?

ISO-8601 lives in `<time datetime>`. Visible text is painted.
`formatTime(iso, zone)` and `paintTimes(root, zone)` use
`Intl.DateTimeFormat`. zone is `local` or `utc`. Default Local.
`timeZone()` reads and writes `sessionStorage` key `pk-time-zone`
so the choice survives a full page load to another timestamp page.
The toggle sits in the card toolbar next to the timestamps. Copy
`activity.html` for that. A page that already has a sheet may add
a Times group after actions. Copy `menu.html` for that. Do not add
a sheet just to host the toggle. Clicking Local or UTC opens a
native popover note for about 3 seconds with the zone name and UTC
offset. Page script places it, so Safari can see it. Not a toast.
Not a `TimezoneProvider`. No `timeAgo`. No IANA picker.
HTML without JS may keep a UTC string.

```js
import { formatTime, paintTimes, timeZone, noteZone } from '../../src/time.js';

const zone = timeZone();
time.setAttribute('datetime', event.at || '');
time.textContent = formatTime(event.at, zone) || event.at;
paintTimes('#activity', zone);
noteZone('#zone-note', zone);
```

Copy `demo/recipes/activity.html`. Settings may show the same
`timeZone()` choice. That is a copy. The activity toolbar stays the
recipe. The kitchen sink is a catalog, not the times recipe.
