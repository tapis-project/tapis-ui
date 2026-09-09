import React, { useEffect, useMemo, useRef } from 'react';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import { useFormikContext } from 'formik';
import { Box, Chip, Stack, Typography } from '@mui/material';
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
import Note from './Note';

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
      queueInherited: !values.execSystemLogicalQueue,
    };
  }, [values, app, systems]);
};

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
        gridTemplateColumns: 'repeat(auto-fit, minmax(7.5rem, 1fr))',
        gap: 0.75,
        p: 1,
        mb: 1,
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
              sx={{
                display: 'block',
                color: 'text.secondary',
                fontSize: '0.7rem',
              }}
            >
              {label}
            </Typography>
            <Typography sx={{ fontWeight: 500, fontSize: '0.78rem' }}>
              {value}
            </Typography>
          </Box>
        ))}
      {queue.description && (
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
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
    <Box sx={{ '& .form-group, & .mb-3': { mb: 0.25 } }}>
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
        sx={{ mb: 1, flexWrap: 'wrap', rowGap: 0.5 }}
      >
        {chips.map(([chipLabel, value]) => (
          <Chip
            key={`${name}-${chipLabel}`}
            size="small"
            variant="outlined"
            label={chipLabel}
            onClick={() => setFieldValue(name, value)}
            sx={{ fontSize: '0.72rem', height: '1.2rem' }}
          />
        ))}
        {!chips.length && (
          <Typography sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
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
      {/* side by side: two short selects stacked full-width was most of the
          section's height, and the defaults in their first options already
          say where each value came from */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          columnGap: 1.5,
        }}
      >
        <FormikSelect
          name="execSystemId"
          description="Where this job runs."
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
                {isBatch && noQueues ? ' (no batch queues)' : ''}
              </option>
            );
          })}
        </FormikSelect>

        <FormikSelect
          name="jobType"
          label="Job Type"
          description="BATCH queues through the scheduler; FORK runs on the host."
          required={true}
          data-testid="jobType"
        >
          <option value="">{`${defaultJobType.source} default (${defaultJobType.jobType})`}</option>
          <option value={Apps.JobTypeEnum.Batch}>Batch</option>
          <option value={Apps.JobTypeEnum.Fork}>Fork</option>
        </FormikSelect>
      </Box>

      {isBatch && (
        <FormikSelect
          name="execSystemLogicalQueue"
          description="The batch queue on this system; its limits are in Queue Parameters below."
          label="Batch Logical Queue"
          required={false}
          disabled={queues.length === 0}
          data-testid="execSystemLogicalQueue"
        >
          <option value="">{defaultQueueLabel}</option>
          {queues.map((queue) => (
            <option value={queue.name} key={`queue-select-${queue.name}`}>
              {queue.name}
              {queue.maxMinutes ? ` (up to ${queue.maxMinutes} min)` : ''}
            </option>
          ))}
        </FormikSelect>
      )}

      {isBatch && !queues.length && !!systemId && (
        <Note tone="warning">
          <b>{systemId}</b> has no batch logical queues, so it cannot run a
          BATCH job. Pick another system, or switch Job Type to FORK.
        </Note>
      )}
      {isBatch && !!queues.length && !queueName && (
        <Note tone="warning">
          Neither <b>{app.id}</b> nor <b>{systemId}</b> names a default queue:
          choose one above before submitting.
        </Note>
      )}
    </>
  );
};

const plural = (value: number | undefined, one: string, many = `${one}s`) =>
  value === undefined ? undefined : `${value} ${value === 1 ? one : many}`;

/**
 * The four numbers a batch job asks the queue for, in an accordion like V1's.
 *
 * Shut, the header says what the job will ask for ("normal · 1 node · 120
 * min"), which is the question most people open it to answer, so most people
 * no longer have to. It will not stay shut while one of the four is wrong:
 * V1's rule, and still the right one.
 */
const QueueParameters: React.FC = () => {
  const { app } = useJobLauncher();
  const { values, errors } = useFormikContext<JobValues>();
  const { queue, queueName, queueInherited, defaultQueue } =
    useResolvedTarget();
  const appAttributes = app.jobAttributes;
  const hasErrors = !!(
    errors.nodeCount ||
    errors.coresPerNode ||
    errors.memoryMB ||
    errors.maxMinutes
  );
  const nodes = values.nodeCount ?? appAttributes?.nodeCount;
  const cores = values.coresPerNode ?? appAttributes?.coresPerNode;
  const memory = values.memoryMB ?? appAttributes?.memoryMB;
  const minutes = values.maxMinutes ?? appAttributes?.maxMinutes;
  const note = [
    queueName &&
      (queueInherited
        ? `${queueName} (${defaultQueue.source} default)`
        : queueName),
    plural(nodes, 'node'),
    plural(cores, 'core/node', 'cores/node'),
    memory !== undefined ? `${memory} MB` : undefined,
    minutes !== undefined ? `${minutes} min` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Collapse title="Queue Parameters" note={note} isCollapsable={!hasErrors}>
      <QueueFacts queue={queue} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          columnGap: 1.5,
        }}
      >
        <QueueNumberField
          name="nodeCount"
          label="Node Count"
          description="Nodes for this job"
          min={queue?.minNodeCount}
          max={queue?.maxNodeCount}
          appDefault={appAttributes?.nodeCount}
        />
        <QueueNumberField
          name="coresPerNode"
          label="Cores Per Node"
          description="Cores on each node"
          min={queue?.minCoresPerNode}
          max={queue?.maxCoresPerNode}
          appDefault={appAttributes?.coresPerNode}
        />
        <QueueNumberField
          name="memoryMB"
          label="Memory, in Megabytes"
          description="Memory per node, in MB"
          min={queue?.minMemoryMB}
          max={queue?.maxMemoryMB}
          appDefault={appAttributes?.memoryMB}
        />
        <QueueNumberField
          name="maxMinutes"
          label="Maximum Minutes"
          description="Wall-clock limit; the scheduler ends the job there"
          min={queue?.minMinutes}
          max={queue?.maxMinutes}
          appDefault={appAttributes?.maxMinutes}
        />
      </Box>
    </Collapse>
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

/**
 * Where it runs, then three accordions: the V1 shape.
 *
 * It had grown a pastel alert, a row of provenance chips repeating what the
 * selects' first options already say, the queue facts, four full-height
 * number fields and a divider before the first accordion, so the form you
 * came to fill in started below the fold. The facts and the four numbers
 * now live in Queue Parameters, which says the numbers while shut.
 */
export const ExecutionSection: React.FC = () => {
  const { app } = useJobLauncher();
  const { isBatch } = useResolvedTarget();

  return (
    <div>
      {!app.jobAttributes?.execSystemId && (
        <Note>
          <b>{app.id}</b> does not name an execution system, so this job needs
          one chosen here.
        </Note>
      )}
      <TargetSelectors />
      {isBatch && <QueueParameters />}
      <MPIOptions />
      <ExecSystemDirs />
    </div>
  );
};

export default ExecutionSection;
