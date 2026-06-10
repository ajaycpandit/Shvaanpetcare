# Shvaan Pet Care — Boarding Manager (structured version)

This is the same app as the single-file `dog-boarding-calculator.html`, reorganized into
a clean static project so it's easier to maintain and extend. **No build step** — it's
plain HTML/CSS/JS and publishes on GitHub Pages exactly like the single file did.

## Folder structure

```
shvaan-app/
├── index.html          ← the page (loads the CSS + JS below)
├── css/
│   └── styles.css      ← all styles
└── js/                 ← loaded in this order by index.html
    ├── core.js         ← Supabase config, global state, sync indicator, logo cache
    ├── init.js         ← startup, page navigation, toast notifications
    ├── dogs.js         ← dog multi-select dropdown (Calculate page)
    ├── calculate.js    ← pricing calculator page
    ├── dog-profiles.js ← dog CRUD, breed search, edit dog, dog history modal
    ├── notifications.js← notification bell + alerts
    ├── calendar.js     ← month/list calendar + day detail
    ├── reservations.js ← reservations, check-in/out workflow, edit reservation
    ├── excel.js        ← dog list Excel import/export
    ├── history.js      ← booking history, payments, booking import/export
    ├── dashboard.js    ← dashboard (today's ops, KPIs, occupancy)
    ├── finance.js      ← finance reporting
    ├── invoice.js      ← invoice rendering + edit booking dates
    ├── settings.js     ← settings page + shared utilities
    └── auth.js         ← Supabase Auth login/logout + app bootstrap (loads last)
```

> **Load order matters.** The scripts are plain (classic) `<script>` tags that share one
> global scope, just like the original single file. `auth.js` must stay **last** because it
> starts the app. If you add a new module, add its `<script>` tag in `index.html` before
> `auth.js`.

## How to publish on GitHub Pages

1. Put the **contents of this `shvaan-app/` folder** in your repo so that `index.html`
   is at the repo root (or in a folder you point Pages at). Keep the `css/` and `js/`
   folders alongside `index.html`.
2. Repo → **Settings → Pages** → Source: **Deploy from a branch** → pick your branch and
   `/root` → Save.
3. Your app will be at `https://yourusername.github.io/yourrepo/`.
4. Keep `book.html` (the public booking form) in the same repo root if you use it.

All file references are **relative** (`css/styles.css`, `js/core.js`), so it works in a
project subfolder on GitHub Pages without changes.

## Important notes

- This is a faithful 1:1 copy of the single-file app — same features, same Supabase backend,
  same behavior. Nothing about your database or setup changes.
- The original `dog-boarding-calculator.html` still works on its own and is untouched. You can
  keep using it while you transition.
- This structure is the foundation for the next big feature (customer logins + configurable
  staff roles), which will be much safer to build here than in one giant file.
