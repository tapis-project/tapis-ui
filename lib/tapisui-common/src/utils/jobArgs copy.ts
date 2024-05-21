import { Apps, Jobs } from '@tapis/tapis-typescript';

export const generateJobArg = (argSpec: Apps.AppArgSpec): Jobs.JobArgSpec => {
  return {
    arg: argSpec.arg,
    description: argSpec.description,
    include: argSpec.inputMode !== Apps.ArgInputModeEnum.IncludeOnDemand,
    name: argSpec.name,
  };
};

export const getArgMode = (
  name: string,
  argSpecs: Array<Apps.AppArgSpec>
): Apps.ArgInputModeEnum | undefined => {
  const spec: Apps.AppArgSpec | undefined = argSpecs.find(
    (argSpec) => argSpec.name === name
  );
  if (!spec) {
    return undefined;
  }
  return spec.inputMode;
};

export const generateJobArgsFromSpec = (
  argSpecs: Array<Apps.AppArgSpec>
): Array<Jobs.JobArgSpec> => {
  return argSpecs.map((argSpec) => generateJobArg(argSpec));
};
