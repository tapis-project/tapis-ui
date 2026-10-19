# syntax=docker/dockerfile:1.7-labs
FROM nixos/nix:2.26.4 as build-stage

WORKDIR /tapisui

# ── Layer 1: Nix closure (cached unless flake.nix/flake.lock change) ──
COPY flake.nix flake.lock ./
RUN nix --extra-experimental-features 'nix-command flakes' develop --command true

# ── Layer 2: Node dependencies (cached unless lockfile/workspace change) ──
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy only package.json from each workspace package for pnpm install
COPY packages/tapisui-api/package.json packages/tapisui-api/
COPY packages/tapisui-common/package.json packages/tapisui-common/
COPY packages/tapisui-hooks/package.json packages/tapisui-hooks/
COPY packages/tapisui-extensions-core/package.json packages/tapisui-extensions-core/
COPY packages/tapisui-extension-devtools/package.json packages/tapisui-extension-devtools/
COPY packages/demo-tapisui-extension/package.json packages/demo-tapisui-extension/
COPY packages/example-extension/package.json packages/example-extension/
COPY packages/icicle-tapisui-extension/package.json packages/icicle-tapisui-extension/
COPY packages/scoped-tapisui-extension/package.json packages/scoped-tapisui-extension/
RUN nix --extra-experimental-features 'nix-command flakes' develop --command pnpm install --frozen-lockfile

# ── Layer 3: Source + build (only this reruns on code changes) ──
COPY \
  --exclude=**node_modules* \
  --exclude=**dist* \
  --exclude=./.vscode \
  --exclude=./__pycache__ \
  --exclude=./__mocks__ \
  --exclude=./.jj \
  --exclude=./.github \
  --exclude=./build \
  --exclude=./deploy \
  ./ ./
RUN nix --extra-experimental-features 'nix-command flakes' develop --command bash -c 'pnpm -r build && pnpm build'

FROM nginx:alpine as production-stage
COPY --from=build-stage /tapisui/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
