import { Apps, Jobs } from '@tapis/tapis-typescript';


export const generateJobAppArg = (appArg: Apps.AppArgSpec): Jobs.JobArgSpec => {
  return {
    arg: appArg.arg,
    description: appArg.description,
    include: appArg.inputMode !== Apps.ArgInputModeEnum.IncludeOnDemand,
    name: appArg.name
  }
}


export const getAppArgMode = (name: string, appArgs: Array<Apps.AppArgSpec>): Apps.ArgInputModeEnum | undefined => {
  const appArg: Apps.AppArgSpec | undefined = appArgs.find(
    (appArg) => appArg.name === name
  );
  if (!appArg) {
    return undefined;
  }
  return appArg.inputMode;
}


export const generateJobAppArgsFromSpec = (appArgs: Array<Apps.AppArgSpec>): Array<Jobs.JobArgSpec> => {
  return appArgs.map(appArg => generateJobAppArg(appArg));
}