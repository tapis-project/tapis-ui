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
      in {
        devShells = {
          default = pkgs.mkShell {
            packages = commonPackages;
            shellHook = ''
              export NPM_CONFIG_PREFIX=${NPM_CONFIG_PREFIX}
              export PATH="${NPM_CONFIG_PREFIX}/bin:$PATH"
              #export CHOKIDAR_USEPOLLING=true
              #export SHELL=$(which zsh)
              #ulimit -n 2000
              echo "Entering TapisUI nix shell..."
              echo -e "npm: $(npm --version) \nnode: $(node --version)"
              echo ""
              echo "Available nix commands:"
              echo "=========================="
              echo "  - nix develop -i: --ignore-environment to isolate nix shell from user env"
              echo "  - nix develop .#help: runs 'make help' to display sphinx options, run 'make <cmd>' from help"
              echo ""
              echo "npm run commands:"
              echo "=========================="
              echo "  - npm run: list all available npm scripts"
              echo "  - npm run init-project: Install all dependencies in root and subpackages, should be ran first"
              echo "  - npm run init-project twice: Runs twice to fix problems on our side with install packages of subpackages"
              echo "  - npm run dev: Start the hot-reloading dev server"
              echo "  - npm run docker: docker build and deploy"
              echo "  - npm run test: Run all tests"
              echo "  - npm run prettier: Ran by 'dev', but should be done before commit"
              echo "  - npm run watcher: Ran by 'dev', watch and rebuild if any changes are made to the source code"
              echo ""
            '';
          help = pkgs.mkShell {
            packages = commonPackages;
            shellHook = ''
              echo "Entering TapisUI nix shell..."
              echo "Available make commands:"
              echo "========================="
              make help
            '';
            };
          };
        };
        # packages = {
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

