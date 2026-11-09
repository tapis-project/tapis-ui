import { Jobs } from '@tapis/tapis-typescript';

/**
 * A stored job, turned back into a submittable seed for the launcher.
 *
 * Deliberately curated rather than copied whole: the job record is the
 * RESOLVED run, not the request. Its directory fields carry the old run's
 * expanded ${JobUUID} paths, so seeding them would point the new job into
 * the old job's folders — directories are left to app defaults instead,
 * and the launcher's provenance chip says so. Server-side bookkeeping
 * (shared-context fields, _tapis env injections) is likewise not the new
 * job's to restate.
 */

const parseJson = <T>(raw: unknown): T | undefined => {
  if (typeof raw !== 'string' || !raw.trim()) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    // a job old enough or odd enough that its stored JSON does not parse
    // still seeds its scalar facts; the arrays just stay app-default
    return undefined;
  }
};

const dropEmpty = <T extends Record<string, unknown>>(obj: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
    )
  ) as Partial<T>;

/**
 * Per-row curation for the parameterSet arrays. Stored rows carry explicit
 * nulls — description: null, include: null — and those land straight in
 * formik state, where the launcher's validation rightly refuses them ("must
 * be a boolean, but the final value was: null") before anything can be
 * submitted. A null is not an answer; absence is, and the app default takes
 * over. include: false survives — dropEmpty keeps real booleans.
 */
const cleanArgRow = (row: Jobs.JobArgSpec): Jobs.JobArgSpec =>
  dropEmpty({
    name: row.name,
    description: row.description,
    include: row.include,
    arg: row.arg,
    notes: row.notes,
  }) as Jobs.JobArgSpec;

const cleanArgRows = (
  rows?: Array<Jobs.JobArgSpec>
): Array<Jobs.JobArgSpec> | undefined =>
  rows?.length ? rows.map(cleanArgRow) : undefined;

export const jobToSeed = (job: Jobs.Job): Partial<Jobs.ReqSubmitJob> => {
  const storedParams = parseJson<Jobs.JobParameterSet>(job.parameterSet);
  const storedInputs = parseJson<Array<Jobs.JobFileInput>>(job.fileInputs);

  const parameterSet: Jobs.JobParameterSet = {};
  const appArgs = cleanArgRows(storedParams?.appArgs);
  if (appArgs) {
    parameterSet.appArgs = appArgs;
  }
  const containerArgs = cleanArgRows(storedParams?.containerArgs);
  if (containerArgs) {
    parameterSet.containerArgs = containerArgs;
  }
  const schedulerOptions = cleanArgRows(storedParams?.schedulerOptions);
  if (schedulerOptions) {
    parameterSet.schedulerOptions = schedulerOptions;
  }
  if (storedParams?.archiveFilter) {
    parameterSet.archiveFilter = storedParams.archiveFilter;
  }
  // the service injects its own _tapis* variables into the stored set; a
  // new submission must not restate them
  const envVariables = (storedParams?.envVariables ?? [])
    .filter((variable) => !(variable.key ?? '').startsWith('_tapis'))
    .map((variable) => ({
      key: variable.key ?? '',
      // '' is a real value for an env var; only null/undefined coerce
      value: variable.value ?? '',
      ...dropEmpty({
        description: variable.description,
        include: variable.include,
        notes: variable.notes,
      }),
    }));
  if (envVariables.length) {
    parameterSet.envVariables = envVariables;
  }

  // per-entry curation: sourceUrl and targetPath are the user's intent;
  // srcSharedAppCtx and friends are the server talking to itself
  const fileInputs = (storedInputs ?? []).map((input) =>
    dropEmpty({
      name: input.name,
      description: input.description,
      sourceUrl: input.sourceUrl,
      targetPath: input.targetPath,
      envKey: input.envKey,
      autoMountLocal: input.autoMountLocal,
    })
  ) as Array<Jobs.JobFileInput>;

  return dropEmpty({
    name: job.name,
    description: job.description,
    appId: job.appId,
    appVersion: job.appVersion,
    jobType: job.jobType as unknown as string,
    execSystemId: job.execSystemId,
    execSystemLogicalQueue: job.execSystemLogicalQueue,
    archiveSystemId: job.archiveSystemId,
    archiveOnAppError: job.archiveOnAppError,
    nodeCount: job.nodeCount,
    coresPerNode: job.coresPerNode,
    memoryMB: job.memoryMB,
    maxMinutes: job.maxMinutes,
    // the record keeps the command, not the flag; MPI-ness is implied
    isMpi: job.mpiCmd ? true : undefined,
    mpiCmd: job.mpiCmd,
    cmdPrefix: job.cmdPrefix,
    tags: job.tags,
    fileInputs: fileInputs.length ? fileInputs : undefined,
    parameterSet: Object.keys(parameterSet).length ? parameterSet : undefined,
  }) as Partial<Jobs.ReqSubmitJob>;
};

export default jobToSeed;
