import { Apps, Jobs } from '@tapis/tapis-typescript';
import { FIELD_SPECS, readFlag } from './sections/schedulerFlags';

export type Warning = {
  sectionId: string;
  label: string;
  message: string;
  /** the same complaint at nav width; see Blocker.short */
  short: string;
  /** worth interrupting for — see FlagSpec.costly */
  costly: boolean;
  /**
   * The formik path of this flag's include checkbox, so a reader can fix the
   * warning where they met it instead of being sent to find the row.
   */
  includePath?: string;
};

/**
 * Things that will not stop a submission but are almost certainly not what you
 * meant. Kept apart from blockers so the nav can say "wrong" in red and "look
 * at this" in amber, and so a warning never disables Submit.
 *
 * The set-but-not-included flag is the one that actually costs people time:
 * the value is right there on screen, so the form looks correct, and the job
 * runs somewhere other than where you booked it. Each warning is one
 * sentence, what is set and that it will not go; the paragraph of what the
 * scheduler does instead that used to follow it was more than anyone read.
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
      message: `${spec.label} is set to "${state.value}" but not included, so ${spec.flags[0]} will not be sent.`,
      // the flag, not the field label: at nav width the thing that will go
      // missing from the submission is the fact worth spending the room on
      short: `${spec.flags[0]} set but not included`,
      costly: !!spec.costly,
      includePath:
        state.index >= 0
          ? `parameterSet.schedulerOptions.${state.index}.include`
          : undefined,
    }))
    // the ones that change where the run lands come first
    .sort((a, b) => Number(b.costly) - Number(a.costly));
