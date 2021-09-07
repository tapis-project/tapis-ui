# TACC Core Portal - Styles

These files are all regular native CSS (not CSS modules, not SCSS).

These files are organized via [ITCSS][itcss] and named with [BEM Namespaces][bem-ns].

[itcss]: https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/ 'Inverted Triangle CSS'
[bem-ns]: https://medium.com/@wenukagtx/bem-namespaces-81a5868e725c#28a3 'BEM & Namespaces'

## `global.css`

Meant to be imported by a stylesheet that is loaded at the root of the application, i.e. `index.css`.

_This file imports, in [ITCSS][itcss] order, all stylesheets from this directory that should be available globally._

## Settings

Variables for values, media queries, selectors, etc.

_These are **not** styles. These are variables used to reduce reptition. These can **NOT** be used via `composes:`._

## Tools

Mixins, functions, and other processing logic.

_These are **not** styles. These are tools to create styles. These can **NOT** be used via `composes:`._

## Generic

Styles that cascade to many elements (or reset/normalize styles, but Bootstrap is doing this).

_No classes allowed. These can **NOT** be used via `composes:`._

## Elements

Styling for bare HTML elements (like `<button>`, `<a>`, `<td>`, etc.).

_No classes allowed. These can **NOT** be used via `composes:`._

## Objects

Class-based selectors which define undecorated structural patterns, e.g. re-usable layouts.

_These can be used via `composes:` by one or many React components._

## Components

Class-based selectors which define decorated design patterns, e.g. UI components.

_These can be used via `composes:` by one or many React components._

## Trumps

Utilities and helper classes with ability to override anything before it.

_These can be used via `composes:` by one or many React components._
