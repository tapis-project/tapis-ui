import * as Yup from 'yup';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import {
  computeDefaultJobType,
  computeDefaultQueue,
  computeDefaultSystem,
  validateExecSystem,
  ValidateExecSystemResult,
} from '@tapis/tapisui-common';
import { hasPlaceholder } from './utils';

// A row you just added with '+ Add' is blank in every field. Nagging '1 to fix'
// before the cursor has landed is noise, so a wholly blank row is allowed here
// and dropped by assembleJob at submit time. A row with a name but no value is
// a real mistake and still fails.
const blankRow = (parent: any) =>
  !parent?.arg?.trim() && !parent?.name?.trim() && !parent?.description?.trim();

const argsSchema = Yup.array(
  Yup.object({
    name: Yup.string(),
    description: Yup.string(),
    include: Yup.boolean(),
    arg: Yup.string().test(
      'value-unless-blank-row',
      'This argument needs a value, or clear the row',
      function (value) {
        return blankRow(this.parent) || !!value?.trim();
      }
    ),
  })
);

/**
 * The V1 wizard splits validation across nine per-step Formik forms. The V2
 * panel keeps the whole job in a single form, so every step's schema is
 * gathered here -- nothing is dropped, the shapes are the same ones the wizard
 * steps declare.
 */
export const launcherValidationSchema = Yup.object().shape({
  name: Yup.string().required('A job name is required').min(1).max(64),
  description: Yup.string(),

  execSystemId: Yup.string(),
  execSystemLogicalQueue: Yup.string(),
  execSystemExecDir: Yup.string(),
  execSystemInputDir: Yup.string(),
  execSystemOutputDir: Yup.string(),
  jobType: Yup.string(),
  nodeCount: Yup.number(),
  coresPerNode: Yup.number(),
  memoryMB: Yup.number(),
  maxMinutes: Yup.number(),
  isMpi: Yup.boolean(),
  mpiCmd: Yup.string(),
  cmdPrefix: Yup.string(),

  fileInputs: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().min(1).required('A fileInput name is required'),
      sourceUrl: Yup.string().min(1).required('A sourceUrl is required'),
      targetPath: Yup.string().min(1).required('A targetPath is required'),
      autoMountLocal: Yup.boolean(),
    })
  ),
  fileInputArrays: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().min(1).required('A fileInputArray name is required'),
      sourceUrls: Yup.array(
        Yup.string().min(1).required('A sourceUrl is required')
      ).min(1),
      targetDir: Yup.string().min(1).required('A targetDir is required'),
    })
  ),

  archiveOnAppError: Yup.boolean(),
  archiveSystemId: Yup.string(),
  archiveSystemDir: Yup.string(),

  parameterSet: Yup.object({
    appArgs: argsSchema,
    containerArgs: argsSchema,
    schedulerOptions: argsSchema,
    envVariables: Yup.array(
      Yup.object({
        key: Yup.string().test(
          'key-unless-blank-row',
          'This variable needs a key, or clear the row',
          function (value) {
            const { value: entryValue } = this.parent ?? {};
            return (!value?.trim() && !entryValue?.trim()) || !!value?.trim();
          }
        ),
        value: Yup.string().test(
          'value-unless-blank-row',
          'This variable needs a value, or clear the row',
          function (value) {
            const { key, include, inputMode } = this.parent ?? {};
            // an excluded variable is not part of the job, so an empty
            // value on it is not a problem to fix
            if (include === false) {
              return true;
            }
            // An app-declared default may legitimately be empty — apps ship
            // value: "" on purpose, and the service exports it as-is. Only
            // REQUIRED promises the service a value, and only your own rows
            // can be a half-typed mistake.
            if (
              inputMode &&
              inputMode !== Apps.KeyValueInputModeEnum.Required
            ) {
              return true;
            }
            return (!value?.trim() && !key?.trim()) || !!value?.trim();
          }
        ),
      })
    ),
    archiveFilter: Yup.object({
      includes: Yup.array(
        Yup.string()
          .min(1)
          .required('A pattern must be specified for this include')
      ),
      excludes: Yup.array(
        Yup.string()
          .min(1)
          .required('A pattern must be specified for this exclude')
      ),
      includeLaunchFiles: Yup.boolean(),
    }),
  }),
});

export type LauncherErrors = Record<string, any>;

/**
 * Cross-field validation that a static schema cannot express: the exec
 * system/queue triangle (app defaults vs job selection), the selected queue's
 * resource ceilings, and scheduler options still carrying `<<allocation>>`
 * style placeholders.
 */
export const makeValidate =
  ({
    app,
    systems,
  }: {
    app: Apps.TapisApp;
    systems: Array<Systems.TapisSystem>;
  }) =>
  (values: Partial<Jobs.ReqSubmitJob>): LauncherErrors => {
    const errors: LauncherErrors = {};
    const {
      execSystemId,
      execSystemLogicalQueue,
      nodeCount,
      coresPerNode,
      memoryMB,
      maxMinutes,
      jobType,
    } = values;

    const validation = validateExecSystem(values, app, systems);
    if (validation === ValidateExecSystemResult.ErrorNoExecSystem) {
      errors.execSystemId = `This app does not have a default execution system. You must specify one for this job`;
    }
    if (validation === ValidateExecSystemResult.ErrorExecSystemNotFound) {
      errors.execSystemId = `The specified exec system cannot be found`;
    }
    if (validation === ValidateExecSystemResult.ErrorExecSystemNoQueues) {
      errors.execSystemId = `The specified exec system is not capable of batch jobs`;
    }
    if (validation === ValidateExecSystemResult.ErrorNoQueue) {
      errors.execSystemLogicalQueue = `Neither the application nor the selected system specifies a default queue. You must specify one for this job`;
    }
    if (validation === ValidateExecSystemResult.ErrorQueueNotFound) {
      errors.execSystemLogicalQueue = `The specified queue cannot be found on the selected system`;
    }

    const schedulerOptionErrors = validateSchedulerOptions(values);
    if (schedulerOptionErrors) {
      errors.parameterSet = { schedulerOptions: schedulerOptionErrors };
    }

    // Queue ceilings only apply to BATCH jobs
    const computedJobType = computeDefaultJobType(
      values,
      app,
      systems
    )?.jobType;
    if (
      jobType === Apps.JobTypeEnum.Fork ||
      (jobType !== Apps.JobTypeEnum.Batch &&
        computedJobType === Apps.JobTypeEnum.Fork)
    ) {
      return errors;
    }

    const computedExecSystem = computeDefaultSystem(app);
    const computedLogicalQueue = computeDefaultQueue(values, app, systems);
    const selectedSystem = systems.find(
      (system) => system.id === (execSystemId ?? computedExecSystem.systemId)
    );

    if (!selectedSystem?.batchLogicalQueues?.length) {
      errors.execSystemLogicalQueue = `The selected system does not have any batch logical queues`;
      return errors;
    }

    const queue = selectedSystem.batchLogicalQueues.find(
      (candidate) =>
        candidate.name ===
        (execSystemLogicalQueue ?? computedLogicalQueue?.queue)
    );
    if (!queue) {
      errors.execSystemLogicalQueue = `The specified queue does not exist on the selected execution system`;
      return errors;
    }

    if (!!nodeCount) {
      if (queue.maxNodeCount && nodeCount > queue.maxNodeCount) {
        errors.nodeCount = `The maximum number of nodes for this queue is ${queue.maxNodeCount}`;
      }
      if (queue.minNodeCount && nodeCount < queue.minNodeCount) {
        errors.nodeCount = `The minimum number of nodes for this queue is ${queue.minNodeCount}`;
      }
    }
    if (!!coresPerNode) {
      if (queue.maxCoresPerNode && coresPerNode > queue.maxCoresPerNode) {
        errors.coresPerNode = `The maximum number of cores per node for this queue is ${queue.maxCoresPerNode}`;
      }
      if (queue.minCoresPerNode && coresPerNode < queue.minCoresPerNode) {
        errors.coresPerNode = `The minimum number of cores per node for this queue is ${queue.minCoresPerNode}`;
      }
    }
    if (!!memoryMB) {
      if (queue.maxMemoryMB && memoryMB > queue.maxMemoryMB) {
        errors.memoryMB = `The maximum amount of memory for this queue is ${queue.maxMemoryMB} megabytes`;
      }
      if (queue.minMemoryMB && memoryMB < queue.minMemoryMB) {
        errors.memoryMB = `The minimum amount of memory for this queue is ${queue.minMemoryMB} megabytes`;
      }
    }
    if (!!maxMinutes) {
      if (queue.maxMinutes && maxMinutes > queue.maxMinutes) {
        errors.maxMinutes = `The maximum number of minutes for a job on this queue is ${queue.maxMinutes}`;
      }
      if (queue.minMinutes && maxMinutes < queue.minMinutes) {
        errors.maxMinutes = `The minimum number of minutes for a job on this queue is ${queue.minMinutes}`;
      }
    }

    return errors;
  };

/**
 * An included scheduler option that still reads `-A <<allocation>>` will be
 * handed to slurm verbatim and rejected there, so it is caught here instead.
 * Errors are keyed per array index so they land on the offending row.
 */
export const validateSchedulerOptions = (
  values: Partial<Jobs.ReqSubmitJob>
) => {
  const options = values.parameterSet?.schedulerOptions ?? [];
  const optionErrors: Array<{ arg: string } | undefined> = [];
  let found = false;
  options.forEach((option, index) => {
    if (option.include && hasPlaceholder(option.arg)) {
      found = true;
      optionErrors[index] = {
        arg: 'This value is still a placeholder. Replace it with a real value, or uncheck Include.',
      };
    }
  });
  return found ? optionErrors : undefined;
};
