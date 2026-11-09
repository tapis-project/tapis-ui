import { Apps, Jobs } from '@tapis/tapis-typescript';

type JobValues = Partial<Jobs.ReqSubmitJob>;

/** Puts `kept` back at the indexes they had in `before`, around `after`. */
const reinsert = <T>(after: T[], before: T[], isKept: (row: T) => boolean) => {
  const out = [...after];
  before.forEach((row, index) => {
    if (isKept(row)) out.splice(Math.min(index, out.length), 0, row);
  });
  return out;
};

/**
 * The job edited as JSON, with the app's FIXED rows put back.
 *
 * The JSON editor shows the job as it will be submitted, and assembleJob
 * leaves FIXED file inputs, arguments and environment variables out of that
 * (the service supplies them and refuses a job that restates one). Applying
 * the edit replaces the form's values, so without this the FIXED rows the
 * form shows would vanish for the rest of the session. They go back where
 * they were; anything the edit added or changed stays as edited.
 */
export const keepFixedRows = (
  next: JobValues,
  current: JobValues,
  app?: Apps.TapisApp
): JobValues => {
  const attrs = app?.jobAttributes;
  if (!attrs || !next || typeof next !== 'object') return next;
  const merged: JobValues = { ...next };

  const fixedInputs = (
    specs?: Array<{ name?: string; inputMode?: Apps.FileInputModeEnum }>
  ) =>
    new Set(
      (specs ?? [])
        .filter((spec) => spec.inputMode === Apps.FileInputModeEnum.Fixed)
        .map((spec) => spec.name)
    );
  (
    [
      ['fileInputs', fixedInputs(attrs.fileInputs)],
      ['fileInputArrays', fixedInputs(attrs.fileInputArrays)],
    ] as const
  ).forEach(([key, fixed]) => {
    const before = (current[key] ?? []) as Array<{ name?: string }>;
    if (!fixed.size || !before.length) return;
    const after = ((next[key] ?? []) as Array<{ name?: string }>).filter(
      (row) => !fixed.has(row.name ?? '')
    );
    (merged as any)[key] = reinsert(after, before, (row) =>
      fixed.has(row.name ?? '')
    );
  });

  const declared = attrs.parameterSet;
  const currentSet = current.parameterSet as Record<string, any> | undefined;
  if (!declared || !currentSet) return merged;
  const set: Record<string, any> = { ...(next.parameterSet ?? {}) };

  const fixedArgs = (specs?: Array<Apps.AppArgSpec>) =>
    new Set(
      (specs ?? [])
        .filter((spec) => spec.inputMode === Apps.ArgInputModeEnum.Fixed)
        .map((spec) => spec.name)
    );
  (
    [
      ['appArgs', fixedArgs(declared.appArgs)],
      ['containerArgs', fixedArgs(declared.containerArgs)],
      ['schedulerOptions', fixedArgs(declared.schedulerOptions)],
    ] as const
  ).forEach(([key, fixed]) => {
    const before = (currentSet[key] ?? []) as Array<Jobs.JobArgSpec>;
    if (!fixed.size || !before.length) return;
    const after = ((set[key] ?? []) as Array<Jobs.JobArgSpec>).filter(
      (row) => !fixed.has(row.name ?? '')
    );
    set[key] = reinsert(after, before, (row) => fixed.has(row.name ?? ''));
  });

  const fixedEnv = new Set(
    (declared.envVariables ?? [])
      .filter(
        (variable) => variable.inputMode === Apps.KeyValueInputModeEnum.Fixed
      )
      .map((variable) => variable.key)
  );
  const beforeEnv = (currentSet.envVariables ?? []) as Array<Jobs.KeyValuePair>;
  if (fixedEnv.size && beforeEnv.length) {
    const after = ((set.envVariables ?? []) as Array<Jobs.KeyValuePair>).filter(
      (row) => !fixedEnv.has(row.key ?? '')
    );
    set.envVariables = reinsert(after, beforeEnv, (row) =>
      fixedEnv.has(row.key ?? '')
    );
  }

  merged.parameterSet = set as Jobs.JobParameterSet;
  return merged;
};
