import React, { useEffect, useMemo, useRef } from 'react';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import { useFormikContext } from 'formik';
import { Alert, Box, Chip, Divider, Stack, Typography } from '@mui/material';
import {
  FormikCheck,
  FormikInput,
  FormikSelect,
  FormikTapisFile,
} from '@tapis/tapisui-common';
import { Collapse } from '@tapis/tapisui-common';
import { useJobLauncher } from '@tapis/tapisui-common';
import {
  computeDefaultJobType,
  computeDefaultQueue,
  computeDefaultSystem,
} from '@tapis/tapisui-common';
import { getLogicalQueues, getQueue, getSystem } from '../utils';

type JobValues = Partial<Jobs.ReqSubmitJob>;

/** Everything the section needs to know about where this job will land. */
const useResolvedTarget = () => {
  const { values } = useFormikContext<JobValues>();
  const { app, systems } = useJobLauncher();

  return useMemo(() => {
    const appSystem = computeDefaultSystem(app);
    const defaultQueue = computeDefaultQueue(values, app, systems);
    const defaultJobType = computeDefaultJobType(values, app, systems);

    const systemId = values.execSystemId ?? appSystem.systemId;
    const system = getSystem(systems, systemId);
    const jobType =
      (values.jobType as Apps.JobTypeEnum) ?? defaultJobType.jobType;
    const isBatch = jobType === Apps.JobTypeEnum.Batch;
    const queueName = values.execSystemLogicalQueue ?? defaultQueue.queue;
    const queue = getQueue(systems, systemId, queueName);

    return {
      appSystem,
      defaultQueue,
      defaultJobType,
      systemId,
      system,
      jobType,
      isBatch,
      queueName,
      queue,
      // true when the value in play comes from a default rather than a choice
      systemInherited: !values.execSystemId,
      queueInherited: !values.execSystemLogicalQueue,
      jobTypeInherited: !values.jobType,
    };
  }, [values, app, systems]);
};

const SourceChip: React.FC<{
  label: string;
  value?: string;
  inherited: boolean;
  source?: string;
}> = ({ label, value, inherited, source }) => (
  <Chip
    size="small"
    variant="outlined"
    color={value ? 'default' : 'warning'}
    label={
      <span>
        <b>{label}:</b> {value ?? 'not set'}
        {value && inherited ? ` (${source ?? 'default'})` : ''}
      </span>
    }
  />
);

/** The chosen queue's ceilings, spelled out instead of hidden in an error. */
const QueueFacts: React.FC<{ queue?: Systems.LogicalQueue }> = ({ queue }) => {
  if (!queue) {
    return null;
  }
  const facts: Array<[string, string | undefined]> = [
    ['HPC queue', queue.hpcQueueName],
    [
      'Minutes',
      formatRange(queue.minMinutes, queue.maxMinutes, 'no published limit'),
    ],
    ['Nodes', formatRange(queue.minNodeCount, queue.maxNodeCount)],
    ['Cores / node', formatRange(queue.minCoresPerNode, queue.maxCoresPerNode)],
    ['Memory (MB)', formatRange(queue.minMemoryMB, queue.maxMemoryMB)],
    ['Max jobs', queue.maxJobs !== undefined ? `${queue.maxJobs}` : undefined],
    [
      'Max jobs / user',
      queue.maxJobsPerUser !== undefined
        ? `${queue.maxJobsPerUser}`
        : undefined,
    ],
  ];
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))',
        gap: 1,
        p: 1.25,
        mb: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'action.hover',
      }}
    >
      {facts
        .filter(([, value]) => !!value)
        .map(([label, value]) => (
          <Box key={`queue-fact-${label}`}>
            <Typography
              variant="caption"
              sx={{ display: 'block', color: 'text.secondary' }}
            >
              {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {value}
            </Typography>
          </Box>
        ))}
      {queue.description && (
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {queue.description}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const formatRange = (min?: number, max?: number, fallback?: string) => {
  if (min !== undefined && max !== undefined) {
    return `${min} – ${max}`;
  }
  if (max !== undefined) {
    return `up to ${max}`;
  }
  if (min !== undefined) {
    return `at least ${min}`;
  }
  return fallback;
};

/**
 * A queue-limited number field. The limits are shown as click-to-fill chips so
 * "the maximum for this queue is 120" is something you can act on, not just
 * an error you hit after typing 240.
 */
const QueueNumberField: React.FC<{
  name: string;
  label: string;
  description: string;
  min?: number;
  max?: number;
  appDefault?: number;
  unavailableHint?: string;
}> = ({ name, label, description, min, max, appDefault, unavailableHint }) => {
  const { setFieldValue } = useFormikContext<JobValues>();
  const chips: Array<[string, number]> = [];
  if (min !== undefined) {
    chips.push([`min ${min}`, min]);
  }
  if (max !== undefined) {
    chips.push([`max ${max}`, max]);
  }
  if (appDefault !== undefined && appDefault !== min && appDefault !== max) {
    chips.push([`app default ${appDefault}`, appDefault]);
  }
  return (
    <Box sx={{ '& .form-group': { mb: 0.5 } }}>
      <FormikInput
        name={name}
        label={label}
        description={description}
        required={false}
        type="number"
      />
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ mb: 1.5, flexWrap: 'wrap', rowGap: 0.5 }}
      >
        {chips.map(([chipLabel, value]) => (
          <Chip
            key={`${name}-${chipLabel}`}
            size="small"
            variant="outlined"
            label={chipLabel}
            onClick={() => setFieldValue(name, value)}
            sx={{ fontSize: '0.7rem', height: '1.25rem' }}
          />
        ))}
        {!chips.length && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {unavailableHint ?? 'This queue does not publish a limit'}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

const TargetSelectors: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<JobValues>();
  const { app, systems } = useJobLauncher();
  const {
    appSystem,
    defaultQueue,
    defaultJobType,
    systemId,
    isBatch,
    queueName,
  } = useResolvedTarget();

  const queues = useMemo(
    () => getLogicalQueues(getSystem(systems, systemId)),
    [systems, systemId]
  );

  // Changing the execution system invalidates a queue chosen on the old one.
  // Unlike the V1 wizard this only fires on an actual system change, so a queue
  // that is still valid (or was pre-filled by the app) survives.
  const previousSystemId = useRef(systemId);
  useEffect(() => {
    if (previousSystemId.current === systemId) {
      return;
    }
    previousSystemId.current = systemId;
    if (
      values.execSystemLogicalQueue &&
      !queues.some((queue) => queue.name === values.execSystemLogicalQueue)
    ) {
      setFieldValue('execSystemLogicalQueue', undefined);
    }
  }, [systemId, queues, values.execSystemLogicalQueue, setFieldValue]);

  const defaultSystemLabel = appSystem.systemId
    ? `App default (${appSystem.systemId})`
    : 'Please select a system';
  const defaultQueueLabel = defaultQueue.queue
    ? `${defaultQueue.source} default (${defaultQueue.queue})`
    : 'Please select a queue';

  return (
    <>
      <FormikSelect
        name="execSystemId"
        description="Where this job runs. Systems without batch queues cannot run BATCH jobs."
        label="Execution System"
        required={true}
        data-testid="execSystemId"
      >
        <option value="">{defaultSystemLabel}</option>
        {systems.map((system) => {
          const noQueues = !system.batchLogicalQueues?.length;
          return (
            <option
              value={system.id}
              key={`execsystem-select-${system.id}`}
              data-testid={`execSystemId-${system.id}`}
            >
              {system.id}
              {isBatch && noQueues ? ' — no batch queues' : ''}
            </option>
          );
        })}
      </FormikSelect>

      <FormikSelect
        name="jobType"
        label="Job Type"
        description={`BATCH jobs are queued by the scheduler, FORK jobs run directly on the host. Unset resolves to the ${defaultJobType.source} default (${defaultJobType.jobType}).`}
        required={true}
        data-testid="jobType"
      >
        <option value="">{`${defaultJobType.source} default (${defaultJobType.jobType})`}</option>
        <option value={Apps.JobTypeEnum.Batch}>Batch</option>
        <option value={Apps.JobTypeEnum.Fork}>Fork</option>
      </FormikSelect>

      {isBatch && (
        <FormikSelect
          name="execSystemLogicalQueue"
          description="The batch queue on this execution system. Its limits are shown below and enforced before submission."
          label="Batch Logical Queue"
          required={false}
          disabled={queues.length === 0}
          data-testid="execSystemLogicalQueue"
        >
          <option value="">{defaultQueueLabel}</option>
          {queues.map((queue) => (
            <option value={queue.name} key={`queue-select-${queue.name}`}>
              {queue.name}
              {queue.maxMinutes ? ` — up to ${queue.maxMinutes} min` : ''}
            </option>
          ))}
        </FormikSelect>
      )}

      {isBatch && !queues.length && !!systemId && (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          <b>{systemId}</b> has no batch logical queues, so it cannot run a
          BATCH job. Pick another execution system, or switch Job Type to FORK.
        </Alert>
      )}
      {isBatch && !!queues.length && !queueName && (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          Neither <b>{app.id}</b> nor <b>{systemId}</b> names a default queue —
          choose one above before submitting.
        </Alert>
      )}
    </>
  );
};

const QueueParameters: React.FC = () => {
  const { app } = useJobLauncher();
  const { queue, queueName, queueInherited, defaultQueue } =
    useResolvedTarget();
  const appAttributes = app.jobAttributes;

  return (
    <Box sx={{ mt: 1 }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ mb: 1, flexWrap: 'wrap', rowGap: 0.5 }}
      >
        <Typography variant="subtitle2">Queue Parameters</Typography>
        {queueName && (
          <Chip
            size="small"
            label={
              queueInherited
                ? `${queueName} (${defaultQueue.source} default)`
                : queueName
            }
            sx={{ fontSize: '0.7rem', height: '1.25rem' }}
          />
        )}
      </Stack>
      <QueueFacts queue={queue} />
      <QueueNumberField
        name="nodeCount"
        label="Node Count"
        description="The number of nodes to use for this job"
        min={queue?.minNodeCount}
        max={queue?.maxNodeCount}
        appDefault={appAttributes?.nodeCount}
      />
      <QueueNumberField
        name="coresPerNode"
        label="Cores Per Node"
        description="The number of cores to use per node"
        min={queue?.minCoresPerNode}
        max={queue?.maxCoresPerNode}
        appDefault={appAttributes?.coresPerNode}
      />
      <QueueNumberField
        name="memoryMB"
        label="Memory, in Megabytes"
        description="The amount of memory to use per node in megabytes"
        min={queue?.minMemoryMB}
        max={queue?.maxMemoryMB}
        appDefault={appAttributes?.memoryMB}
      />
      <QueueNumberField
        name="maxMinutes"
        label="Maximum Minutes"
        description="Wall clock limit for this job. The scheduler kills the job when it is reached."
        min={queue?.minMinutes}
        max={queue?.maxMinutes}
        appDefault={appAttributes?.maxMinutes}
      />
    </Box>
  );
};

const MPIOptions: React.FC = () => {
  const { values } = useFormikContext<JobValues>();
  const isMpi = values.isMpi;
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

const ExecSystemDirs: React.FC = () => {
  const { values } = useFormikContext<JobValues>();
  const execSystemId = values.execSystemId;
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

export const ExecutionSection: React.FC = () => {
  const { app } = useJobLauncher();
  const {
    systemId,
    systemInherited,
    queueName,
    queueInherited,
    defaultQueue,
    jobType,
    jobTypeInherited,
    defaultJobType,
    isBatch,
  } = useResolvedTarget();

  return (
    <div>
      {!app.jobAttributes?.execSystemId && (
        <Alert severity="info" sx={{ mb: 1.5 }}>
          <b>{app.id}</b> does not set a default execution system, so this job
          needs one chosen here. Apps that name an execution system (and, for
          BATCH, a logical queue) launch without this step.
        </Alert>
      )}

      <Stack
        direction="row"
        spacing={0.75}
        sx={{ mb: 1.5, flexWrap: 'wrap', rowGap: 0.75 }}
      >
        <SourceChip
          label="System"
          value={systemId}
          inherited={systemInherited}
          source="app default"
        />
        <SourceChip
          label="Type"
          value={jobType}
          inherited={jobTypeInherited}
          source={`${defaultJobType.source} default`}
        />
        {isBatch && (
          <SourceChip
            label="Queue"
            value={queueName}
            inherited={queueInherited}
            source={`${defaultQueue.source} default`}
          />
        )}
      </Stack>

      <TargetSelectors />
      {isBatch && <QueueParameters />}
      <Divider sx={{ my: 1.5 }} />
      <MPIOptions />
      <ExecSystemDirs />
    </div>
  );
};

export default ExecutionSection;
