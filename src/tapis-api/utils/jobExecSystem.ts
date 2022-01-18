import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';

export const generateDefaultSystemAttributes = (
  app: Apps.TapisApp,
  systems: Array<Systems.TapisSystem>
): Partial<Jobs.ReqSubmitJob> => {
  const specifiedSystem = systems.find(system => system.id === app.jobAttributes?.execSystemId) ?? undefined;
  return({
    execSystemId: app.jobAttributes?.execSystemId,
    execSystemLogicalQueue: app.jobAttributes?.execSystemLogicalQueue 
      ?? specifiedSystem?.batchDefaultLogicalQueue ?? undefined
  })
}