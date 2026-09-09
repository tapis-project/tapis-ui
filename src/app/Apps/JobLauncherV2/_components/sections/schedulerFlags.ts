import { Apps, Jobs } from '@tapis/tapis-typescript';
import { findFlagIndex, hasPlaceholder, parseFlagValue } from '../utils';

// The scheduler flags that get a field of their own, and the reading of one.
// Shared so the row, the nav badge and the summary all agree on what "set but
// not included" means — the sidebar warning cannot drift from the row that
// raised it.

export type FlagSpec = {
  /** Flags that mean the same thing; the first is what we write back */
  flags: Array<string>;
  /**
   * Plain-word gloss beside the flag. '-A' and '-J' on their own are stunted —
   * you have to already know slurm to read them. Omitted where the flag says
   * it itself ('--reservation').
   */
  gloss?: string;
  label: string;
  placeholder: string;
  helper: string;
  defaultName: string;
  defaultDescription: string;
};

export const PROFILE_FLAG = '--tapis-profile';

export const JOB_NAME: FlagSpec = {
  flags: ['-J', '--job-name'],
  gloss: 'job name',
  label: 'Slurm job name',
  placeholder: 'my-run',
  helper:
    'What the job is called in the scheduler queue (squeue, emails). Separate from the Tapis job name.',
  defaultName: 'Slurm job name',
  defaultDescription: 'Job name shown by the batch scheduler',
};

export const ALLOCATION: FlagSpec = {
  flags: ['-A', '--account', '--allocation'],
  gloss: 'allocation',
  label: 'Allocation (project)',
  placeholder: 'MY-PROJECT-1234',
  helper:
    'The TACC project charged for this job, passed to the scheduler as -A <allocation>. Find yours in the TACC portal under Allocations.',
  defaultName: 'TACC Allocation',
  defaultDescription: 'Project allocation charged for this job',
};

export const RESERVATION: FlagSpec = {
  flags: ['--reservation'],
  label: 'Reservation name',
  placeholder: 'my-reservation',
  helper:
    'Only needed if you were given a reservation name (training, maintenance window, dedicated time). Leave blank otherwise.',
  defaultName: 'TACC Reservation',
  defaultDescription: 'Scheduler reservation to run this job under',
};

export const FIELD_SPECS = [JOB_NAME, ALLOCATION, RESERVATION];

/** Every flag that has a dedicated field above the raw list. */
export const promotedFlags = [
  PROFILE_FLAG,
  ...FIELD_SPECS.flatMap((spec) => spec.flags),
];

export const isPromoted = (option: Jobs.JobArgSpec) =>
  findFlagIndex([option], promotedFlags) === 0;

export type FlagState = {
  index: number;
  option?: Jobs.JobArgSpec;
  value: string;
  include: boolean;
  unresolved: boolean;
  /** What the app shipped for this flag, '' if it shipped nothing */
  declared: string;
  /**
   * The value is real, it is the user's rather than the app's, and it is not
   * going to be sent. An app-declared option with inputMode INCLUDE_ON_DEMAND
   * arrives with include=false, so typing into it is otherwise a silent no-op.
   */
  setNotIncluded: boolean;
};

export const readFlag = (
  values: Partial<Jobs.ReqSubmitJob>,
  app: Apps.TapisApp,
  spec: FlagSpec
): FlagState => {
  const options = values.parameterSet?.schedulerOptions ?? [];
  const index = findFlagIndex(options, spec.flags);
  const option = index >= 0 ? options[index] : undefined;
  const value = parseFlagValue(option?.arg, spec.flags);
  const include = option?.include ?? false;
  const unresolved = hasPlaceholder(value);

  const specs = app.jobAttributes?.parameterSet?.schedulerOptions ?? [];
  const declaredAt = findFlagIndex(specs, spec.flags);
  const declared =
    declaredAt >= 0 ? parseFlagValue(specs[declaredAt].arg, spec.flags) : '';

  return {
    index,
    option,
    value,
    include,
    unresolved,
    declared,
    setNotIncluded:
      !!value.trim() && !unresolved && !include && value !== declared,
  };
};
