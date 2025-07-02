{
  description = "TapisUI DevEnv";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    #pnpm2nix.url = "github:nzbr/pnpm2nix-nzbr";
  };

  outputs = { self, nixpkgs, flake-utils }:
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

        # menu script package with an optional version parameter
        tapisMenu = pkgs.writeScriptBin "menu" ''
          #!${pkgs.bash}/bin/bash
          echo -e "\033[34mEntering TapisUI development environment...\033[0m"

          # if input $1 is version or --version, show npm and node version
          if [[ "$1" == "version" || "$1" == "--version" ]]; then
            NPM_VERSION=$(${pkgs.nodePackages.npm}/bin/npm --version)
            NODE_VERSION=$(${pkgs.nodejs_22}/bin/node --version)
            PNPM_VERSION=$(${pkgs.pnpm}/bin/pnpm --version)
            echo -e "npm: $NPM_VERSION"
            echo -e "pnpm: $PNPM_VERSION"
            echo -e "node: $NODE_VERSION"
          fi

          echo -e "\nDevelopment commands:
          ==========================
            - pnpm run init-project: initialize tapis-ui project, creates .env, installs deps, and runs
            - pnpm run dev: Start a hot-reloading dev server + auto-prettier
            - pnpm install: install all rootpkg and subpkg dependencies from one module location
            - pnpm -r build: Build the rootpkg (-r to build all subpkgs)
            - pnpm run docker: docker build and deploy
            - pnpm run test: Run all tests
            - pnpm run prettier: Loop ran by dev, but should be ran before commit always
            - pnpm run prettier-loop: Ran by dev, prettier every 5 minutes
            - pnpm up -r @tapis/tapis-typescript@0.0.56: Update all pkgs with a specific lib version

          Other commands:
          ==========================
            - menu: callable from nix shell, shows this help message
            - menu --version: shows npm and node version + menu
            - nix develop -i: --ignore-environment to isolate nix shell from user env
            - nix develop .#menu: runs 'menu version' in nix shell
            - nix flake show: to view flake outputs
            - pnpm run: list all pnpm scripts in root package.json
            - pnpm -r build | list | audit | outdated: cool commands, run pnpm for more info
          "
        '';
        
        # Create a welcome alias that points to menu
        tapisWelcome = pkgs.writeScriptBin "welcome" ''
          #!${pkgs.bash}/bin/bash
          echo -e "\033[31m'welcome' is deprecated, use 'menu' instead.\033[0m"
          ${tapisMenu}/bin/menu "$@"
        '';
        
        ## This doesn't use anything yet, but might be a replacement for default mkDerivation
        # inherit (pnpm2nix.packages.${system}) mkPnpmPackage;
        # frontend = mkPnpmPackage {
        #   pname = "tapisui";
        #   version = "1.0.0";
        #   src = ./.;
        #   nodejs = pkgs.nodejs_22;
        #   pnpm = pkgs.pnpm;
        #   #extraBuildInputs = commonPackages;
        #   nativeBuildInputs = commonPackages;
        #   configurePhase = ''
        #     export HOME=$TMPDIR
        #     pnpm install --frozen-lockfile
        #     '';
        #   buildPhase = ''
        #     export HOME=$TMPDIR
        #     pnpm install --frozen-lockfile
        #     pnpm run build
        #   '';
        # };
      in {
        devShells = {
          default = pkgs.mkShell {
            packages = commonPackages ++ [
              tapisMenu
              tapisWelcome
            ];
            shellHook = ''
              alias npm="echo -e '\033[33mHowdy! We use pnpm round these parts. Seem to have found you using npm. More details in readme.\033[0m' && npm"
              #alias npm=pnpm
              #export NPM_CONFIG_PREFIX=${NPM_CONFIG_PREFIX}
              #export PATH="${NPM_CONFIG_PREFIX}/bin:$PATH"
              #export CHOKIDAR_USEPOLLING=true
              #export SHELL=$(which zsh)
              #ulimit -n 2000
              menu version
            '';
          };
          menu = pkgs.mkShell {
            packages = commonPackages ++ [ tapisMenu tapisWelcome ];
            shellHook = ''
              # Just show the help message and exit
              menu version
              exit
            '';
          };
        };
        packages = {
          #inherit frontend;
          # You can run default mkDerivation with `nix build .#default`
          # Default build using pnpm
          default = pkgs.stdenv.mkDerivation {
            name = "tapisui-build";
            src = ./.;
            buildInputs = commonPackages;
            buildPhase = ''
              echo "This doesn't work. :) Use 'nix develop' to enter the dev shell and run pnpm commands instead."
              export HOME=$TMPDIR
              pnpm install --frozen-lockfile
              pnpm run build --verbose
            '';
            installPhase = ''
              mkdir -p $out
              cp -r dist/* $out/
            '';
          };
        };
      }
    );
}
