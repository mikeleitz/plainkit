# plainkit

Vanilla JS toolkit for HTML pages served by nginx (or anything that
serves files). Boring multi-page business software: dashboards, data
entry, settings, lists, the occasional live page.

DataProvider owns HTTP. LiveProvider owns the socket. Theme with CSS
variables. UI never calls `fetch` or `WebSocket`. Interceptor wraps
every HTTP call. Pub/Sub is how widgets hear about changes.

Not a general SPA framework. No React, Vue, or build step. Apps are
multiple HTML pages with full page loads.

The kit is meant to be cheap for AI and humans to **use**, and cheap
for AI and humans to **change**. Same concepts in every file. Small
modules. One prefix.

## Start

Copy `src/` and `css/` into the site's static tree. Link the two
stylesheets and a page script:

```html
<link rel="stylesheet" href="./kit/css/tokens.css">
<link rel="stylesheet" href="./kit/css/base.css">
<script type="module" src="./page.js"></script>
```

```bash
make help
make check
make preview
```

Preview is `http://localhost:8091/demo/`. ESM modules need that
server. `file://` can load the CSS.

License: MIT (`LICENSE`).

Agent rules: `AGENTS.md`. Assembly truths: `40k-foot-view.md`.
Jobs while assembling a page: `how-do-i.md`. Frames:
`canonical-layout-patterns.md`. Bound table recipe:
`demo/recipes/table.html`. The filter list stays full page loads.
Notable changes: `CHANGELOG.md`.

`make release VERSION=X.Y.Z` writes `VERSION` only. It does not
commit, tag, or push.

## Modules

| File                 | Role                                                     |
|----------------------|----------------------------------------------------------|
| `src/interceptor.js` | All `fetch` goes through here                            |
| `src/pubsub.js`      | Named events                                             |
| `src/provider.js`    | `load` / `create` / `save` / `remove` / `subscribe`      |
| `src/live.js`        | WebSocket pipe: snapshot, `send`, reconnect, heartbeat   |
| `src/session.js`     | Session/roles provider, `guard`, `hasRole` / `lacksRole` |
| `src/locale.js`      | Overlay JSON catalogs onto `data-pk-i18n`                |
| `src/time.js`        | Paint `<time datetime>` as Local or UTC                  |
| `src/bind.js`        | Text, attr, field, list, hidden, disabled, class, errors |
| `src/dialog.js`      | Open and close native `<dialog>`                         |
| `src/tabs.js`        | Tiny aria tabs helper                                    |
| `src/index.js`       | Re-exports                                               |
| `css/tokens.css`     | `--pk-*` tokens                                          |
| `css/base.css`       | Reset plus imports of layout, forms, components          |
| `css/layout.css`     | Page, shell, stack, cover, crumb, pager, toolbar         |
| `css/forms.css`      | Fields and controls                                      |
| `css/components.css` | Buttons, cards, lists, dialog, tabs                      |
| `css/live.css`       | Optional live-session widgets                            |
| `pages/403.html`     | Static deny page (also `404.html`, `500.html`)           |

Override colors on `:root` or `html`. Do not add a JS theme object.

## Use from a site

The Start snippet is the whole install. `base.css` imports layout,
forms, and components. Live session pages also link `live.css`.

```js
import { DataProvider } from './kit/provider.js';
import { bindText, bindField } from './kit/bind.js';

const users = new DataProvider({ name: 'users', url: '/api/users.json' });
bindText('#status', users, (e) => e.status);
users.load();
```

`bindField(input, provider, 'name')` paints an `input`, `textarea`,
`select`, or checkbox from a top-level key and writes back on
`input` and `change`. Not a form framework. Autofill tokens live on
the markup. Copy `demo/recipes/settings.html`.

Custom sources: pass `load` / `save` instead of `url` (cookie,
sessionStorage, in-memory). `load({ teamId: '1' })` appends query
params.

```js
items.create({ title: 'New item' }); // POST
item.save(); // PUT
item.remove(); // DELETE
```

`create(body)` POSTs through Interceptor. If current data is an
array, the created record is prepended. If the server returns an
array, that list replaces the data. Do not use `save()` for create.
`save()` is PUT. `bindList` replaces its children on every update.
Focus in a row does not survive.

A CDN URL of the same files is fine. `npm install` is not.

## Recipes

Whole pages under `demo/recipes/`. Start at `demo/` (the recipe list).
Copy one HTML file plus its page script when it has one. Duplicate
the header. There is no router.

| Page                          | What to copy                                     |
|-------------------------------|--------------------------------------------------|
| `demo/index.html`             | Directory of copyable pages                      |
| `demo/sink.html`              | Kitchen sink. Catalog only. Do not paste         |
| `demo/recipes/login.html`     | Cover, fields, CTA, second button, banner        |
| `demo/recipes/items.html`     | List, toolbar, crumbs, create and confirm delete |
| `demo/recipes/list.html`      | Search, `load({ q })`, empty state, pager        |
| `demo/recipes/table.html`     | Bound tbody, search, pager, select, dialogs      |
| `demo/recipes/dashboard.html` | Stats, progress, ranked list, table, tabs        |
| `demo/recipes/menu.html`      | Header button, sheet of links, actions, Times    |
| `demo/recipes/popover.html`   | Small overlay next to a control. Not a sheet     |
| `demo/recipes/hint.html`      | Circle on a card. Hover tip. Click opens a tab   |
| `demo/recipes/accounts.html`  | App shell plus simple table                      |
| `demo/recipes/invite.html`    | QR frame plus invite URL (`pk-pre`)              |
| `demo/recipes/settings.html`  | Form, autofill tokens, read-only plan (`pk-dl`)  |
| `demo/recipes/status.html`    | Load cover, error cover, ready                   |
| `demo/recipes/activity.html`  | Facts, steps, bound log, Local/UTC `<time>`      |
| `demo/recipes/related.html`   | Facts, grouped neighbor lists as real links      |
| `demo/recipes/room.html`      | LiveProvider, vote, roster, send-dropped         |
| `demo/recipes/denied.html`    | Interceptor 401 and 403 to error pages           |
| `demo/session.html`           | Hide controls. Deny a page with `guard`          |
| `demo/locale.html`            | Overlay JSON onto English in the page            |

Recipe copy is generic: account, item, plan, vote, room, option. The
kitchen sink still proves widgets exist. Open it from the list. Do
not paste the sink into an app.

Short answers for common jobs, including page CSS when the kit has no
class: `how-do-i.md`.

## Theme

Canonical tokens are `--pk-*`. Set them on `:root`. Kit defaults are
dark-first. A second brand is a `:root` block. Do not fork
`components.css`. Do not add a JS theme object.

```css
:root {
  --pk-bg: #14120c;
  --pk-surface: #1c1913;
  --pk-cta: #c2410c;
  --pk-cta-label: #ffffff;
  --pk-radius-card: 4px;
  --pk-radius-control: 4px;
  --pk-font: Georgia, "Times New Roman", serif;
  --pk-text-title: 1.6rem;
  --pk-space: 0.85rem;
  --pk-control-height: 3rem;
  --pk-glow: #2a2118;
}
```

Type: `--pk-text-title`, `--pk-text-body`, `--pk-text-sm`,
`--pk-text-label`. Density: `--pk-space` plus `--pk-control-height`.
Glow wash: `--pk-glow-wash` (uses `--pk-glow`). Do not add a spacing
scale.

`html.pk-theme-light` (or `html[data-theme="light"]`) switches the
bundled light palette. `html.pk-density-compact` tightens space,
control height, and title size. Solid CTA plus white is for real
primary actions only.

Dialogs fade. Phone sheets slide up and show a grabber. Duration is
`--pk-motion`. Easing is `--pk-motion-ease`.
`prefers-reduced-motion` sets duration to `0ms`. No animation
library. No swipe-to-dismiss.

Default sheets are `--pk-*` and `.pk-*` only. New work uses those.

## Layout

Intent classes. Not a utility pile. One breakpoint: split and cluster
behave on a phone and a desktop.

| Class            | Intent                                          |
|------------------|-------------------------------------------------|
| `.pk-page`       | Full page, font, background                     |
| `.pk-shell`      | Centered column, max width                      |
| `.pk-shell-wide` | Wider shell for a live room. Copy `room.html`   |
| `.pk-stack`      | Vertical flow, consistent gap                   |
| `.pk-cluster`    | Horizontal wrap, aligned, gap                   |
| `.pk-split`      | Two columns when wide, stack when narrow        |
| `.pk-cover`      | Center a short block. Scroll if it is tall      |
| `.pk-header`     | App header row: mark, title, actions            |
| `.pk-crumb`      | Breadcrumb `ol` / `li` / `a`. Full page loads   |
| `.pk-pager`      | Page links. Prev/next always occupy a slot      |
| `.pk-toolbar`    | Title plus actions                              |
| `.pk-app`        | Header plus optional side nav plus main         |
| `.pk-side`       | Optional side nav in `.pk-app-body`             |
| `.pk-main`       | Primary content                                 |
| `.pk-aside`      | Side roster / help                              |
| `.pk-table`      | Semantic table. `.pk-num` right-aligns          |
| `.pk-stat`       | Metric card. Number, trend, optional progress   |
| `.pk-timeline`   | Vertical activity `ol`. `bindList` and `<time>` |
| `.pk-steps`      | Status `ol`. Labels in HTML. `aria-current`     |
| `.pk-sheet`      | Optional dialog sheet. Phone grabber and slide  |
| `.pk-popover`    | Small overlay. Native `popover`. Not a sheet    |
| `.pk-card`       | Content card                                    |
| `.pk-list`       | Stacked rows                                    |
| `.pk-btn`        | Auto-width button                               |
| `.pk-field`      | Labeled control                                 |
| `.pk-dl`         | Fact list                                       |
| `.pk-dialog`     | Native dialog                                   |
| `.pk-banner`     | Page notice                                     |
| `.pk-empty`      | Empty state                                     |
| `.pk-nav`        | In-page nav                                     |
| `.pk-hint`       | Circle on a card. Hover tip. Click opens a tab  |
| `.pk-hint-wrap`  | Hint plus tip                                   |
| `.pk-hint-tip`   | Short hover/focus text                          |
| `.pk-hint-warn`  | Warn variant                                    |
| `.pk-hint-err`   | Error variant                                   |
| `.pk-qr`         | Square frame for a QR image the app serves      |
| `.pk-pre`        | Wrapping block for a long value or URL          |

`[hidden]` always wins over kit `display: flex` on stacks, rows, and
lists. Use the attribute. Do not add another display class to hide
something.

`.pk-cover` centers a short block. If the block is taller than the
viewport, it scrolls from the top instead of clipping the header.

`.pk-app` is header plus `.pk-app-body`. Put `.pk-side` in the body
for a side nav. Omit it (or `[hidden]`) and main is full width. One
breakpoint, same as `.pk-split`. `.pk-table` is a semantic table, not
a spreadsheet DataGrid. Use `.pk-num` on numeric cells. Bind rows with
`bindList` on `tbody`. Copy `demo/recipes/table.html`. Search, pager,
row selection, and dialogs stay on the page.

`.pk-qr` is a square, light quiet zone around an `<img>`,
`<canvas>`, or `<svg>`. Bind `src` from a provider. The kit does not
encode. Size is `--pk-qr-size`.

`.pk-crumb` is an `ol` of links. Current page uses
`aria-current="page"`. No JS. `.pk-toolbar` is title plus actions.
`.pk-pager` is an `ol` of page links. Prev and Next always occupy a
slot. Disable when they do not apply. The list recipe navigates.
The table recipe intercepts clicks and `load`s. No JS pager widget.

`.pk-btn` is auto width.

Shared chrome across pages is duplicated markup or a server include.
There is no client router.

## Credentials

Attach a bearer token (or anything else) with an interceptor hook.
Widgets still do not call `fetch`.

```js
import { defaultInterceptor } from './kit/interceptor.js';

defaultInterceptor.use('request', ({ url, opts }) => {
  const token = sessionStorage.getItem('token');
  if (token) opts.headers.set('Authorization', 'Bearer ' + token);
  return { url, opts };
});
```

HTTP 401 and 403 are a page choice. Register an error hook. Do not
attach it on every call unless the page opts in.

```js
import { defaultInterceptor, redirectOnStatus } from './kit/interceptor.js';

defaultInterceptor.use('error', redirectOnStatus({
  401: '/login.html',
  403: '/403.html',
}));
```

`redirectOnStatus` maps `err.response.status` and `location.replace`s.
Session `guard` still covers a page that loaded and then learned it
has no access.

The kit does not ship OIDC or an identity-provider SDK.

## Session

`SessionProvider` is a DataProvider. Load `/me` (or pass `data` /
`load`). Default payload is `{ name, roles: ['member'] }`. The app
owns extra fields.

Hide or disable controls from roles. Deny a whole page with `guard`.
Client hide is UX. The server still enforces access.

```js
import { SessionProvider, lacksRole } from './kit/session.js';
import { bindHidden, bindDisabled } from './kit/bind.js';

const session = new SessionProvider({
  url: '/api/me',
  denyHref: '/403.html',
});
bindHidden('#admin-save', session, lacksRole('admin'));
bindDisabled('#export', session, lacksRole('admin'));
session.load();
```

On a page that requires the role, call `guard` instead of hiding
controls:

```js
session.guard('admin');
session.load();
```

`guard` waits while status is `loading`. If load fails, or the
session is known and the role is missing, it `location.replace`s the
deny page. Do not keep rendering. Mixed pages use `bindHidden` only.

`hasRole` / `lacksRole` are predicates for bind helpers.
`session.has('admin')` is the same check on the current payload.

Login is a cover page plus DataProvider. Not an auth framework.

## LiveProvider

Pipe plus snapshot and command. The app owns the JSON schema.

```js
import { LiveProvider } from './kit/live.js';

const room = new LiveProvider({
  name: 'room',
  url: 'wss://example.test/rooms/1',
  token: () => sessionStorage.getItem('token'),
  heartbeatMs: 25000,
  tick: 'seconds',
});
room.subscribe((e) => {
  // e.data, e.status, e.error, e.meta
});
room.connect();
room.send({ type: 'vote', optionId: 'a1' });
```

Handshake:

1. Connect. Token is `access_token` on the query string, or send
   `authMessage` as the first JSON.
2. Server sends `{ type: "snapshot", data }`. Later messages with
   `data` replace the current payload. No merge in the kit.
3. UI calls `send(obj)` for commands. Widgets do not construct
   sockets.
4. Client sends `{ type: "ping" }` every 20 to 30 seconds. Reply to
   inbound ping with `{ type: "pong" }`.
5. On drop, reconnect with backoff and expect a new snapshot.
6. `status()` is `idle`, `connecting`, `open`, `closed`, or `error`.
   `close()` stops reconnect.

`tick: 'seconds'` decrements that numeric field once per second while
the socket is open. The timer widget only renders. It does not start
its own interval.

`send` while not open is dropped. Return value is `false`. The
provider notifies with `meta.source` `send-dropped`. There is no
outbox. Connect first, or wait until `status()` is `open`. Copy
`demo/recipes/room.html` for a live page. The kitchen sink still
proves the widgets exist.

## Localization

English ships in the HTML. First paint does not wait on a catalog.
Kit demos and recipes stay English. Other languages are a JSON
document from the server, loaded with DataProvider.

```html
<button type="button" data-pk-i18n="save">Save</button>
<input placeholder="Email" data-pk-i18n-attr="placeholder:email.ph">
```

```json
{ "save": "Speichern", "email.ph": "E-Mail" }
```

```js
import { applyLocale } from './kit/locale.js';

const locale = new DataProvider({ name: 'locale', url: '/locales/de.json' });
locale.subscribe((e) => {
  if (e.data) applyLocale(document.body, e.data, { lang: 'de' });
});
locale.load();
```

Missing keys keep the English in the markup. `{name}` in a catalog
string is replaced from `options.vars`. Attributes: `placeholder`,
`title`, `aria-label` only. No ICU. Number formatting stays in the
page script. Dates use `formatTime` / `paintTimes` on
`<time datetime>`. Demo: `demo/locale.html`.

## Dates

ISO-8601 lives in `<time datetime>`. `formatTime(iso, zone)` and
`paintTimes(root, zone)` paint visible text. zone is `local` or
`utc`. Default local. `timeZone()` reads and writes `sessionStorage`
key `pk-time-zone`. That survives navigation on the same tab. Copy
`demo/recipes/activity.html` for the toolbar. Settings may show the
same choice. A page that already has a sheet may add a Times group.
Copy `menu.html` for that. Do not add a sheet just to host it.
Clicking Local or UTC shows a native popover note for about 3 seconds
with the IANA name and UTC offset (`zoneLabel`, `noteZone`). Not a
toast. Not a TimezoneProvider. No IANA picker. No `timeAgo`.

## Error pages

Static HTML in `pages/`: `403.html`, `404.html`, `500.html`. nginx
(or the app gateway) should return them with the real HTTP status.

```
error_page 403 /403.html;
error_page 404 /404.html;
error_page 500 502 503 504 /500.html;
```

Copy the files into the site tree. Point the stylesheet href at your
kit CSS and the home link at your app home. Kit preview uses
`../css/` and `../demo/`.

A page that loaded and then learns the session has no access goes to
the 403 page (`session.guard`) instead of rendering.

## Makefile

```bash
make help
make check
make preview        # http://localhost:8091/demo/  (recipes, session, pages/)
make preview-stop
```

`file://` can load the CSS. ESM modules need `make preview`.

## What is not here

Load-bearing absences live in `40k-foot-view.md` (section 9) and
`AGENTS.md` (Never do). A bound table is `demo/recipes/table.html`
(`bindList` on `tbody`). Do not copy a grid widget into the kit.
