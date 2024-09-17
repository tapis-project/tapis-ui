#!/bin/bash

#### USE WITH
# npm run init-project none - to not delete anything
# npm run init-project modules - to delete only node_modules and dist dirs
# npm run init-project locks - to delete only package-lock.json
# npm run init-project all - to delete all of the above
# npm run init-project container - to delete all of the above AND prevent running npm run start
####

delete_files() {
  case $1 in
    "all")
      rm -rf dist node_modules package-lock.json
      ;;
    "modules")
      rm -rf dist node_modules
      ;;
    "container")
      rm -rf dist node_modules
      ;;
    "none")
      ;;
    "twice")
      ;;
    "locks")
      rm -rf package-lock.json
      ;;
    *)
      echo "Invalid flag: $flag Must specify 'all', 'none', 'modules', 'locks', or 'container'"
      exit 1
      ;;
  esac
}

handle_failure() {
  echo "Error: $2"
  echo "#############################################################"
  echo "####              Initialization Failed                  ####"
  echo "#############################################################"
  exit $1
}

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

flag=${1:-"none"}
install_command="npm ci"
if [[ $flag == "all" || $flag == "locks" || $flag == "twice" ]]; then
  install_command="npm install --verbose"
fi;

echo ""
echo "#############################################################"
echo "####              Initializing TapisUI                   ####"
echo "#############################################################"

# Remove below to improve speed of project initalization
rm -rf /tmp/tapisui-extensions-core/

# Directories to build
dirs=(
  "packages/tapisui-api"
  "packages/tapisui-hooks"
  "packages/tapisui-common"
  "packages/tapisui-extensions-core"
  "packages/tapisui-extension-devtools"
  "packages/icicle-tapisui-extension"
  ""
)

for dir in "${dirs[@]}"; do
  # Change to the current pacakges directory
  cd "$dir" || handle_failure $? "Package directory '${dir}' does not exist"

  echo ""
  echo "#############################################################"
  echo "Preparing package: \"$dir\""
  echo "#############################################################"

  # Delet files according to the flag provided
  delete_files $flag

  # Install all deps in the package.json
  eval "$install_command" || handle_failure $? "Package installation unsuccessful"
  
  # Only build in the packages
  if [[ -n "$dir" ]]; then
    npm run build || handle_failure $? "Build unsuccessful"
    echo "Package build successful: $dir"
    cd ../../
  fi
done

# Running prettier will reformat any code that has been unformatted by the code
# generating scripts in extension packages
npm run prettier

echo ""
echo "#############################################################"
echo "####        TapisUI Initialization Successful            ####"
echo "#############################################################"
echo ""

if [[ $flag != "container" && $flag != "twice" ]]; then
  npm run start
fi