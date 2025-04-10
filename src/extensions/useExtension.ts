import { useContext } from "react";
import { default as ExtensionsContext } from "./ExtensionsContext";
import { registeredExtensions, tasks } from "@tapis/tapisui-extensions-core";
import { resolveBasePath } from "utils/resolveBasePath";

const useExtension = () => {
  const { extensions } = useContext(ExtensionsContext);
  let basePath = resolveBasePath();
  let extension = undefined;
  let extensionName = undefined;
  for (extensionName in registeredExtensions) {
    console.log({ extensionName });
    if (registeredExtensions[extensionName].baseUrls.includes(basePath)) {
      extension = extensions[extensionName];
      break;
    }
    extensionName = undefined;
  }

  console.log({ extension, extensionName, services: { workflows: { tasks } } });

  return { extension, extensionName, services: { workflows: { tasks } } };
};

export default useExtension;
