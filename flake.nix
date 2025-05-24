{
  description = "TapisUI DevEnv";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    pnpm2nix.url = "github:nzbr/pnpm2nix-nzbr";
  };

  outputs = { self, nixpkgs, flake-utils, pnpm2nix }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        commonPackages = [
          pkgs.gnugrep
          pkgs.nodejs_22
          #pkgs.nodePackages.npm
          pkgs.pnpm
          pkgs.git
          pkgs.xdg-utils
          pkgs.which
          pkgs.ripgrep
          pkgs.fd
          #pkgs.coreutils # clear is not provided # gives clear and other stuff!
        ] ++ pkgs.lib.optional pkgs.stdenv.isDarwin pkgs.darwin.cctools; # Example: add Darwin-specific tools if needed

        NPM_CONFIG_PREFIX = "${toString ./.}/npm_config_prefix";
        
        # Using builtins.replaceStrings to convert newlines to their escaped form for the shell
        helpText = ''
          Useful to have help text to refer to in nix. I just use scripts now, but this example stays.
        '';
        # Convert newlines to literal \n for shell echo -e
        tapisuiHelpMsg = builtins.replaceStrings ["\n"] ["\\n"] helpText;

        # Create a unified welcome script package with an optional version parameter
        tapisWelcome = pkgs.writeScriptBin "welcome" ''
          #!${pkgs.bash}/bin/bash
          echo -e "Entering TapisUI development environment..."

          # if input $1 is version or --version, show npm and node version
          if [[ "$1" == "version" || "$1" == "--version" ]]; then
            NPM_VERSION=$(${pkgs.nodePackages.npm}/bin/npm --version)
            NODE_VERSION=$(${pkgs.nodejs_22}/bin/node --version)
            echo -e "npm: $NPM_VERSION"
            echo -e "node: $NODE_VERSION"
          fi

          echo -e "\npnpm run commands:
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
          "
        '';
        
        inherit (pnpm2nix.packages.${system}) mkPnpmPackage;

        frontend = mkPnpmPackage {
          pname = "tapisui";
          version = "1.0.0";
          src = ./.;
          nodejs = pkgs.nodejs_22;
          pnpm = pkgs.pnpm;
          #extraBuildInputs = commonPackages;
          nativeBuildInputs = commonPackages;
          configurePhase = ''
            export HOME=$TMPDIR
            pnpm install --frozen-lockfile
            '';
          buildPhase = ''
            export HOME=$TMPDIR
            pnpm install --frozen-lockfile
            pnpm run build
          '';
        };
      in {
        devShells = {
          default = pkgs.mkShell {
            packages = commonPackages ++ [
              tapisWelcome
            ];
            shellHook = ''
              #alias npm=pnpm
              #export NPM_CONFIG_PREFIX=${NPM_CONFIG_PREFIX}
              #export PATH="${NPM_CONFIG_PREFIX}/bin:$PATH"
              #export CHOKIDAR_USEPOLLING=true
              #export SHELL=$(which zsh)
              #ulimit -n 2000
              welcome version
            '';
          };
          welcome = pkgs.mkShell {
            packages = commonPackages ++ [ tapisWelcome ];
            shellHook = ''
              # Just show the help message and exit
              welcome version
              exit
            '';
          };
        };
        packages = {
          inherit frontend;
          # Default build using pnpm
          default = pkgs.stdenv.mkDerivation {
            name = "tapisui-build";
            src = ./.;
            buildInputs = commonPackages;
            buildPhase = ''
              export HOME=$TMPDIR
              pnpm install --frozen-lockfile
              pnpm run build --verbose
            '';
            installPhase = ''
              mkdir -p $out
              cp -r dist/* $out/
            '';
          };
          carl = pkgs.stdenv.mkDerivation rec {
            pname = "frontend";
            version = "1.0.0";
            src = ./.;

            nativeBuildInputs = commonPackages;

            buildPhase = ''
              pnpm install --frozen-lockfile
              pnpm run build
            '';

            installPhase = ''
              mkdir -p $out
              cp -r dist/* $out/
            '';
          };
          # GitHub Pages build for Github actions
          github-pages = pkgs.stdenv.mkDerivation {
            name = "tapisui-gh-pages";
            src = ./.;
            buildInputs = commonPackages;
            buildPhase = ''
              export HOME=$TMPDIR
              pnpm install --frozen-lockfile
              pnpm run gh-pages
            '';
            installPhase = ''
              mkdir -p $out
              # Assuming gh-pages outputs to ./build
              cp -r build/* $out/
            '';
          };
        };
      }
    );
}
