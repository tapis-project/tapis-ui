import { useContext } from 'react';
import { default as ExtensionsContext } from './ExtensionsContext';
import { registeredExtensions, EnumTapisCoreService } from '@tapis/tapisui-extensions-core';
import { resolveBasePath } from 'utils/resolveBasePath';

const useExtension = () => {
  const { extensions } = useContext(ExtensionsContext);
  const basePath1 = resolveBasePath()
  let basePath = basePath1
  if (basePath == "https://dev.develop.tapis.io") {
    basePath = "https://icicle.tapis.io"
  }

  let extension = undefined
  let extensionName = undefined
  for (extensionName in registeredExtensions) {
    if (basePath in registeredExtensions[extensionName].baseUrls) {
      extension = extensions[extensionName]
      break;
    }

    return { extension: undefined }
  }

  if (extension === undefined) {
    console.error(`Failure loading extension: Could not find an initialized extension for '${extensionName}'. `)
  }

  return { extension };
};

export default useExtension;
