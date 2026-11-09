# Changelog for TapisUI

All notable changes to this project will be documented in this file.

View TapisUI at https://tacc.tapis.io.

- Feel free to make use of your preferred tenant.

Please find documentation here:
https://tapis.readthedocs.io/en/latest/index.html

You may also reference live-docs based on the OpenAPI v3 specification here:
https://tapis-project.github.io/live-docs


## 26Q3.0-alpha

> Not released yet. Entries are added as features land; the `-alpha` suffix comes off
> when the release is tagged.

The service pages, rebuilt. Systems, Files, Apps and Jobs move onto one page kit and one
nav, the login page becomes the landing, and Settings arrives.

### Highlights

#### 🧭 One page kit and one nav for every service
- **Landing tables** — columns you choose, sortable headers, three fit modes and a facts
  strip; a named app or system in a table opens it.
- **Detail pages** — one head, one record view, one set of state chips, a history ledger
  that expands into the whole dialog, a notes box, and fact boxes that level before they
  paint.
- **The nav spine** — windowed lists with a ledger that says what was loaded and when,
  one filter bar of chips, and a search that says what it searched.
- **The page frame** — a ? beside each title explains the page, a resizable docs drawer,
  page width as a real preference, and skeletons instead of first-paint spinners.
- **A list column you size** — drag its edge, double-click to reset, or use the arrow
  keys; the width is remembered per device.

#### 🖥️ Systems
- A landing dashboard and a fact-card detail page: batch and queue limits as a real
  table, the scheduler profile, history and lineage, notes, and a live Sharing & access
  panel.
- Delete, enable and disable land correctly, and deleted systems are a visible choice.
- A new credential gets a patient recheck, and a host that is down reads as down, not as
  a key problem.
- Guided creation, section by section, at full parity with the classic wizard.

#### 📁 Files
- A rebuilt explorer: Dolphin-style selection, keyboard navigation, a path bar with back,
  forward and an editable trail, and a viewer that walks the directory, strips terminal
  escape codes and decodes ELF files.
- The toolbar becomes an icon rail, with a Places menu for the system's landmarks, and
  the landing is a systems table with its own nav.
- Refusals, missing paths and missing credentials explain themselves inside the explorer
  instead of ending it; dropping files offers the upload.
- HTML previews run sandboxed, with no scripts or forms, and say so; SVG shows as an
  image. Download is the way to see a page as written.

#### 🚀 Apps and the guided job launcher
- The launcher in eight sections, each pointing at what blocks it; one issue list drives
  the nav, the review board and the walk. Paste JSON in place, expand argument and env
  var descriptions, and pick from the cluster's own allocation list.
- The apps landing lists what you actually run, and the app card says what it runs, with
  its recent runs in a real table.
- Sharing, lifecycle and history for apps, and deleted apps become findable.

#### 📋 Jobs
- A jobs dashboard (stat tiles, a 14-day outcome chart, per-app activity) and a nav that
  groups a burst of near-identical jobs instead of drowning in them.
- The job page says what the job did and, for a failure, what failed; a session stopped
  on purpose no longer reads as a failure, and a BLOCKED run explains its hold.
- Every job carries Resubmit, with an adjust-first path through the launcher; a cancel
  is felt at once and survives a reload.
- Session apps (FlexServ, ParaView) hand over their address and token in a box on the
  job page, with a floating window that stays open. Only an https address on the job's
  own system is opened from the page, and pasting into a session is a switch per window.

#### 🔑 The login page is the landing
- Logo, host and description sit open on one left edge with only the sign-in boxed.
  Protected links open a login modal built from the same pieces, which then says who
  signed in and where it is taking you.
- Password sign-in shows only where Tapis Auth can't be used, with a show-password eye
  as NIST SP 800-63B recommends.
- Hold the header for 3 s to sign in with an access token: on for every tenant behind a
  warning, and an extension can turn it off.

#### ⚙️ Settings
- One panel (the gear, or `/settings` with linkable sections) for your session, profile
  lookup, the preferences the rebuilt pages read, and a token decoder.
- Tenant admins get privileged users, tenant metrics, and an App & System store that
  registers definitions from the shared application repository.

### New features (the rest)

- `/components`: a catalog of the shared buttons, rails, tables and boxes, each with its
  source file, where it is used, and a live example.
- MLHub is spelled as one word, and its own app bar replaces the breadcrumbs.
- `docs/SERVICE_GAPS.md`: what the services will not let the UI do yet.

### Performance

- One cache policy for the hooks: the systems, files, apps, jobs and tenant hooks stop
  refetching in the background, and each page makes one list request.
- A keystroke in the job launcher costs 0.7 ms instead of 95 ms.
- A record's JSON view is a read-only blob instead of an editor, dark by default: a
  111 KB record tokenizes in 1.5 ms, and very long records show their head first.

### Bug fixes:

- Drag-and-drop uploads land in the folder you dropped on, and names with `#`, `?` or
  `%` upload as named.
- New folder, upload, rename, move and delete work inside folders whose names need
  escaping, such as names with spaces.
- List pages wait for the sign-in before asking for their lists.
- Disable, delete and credential removal on a system clear stale data again.
- Submitted, resubmitted, cancelled and hidden jobs show up without a manual refresh.
- The OAuth2 callback refuses a token this deployment can't use, and says why.
- A fresh sign-in reaches the whole page without a reload.
- A reactstrap modal opens above a MUI dialog, not behind it.
- The sidebar collapse tab sits on the pane instead of over the page.
- A page that crashes shows the error and leaves the app running, and a tab left open
  across a deploy reloads once instead of going blank.
- Unknown URLs show a not-found page.
- A pod, volume, snapshot, image or template that cannot load says whether it is
  missing, refused or failed, and links back to its list.
- A 403 or 404 shows at once instead of after about 7 seconds of retries.
- Signing out clears cached responses from the tab.
- Disabling a system from its page asks first, and the new system dialog asks before
  discarding what you typed.
- The job launcher rechecks blockers on submit, and the JSON editor refuses anything
  that is not a job object.
- Stepping through files stops the previous download.

### Build and tests:

- A runnable jest and vitest suite, and PRs build the app and a disposable image.
- Docker builds use BuildKit caches and a .dockerignore that keeps .env out.
- A lint gate for em-dashes in user-facing text, with a shrinking baseline.


## 26Q2.1

### New features:

- MLHub model discovery: filtering, new model cards, auto-run discovery, and a semantic
  segmentation service
- VTK.js file visualization — multi-pane viewer with shared controls, launched from the
  Files toolbar
- Cancel-jobs button and clearer job status messaging
- View job output files at any job status

### Bug fixes:

- Production Docker build fixes (CommonJS includes, dist output)
- Model details page layout; hide questionable models


## 26Q2.0

### New features:

- Pods management overhaul: filterable list v2, edit form/JSON/diff panes, image wizard,
  `derived_lite`-backed reads, admin object views, and the pods permissions view extended
  to volumes and snapshots
- ICICLE portal beta + Chatbook page; patra tab; Smart Labeler iframe integration
- Chat panel: streaming responses, history forwarding, auth-gated access
- Package updates: tapis-typescript 0.0.68, pods 0.0.14, authenticator 1.8.5

### Bug fixes:

- Systems modal fix; `useCreateSystem` mutate fix
- ICICLE auth on local dev; portal service-list scrolling
- Dockerfile nix layer caching


## 26Q1.0

### New features:

- ChatPanel and advanced features
- Added features for tutorials
- View system output before job end
- New advanced pods edit mode
- New advanced pods admin mode
- Pods diff viewer and resource adder
- TMS Auth flow
- Revert system credential button
- Goto hostEval button

### Bug fixes:

- Incread upload time + limit
- Fixes for workflows
- Fixes for ML Workbench
- Fixes for Pods
- Fixes for Chat Panel urls + reactivity
- Fixes for styling before tutorial
- Fixes for responsive design on all pages
- Fixes for tutorial ease


## 25Q4.0

### New features:

- UI now outputs chunked, just in time components for speed/size
- Beginnings of new MLHub pages
- Added initial welcome message to some tenants
- Work on authentication automation
- Updated all packages to get rid of deprecation/warnings
- Added share button in file browser
- Added copy button to JWT + menu

### Bug fixes:

- Fixes for some workflows
- Fixes for ML Workbench

## 1.9.0 - 2024-09-13:

### New features:

- Workflows page received large updates to field usage and management in DAG and more
- Get/Delete/Create Authenticator clients page is now available
- JSON Editor enables Systems/Apps/Jobs JSON requests in UI
- Updates to MLEdge and MLWorkbench
- Pods UI overhaul. Most things now work. Edit and Create are more stable with better defaults
- Systems, Apps, Jobs, and Pods now using shared sidebar list
- Updates to tapis-typescript and subpackages
- Transitioned to pnpm from npm for package management and scripts
- Plugin: Scoped tenant work, new tabs and guis
- Plugin: ICICLE updates for workbench, harvest, and assorted tabs
- Updated README and docs
- Introduced flake.nix/.lock for use with `nix develop` for seamless development

### Bug fixes:

- Pods pages fixed in many ways.


## 1.8.0 - 2024-12-16:

### New features:

- Updated secrets engine for Workflows
- Updating MLEdge
- Moving further in the direction of MUI
- Fixes for file nav and operations
- Updates to pipelines/workflows in general
- Added postits
- Streamlined authentication modals and globus auth modals
- Overhauled System details with new buttons and hooks
- Moving over the new sidebar in some services.
- Moving over to primarily CodeMirror for text boxes
- Revamp of Pods UI with Redux state
- Added initial implementation of Redux and slices

### Bug fixes:

- No change.


## 1.7.0 - 2024-09-13:

Release of TapisUI with great work from Nathan Freeman, Alex Fields, SGX3 interns, Dhanny, and more.

### New features:

- Moving to Vite multi-package monorepo setup. Leaving create-react-app framework as that's deprecated.
- Updating to latest React 18 alongside updates to several major libraries.
- Reworked development flows with new `npm run` methods. `npm run dev`, `npm run init-project`, and more.
- Project build and deployment now working. In userspace alongside dockerspace with `npm run` methods for docker.
- Plugin architecture for adding additional components created alongside needed packages and helper libraries.
- Workflows interactive task editor and interface added.
- Plugin: Added ML-Hub dashboard with model information and download pages. Added dataset page and views as well.
- Plugin: Added ML-Edge Simulation Environment for interacting with Camera Traps Edge simulator.
- Plugin: Added CKN, Training Catalog, Visual Analytics, and OpenPASS integrations.
- Plugin: Added JupyterLab and OpenWebUI iframe integrations.
- Integrated new authentication methods.
- Pods service interactive management dashboard added.
- Revamped sidebar, user menu, logos, interactivity.
- TapisUI now serving from `*.tapis.io/` rather than `*.tapis.io/tapis-ui`
- Initial versioned release.

### Bug fixes:

- No change.
