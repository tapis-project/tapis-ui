import { Apps, Jobs } from '@tapis/tapis-typescript';


export const generateJobAppArg = (appArg: Apps.AppArgSpec): Jobs.JobArgSpec => {
  return {
    arg: appArg.arg,
    description: appArg.description,
    include: appArg.inputMode !== Apps.ArgInputModeEnum.IncludeOnDemand,
    name: appArg.name
  }
}


export const getAppArgMode = (name: string, app: Apps.TapisApp): Apps.ArgInputModeEnum | undefined => {
  const appArg: Apps.AppArgSpec | undefined = app.jobAttributes?.parameterSet?.appArgs?.find(
    (appArg) => appArg.name === name
  );
  if (!appArg) {
    return undefined;
  }
  return appArg.inputMode;
}


export const generateJobAppArgsFromSpec = (app: Apps.TapisApp): Array<Jobs.JobArgSpec> => {
  return (
    app.jobAttributes?.parameterSet?.appArgs
      ? [] as Array<Jobs.JobArgSpec>
      : app.jobAttributes!.parameterSet!.appArgs!.map(
        (appArg) => generateJobAppArg(appArg)
      )
  )
}