# Getting Started with TapisUI

1. Clone the TapisUI repository
2. `cd` into projects root directory
3. Run `npm run init-project`. This will build and install all of the libraries and external packages. At the end of this process, the vite library will start a local install of TapisUI at **http://localhost:3000**

# Starting TapisUI
From the root directory of the project, run `npm run start`

# TapisUI supporting packages
Much of the functionality and components used in TapisUI exist as their own NPM packages.
This enables developers to use TapisUI features and ui in their own projects. These packages are located in the `lib` directory in the root of TapisUI. There are 4 main packages.
- **tapsiui-extensions-core** - A library for building extensions and plugins to TapisUI
- **tapisui-common** - This package contains the generic components used in TapisUI as well as components specific to core Tapis services. These Tapis-specific components fetch data from Tapis services and render useful UI such as a file navigator for Tapis Systems, the Tapis Job Launcher Wizard, and more.
- **tapisui-api** - A package of function that make API calls directly to Tapis services
- **tapisui-hooks** - A package of hooks that use the **tapisui-api** library to fetch and mutate data as well as handle errors generated during API calls. With these hooks, developers can tie UI into the lifecycle of an API request via properties such as `isLoading`, `isSuccess`, `isError`, and more. 

## Updating supporting packages

# Extensions
