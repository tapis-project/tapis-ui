### Requirements

- node.js stable


### Instructions

First install node dependencies in the base directory:


```
npm install
```

Next, start a development server with:

```
npm run dev
```

You can then browse to you [`https://localhost:3000`](https://localhost:3000) to view the application.
Due to a self-signed certificate being used for the dev server, you will receive a security warning.

### Testing, Linting and Pipelines

You may run unit tests with

```
npm run test
```

You may run linting with

```
npm run lint
```

On pull request, these will be run via Github actions.
