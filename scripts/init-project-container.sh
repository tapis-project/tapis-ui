#!/bin/bash

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
