# TapisUI - React TypeScript UI for Tapis
[![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/tapis-project/tapis-ui?label=git%20tag&sort=semver)](https://github.com/tapis-project/tapis-ui/tags)
[![Docker Image Version (latest by date)](https://img.shields.io/docker/v/tapis/tapisui?label=image&sort=semver)](https://hub.docker.com/r/tapis/tapisui/tags)
[![docs](https://img.shields.io/badge/docs-grey)](https://tapis.readthedocs.io/en/latest/technical/tapisui.html)
[![live-docs](https://img.shields.io/badge/live--docs-grey)](https://tapis-project.github.io/live-docs)


## Getting Started with TapisUI

1. Clone TapisUI repo with `git clone https://github.com/tapis-project/tapis-ui.git`
2. `cd` into repo root directory
3. Run `pnpm init-project` which will:  
   a. Create intial `.env` from `.env.template` for configuration  
   b. Run `pnpm install` to install packages for root and all sub packages  
   c. Run `pnpm -r build` to build root and all sub packages  
   d1. Run `pnpm run start` to serve vite TapisUI instance at **http://localhost:3000**  
   d2. Devs can optionally run `pnpm run dev` which enables hot-reloading after changes in subpackages along with serving TapisUI  
4. Open the URL output by stdout to view the UI, generally **http://localhost:3000**
5. [View the wiki](https://github.com/tapis-project/tapis-ui/wiki) for a dive into what's what in this repository.

## Development with TapisUI

- `pnpm run init-project` runs `install`, `build`, and `start`.
- `pnpm run start` starts dev vite instance with `vite.dev.config.mts` config; no hot-reloads.
- `pnpm run dev` starts dev vite and `tsc --build` in `--watch` mode which hot-reloads subpackages.
- `pnpm run docker` will start instance like `pnpm run start`, but containerized.

### Production Builds

- `pnpm run docker-prod` will build and start nginx serving built vite project.
  - This will run `npm run build` and copy files to nginx to server
- `pnpm run build-dev; pnpm run preview-dev` to build and run vite preview locally.
  - Packages must be pristine for build to work. Docker might be more reproducible.
    - `ctrl+shift+c` in browser to inspect console and find errors. If you get an invariant error then there's more than likely a package issue.

### Package Manager (pnpm v. npm)
---

In May '25 TapisUI switched to using `pnpm` to manage the root package and all subpackages. `pnpm` manages all package `node_modules` from a central location and symlinks to directories when neccessary. `pnpm` also provides easy package resolution for self-referencing subpackages. This repo contains 10 packages and `pnpm` increases speed, decreases potential errors, and provides useful utitilies for dependency management and more. You will need to intall `pnpm`, here's [the install guide](https://pnpm.io/installation), and here's two things you could do:

### Using pnpm install via npm


Users can install pnpm via npm and run as so:

```
npm install pnpm
npx pnpm install
npx pnpm -r build
npx pnpm dev
```

### Using pnpm which is already installed in Nix development flake

`flake.nix` describes a development shell with pinned pnpm version, you can use that like this:

```
nix develop .#default --extra-experimental-features 'nix-command flakes'
pnpm install
pnpm -r build
pnpm dev
```

## _Experimental_ Nix Development Shell

Nix is a _functional_ package manager which stores packages in a central Nix _store_ which links to final locations. TapisUI uses nix to solve dependency and reproducibility issues in development. [To install nix, view the official instructions here](https://nixos.org/download/#nix-install-linux). A potentially "better" installation option is the [Determinate Nix installer](https://github.com/DeterminateSystems/nix-installer), their installer works better on all OS's and it enables experimental features by default (of which we use).

TapisUI has optional nix development tools. Included in the repo root is a `flake.nix` and `lock.nix` file. The `flake.nix` file defines a flake's `description`, `inputs`, and `outputs`. `inputs` attr specifies the dependencies of a flake, these are locked with `lock.nix`. `outputs` are what the flake produces, one flake may simultaneously contain several types of outputs.

This `flake.nix` specifies a default pkgs.mkShell. When ran with `nix develop` the user will be placed in a nix shell containing the packages needed to develop/deploy/test TapisUI. This optional utility allows developers to all work in a declarative manner.

As mentioned, getting into this environment requires nix to be installed on your OS (nix can be used as a portable rootless package, but that hasn't been tested). Once you can run `nix` you should be able to run `nix develop .#default` to run the default mkshell output. Which will give you access to a welcome pkg and aforementioned development packages, in this case locked versions of `npm`, `pnpm`, `node.js`, `git`, and more.

Warning: We're using the flakes and nix-command features of Nix which are experimental. You can temporarily allow with `export NIX_CONFIG="experimental-features = nix-command flakes"`. If you use the Determinate Nix installer these features will already be allowed. If you want a more permanent override you can adjust nix.conf, home-manager, or NixOS [as described in the Flakes docs.](https://nixos.wiki/wiki/flakes)

```
➜  tapis-ui git:(dev) # nix develop
Entering TapisUI development environment...
npm: 10.9.2
pnpm: 10.11.0
node: v22.14.0

pnpm run commands:
==========================
  - pnpm run: list all pnpm scripts in root package.json
  - pnpm install: install all rootpkg and subpkg dependencies from one module location
  - pnpm -r build: Build the rootpkg (-r to build all subpkgs)
  - pnpm run dev: Start the hot-reloading dev server
  - pnpm run docker: docker build and deploy
  - pnpm run test: Run all tests
  - pnpm run prettier: Ran by 'dev', but should be done before commit
  - pnpm add <pkg> -w: Add a package to the root pkg in workspace
  - pnpm list: List all packages in the workspace
  - pnpm -r build | list | audit | outdated: cool commands, run pnpm for more info

Common commands:
==========================
  - welcome: callable from nix shell, shows this help message
  - welcome --version: shows npm and node version + welcome
  - nix develop -i: --ignore-environment to isolate nix shell from user env
  - nix develop .#welcome: runs welcome version in nix shell
  - nix flake show: to view flake outputs
```

Read more about [nix flakes here](https://nixos-and-flakes.thiscute.world/other-usage-of-flakes/outputs). This flake is relatively simplistic. We can use flakes to build VM images, docker images, packages, run GUI dev shells, formatting, hydra, process management, NixOS, and more. We hope this is a useful resource.

Once again these Nix tools are currently optional. Using them should streamline development, but feel free to install packages through your OS or preferred method.

## TapisUI supporting packages

Much of the functionality and components used in TapisUI exist as their own NPM packages.
This enables developers to use TapisUI features and ui in their own projects. These packages are located in the `lib` directory in the root of TapisUI. There are 4 main packages.

- **tapisui-common** - This package contains the generic components used in TapisUI as well as components specific to core Tapis services. These Tapis-specific components fetch data from Tapis services and render useful UI such as a file navigator for Tapis Systems, the Tapis Job Launcher Wizard, and more.
- **tapisui-api** - A package of function that make API calls directly to Tapis services
- **tapisui-hooks** - A package of hooks that use the **tapisui-api** library to fetch and mutate data as well as handle errors generated during API calls. With these hooks, developers can tie UI into the lifecycle of an API request via properties such as `isLoading`, `isSuccess`, `isError`, and more.
- **tapisui-extensions-core** - A library for building extensions and plugins to TapisUI
- **tapisui-extensions-devtools** - Devtools when working with tapisui-extensions

## Learn More

- [TapisUI wiki](https://github.com/tapis-project/tapis-ui/wiki) for help with deployment and developing extensions
- [Tapis documentation](https://tapis.readthedocs.io/en/latest/contents.html) for more information on Tapis
- [Tapis live-docs](https://tapis-project.github.io/live-docs) for OpenAPI V3 endpoint descriptions for all services (which UI makes use of)
