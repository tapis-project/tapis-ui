{
  description = "TapisUI DevEnv";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        commonPackages = [
          pkgs.gnugrep
          pkgs.nodejs_22
          pkgs.nodePackages.npm
          #pkgs.pnpm
          pkgs.git
          pkgs.xdg-utils
          pkgs.which
          pkgs.ripgrep
          pkgs.fd
          #pkgs.coreutils # clear is not provided # gives clear and other stuff!
        ];
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

          echo -e "\nnpm run commands:
          ==========================
            - npm run: list all available npm scripts
            - npm run init-project: Install all dependencies in root and subpackages, should be ran first
            - npm run init-project twice: Runs twice to fix problems on our side with install packages of subpackages
            - npm run dev: Start the hot-reloading dev server
            - npm run docker: docker build and deploy
            - npm run test: Run all tests
            - npm run prettier: Ran by 'dev', but should be done before commit
            - npm run watcher: Ran by 'dev', watch and rebuild if any changes are made to the source code

          Common commands:
          ==========================
            - welcome: callable from nix shell, shows this help message
            - welcome --version: shows npm and node version + welcome
            - nix develop -i: --ignore-environment to isolate nix shell from user env
            - nix develop .#welcome: runs welcome version in nix shell
          "
        '';
        
      in {
        devShells = {
          default = pkgs.mkShell {
            packages = commonPackages ++ [
              tapisWelcome
            ];
            shellHook = ''
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
        # packages = {
        #   # We could create packages for scripts here
        #   welcome = tapisWelcome;
        #   default = pkgs.stdenv.mkDerivation {
        #     name = "tapis-docs";
        #     src = ./.;
        #     buildInputs = commonPackages;
        #     buildPhase = ''
        #       make html
        #     '';
        #     installPhase = ''
        #       mkdir -p $out
        #       cp -r build/html $out/
        #     '';
        #   };
        # };
      }
    );
}
