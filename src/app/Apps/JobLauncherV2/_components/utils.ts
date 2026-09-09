import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';

export const getSystem = (
  systems: Array<Systems.TapisSystem>,
  systemId?: string
) =>
  !!systemId ? systems.find((system) => system.id === systemId) : undefined;

export const getLogicalQueues = (system?: Systems.TapisSystem) =>
  system?.batchLogicalQueues ?? [];

export const getQueue = (
  systems: Array<Systems.TapisSystem>,
  systemId?: string,
  queueName?: string
) =>
  !!queueName
    ? getLogicalQueues(getSystem(systems, systemId)).find(
        (queue) => queue.name === queueName
      )
    : undefined;

/**
 * Flattens a formik error object into dotted paths, so that a section can ask
 * "does any error live under one of the fields I own?"
 *
 * { parameterSet: { schedulerOptions: [ { arg: 'bad' } ] } }
 *   -> ['parameterSet.schedulerOptions.0.arg']
 */
export type ErrorEntry = { path: string; message: string };

export const flattenErrors = (errors: any, prefix = ''): Array<ErrorEntry> => {
  if (errors === undefined || errors === null) {
    return [];
  }
  if (typeof errors === 'string') {
    return prefix ? [{ path: prefix, message: errors }] : [];
  }
  if (Array.isArray(errors)) {
    return errors.flatMap((entry, index) =>
      flattenErrors(entry, `${prefix}.${index}`)
    );
  }
  if (typeof errors === 'object') {
    return Object.entries(errors).flatMap(([key, value]) =>
      flattenErrors(value, prefix ? `${prefix}.${key}` : key)
    );
  }
  return [];
};

export const flattenErrorPaths = (errors: any, prefix = ''): Array<string> =>
  flattenErrors(errors, prefix).map((entry) => entry.path);

/** True when an error path belongs to one of a section's owned field paths. */
export const errorsForFields = (
  errorPaths: Array<string>,
  fields: Array<string>
) =>
  errorPaths.filter((path) =>
    fields.some((field) => path === field || path.startsWith(`${field}.`))
  );

/**
 * Scheduler options handed down from an app frequently arrive as templates the
 * user is expected to fill in, e.g. `-A <<allocation>>` or
 * `--reservation <reservation name>`. Submitting those verbatim fails at the
 * scheduler, so they are treated as unresolved.
 */
export const PLACEHOLDER_PATTERN = /<<[^<>]*>>|<[^<>]+>|\{\{[^{}]*\}\}/;

export const hasPlaceholder = (value?: string) =>
  !!value && PLACEHOLDER_PATTERN.test(value);

/** Matches an arg against a scheduler flag, e.g. '-A' or '--reservation'. */
const matchesFlag = (arg: string | undefined, flags: Array<string>) => {
  const trimmed = (arg ?? '').trim();
  return flags.some(
    (flag) =>
      trimmed === flag ||
      trimmed.startsWith(`${flag} `) ||
      trimmed.startsWith(`${flag}=`)
  );
};

/** Works for both job options and the app's declared arg specs. */
export const findFlagIndex = (
  options: Array<{ arg?: string }>,
  flags: Array<string>
) => options.findIndex((option) => matchesFlag(option.arg, flags));

/** Pulls the value out of `-A myproject` / `--reservation=res1`. */
export const parseFlagValue = (
  arg: string | undefined,
  flags: Array<string>
) => {
  const trimmed = (arg ?? '').trim();
  const flag = flags.find(
    (candidate) =>
      trimmed === candidate ||
      trimmed.startsWith(`${candidate} `) ||
      trimmed.startsWith(`${candidate}=`)
  );
  if (!flag) {
    return '';
  }
  return trimmed
    .slice(flag.length)
    .replace(/^[=\s]+/, '')
    .trim();
};

const NUMERIC_FIELDS: Array<keyof Jobs.ReqSubmitJob> = [
  'nodeCount',
  'coresPerNode',
  'memoryMB',
  'maxMinutes',
];

const isEmpty = (value: any) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

const prune = (obj: Record<string, any>): Record<string, any> =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => !isEmpty(value))
  );

/**
 * Turns the live form state into the request body. Formik keeps number inputs
 * as strings and empty optional fields as '', neither of which belongs in a
 * job submission, so they are coerced and dropped here.
 *
 * Given the app, it also leaves out everything the app declared FIXED. The
 * service injects fixed arguments, variables and file inputs from the app
 * definition itself, and rejects a job that restates one with so much as a
 * differing notes field (JOBS_FIXED_ARG_ERROR) or a resolved targetPath
 * (JOBS_FIXED_INPUT_ERROR) — a fidelity a form round-trip cannot promise.
 * Fixed rows stay visible in the form; they are simply not the job's to say.
 */
export const assembleJob = (
  values: Partial<Jobs.ReqSubmitJob>,
  app?: Apps.TapisApp
): Partial<Jobs.ReqSubmitJob> => {
  const job: Partial<Jobs.ReqSubmitJob> = { ...values };

  NUMERIC_FIELDS.forEach((field) => {
    const value = job[field] as unknown;
    if (value === '' || value === undefined || value === null) {
      delete job[field];
    } else {
      (job as any)[field] = Number(value);
    }
  });

  if (job.jobType === Apps.JobTypeEnum.Fork) {
    delete job.execSystemLogicalQueue;
  }
  if (job.isMpi) {
    delete job.cmdPrefix;
  } else {
    delete job.mpiCmd;
  }

  // The FIXED-args bargain, for file inputs: the service injects an app's
  // FIXED inputs itself and refuses a job that restates one with any field
  // different (JOBS_FIXED_INPUT_ERROR) — and a seeded job restates them
  // RESOLVED, its stored targetPath expanded, which reads as a change.
  const declaredAttrs = app?.jobAttributes;
  if (declaredAttrs) {
    const fixedInputNames = (
      specs?: Array<{ name?: string; inputMode?: Apps.FileInputModeEnum }>
    ) =>
      new Set(
        (specs ?? [])
          .filter((spec) => spec.inputMode === Apps.FileInputModeEnum.Fixed)
          .map((spec) => spec.name)
      );
    const fixedInputs = fixedInputNames(declaredAttrs.fileInputs);
    if (fixedInputs.size && job.fileInputs?.length) {
      job.fileInputs = job.fileInputs.filter(
        (input) => !fixedInputs.has(input.name ?? '')
      );
    }
    const fixedArrays = fixedInputNames(declaredAttrs.fileInputArrays);
    if (fixedArrays.size && job.fileInputArrays?.length) {
      job.fileInputArrays = job.fileInputArrays.filter(
        (input) => !fixedArrays.has(input.name ?? '')
      );
    }
  }

  if (job.parameterSet) {
    // Rows added with '+ Add' and never filled in are carried in the form so
    // they keep their place in the list, but they are not part of the job.
    const withoutBlanks: Record<string, any> = { ...job.parameterSet };
    (['appArgs', 'containerArgs', 'schedulerOptions'] as const).forEach(
      (key) => {
        const rows = withoutBlanks[key] as Array<Jobs.JobArgSpec> | undefined;
        if (rows) {
          withoutBlanks[key] = rows.filter(
            (row) => row.arg?.trim() || row.name?.trim()
          );
        }
      }
    );
    if (withoutBlanks.envVariables) {
      withoutBlanks.envVariables = (
        withoutBlanks.envVariables as Array<{ key?: string; value?: string }>
      ).filter((row) => row.key?.trim() || row.value?.trim());
    }

    const declared = app?.jobAttributes?.parameterSet;
    if (declared) {
      const fixedArgs = (specs?: Array<Apps.AppArgSpec>) =>
        new Set(
          (specs ?? [])
            .filter((spec) => spec.inputMode === Apps.ArgInputModeEnum.Fixed)
            .map((spec) => spec.name)
        );
      (
        [
          ['appArgs', declared.appArgs],
          ['containerArgs', declared.containerArgs],
          ['schedulerOptions', declared.schedulerOptions],
        ] as const
      ).forEach(([key, specs]) => {
        const fixed = fixedArgs(specs);
        const rows = withoutBlanks[key] as Array<Jobs.JobArgSpec> | undefined;
        if (rows && fixed.size) {
          withoutBlanks[key] = rows.filter((row) => !fixed.has(row.name ?? ''));
        }
      });

      const fixedEnv = new Set(
        (declared.envVariables ?? [])
          .filter(
            (variable) =>
              variable.inputMode === Apps.KeyValueInputModeEnum.Fixed
          )
          .map((variable) => variable.key)
      );
      if (fixedEnv.size && withoutBlanks.envVariables) {
        withoutBlanks.envVariables = (
          withoutBlanks.envVariables as Array<Jobs.KeyValuePair>
        ).filter((row) => !fixedEnv.has(row.key ?? ''));
      }
    }

    // The submit schema takes description only when it says something
    // (minLength 1) — and apps ship rows with description: "" — while
    // inputMode is the app's field, not the job's. Both must go back out
    // as absent, or the service refuses the whole payload.
    const withoutEmptyDescription = <T extends { description?: string }>(
      row: T
    ): T => {
      if (row.description?.trim()) {
        return row;
      }
      const { description, ...rest } = row as T & { description?: string };
      return rest as T;
    };
    // notes must be a JSON object in the submit schema, but a stored job
    // round-trips them as strings — and sometimes an explicit null — and
    // one such row refuses the whole payload. A string that IS an object
    // is unwrapped; everything else goes out as absent.
    const withHonestNotes = <T extends { notes?: unknown }>(row: T): T => {
      const { notes, ...rest } = row as T & { notes?: unknown };
      if (notes && typeof notes === 'object' && !Array.isArray(notes)) {
        return row;
      }
      if (typeof notes === 'string') {
        try {
          const parsed = JSON.parse(notes);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return { ...rest, notes: parsed } as unknown as T;
          }
        } catch {
          // not JSON — no object to send
        }
      }
      return rest as unknown as T;
    };
    (['appArgs', 'containerArgs', 'schedulerOptions'] as const).forEach(
      (key) => {
        const rows = withoutBlanks[key] as Array<Jobs.JobArgSpec> | undefined;
        if (rows) {
          withoutBlanks[key] = rows.map((row) =>
            withHonestNotes(withoutEmptyDescription(row))
          );
        }
      }
    );
    if (withoutBlanks.envVariables) {
      withoutBlanks.envVariables = (
        withoutBlanks.envVariables as Array<
          Jobs.KeyValuePair & { inputMode?: unknown }
        >
      ).map((row) => {
        const { inputMode, ...rest } = row;
        return withHonestNotes(
          withoutEmptyDescription(rest as Jobs.KeyValuePair)
        );
      });
    }

    job.parameterSet = withoutBlanks;

    const parameterSet = prune(job.parameterSet);
    if (Object.keys(parameterSet).length) {
      job.parameterSet = parameterSet;
    } else {
      delete job.parameterSet;
    }
  }

  return prune(job) as Partial<Jobs.ReqSubmitJob>;
};
