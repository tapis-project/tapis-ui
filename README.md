# Getting Started with TapisUI

1. Clone the TapisUI repository
2. `cd` into projects root directory
3. Run `npm run init-project`. This will build and install all of the libraries and external packages. At the end of this process, the vite library will start a local install of TapisUI at **http://localhost:3000**
4. After the initial build you should be able to run `npm run dev` for a hot-reloading environment.
5. [View the wiki](https://github.com/tapis-project/tapis-ui/wiki) for a dive into what's what in this repository.

# Development with TapisUI

- `npm run start` starts dev vite instance with `vite.dev.config.mts` config.
- `npm run dev` starts dev vite and watcher.js script which hot reloads sub packages when changes are found.
- `npm run docker` will start instance like `npm run start`, but containerized.

### Production Builds

- `npm run docker-prod` will build and start nginx serving built vite project.
  - This will run `npm run build` and copy files to nginx to server
- `npm run build-dev; npm run preview-dev` to build and run vite preview locally.
  - Packages must be pristine for build to work. Docker might be more reproducible.
    - `ctrl+shift+c` in browser to inspect console and find errors. If you get an invariant error then there's more than likely a package issue.

# TapisUI supporting packages

Much of the functionality and components used in TapisUI exist as their own NPM packages.
This enables developers to use TapisUI features and ui in their own projects. These packages are located in the `lib` directory in the root of TapisUI. There are 4 main packages.

- **tapisui-common** - This package contains the generic components used in TapisUI as well as components specific to core Tapis services. These Tapis-specific components fetch data from Tapis services and render useful UI such as a file navigator for Tapis Systems, the Tapis Job Launcher Wizard, and more.
- **tapisui-api** - A package of function that make API calls directly to Tapis services
- **tapisui-hooks** - A package of hooks that use the **tapisui-api** library to fetch and mutate data as well as handle errors generated during API calls. With these hooks, developers can tie UI into the lifecycle of an API request via properties such as `isLoading`, `isSuccess`, `isError`, and more.
- **tapisui-extensions-core** - A library for building extensions and plugins to TapisUI
- **tapisui-extensions-devtools** - Devtools when working with tapisui-extensions

## Updating supporting packages

# Extensions
