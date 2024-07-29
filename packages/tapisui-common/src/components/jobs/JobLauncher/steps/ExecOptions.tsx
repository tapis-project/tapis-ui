import { useMemo, useEffect, useState } from 'react';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import { useJobLauncher, StepSummaryField } from '../components';
import {
  FormikInput,
  FormikCheck,
  FormikSelect,
  FormikTapisFile,
} from '../../../../ui-formik/FieldWrapperFormik';
import { useFormikContext } from 'formik';
import { Collapse } from '../../../../ui';
import {
  computeDefaultQueue,
  computeDefaultSystem,
  computeDefaultJobType,
  validateExecSystem,
  ValidateExecSystemResult,
} from '../../../../utils/jobExecSystem';
import { capitalize } from './utils';
import * as Yup from 'yup';
import fieldArrayStyles from '../FieldArray.module.scss';
import { JobStep, JobLauncherProviderParams } from '../';

const getLogicalQueues = (system?: Systems.TapisSystem) =>
  system?.batchLogicalQueues ?? [];

const getSystem = (systems: Array<Systems.TapisSystem>, systemId?: string) =>
  !!systemId ? systems.find((system) => system.id === systemId) : undefined;

const SystemSelector: React.FC = () => {
  const { setFieldValue, values } = useFormikContext();
  const { job, app, systems } = useJobLauncher();

  const [queues, setQueues] = useState<Array<Systems.LogicalQueue>>(
    getLogicalQueues(getSystem(systems, job.execSystemId))
  );

  const [selectableSystems, setSelectableSystems] =
    useState<Array<Systems.TapisSystem>>(systems);

  const {
    defaultSystemLabel,
    defaultQueueLabel,
    defaultJobTypeLabel,
    isBatch,
    selectedSystem,
  } = useMemo(() => {
    // Compute labels for when undefined values are selected for systems, queues or jobType
    const { source: systemSource, systemId } = computeDefaultSystem(app);
    const defaultSystemLabel = systemSource
      ? `App default (${systemId})`
      : 'Please select a system';
    const { source: queueSource, queue } = computeDefaultQueue(
      values as Partial<Jobs.ReqSubmitJob>,
      app,
      systems
    );
    const defaultQueueLabel = queueSource
      ? `${capitalize(queueSource)} default (${queue})`
      : 'Please select a queue';
    const { source: jobTypeSource, jobType } = computeDefaultJobType(
      values as Partial<Jobs.ReqSubmitJob>,
      app,
      systems
    );
    const defaultJobTypeLabel = `${capitalize(
      jobTypeSource
    )} default (${jobType})`;
    const isBatch =
      (values as Jobs.ReqSubmitJob)?.jobType === Apps.JobTypeEnum.Batch ||
      jobType === Apps.JobTypeEnum.Batch;
    const selectedSystem = (values as Jobs.ReqSubmitJob)?.execSystemId;
    return {
      defaultSystemLabel,
      defaultQueueLabel,
      defaultJobTypeLabel,
      isBatch,
      selectedSystem,
    };
  }, [values, app, systems]);

  useEffect(() => {
    // Handle changes to selectable execSystems and execSystemLogicalQueues
    const validSystems = isBatch
      ? systems.filter((system) => !!system.batchLogicalQueues?.length)
      : systems;
    setSelectableSystems(validSystems);
    if (!validSystems.some((system) => system.id === selectedSystem)) {
      // If current system is invalid (like a system with no logical queues for a batch job)
      // then use the application default
      setFieldValue('execSystemId', undefined);
    }
    if (!isBatch) {
      setFieldValue('execSystemLogicalQueue', undefined);
    }
    const system = getSystem(
      validSystems,
      selectedSystem ?? app.jobAttributes?.execSystemId
    );
    const queues = getLogicalQueues(system);
    setQueues(queues);
    setFieldValue('execSystemLogicalQueue', undefined);
  }, [
    systems,
    isBatch,
    app,
    selectedSystem,
    setFieldValue,
    setSelectableSystems,
    setQueues,
  ]);

  return (
    <div className={fieldArrayStyles.item}>
      <FormikSelect
        name="execSystemId"
        description="The execution system for this job"
        label="Execution System"
        required={true}
        data-testid="execSystemId"
      >
        <option value={undefined} label={defaultSystemLabel} />
        {selectableSystems.map((system) => (
          <option
            value={system.id}
            key={`execsystem-select-${system.id}`}
            label={system.id}
            data-testid={`execSystemId-${system.id}`}
          />
        ))}
      </FormikSelect>
      <FormikSelect
        name="jobType"
        label="Job Type"
        description="Jobs can either be Batch or Fork"
        required={true}
        data-testid="jobType"
      >
        <option value={undefined} label={defaultJobTypeLabel} />
        <option value={Apps.JobTypeEnum.Batch} label="Batch" />
        <option value={Apps.JobTypeEnum.Fork} label="Fork" />
      </FormikSelect>
      {isBatch && (
        <FormikSelect
          name="execSystemLogicalQueue"
          description="The batch queue on this execution system"
          label="Batch Logical Queue"
          required={false}
          disabled={queues.length === 0}
          data-testid="execSystemLogicalQueue"
        >
          <option value={undefined} label={defaultQueueLabel} />
          {queues.map((queue) => (
            <option
              value={queue.name}
              key={`queue-select-${queue.name}`}
              label={queue.name}
            />
          ))}
        </FormikSelect>
      )}
    </div>
  );
};

const ExecSystemDirs: React.FC = () => {
  const { values } = useFormikContext();
  const execSystemId = useMemo(
    () => (values as Partial<Jobs.ReqSubmitJob>).execSystemId,
    [values]
  );
  return (
    <Collapse title="Execution System Directories">
      <FormikTapisFile
        allowSystemChange={false}
        systemId={execSystemId}
        disabled={!execSystemId}
        name="execSystemExecDir"
        label="Execution System Execution Directory"
        description="The directory on the selected selection system for execution files"
        required={false}
        files={false}
        dirs={true}
      />
      <FormikTapisFile
        allowSystemChange={false}
        systemId={execSystemId}
        disabled={!execSystemId}
        name="execSystemInputDir"
        label="Execution System Input Directory"
        description="The directory on the selected selection system for input files"
        required={false}
        files={false}
        dirs={true}
      />
      <FormikTapisFile
        allowSystemChange={false}
        systemId={execSystemId}
        disabled={!execSystemId}
        name="execSystemOutputDir"
        label="Execution System Output Directory"
        description="The directory on the selected selection system for output files"
        required={false}
        files={false}
        dirs={true}
      />
    </Collapse>
  );
};

const ExecSystemQueueOptions: React.FC = () => {
  const { errors } = useFormikContext();
  const queueErrors = errors as QueueErrors;
  const hasErrors =
    queueErrors.coresPerNode ||
    queueErrors.maxMinutes ||
    queueErrors.memoryMB ||
    queueErrors.nodeCount;
  return (
    <Collapse title="Queue Parameters" isCollapsable={!hasErrors}>
      <FormikInput
        name="nodeCount"
        label="Node Count"
        description="The number of nodes to use for this job"
        required={false}
        type="number"
      />
      <FormikInput
        name="coresPerNode"
        label="Cores Per Node"
        description="The number of cores to use per node"
        required={false}
        type="number"
      />
      <FormikInput
        name="memoryMB"
        label="Memory, in Megabytes"
        description="The amount of memory to use per node in megabytes"
        required={false}
        type="number"
      />
      <FormikInput
        name="maxMinutes"
        label="Maximum Minutes"
        description="The maximum amount of time in minutes for this job"
        required={false}
        type="number"
      />
    </Collapse>
  );
};

const MPIOptions: React.FC = () => {
  const { values } = useFormikContext();
  const isMpi = useMemo(
    () => (values as Partial<Jobs.ReqSubmitJob>).isMpi,
    [values]
  );
  return (
    <Collapse title="MPI Options">
      <FormikCheck
        name="isMpi"
        label="Is MPI?"
        description="If checked, this job will be run as an MPI job"
        required={false}
      />
      <FormikInput
        name="mpiCmd"
        label="MPI Command"
        description="If this is an MPI job, you may specify the MPI command"
        required={false}
        disabled={!isMpi}
      />
      <FormikInput
        name="cmdPrefix"
        label="Command Prefix"
        description="If this is not an MPI job, you may specify a command prefix"
        required={false}
        disabled={!!isMpi}
      />
    </Collapse>
  );
};

export const ExecOptions: React.FC = () => {
  const { values } = useFormikContext();

  const isBatch = useMemo(
    () => (values as Jobs.ReqSubmitJob)?.jobType === Apps.JobTypeEnum.Batch,
    [values]
  );

  return (
    <div>
      <h2>Execution Options</h2>
      <SystemSelector />
      {isBatch && <ExecSystemQueueOptions />}
      <MPIOptions />
      <ExecSystemDirs />
    </div>
  );
};

export const ExecOptionsSummary: React.FC = () => {
  const { job, app, systems } = useJobLauncher();
  const { isMpi, mpiCmd, cmdPrefix } = job;

  const { computedSystem, computedQueue, computedJobType } = useMemo(() => {
    const { execSystemLogicalQueue, execSystemId, jobType } = job;
    const computedSystem = execSystemId ?? computeDefaultSystem(app)?.systemId;
    const computedQueue =
      execSystemLogicalQueue ?? computeDefaultQueue(job, app, systems)?.queue;
    const computedJobType =
      jobType ?? computeDefaultJobType(job, app, systems)?.jobType;
    return {
      computedSystem,
      computedQueue,
      computedJobType,
    };
  }, [job, app, systems]);

  return (
    <div>
      <StepSummaryField
        field={computedSystem}
        error="An execution system is required"
        key="execution-system-id-summary"
      />
      {computedJobType === Apps.JobTypeEnum.Batch && (
        <StepSummaryField
          field={computedQueue}
          error="A logical queue is required"
          key="execution-system-queue-summary"
        />
      )}
      <StepSummaryField
        field={`${
          isMpi
            ? `MPI Command: ${mpiCmd ?? 'system default'}`
            : `Command Prefix: ${cmdPrefix ?? 'system default'}`
        }`}
        key="execution-mpi-summary"
      />
    </div>
  );
};

const validationSchema = Yup.object({
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
});

type QueueErrors = {
  nodeCount?: string;
  coresPerNode?: string;
  memoryMB?: string;
  maxMinutes?: string;
  execSystemId?: string;
  execSystemLogicalQueue?: string;
};

const validateThunk = ({ app, systems }: JobLauncherProviderParams) => {
  return (values: Partial<Jobs.ReqSubmitJob>) => {
    const {
      execSystemId,
      execSystemLogicalQueue,
      nodeCount,
      coresPerNode,
      memoryMB,
      maxMinutes,
      jobType,
    } = values;
    const errors: QueueErrors = {};

    const validation = validateExecSystem(
      values as Partial<Jobs.ReqSubmitJob>,
      app,
      systems
    );
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

    // Skip queue validation if the job is a FORK job
    if (
      jobType === Apps.JobTypeEnum.Fork ||
      computeDefaultJobType(values as Partial<Jobs.ReqSubmitJob>, app, systems)
        ?.jobType === Apps.JobTypeEnum.Fork
    ) {
      return errors;
    }

    const computedExecSystem = computeDefaultSystem(app);
    const computedLogicalQueue = computeDefaultQueue(
      values as Partial<Jobs.ReqSubmitJob>,
      app,
      systems
    );
    const selectedSystem = systems.find(
      (system) => system.id === (execSystemId ?? computedExecSystem.systemId)
    );

    if (!selectedSystem?.batchLogicalQueues?.length) {
      errors.execSystemLogicalQueue = `The selected system does not have any batch logical queues`;
      return errors;
    }

    const queue = selectedSystem?.batchLogicalQueues?.find(
      (queue) =>
        queue.name === (execSystemLogicalQueue ?? computedLogicalQueue?.queue)
    );
    if (!queue) {
      errors.execSystemLogicalQueue = `The specified queue does not exist on the selected execution system`;
      return errors;
    }

    if (!!nodeCount) {
      if (queue?.maxNodeCount && nodeCount > queue?.maxNodeCount) {
        errors.nodeCount = `The maximum number of nodes for this queue is ${queue?.maxNodeCount}`;
      }
      if (queue?.minNodeCount && nodeCount < queue?.minNodeCount) {
        errors.nodeCount = `The minimum number of nodes for this queue is ${queue?.minNodeCount}`;
      }
    }
    if (!!coresPerNode) {
      if (queue?.maxCoresPerNode && coresPerNode > queue?.maxCoresPerNode) {
        errors.coresPerNode = `The maximum number of cores per node for this queue is ${queue?.maxCoresPerNode}`;
      }
      if (queue?.minCoresPerNode && coresPerNode < queue?.minCoresPerNode) {
        errors.coresPerNode = `The minimum number of cores per node for this queue is ${queue?.minCoresPerNode}`;
      }
    }
    if (!!memoryMB) {
      if (queue?.maxMemoryMB && memoryMB > queue?.maxMemoryMB) {
        errors.memoryMB = `The maximum amount of memory for this queue is ${queue?.maxMemoryMB} megabytes`;
      }
      if (queue?.minMemoryMB && memoryMB < queue?.minMemoryMB) {
        errors.memoryMB = `The minimum amount of memory for this queue is ${queue?.minMemoryMB} megabytes`;
      }
    }
    if (!!maxMinutes) {
      if (queue?.maxMinutes && maxMinutes > queue?.maxMinutes) {
        errors.maxMinutes = `The maximum number of minutes for a job on this queue is ${queue?.maxMinutes}`;
      }
      if (queue?.minMinutes && maxMinutes < queue?.minMinutes) {
        errors.maxMinutes = `The minimum number of minutes for a job on this queue is ${queue?.minMinutes}`;
      }
    }
    return errors;
  };
};

const generateInitialValues = ({
  job,
  app,
  systems,
}: JobLauncherProviderParams): Partial<Jobs.ReqSubmitJob> => ({
  execSystemId: job.execSystemId,
  execSystemLogicalQueue: job.execSystemLogicalQueue,
  jobType: job.jobType,
  execSystemExecDir: job.execSystemExecDir,
  execSystemInputDir: job.execSystemInputDir,
  execSystemOutputDir: job.execSystemOutputDir,
  nodeCount: job.nodeCount,
  coresPerNode: job.coresPerNode,
  memoryMB: job.memoryMB,
  maxMinutes: job.maxMinutes,
  isMpi: job.isMpi,
  mpiCmd: job.mpiCmd,
  cmdPrefix: job.cmdPrefix,
});

const step: JobStep = {
  id: 'execution',
  name: 'Execution Options',
  render: <ExecOptions />,
  summary: <ExecOptionsSummary />,
  generateInitialValues,
  validateThunk,
  validationSchema,
};

export default step;
