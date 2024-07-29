#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ROOT_DIR=$(dirname $SCRIPT_DIR)
LIB_DIR="${ROOT_DIR}/packages"

runTest() {
  # Run the api tests
  cd $1
  npm run test
  testExitCode=$?
  if [[ $testExitCode != 0 ]]; then
    exit $testExitCode
  fi;
  cd $ROOT_DIR
}

runTest packages/tapisui-hooks && runTest packages/tapisui-api # && runTest lib/tapisui-common
