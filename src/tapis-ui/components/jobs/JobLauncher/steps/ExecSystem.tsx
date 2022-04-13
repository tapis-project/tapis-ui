import { useMemo, useEffect, useState, useCallback } from 'react';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import { useJobLauncher, StepSummaryField } from '../components';
import { FormikJobStepWrapper } from '../components';
import {
  FormikInput,
  FormikCheck,
  FormikSelect,
  FormikTapisFile,
} from 'tapis-ui/_common/FieldWrapperFormik';
import { useFormikContext } from 'formik';
import { Collapse } from 'tapis-ui/_common';
import * as Yup from 'yup';

const getLogicalQueues = (system?: Systems.TapisSystem) =>
  system?.batchLogicalQueues ?? [];

const getSystem = (systems: Array<Systems.TapisSystem>, systemId?: string) =>
  !!systemId ? systems.find((system) => system.id === systemId) : undefined;

/**
 * Returns a default logical queue based on the following priority:
 * - If the selected system has the logical queue specified in the app, use that
 * - If the selected system has a default logical queue and the one in the app is not present, use that
 * - If no app logical queue is specified and no system default queue is specified, return undefined;
 */
export const getLogicalQueue = (
  app: Apps.TapisApp,
  systems: Array<Systems.TapisSystem>,
  systemId?: string
): string | undefined => {
  if (!systemId) {
    return undefined;
  }
  const system = getSystem(systems, systemId);
  if (!system) {
    return undefined;
  }
  const queues = getLogicalQueues(system);
  if (!!app.jobAttributes?.execSystemLogicalQueue) {
    const selectedSystemHasAppDefault = queues.some(
      (queue) => queue.name === app.jobAttributes?.execSystemLogicalQueue
    );
    if (selectedSystemHasAppDefault) {
      return app.jobAttributes?.execSystemLogicalQueue;
    }
  }
  if (!!system.batchDefaultLogicalQueue) {
    return system.batchDefaultLogicalQueue;
  }
  return undefined;
};

const SystemSelector: React.FC = () => {
  const { setFieldValue, values } = useFormikContext();
  const { job, app, add, systems } = useJobLauncher();

  const [queues, setQueues] = useState<Array<Systems.LogicalQueue>>(
    getLogicalQueues(getSystem(systems, job.execSystemId))
  );

  const selectedSystem = useMemo(
    () => (values as Jobs.ReqSubmitJob)?.execSystemId,
    [values]
  );

  useEffect(
    () => {
      const logicalQueue = getLogicalQueue(app, systems, selectedSystem);
      setQueues(getLogicalQueues(getSystem(systems, selectedSystem)));
      setFieldValue('execSystemLogicalQueue', logicalQueue);
      add({
        execSystemId: selectedSystem,
        execSystemLogicalQueue: logicalQueue,
      });
    },
    /* eslint-disable-next-line */
    [selectedSystem, setQueues, setFieldValue]
  );

  return (
    <>
      <FormikSelect
        name="execSystemId"
        description="The execution system for this job"
        label="Execution System"
        required={true}
      >
        {systems.map((system) => (
          <option value={system.id} key={`execsystem-select-${system.id}`}>
            {system.id}
          </option>
        ))}
      </FormikSelect>

      {!!selectedSystem && (
        <FormikSelect
          name="execSystemLogicalQueue"
          description="The batch queue on this execution system"
          label="Batch Logical Queue"
          required={false}
        >
          {queues.map((queue) => (
            <option value={queue.name} key={`queue-select-${queue.name}`}>
              {queue.name}
            </option>
          ))}
        </FormikSelect>
      )}
    </>
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
  return (
    <Collapse title="Queue Parameters">
      <FormikInput
        name="nodeCount"
        label="Node Count"
        description="The number of nodes to use for this job"
        required={false}
      />
      <FormikInput
        name="coresPerNode"
        label="Cores Per Node"
        description="The number of cores to use per node"
        required={false}
      />
      <FormikInput
        name="memoryMB"
        label="Memory, in Megabytes"
        description="The amount of memory to use per node in megabytes"
        required={false}
      />
      <FormikInput
        name="maxMinutes"
        label="Maximum Minutes"
        description="The maximum amount of time in minutes for this job"
        required={false}
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

type QueueErrors = {
  nodeCount?: string;
  coresPerNode?: string;
  memoryMB?: string;
  maxMinutes?: string;
};

export const ExecSystem: React.FC = () => {
  const { job, app, systems } = useJobLauncher();
  const initialValues: Partial<Jobs.ReqSubmitJob> = {
    execSystemId: job.execSystemId ?? app.jobAttributes?.execSystemId,
    execSystemLogicalQueue: job.execSystemId
      ? getLogicalQueue(app, systems, job.execSystemId)
      : undefined,
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
  };

  const validationSchema = Yup.object({
    execSystemId: Yup.string().required(
      'An execution system must be selected for this job'
    ),
    execSystemLogicalQueue: Yup.string(),
    execSystemExecDir: Yup.string(),
    execSystemInputDir: Yup.string(),
    execSystemOutputDir: Yup.string(),
    nodeCount: Yup.number(),
    coresPerNode: Yup.number(),
    memoryMB: Yup.number(),
    maxMinutes: Yup.number(),
    isMpi: Yup.boolean(),
    mpiCmd: Yup.string(),
    cmdPrefix: Yup.string(),
  });

  const queueValidation = useCallback(
    (values: Partial<Jobs.ReqSubmitJob>) => {
      const {
        execSystemId,
        execSystemLogicalQueue,
        nodeCount,
        coresPerNode,
        memoryMB,
        maxMinutes,
      } = values;
      const errors: QueueErrors = {};
      if (!execSystemId || !execSystemLogicalQueue) {
        return errors;
      }
      const queue = systems
        .find((system) => system.id === execSystemId)
        ?.batchLogicalQueues?.find(
          (queue) => queue.name === execSystemLogicalQueue
        );
      if (!queue) {
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
    },
    [systems]
  );

  return (
    <FormikJobStepWrapper
      validationSchema={validationSchema}
      initialValues={initialValues}
      validate={queueValidation}
    >
      <SystemSelector />
      <ExecSystemQueueOptions />
      <MPIOptions />
      <ExecSystemDirs />
    </FormikJobStepWrapper>
  );
};

export const ExecSystemSummary: React.FC = () => {
  const { job } = useJobLauncher();
  const { execSystemId, execSystemLogicalQueue, isMpi, mpiCmd, cmdPrefix } =
    job;
  const summary = execSystemId
    ? `${execSystemId} ${
        execSystemLogicalQueue ? '(' + execSystemLogicalQueue + ')' : ''
      }`
    : undefined;
  return (
    <div>
      <StepSummaryField
        field={summary}
        error="An execution system is required"
        key="execution-system-id-summary"
      />
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
