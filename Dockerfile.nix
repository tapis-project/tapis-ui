# syntax=docker/dockerfile:1.7-labs
FROM nixos/nix:2.26.4 as build-stage

WORKDIR /tapisui

# Copy flake files and source
COPY flake.nix flake.lock ./
COPY \
  --exclude=**node_modules* \
  --exclude=**dist* \
  --exclude=./.vscode \
  --exclude=./__pycache__ \
  --exclude=./__mocks__ \
  --exclude=./.github \
  --exclude=./build \
  --exclude=./deploy \
  ./ ./

# Set up Nix cache for dependencies (optional, but speeds up builds)
RUN nix --extra-experimental-features 'nix-command flakes' develop --command pnpm install
RUN nix --extra-experimental-features 'nix-command flakes' develop --command pnpm -r build

FROM nginx:alpine as production-stage
COPY --from=build-stage /tapisui/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
