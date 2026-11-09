import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import { fileInputsComplete } from '@tapis/tapisui-common';
import { fileInputArraysComplete } from '@tapis/tapisui-common';
import { jobRequiredFieldsComplete } from '@tapis/tapisui-common';
import { flattenErrors, findFlagIndex, parseFlagValue } from './utils';
import { sectionForField } from './sections/meta';
import { FIELD_SPECS } from './sections/schedulerFlags';

export type Blocker = {
  /** Section the user should be sent to */
  sectionId: string;
  label: string;
  message: string;
  /**
   * The same complaint at nav width. A nav row is ~200px and already carries
   * a label and a badge, so the second and third sentences of a message have
   * nowhere to go; this is the clause that identifies the problem, and the
   * full message waits on the review board.
   */
  short: string;
  /**
   * For a scheduler flag left holding a placeholder, the formik path of its
   * include checkbox: the box the message's "or uncheck Include" means. The
   * review board used to press it for you and no longer does (it got
   * pressed out of fidget); the message says it and the row links there.
   */
  includePath?: string;
};

/**
 * The first sentence, without its full stop. Validation messages lead with
 * what is wrong and follow with what to do about it, so the lead is exactly
 * the short form ("This value is still a placeholder").
 */
export const firstSentence = (message: string): string => {
  const end = /\.(\s|$)/.exec(message);
  return (end ? message.slice(0, end.index) : message).trim();
};

/**
 * Nav wording for the handful of messages whose first sentence is still the
 * long way round.
 *
 * A form field can afford "This app does not have a default execution system.
 * You must specify one for this job"; a nav row wants the fact, which is that
 * one is required. Keyed on the whole message rather than the field, because
 * three different things go wrong with execSystemId and they are not the same
 * complaint. A message that changes falls back to its own first sentence
 * rather than to a wrong rewrite.
 */
const NAV_SHORT: Record<string, string> = {
  'This app does not have a default execution system. You must specify one for this job':
    'An execution system is required',
  'Neither the application nor the selected system specifies a default queue. You must specify one for this job':
    'A logical queue is required',
  'The specified exec system is not capable of batch jobs':
    'This system cannot run batch jobs',
  'The selected system does not have any batch logical queues':
    'This system has no batch queues',
  'The specified queue does not exist on the selected execution system':
    'That queue is not on this system',
  'The specified queue cannot be found on the selected system':
    'That queue is not on this system',
};

export const navShort = (message: string): string =>
  NAV_SHORT[message] ?? firstSentence(message);

/**
 * Which named scheduler flag each `schedulerOptions.N` row holds.
 *
 * A validation error on `parameterSet.schedulerOptions.2.arg` says "this
 * value", which is fine standing next to the row it came from and useless in
 * a nav column, where three of them read the same. The flags we give a field
 * of their own have a label, so the row can be named.
 */
export const flagLabelsByIndex = (
  options: Array<{ arg?: string }>
): Record<number, string> => {
  const labels: Record<number, string> = {};
  FIELD_SPECS.forEach((spec) => {
    const index = findFlagIndex(options, spec.flags);
    if (index >= 0) labels[index] = spec.label;
  });
  return labels;
};

/** `parameterSet.schedulerOptions.3.arg` -> 3 */
export const schedulerIndexOf = (path: string): number | undefined => {
  const match = /^parameterSet\.schedulerOptions\.(\d+)\.arg$/.exec(path);
  return match ? Number(match[1]) : undefined;
};

/** `parameterSet.schedulerOptions.3.arg` -> `...3.include` */
export const includePathFor = (path: string): string | undefined => {
  const match = /^(parameterSet\.schedulerOptions\.\d+)\.arg$/.exec(path);
  return match ? `${match[1]}.include` : undefined;
};

/**
 * Everything standing between the current form state and a submittable job,
 * in one list. The V1 wizard scattered these across per-step summaries; here
 * they are gathered so "why is Submit disabled?" is answerable at a glance.
 */
export const computeBlockers = ({
  values,
  errors,
  app,
}: {
  values: Partial<Jobs.ReqSubmitJob>;
  errors: any;
  app: Apps.TapisApp;
  systems: Array<Systems.TapisSystem>;
}): Array<Blocker> => {
  const options = values.parameterSet?.schedulerOptions ?? [];
  const flagLabels = flagLabelsByIndex(options);
  // "This value is still a placeholder" is three identical complaints when
  // three flags are wrong. Where the row is one of the named flags, say which.
  const named = (path: string, message: string) => {
    const index = schedulerIndexOf(path);
    const label = index != null ? flagLabels[index] : undefined;
    return label && message.startsWith('This value ')
      ? `${label} ${message.slice('This value '.length)}`
      : message;
  };

  const blockers: Array<Blocker> = flattenErrors(errors).map((entry) => {
    const message = named(entry.path, entry.message);
    return {
      sectionId: sectionForField(entry.path)?.id ?? 'review',
      label: entry.path,
      message,
      short: navShort(message),
      includePath: includePathFor(entry.path),
    };
  });

  // Included, and the flag is there with nothing after it. Not a placeholder,
  // so the placeholder rule misses it, and assembleJob sends a bare `-A` that
  // the scheduler refuses. Only the flags that take a value are checked:
  // plenty of scheduler options (--exclusive) are legitimately bare.
  FIELD_SPECS.forEach((spec) => {
    const index = findFlagIndex(options, spec.flags);
    if (index < 0) return;
    const option = options[index];
    if (!option?.include) return;
    if (parseFlagValue(option.arg, spec.flags).trim()) return;
    blockers.push({
      sectionId: 'scheduler',
      label: `${spec.flags[0]}-empty`,
      message: `${spec.label} is included but has no value, so ${spec.flags[0]} would be sent on its own. Give it a value, or uncheck Include.`,
      short: `${spec.label} is included but empty`,
      includePath: `parameterSet.schedulerOptions.${index}.include`,
    });
  });

  if (!jobRequiredFieldsComplete(values)) {
    blockers.push({
      sectionId: 'basics',
      label: 'name',
      message: 'A job name is required',
      short: 'A job name is required',
    });
  }

  if (!fileInputsComplete(app, values.fileInputs ?? [])) {
    blockers.push({
      sectionId: 'inputs',
      label: 'fileInputs',
      message:
        'This app has required file inputs that are not present on the job',
      short: 'A required file input is missing',
    });
  }

  if (!fileInputArraysComplete(app, values.fileInputArrays ?? [])) {
    blockers.push({
      sectionId: 'inputs',
      label: 'fileInputArrays',
      message:
        'This app has required file input arrays that are not present on the job',
      short: 'A required file input array is missing',
    });
  }

  // Dedupe: a missing name shows up both as a schema error and as a
  // required-field check
  const seen = new Set<string>();
  return blockers.filter((blocker) => {
    const key = `${blocker.sectionId}:${blocker.label}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};
