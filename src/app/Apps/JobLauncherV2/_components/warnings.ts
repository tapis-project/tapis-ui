import { Apps, Jobs } from '@tapis/tapis-typescript';
import { FIELD_SPECS, readFlag } from './sections/schedulerFlags';

export type Warning = {
  sectionId: string;
  label: string;
  message: string;
};

/**
 * Things that will not stop a submission but are almost certainly not what you
 * meant. Kept apart from blockers so the nav can say "wrong" in red and "look
 * at this" in amber, and so a warning never disables Submit.
 */
export const computeWarnings = ({
  values,
  app,
}: {
  values: Partial<Jobs.ReqSubmitJob>;
  app: Apps.TapisApp;
}): Array<Warning> =>
  FIELD_SPECS.map((spec) => ({ spec, state: readFlag(values, app, spec) }))
    .filter(({ state }) => state.setNotIncluded)
    .map(({ spec, state }) => ({
      sectionId: 'scheduler',
      label: spec.flags[0],
      message: `${spec.label} is set to "${state.value}" but not included — it will not be sent to the scheduler.`,
    }));
