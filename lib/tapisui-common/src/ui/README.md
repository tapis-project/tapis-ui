# TACC TAPIS UI - Common Components

These components are available to all components (including each other).

## Rules

- Every component should have its own folder.
- Every component should be exported from `index.js`.

## Troubleshooting

### ESLint `import/no-cycle`

This error occurs to avoid _even the possibility of_ a circular dependency.

It can be caused by attempts to import a common component via the following the syntax:

```js
// assuming importer has its own folder
import … from '..';
// a syntax allowed outside of `_common`
import … from 'ui';
```

If you have two common components to import into another common component, then import each individually:

```js
// Do import each individually
import Icon from '../Icon';
import LoadingSpinner from '../LoadingSpinner';

// Do NOT import them together
// import { Icon, LoadingSpinner } from '..';
// import { Icon, LoadingSpinner } from 'tapis-ui/_common';
```
