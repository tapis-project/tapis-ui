# `tapis-ui`

This project is a React-Redux based web client for [`https://tapis.io`](https://tapis.io).
Testing changes - 1

## Requirements

- node.js stable

## Installing and Running

First install node dependencies in the base directory:

```bash
npm install
```

Next, start a development server with:

```bash
npm run dev
```

You can then browse to you [`https://localhost:3000`](https://localhost:3000) to view the application.
Due to a self-signed certificate being used for the dev server, you will receive a security warning.

## Project Structure

All of the project sources are in the [`./src`](./src) directory. There are three major components:

- [`tapis-redux`](./src/tapis-redux): Redux state management and service for accessing `tapis.io`
- [`tapis-ui`](./src/tapis-ui): UI components for interacting `tapis.io` services
- [`tapis-app`](./src/tapis-app): A sample web application built on `tapis-ui` and `tapis-redux` components

Each component is structured so that they can eventually be published as separate npm packages. They each have:

- `src` directory
- `__tests__` directory for unit tests for those components

In addition, all fixtures are available in [`./fixtures/`](./fixtures)

## Testing, Linting and Pipelines

You may run unit tests with

```bash
npm run test
```

You may run linting with

```bash
npm run lint
```

On pull request, these will be run via Github actions.
