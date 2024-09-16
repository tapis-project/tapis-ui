# Changelog for TapisUI

All notable changes to this project will be documented in this file.

View TapisUI at https://tacc.tapis.io.

- Feel free to make use of your preferred tenant.

Please find documentation here:
https://tapis.readthedocs.io/en/latest/index.html

You may also reference live-docs based on the OpenAPI v3 specification here:
https://tapis-project.github.io/live-docs

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
