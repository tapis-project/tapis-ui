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
    echo "You must install node version 22"
    exit 1
fi;

if [[ $(npm --version) != *"${NPM_VERSION}"* ]]; then
    echo "You must install npm version 10"
    exit 1
fi;

cd lib/tapisui-api
npm run install
npm run build
cd ../

cd lib/tapisui-hooks
npm run install
npm run build
cd ../

cd lib/tapisui-common
npm run install
npm run build
cd ../

cd lib/tapisui-extensions-core
npm run install
npm run build
cd ../

cd lib/icicle-tapisui-extension
npm run install
npm run build

cd ../../

npm install
npm run start