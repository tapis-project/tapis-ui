#!/bin/bash

#### USE WITH
# npm run init-project none - to not delete anything
# npm run init-project modules - to delete only node_modules and dist dirs
# npm run init-project locks - to delete only package-lock.json
# npm run init-project all - to delete all of the above
####

NODE_VERSION=22
NPM_VERSION=10

declare -a programs=(git node)

for program in "${programs[@]}"; do
  which $program >> /dev/null
  if [[ $? > 0 ]]; then
    echo "$program must be installed"
    exit 1
  fi;
done

if [[ $(node --version) != *"${NODE_VERSION}"* ]]; then
  echo "You must install node version $NODE_VERSION. Run \`nvm install $NODE_VERSION\`"
  exit 1
fi;

if [[ $(npm --version) != *"${NPM_VERSION}"* ]]; then
  echo "You must install npm version $NPM_VERSION"
  exit 1
fi;

delete_files() {
  local flag=${1:-"all"}  # Set default value to "all" if no flag is provided
  case $flag in
    "all")
      rm -rf dist node_modules package-lock.json
      ;;
    "none")
      ;;
    "modules")
      rm -rf dist node_modules
      ;;
    "locks")
      rm -rf package-lock.json
      ;;
    *)
      echo "Invalid flag: $flag Must specify 'all', 'none', 'modules', or 'locks'"
      exit 1
      ;;
  esac
}


# Remove below to improve speed of project initalization
rm -rf /tmp/tapisui-extensions-core/

# Directories to build
dirs=(
  "lib/tapisui-api"
  "lib/tapisui-hooks"
  "lib/tapisui-common"
  "lib/tapisui-extensions-core"
  "lib/icicle-tapisui-extension"
  ""
)

for dir in "${dirs[@]}"; do
  cd "$dir" || exit 1
  echo "$(pwd)"
  echo "#############################################################"
  delete_files "$1"
  npm install
  ## "" is the root directory, it doesn't build, and it shouldn't cd ../../.
  if [[ -n "$dir" ]]; then
    npm run build # just breaking currently. When working, can probably add somehow.
    cd ../../ || exit 1
  fi
done

echo "$(pwd)"

npm run start