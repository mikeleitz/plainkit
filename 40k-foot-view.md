# 40k foot view

Plainkit is not a UI framework. It is a **page kit**: one HTML document, one small script, one way data moves, CSS that names *intent*. Grab these truths and you can assemble almost any boring screen from them.

## 1. The unit is a page

An app is many HTML files with full page loads. There is no client router, no app shell that swaps `<main>`, no shared JS store across screens.

| What you want across pages | How you get it                                            |
|----------------------------|-----------------------------------------------------------|
| Shared chrome              | Duplicate markup, nginx SSI, or a static include          |
| Shared look                | Same `tokens.css` + `base.css`                            |
| Shared credentials         | Interceptor hooks on this page (or a copied snippet)      |
| Navigation                 | Real links. Crumbs and enabled pager steps are `<a href>` |

If you catch yourself wanting a hash route or `history.pushState` to keep the page alive, you are leaving the kit.

A table that is the work of the page may call `load({ q, page })` again without leaving the URL path. `history.replaceState` of the query string is allowed. That is still one page, one provider, one subscribe. It is not a router. The filter-list recipe stays GET links. The bound table recipe (`demo/recipes/table.html`) intercepts search and pager that way, and `load`s again after create, edit, or delete. Do not add `pushState` or swap `<main>`.

**Rule:** copy a recipe page (`demo/recipes/`), rename it, point the script at your providers. Do not invent a second assembly pattern.

## 2. Three owners. Never a fourth.

Every runtime fact has one owner:

| Fact                         | Owner              | UI may                            | UI may not                    |
|------------------------------|--------------------|-----------------------------------|-------------------------------|
| HTTP                         | `DataProvider`     | `load` / `create` / `save` / `remove` / `set` | call `fetch`                  |
| WebSocket                    | `LiveProvider`     | `connect` / `send` / `close`      | construct `WebSocket`         |
| Auth headers, 401/403 hops   | `Interceptor`      | register hooks once per page      | attach headers in a widget    |
| What the user sees           | HTML + bind        | subscribe and paint               | own a clock, own a cache      |
| Colors, type, density        | CSS `--pk-*`       | set tokens / a class on `html`    | a JS theme object             |
| JSON shape                   | The app            | map fields in the page script     | put the schema in the kit     |

`SessionProvider` is not a fourth owner. It **is** a `DataProvider` whose payload happens to have `roles: string[]`.

`LiveProvider` is a pipe plus snapshot plus command. A live room is still a page. The timer widget renders `seconds`. It does not start its own interval (`tick: 'seconds'` is the provider's job).

**Rule:** if a widget wants data, it `subscribe()`s. If it wants the network, it is already the wrong layer.

## 3. The event is the whole contract

Every provider notifies with the same object:

```js
{
  data,      // current payload (app-owned JSON)
  status,    // Data: idle | loading | ready | error
             // Live: idle | connecting | open | closed | error
  error,     // Error or null
  meta,      // { source: 'load' | 'save' | 'create' | ... }
  provider,  // the instance
}
```

`subscribe(fn)` is how you hear it. Bind helpers are just `subscribe` plus a DOM write.

That is the domain model of "state." There is no Redux, no signals graph, no per-widget store. One resource, one payload, one status, one error.

**Rule:** paint from `e.data` / `e.status` / `e.error`. Do not keep a parallel copy in the page script unless you are mid-gesture (a dialog's `pendingId` is fine; a second cache of the list is not).

## 4. A provider is one resource

`new DataProvider({ name, url })` holds **one** thing: a user, a list, a settings object, a locale catalog, `/me`.

Verbs are HTTP verbs, not a generic `mutate`:

| Call              | Network                         | Local effect                                      |
|-------------------|---------------------------------|---------------------------------------------------|
| `load(query?)`    | GET (query becomes search params) | snapshot + `set`                                  |
| `create(body)`    | POST                            | array response replaces; else prepend if array    |
| `save()`          | PUT of current `get()`          | server body wins if present                       |
| `remove()`        | DELETE                          | `set(null)`                                       |
| `set(data)`       | none                            | ready, notify                                     |
| `reset()`         | none                            | restore last loaded/saved snapshot                |

Custom `load` / `save` exist for cookie, `sessionStorage`, memory. Same subscribe surface. Still no `fetch` in UI.

`create` is POST. `save` is PUT. Do not use `save` to create.

**Rule:** one provider per resource on the page. Compose in the page script (`session` + `items` + `locale`). Do not make a god object.

## 5. Bind is how HTML stays honest

HTML is the structure. Bind is the paint loop. There is no component constructor.

| Helper            | Job                                              |
|-------------------|--------------------------------------------------|
| `bind`            | run `apply(el, event)` now and on every change   |
| `bindText`        | `textContent`                                    |
| `bindAttr`        | one attribute (`src`, `href`, …)                 |
| `bindField`       | one key, two-way on `input` and `change`         |
| `bindList`        | clone a `<template>` per item, replace children  |
| `bindHidden`      | `hidden` from a predicate                        |
| `bindDisabled`    | `disabled` from a predicate                      |
| `bindClass`       | toggle a class from a predicate                  |
| `setFieldError`   | `.pk-field-error` + `aria-invalid`               |

`bindList` is small lists only. It **replaces** children. Focus in a row does not survive. That is intentional. A `tbody` is a valid target. Use a template of `<tr>`. If you need a spreadsheet, you are outside the kit. Copy `demo/recipes/table.html`.

`bindField` is not a form framework. Top-level keys only. Checkboxes use `checked`. Submit is still a form `submit` handler that calls `create` / `save`.

**Rule:** markup first, then wire. If you are generating the whole screen in JS, you skipped the kit.

## 6. How you actually put a UI together

Same recipe every time. This is the assembly algorithm.

**1. Name the page.** One URL, one job: login, list, settings, room, deny.

**2. Pick a page shape (layout intent, not pixels).**

| Shape        | Class                         | When                                                      |
|--------------|-------------------------------|-----------------------------------------------------------|
| Cover        | `body.pk-page.pk-cover`       | Short centered block: login, load, error, 403             |
| Shell        | `.pk-page` + `.pk-shell`      | Narrow form / settings                                    |
| Wide shell   | `.pk-shell-wide`              | Live room. Copy `room.html`. Not session or dashboard     |
| App          | `.pk-app` + header + main     | Header, optional `.pk-side`, `.pk-main`                   |

Inside the shape, stack meaning:

- `.pk-stack` vertical flow
- `.pk-cluster` horizontal wrap
- `.pk-split` two columns when wide, stack on a phone
- `.pk-header` / `.pk-toolbar` / `.pk-crumb` / `.pk-pager` chrome
- `.pk-card`, `.pk-list`, `.pk-table`, `.pk-dl`, `.pk-timeline`, `.pk-steps`, `.pk-popover`, `.pk-hint`, `.pk-field`, `.pk-btn`

One breakpoint. Classes say **what the region is for**. There is no spacing scale and no utility pile.

**3. Write semantic HTML with English already in it.** `button`, `form`, `dialog`, `table`, `nav`, `ol`. Visible copy lives in the page. First paint does not wait on JSON.

**4. Instantiate providers in the page script.**

```js
const session = new SessionProvider({ url: '/api/me', denyHref: '/403.html' });
const items = new DataProvider({ name: 'items', url: '/api/items' });
```

**5. Bind visibility and text to status and data.** The status recipe is the pattern for "page cannot render without this":

- hide ready UI while `status !== 'ready'`
- show a load cover while loading
- show an error cover on `error`
- never leave a blank broken layout

**6. Bind user gestures to provider verbs.** Click create → `items.create(...)`. Click save → `item.save()`. Vote → `room.send({ type: 'vote', ... })`. The widget does not know HTTP.

**7. Theme last, with CSS.** Override `--pk-*` on `:root`. Light is `html.pk-theme-light` (kept alias: `html[data-theme="light"]`). Compact is `html.pk-density-compact`. Solid `#2563eb` plus white is for real CTAs only. Chrome stays quiet.

That is the whole lego set: **intent layout + semantic HTML + providers + bind**. Not a widget class per control.

## 7. Access, failure, and copy are pages too

These are first-class, not afterthoughts.

**Session**

- Payload: `{ name, roles: ['member', ...] }`. App owns extra fields.
- Mixed page: `bindHidden` / `bindDisabled` with `lacksRole('admin')`. Client hide is UX.
- Whole page requires a role: `session.guard('admin')` then `load()`. On fail or missing role, `location.replace` the 403 page. Do not keep rendering.
- Server still enforces. The kit is not OIDC, not a permission language, and not an identity-provider SDK. Login is a cover + form + DataProvider.

**HTTP 401/403** is a page choice via `redirectOnStatus`. Opt in on that page. Do not attach it globally by default.

**Full failure is an HTML page** (`pages/403.html`, `404.html`, `500.html`) returned with the real status. A DataProvider error on a page that cannot render uses a banner or cover, same idea.

**Locale:** English is in the HTML. Other languages are one JSON map loaded with DataProvider, overlaid onto `[data-pk-i18n]`. Missing keys keep English. No `t()` wrapping, no ICU, no auto-detect.

**`[hidden]` always wins.** Do not add a `display: flex` that skips it. That is how covers, empty states, role hide, and a `.pk-note` that also has `pk-note-open` actually work.

## 8. Interceptor is the only seam for "cross cutting"

Want a bearer token? One `request` hook on `defaultInterceptor`. Want 401 → login? One `error` hook with `redirectOnStatus`. Widgets stay ignorant.

Live auth is different on purpose: `access_token` on the socket URL, or `authMessage` as the first JSON. Still not constructed by the widget.

**Rule:** if you are about to wrap `fetch` in a helper "just for this page," stop. Put it on the interceptor or on the provider's custom `load`.

## 9. What is deliberately *not* in the model

These look like missing features. They are load-bearing absences.

- No virtual DOM, no components with constructors
- No client router
- No JS theme API (`setTheme` does not exist)
- No form framework, no spreadsheet DataGrid, no SSE. A bound table is HTML plus `bindList` on `tbody`. Search and pager `load` in place. Do not add a grid constructor.
- No outbox: `LiveProvider.send` while not open is dropped (`meta.source: 'send-dropped'`)
- No merge of live messages: a message with `data` **replaces** the payload
- No kit-owned JSON schemas
- No dual `.ee-*` in default CSS (compat sheet only)

If a need does not fit, it waits for a **named pass** in `AGENTS.md`. You do not invent a second data layer "just this once."

## 10. A working checklist

When you sit down to build a screen, ask only these:

1. **Which HTML page is this?** One URL.
2. **Which layout intent?** Cover, shell, or app.
3. **Which resources?** One `DataProvider` or `LiveProvider` each.
4. **What does ready / loading / error look like?** Bind those three. Do not ship a blank main.
5. **What does the user do?** Map clicks/submits to `create` / `save` / `remove` / `send`.
6. **Who may see it?** Hide controls, or `guard` the page, or both. Server still says no.
7. **Is English already in the markup?** Overlay later if needed.
8. **Did I call `fetch` or `WebSocket` from the widget?** If yes, undo it.

Copy `demo/` (the recipe list) and steal the closest page. Jobs while assembling: `how-do-i.md`. Frames: `canonical-layout-patterns.md`. How to call modules: `README.md`. Agent rules: `AGENTS.md`. The kitchen sink proves widgets exist. It is not an app template.
