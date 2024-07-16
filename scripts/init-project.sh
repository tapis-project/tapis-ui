#!/bin/bash

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
    echo "You must install node version 22. run \`nvm install 22\`"
    exit 1
fi;

if [[ $(npm --version) != *"${NPM_VERSION}"* ]]; then
    echo "You must install npm version 10"
    exit 1
fi;

# Remove below to improve speed of project initalization
rm -rf /tmp/tapisui-extensions-core/

cd lib/tapisui-api
echo $(pwd)
rm -rf dist node_modules
rm package-lock.json
npm install
npm run build
cd ../../

cd lib/tapisui-hooks
echo $(pwd)
rm -rf dist node_modules
rm package-lock.json
npm install
npm run build
cd ../../

cd lib/tapisui-common
echo $(pwd)
rm -rf dist node_modules
rm package-lock.json
npm install
npm run build
cd ../../

cd lib/tapisui-extensions-core
echo $(pwd)
rm -rf dist node_modules
rm package-lock.json
npm install
npm run build
cd ../../

cd lib/icicle-tapisui-extension
echo $(pwd)
rm -rf dist node_modules
rm package-lock.json
npm install
npm run build
cd ../../

echo $(pwd)
npm install
npm run start