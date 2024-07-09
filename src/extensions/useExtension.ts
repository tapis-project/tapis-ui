import { useContext } from "react";
import { default as ExtensionsContext } from "./ExtensionsContext";
import {
  registeredExtensions,
  EnumTapisCoreService,
} from "@tapis/tapisui-extensions-core";
import { resolveBasePath } from "utils/resolveBasePath";
import { CropLandscapeOutlined } from "@mui/icons-material";
import { computeOffsetLeft } from "@mui/x-data-grid/hooks/features/virtualization/useGridVirtualScroller";

const useExtension = () => {
  const { extensions } = useContext(ExtensionsContext);
  let basePath = resolveBasePath();
  let extension = undefined;
  let extensionName = undefined;
  for (extensionName in registeredExtensions) {
    if (registeredExtensions[extensionName].baseUrls.includes(basePath)) {
      extension = extensions[extensionName];
      break;
    }

    return { extension: undefined };
  }

  if (extension === undefined) {
    console.error(
      `Failure loading extension: Could not find an initialized extension for '${extensionName}'. `
    );
  }

  return { extension };
};

export default useExtension;
