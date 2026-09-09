/**
 * NewSystemGuidedDialog — registering a system the way the guided app
 * creator works: a SectionedPanel through the real decisions (what it is,
 * where it lives, whether it runs jobs, how its scheduler is shaped) with
 * per-section blocking chips, and a Review section showing the exact
 * Systems.ReqPostSystem before it is sent. Everything the classic stepper could
 * set is settable here — queues, env variables, capabilities, proxy, DTN
 * included; the classic stepper and its JSON editor stay one preference
 * away (Settings › Preferences › New system dialog).
 */
import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  BadgeOutlined,
  CloseRounded,
  Dns,
  PlayCircleOutline,
  Schedule,
  TaskAlt,
} from '@mui/icons-material';
import SectionedPanel from 'app/_components/SectionedPanel/SectionedPanel';
import type { PanelGroup } from 'app/_components/SectionedPanel/SectionedPanel';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import {
  ChipChoice,
  GField,
  SectionBody,
} from 'app/_components/SectionedPanel/guidedKit';

// ── the draft ──────────────────────────────────────────────────────────────

export type QueueDraft = {
  name: string;
  hpcQueueName: string;
  maxJobs: string;
  maxJobsPerUser: string;
  minNodeCount: string;
  maxNodeCount: string;
  minCoresPerNode: string;
  maxCoresPerNode: string;
  minMemoryMB: string;
  maxMemoryMB: string;
  minMinutes: string;
  maxMinutes: string;
};

export const EMPTY_QUEUE: QueueDraft = {
  name: '',
  hpcQueueName: '',
  maxJobs: '',
  maxJobsPerUser: '',
  minNodeCount: '',
  maxNodeCount: '',
  minCoresPerNode: '',
  maxCoresPerNode: '',
  minMemoryMB: '',
  maxMemoryMB: '',
  minMinutes: '',
  maxMinutes: '',
};

export type SysDraft = {
  id: string;
  description: string;
  tags: string[];
  systemType: Systems.SystemTypeEnum;
  host: string;
  rootDir: string;
  effectiveUserId: string;
  defaultAuthnMethod: Systems.AuthnEnum;
  dtnSystemId: string;
  useProxy: boolean;
  proxyHost: string;
  proxyPort: string;
  canExec: boolean;
  jobWorkingDir: string;
  runtimeType: Systems.RuntimeTypeEnum;
  mpiCmd: string;
  enableCmdPrefix: boolean;
  jobMaxJobs: string;
  jobMaxJobsPerUser: string;
  envVars: Array<{ key: string; value: string }>;
  capabilities: Array<{ category: string; name: string; value: string }>;
  canRunBatch: boolean;
  batchScheduler: Systems.SchedulerTypeEnum;
  batchSchedulerProfile: string;
  batchDefaultLogicalQueue: string;
  queues: Array<QueueDraft>;
};

export const EMPTY_SYSTEM: SysDraft = {
  id: '',
  description: '',
  tags: [],
  systemType: Systems.SystemTypeEnum.Linux,
  host: '',
  rootDir: '/',
  effectiveUserId: '${apiUserId}',
  defaultAuthnMethod: Systems.AuthnEnum.PkiKeys,
  dtnSystemId: '',
  useProxy: false,
  proxyHost: '',
  proxyPort: '',
  canExec: true,
  jobWorkingDir: 'HOST_EVAL($SCRATCH)',
  runtimeType: Systems.RuntimeTypeEnum.Singularity,
  mpiCmd: '',
  enableCmdPrefix: false,
  jobMaxJobs: '',
  jobMaxJobsPerUser: '',
  envVars: [],
  capabilities: [],
  canRunBatch: true,
  batchScheduler: Systems.SchedulerTypeEnum.Slurm,
  batchSchedulerProfile: 'tacc',
  batchDefaultLogicalQueue: '',
  queues: [],
};

// the classic modal's yup lines, said per field
const NAME_RE = /^[a-zA-Z0-9_.-]+$/;
const PATH_RE = /^[a-zA-Z0-9_.\-/]+$/;
const USER_RE = /^[a-zA-Z0-9_${}@.-]+$/;

const isCount = (raw: string) => /^\d+$/.test(raw) && Number(raw) >= 0;

export const systemProblems = (d: SysDraft): Record<string, string> => {
  const problems: Record<string, string> = {};
  if (!d.id) problems.id = 'a system needs an id';
  else if (!NAME_RE.test(d.id) || d.id.length > 80)
    problems.id = "letters, digits, '.', '_' or '-', at most 80";
  if (!d.host) problems.host = 'where does it live?';
  else if (!NAME_RE.test(d.host) || d.host.length > 256)
    problems.host = 'not a valid hostname';
  if (d.rootDir && !PATH_RE.test(d.rootDir))
    problems.rootDir = 'not a valid path';
  if (d.effectiveUserId && !USER_RE.test(d.effectiveUserId))
    problems.effectiveUserId = 'not a valid account or template';
  if (d.useProxy) {
    if (!d.proxyHost) problems.proxyHost = 'a proxy needs a host';
    if (d.proxyPort !== '' && !isCount(d.proxyPort))
      problems.proxyPort = 'a port number';
  }
  for (const key of ['jobMaxJobs', 'jobMaxJobsPerUser'] as const) {
    if (d[key] !== '' && !isCount(d[key])) problems[key] = 'a whole number';
  }
  if (d.canExec && d.canRunBatch) {
    if (!d.batchSchedulerProfile)
      problems.batchSchedulerProfile = 'the scheduler profile is required';
    else if (
      !PATH_RE.test(d.batchSchedulerProfile) ||
      d.batchSchedulerProfile.length > 60
    )
      problems.batchSchedulerProfile = 'not a valid profile name';
    d.queues.forEach((q, i) => {
      if (!q.name || !q.hpcQueueName)
        problems[`queue-${i}`] = `queue ${i + 1} needs a name and an HPC name`;
    });
  }
  return problems;
};

/** the request exactly as it will be sent — the review shows this verbatim */
export const assembleSystem = (d: SysDraft): Systems.ReqPostSystem => {
  const num = (raw: string) => (raw === '' ? undefined : Number(raw));
  const text = (raw: string) => (raw === '' ? undefined : raw);
  const exec = d.canExec;
  const batch = exec && d.canRunBatch;
  return {
    id: d.id,
    ...(d.description ? { description: d.description } : {}),
    systemType: d.systemType,
    host: d.host,
    rootDir: d.rootDir || '/',
    defaultAuthnMethod: d.defaultAuthnMethod,
    ...(text(d.effectiveUserId) ? { effectiveUserId: d.effectiveUserId } : {}),
    ...(text(d.dtnSystemId) ? { dtnSystemId: d.dtnSystemId } : {}),
    useProxy: d.useProxy,
    ...(d.useProxy
      ? { proxyHost: text(d.proxyHost), proxyPort: num(d.proxyPort) ?? 0 }
      : {}),
    canExec: exec,
    ...(exec
      ? {
          jobWorkingDir: d.jobWorkingDir || '/',
          jobRuntimes: [{ runtimeType: d.runtimeType }],
          enableCmdPrefix: d.enableCmdPrefix,
          ...(text(d.mpiCmd) ? { mpiCmd: d.mpiCmd } : {}),
          ...(num(d.jobMaxJobs) != null
            ? { jobMaxJobs: num(d.jobMaxJobs) }
            : {}),
          ...(num(d.jobMaxJobsPerUser) != null
            ? { jobMaxJobsPerUser: num(d.jobMaxJobsPerUser) }
            : {}),
          ...(d.envVars.length
            ? {
                jobEnvVariables: d.envVars
                  .filter((v) => v.key)
                  .map((v) => ({ key: v.key, value: v.value })),
              }
            : {}),
          ...(d.capabilities.length
            ? {
                jobCapabilities: d.capabilities
                  .filter((c) => c.name)
                  .map((c) => ({
                    category: c.category || 'SCHEDULER',
                    name: c.name,
                    ...(c.value ? { value: c.value } : {}),
                  })),
              }
            : {}),
        }
      : {}),
    canRunBatch: batch,
    ...(batch
      ? {
          batchScheduler: d.batchScheduler,
          batchSchedulerProfile: d.batchSchedulerProfile,
          ...(text(d.batchDefaultLogicalQueue)
            ? { batchDefaultLogicalQueue: d.batchDefaultLogicalQueue }
            : {}),
          ...(d.queues.length
            ? {
                batchLogicalQueues: d.queues.map((q) => ({
                  name: q.name,
                  hpcQueueName: q.hpcQueueName,
                  ...(num(q.maxJobs) != null
                    ? { maxJobs: num(q.maxJobs) }
                    : {}),
                  ...(num(q.maxJobsPerUser) != null
                    ? { maxJobsPerUser: num(q.maxJobsPerUser) }
                    : {}),
                  ...(num(q.minNodeCount) != null
                    ? { minNodeCount: num(q.minNodeCount) }
                    : {}),
                  ...(num(q.maxNodeCount) != null
                    ? { maxNodeCount: num(q.maxNodeCount) }
                    : {}),
                  ...(num(q.minCoresPerNode) != null
                    ? { minCoresPerNode: num(q.minCoresPerNode) }
                    : {}),
                  ...(num(q.maxCoresPerNode) != null
                    ? { maxCoresPerNode: num(q.maxCoresPerNode) }
                    : {}),
                  ...(num(q.minMemoryMB) != null
                    ? { minMemoryMB: num(q.minMemoryMB) }
                    : {}),
                  ...(num(q.maxMemoryMB) != null
                    ? { maxMemoryMB: num(q.maxMemoryMB) }
                    : {}),
                  ...(num(q.minMinutes) != null
                    ? { minMinutes: num(q.minMinutes) }
                    : {}),
                  ...(num(q.maxMinutes) != null
                    ? { maxMinutes: num(q.maxMinutes) }
                    : {}),
                })),
              }
            : {}),
        }
      : {}),
    ...(d.tags.length ? { tags: d.tags } : {}),
  } as Systems.ReqPostSystem;
};

// ── small local pieces ─────────────────────────────────────────────────────

/** rows of paired inputs with a remove ✕ and an add press */
const RowsEditor: React.FC<{
  label: string;
  addLabel: string;
  rows: React.ReactNode[];
  onAdd: () => void;
}> = ({ label, addLabel, rows, onAdd }) => (
  <Box>
    <Typography
      sx={{
        fontSize: '0.62rem',
        fontWeight: 700,
        color: 'text.secondary',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        mb: 0.5,
      }}
    >
      {label}
    </Typography>
    <Box sx={{ display: 'grid', gap: 1 }}>
      {rows}
      <Box>
        <Button
          size="small"
          variant="outlined"
          onClick={onAdd}
          sx={{ textTransform: 'none', fontSize: '0.7rem' }}
        >
          {addLabel}
        </Button>
      </Box>
    </Box>
  </Box>
);

const RemoveX: React.FC<{ onClick: () => void; what: string }> = ({
  onClick,
  what,
}) => (
  <IconButton
    size="small"
    aria-label={`Remove ${what}`}
    onClick={onClick}
    sx={{ p: 0.25, alignSelf: 'center' }}
  >
    <CloseRounded sx={{ fontSize: 14 }} />
  </IconButton>
);

// ── the dialog ─────────────────────────────────────────────────────────────

const NewSystemGuidedDialog: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const history = useHistory();
  const [draft, setDraft] = useState<SysDraft>(EMPTY_SYSTEM);
  const set = <K extends keyof SysDraft>(key: K, value: SysDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const [tagInput, setTagInput] = useState('');

  const problems = useMemo(() => systemProblems(draft), [draft]);
  const missing = Object.keys(problems).length;
  const request = useMemo(() => assembleSystem(draft), [draft]);

  // the real profiles for this tenant, offered as chips over the free field
  const profilesQ = Hooks.useSchedulerProfiles({
    enabled: draft.canExec && draft.canRunBatch,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
  const profileNames = (profilesQ.data?.result ?? [])
    .map((p) => p.name)
    .filter((n): n is string => !!n)
    .slice(0, 8);

  const queryClient = useQueryClient();
  const { createSystem, isLoading, isSuccess, error, reset } =
    Hooks.useCreateSystem();
  const submit = () =>
    createSystem(request, true, {
      onSuccess: () => {
        queryClient.invalidateQueries(Hooks.queryKeys.list);
        queryClient.invalidateQueries(Hooks.queryKeys.listWindow);
      },
    }).catch(() => {
      // the refusal already lives in the mutation's error state — this
      // keeps the async rejection from surfacing as an unhandled one
    });

  const identityMissing = problems.id ? 1 : 0;
  const hostMissing = [
    'host',
    'rootDir',
    'effectiveUserId',
    'proxyHost',
    'proxyPort',
  ].filter((k) => problems[k]).length;
  const execMissing = ['jobMaxJobs', 'jobMaxJobsPerUser'].filter(
    (k) => problems[k]
  ).length;
  const batchMissing =
    (problems.batchSchedulerProfile ? 1 : 0) +
    Object.keys(problems).filter((k) => k.startsWith('queue-')).length;

  const stateOf = (count: number, offLabel?: string) =>
    offLabel != null
      ? { label: offLabel, tone: 'planned' as const }
      : count > 0
      ? { label: `${count} to fill`, tone: 'blocking' as const }
      : { label: 'ready', tone: 'live' as const };

  const groups: PanelGroup[] = [
    {
      label: 'Define',
      items: [
        {
          id: 'identity',
          label: 'Identity',
          title: 'Identity',
          subtitle: 'what this system is called in Tapis',
          icon: <BadgeOutlined />,
          state: stateOf(identityMissing),
          render: () => (
            <SectionBody lead="The id is how every job, file path and share will name this machine — pick something people recognize.">
              <GField
                autoFocus
                label="System id"
                value={draft.id}
                onChange={(v) => set('id', v)}
                problem={problems.id}
                mono
              />
              <GField
                label="Description"
                value={draft.description}
                onChange={(v) => set('description', v)}
                helper="what would you tell a colleague this machine is for?"
              />
              <Box>
                <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                  <GField
                    label="Add a tag"
                    value={tagInput}
                    onChange={setTagInput}
                    mono
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!tagInput.trim()}
                    onClick={() => {
                      const tag = tagInput.trim();
                      if (tag && !draft.tags.includes(tag))
                        set('tags', [...draft.tags, tag]);
                      setTagInput('');
                    }}
                    sx={{ textTransform: 'none', flexShrink: 0 }}
                  >
                    add
                  </Button>
                </Box>
                {draft.tags.length > 0 && (
                  <Box
                    sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}
                  >
                    {draft.tags.map((tag) => (
                      <Chip
                        key={tag}
                        size="small"
                        label={tag}
                        onDelete={() =>
                          set(
                            'tags',
                            draft.tags.filter((t) => t !== tag)
                          )
                        }
                        sx={{ borderRadius: '4px', fontSize: '0.68rem' }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </SectionBody>
          ),
        },
        {
          id: 'host',
          label: 'Host',
          title: 'Host & access',
          subtitle: 'where it lives and how Tapis signs in',
          icon: <Dns />,
          state: stateOf(hostMissing),
          render: () => (
            <SectionBody lead="The machine itself: its address, the directory Tapis treats as root, and the account it lands as.">
              <ChipChoice
                label="system type"
                options={[
                  {
                    value: Systems.SystemTypeEnum.Linux,
                    hint: 'SSH-reachable host',
                  },
                  { value: Systems.SystemTypeEnum.S3, hint: 'an S3 bucket' },
                  {
                    value: Systems.SystemTypeEnum.Irods,
                    hint: 'an iRODS grid',
                  },
                  {
                    value: Systems.SystemTypeEnum.Globus,
                    hint: 'a Globus endpoint',
                  },
                ]}
                value={draft.systemType}
                onChange={(v) => set('systemType', v as Systems.SystemTypeEnum)}
              />
              <GField
                label="Host"
                value={draft.host}
                onChange={(v) => set('host', v)}
                problem={problems.host}
                helper="e.g. frontera.tacc.utexas.edu"
                mono
              />
              <GField
                label="Root directory"
                value={draft.rootDir}
                onChange={(v) => set('rootDir', v)}
                problem={problems.rootDir}
                helper="everything Tapis sees lives under this path"
                mono
              />
              <GField
                label="On the host as"
                value={draft.effectiveUserId}
                onChange={(v) => set('effectiveUserId', v)}
                problem={problems.effectiveUserId}
                helper={'${apiUserId} means everyone lands as themselves'}
                mono
              />
              <ChipChoice
                label="auth method"
                options={[
                  { value: Systems.AuthnEnum.PkiKeys, hint: 'SSH keypair' },
                  { value: Systems.AuthnEnum.Password, hint: 'host password' },
                  { value: Systems.AuthnEnum.TmsKeys, hint: 'TMS-minted keys' },
                  { value: Systems.AuthnEnum.AccessKey, hint: 'S3 access key' },
                  { value: Systems.AuthnEnum.Token, hint: 'access token' },
                  {
                    value: Systems.AuthnEnum.Cert,
                    hint: 'signed SSH certificate',
                  },
                ]}
                value={draft.defaultAuthnMethod}
                onChange={(v) =>
                  set('defaultAuthnMethod', v as Systems.AuthnEnum)
                }
              />
              <GField
                label="DTN system id (optional)"
                value={draft.dtnSystemId}
                onChange={(v) => set('dtnSystemId', v)}
                helper="a Data Transfer Node system jobs can stage files through"
                mono
              />
              <ChipChoice
                label="proxy"
                options={[
                  { value: 'no', label: 'direct', hint: 'no proxy' },
                  {
                    value: 'yes',
                    label: 'through a proxy',
                    hint: 'SSH via a proxy host',
                  },
                ]}
                value={draft.useProxy ? 'yes' : 'no'}
                onChange={(v) => set('useProxy', v === 'yes')}
              />
              {draft.useProxy && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: 1.5,
                  }}
                >
                  <GField
                    label="Proxy host"
                    value={draft.proxyHost}
                    onChange={(v) => set('proxyHost', v)}
                    problem={problems.proxyHost}
                    mono
                  />
                  <GField
                    label="Proxy port"
                    value={draft.proxyPort}
                    onChange={(v) => set('proxyPort', v)}
                    problem={problems.proxyPort}
                    mono
                  />
                </Box>
              )}
            </SectionBody>
          ),
        },
        {
          id: 'execution',
          label: 'Execution',
          title: 'Execution',
          subtitle: 'whether jobs run here, and how',
          icon: <PlayCircleOutline />,
          state: stateOf(execMissing, draft.canExec ? undefined : 'off'),
          render: () => (
            <SectionBody
              wide
              lead="A system can be storage only, or a place jobs actually run. Running jobs brings a working directory, a container runtime, and the knobs below."
            >
              <ChipChoice
                label="jobs"
                options={[
                  { value: 'yes', label: 'can run jobs' },
                  { value: 'no', label: 'storage only' },
                ]}
                value={draft.canExec ? 'yes' : 'no'}
                onChange={(v) => set('canExec', v === 'yes')}
              />
              {draft.canExec && (
                <>
                  <GField
                    label="Job working directory"
                    value={draft.jobWorkingDir}
                    onChange={(v) => set('jobWorkingDir', v)}
                    helper="HOST_EVAL($SCRATCH) asks the host at job time"
                    mono
                  />
                  <ChipChoice
                    label="container runtime"
                    options={[
                      {
                        value: Systems.RuntimeTypeEnum.Singularity,
                        hint: 'Apptainer/Singularity',
                      },
                      {
                        value: Systems.RuntimeTypeEnum.Docker,
                        hint: 'Docker engine',
                      },
                    ]}
                    value={draft.runtimeType}
                    onChange={(v) =>
                      set('runtimeType', v as Systems.RuntimeTypeEnum)
                    }
                  />
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 1.5,
                    }}
                  >
                    <GField
                      label="MPI command (optional)"
                      value={draft.mpiCmd}
                      onChange={(v) => set('mpiCmd', v)}
                      helper="e.g. ibrun"
                      mono
                    />
                    <Box sx={{ alignSelf: 'end' }}>
                      <ChipChoice
                        label="cmd prefix"
                        options={[
                          { value: 'no', label: 'not allowed' },
                          { value: 'yes', label: 'jobs may prepend' },
                        ]}
                        value={draft.enableCmdPrefix ? 'yes' : 'no'}
                        onChange={(v) => set('enableCmdPrefix', v === 'yes')}
                      />
                    </Box>
                    <GField
                      label="Max jobs (optional)"
                      value={draft.jobMaxJobs}
                      onChange={(v) => set('jobMaxJobs', v)}
                      problem={problems.jobMaxJobs}
                      mono
                    />
                    <GField
                      label="Max jobs per user (optional)"
                      value={draft.jobMaxJobsPerUser}
                      onChange={(v) => set('jobMaxJobsPerUser', v)}
                      problem={problems.jobMaxJobsPerUser}
                      mono
                    />
                  </Box>
                  <RowsEditor
                    label="environment variables"
                    addLabel="+ variable"
                    onAdd={() =>
                      set('envVars', [...draft.envVars, { key: '', value: '' }])
                    }
                    rows={draft.envVars.map((v, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr auto',
                          gap: 1,
                        }}
                      >
                        <GField
                          label="Key"
                          value={v.key}
                          onChange={(key) =>
                            set(
                              'envVars',
                              draft.envVars.map((row, j) =>
                                j === i ? { ...row, key } : row
                              )
                            )
                          }
                          mono
                        />
                        <GField
                          label="Value"
                          value={v.value}
                          onChange={(value) =>
                            set(
                              'envVars',
                              draft.envVars.map((row, j) =>
                                j === i ? { ...row, value } : row
                              )
                            )
                          }
                          mono
                        />
                        <RemoveX
                          what={`variable ${i + 1}`}
                          onClick={() =>
                            set(
                              'envVars',
                              draft.envVars.filter((_, j) => j !== i)
                            )
                          }
                        />
                      </Box>
                    ))}
                  />
                  <RowsEditor
                    label="job capabilities"
                    addLabel="+ capability"
                    onAdd={() =>
                      set('capabilities', [
                        ...draft.capabilities,
                        { category: 'SCHEDULER', name: '', value: '' },
                      ])
                    }
                    rows={draft.capabilities.map((c, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr auto',
                          gap: 1,
                        }}
                      >
                        <GField
                          label="Category"
                          value={c.category}
                          onChange={(category) =>
                            set(
                              'capabilities',
                              draft.capabilities.map((row, j) =>
                                j === i ? { ...row, category } : row
                              )
                            )
                          }
                          mono
                        />
                        <GField
                          label="Name"
                          value={c.name}
                          onChange={(name) =>
                            set(
                              'capabilities',
                              draft.capabilities.map((row, j) =>
                                j === i ? { ...row, name } : row
                              )
                            )
                          }
                          mono
                        />
                        <GField
                          label="Value"
                          value={c.value}
                          onChange={(value) =>
                            set(
                              'capabilities',
                              draft.capabilities.map((row, j) =>
                                j === i ? { ...row, value } : row
                              )
                            )
                          }
                          mono
                        />
                        <RemoveX
                          what={`capability ${i + 1}`}
                          onClick={() =>
                            set(
                              'capabilities',
                              draft.capabilities.filter((_, j) => j !== i)
                            )
                          }
                        />
                      </Box>
                    ))}
                  />
                </>
              )}
            </SectionBody>
          ),
        },
        {
          id: 'batch',
          label: 'Batch',
          title: 'Batch & queues',
          subtitle: 'the scheduler, its profile, the queues',
          icon: <Schedule />,
          state: stateOf(
            batchMissing,
            draft.canExec && draft.canRunBatch ? undefined : 'off'
          ),
          render: () => (
            <SectionBody
              wide
              lead="Batch systems hand jobs to a scheduler. The profile is site-defined (module loads and hidden options); queues mirror the host's real ones."
            >
              <ChipChoice
                label="batch"
                options={[
                  { value: 'yes', label: 'through a scheduler' },
                  { value: 'no', label: 'no scheduler' },
                ]}
                value={draft.canExec && draft.canRunBatch ? 'yes' : 'no'}
                onChange={(v) => set('canRunBatch', v === 'yes')}
              />
              {draft.canExec && draft.canRunBatch && (
                <>
                  <ChipChoice
                    label="scheduler"
                    options={Object.values(Systems.SchedulerTypeEnum).map(
                      (s) => ({
                        value: s,
                      })
                    )}
                    value={draft.batchScheduler}
                    onChange={(v) =>
                      set('batchScheduler', v as Systems.SchedulerTypeEnum)
                    }
                  />
                  <Box>
                    <GField
                      label="Scheduler profile"
                      value={draft.batchSchedulerProfile}
                      onChange={(v) => set('batchSchedulerProfile', v)}
                      problem={problems.batchSchedulerProfile}
                      helper="site-defined; the chips are this tenant's real ones"
                      mono
                    />
                    {profileNames.length > 0 && (
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 0.5,
                          flexWrap: 'wrap',
                          mt: 0.75,
                        }}
                      >
                        {profileNames.map((name) => (
                          <Chip
                            key={name}
                            size="small"
                            label={name}
                            onClick={() => set('batchSchedulerProfile', name)}
                            variant={
                              draft.batchSchedulerProfile === name
                                ? 'filled'
                                : 'outlined'
                            }
                            sx={{
                              borderRadius: '4px',
                              fontFamily: 'monospace',
                              fontSize: '0.66rem',
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                  <GField
                    label="Default queue (optional)"
                    value={draft.batchDefaultLogicalQueue}
                    onChange={(v) => set('batchDefaultLogicalQueue', v)}
                    helper="must match one of the queues below"
                    mono
                  />
                  <RowsEditor
                    label="logical queues"
                    addLabel="+ queue"
                    onAdd={() =>
                      set('queues', [...draft.queues, { ...EMPTY_QUEUE }])
                    }
                    rows={draft.queues.map((queue, i) => (
                      <Box
                        key={i}
                        sx={{
                          border: '1px solid',
                          borderColor: problems[`queue-${i}`]
                            ? '#c6282866'
                            : 'divider',
                          borderRadius: 1,
                          p: 1,
                          display: 'grid',
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr auto',
                            gap: 1,
                          }}
                        >
                          <GField
                            label="Queue name"
                            value={queue.name}
                            onChange={(name) =>
                              set(
                                'queues',
                                draft.queues.map((row, j) =>
                                  j === i ? { ...row, name } : row
                                )
                              )
                            }
                            mono
                          />
                          <GField
                            label="HPC queue name"
                            value={queue.hpcQueueName}
                            onChange={(hpcQueueName) =>
                              set(
                                'queues',
                                draft.queues.map((row, j) =>
                                  j === i ? { ...row, hpcQueueName } : row
                                )
                              )
                            }
                            mono
                          />
                          <RemoveX
                            what={`queue ${i + 1}`}
                            onClick={() =>
                              set(
                                'queues',
                                draft.queues.filter((_, j) => j !== i)
                              )
                            }
                          />
                        </Box>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 1,
                          }}
                        >
                          {(
                            [
                              ['minNodeCount', 'min nodes'],
                              ['maxNodeCount', 'max nodes'],
                              ['minCoresPerNode', 'min cores'],
                              ['maxCoresPerNode', 'max cores'],
                              ['minMemoryMB', 'min MB'],
                              ['maxMemoryMB', 'max MB'],
                              ['minMinutes', 'min minutes'],
                              ['maxMinutes', 'max minutes'],
                              ['maxJobs', 'max jobs'],
                              ['maxJobsPerUser', 'jobs/user'],
                            ] as Array<[keyof QueueDraft, string]>
                          ).map(([key, label]) => (
                            <GField
                              key={key}
                              label={label}
                              value={queue[key]}
                              onChange={(value) =>
                                set(
                                  'queues',
                                  draft.queues.map((row, j) =>
                                    j === i ? { ...row, [key]: value } : row
                                  )
                                )
                              }
                              mono
                            />
                          ))}
                        </Box>
                      </Box>
                    ))}
                  />
                </>
              )}
            </SectionBody>
          ),
        },
      ],
    },
    {
      label: 'Create',
      items: [
        {
          id: 'review',
          label: 'Review & create',
          title: 'Review & create',
          subtitle: 'the definition exactly as it will be sent',
          icon: <TaskAlt />,
          state:
            missing > 0
              ? { label: `${missing} to fill`, tone: 'blocking' as const }
              : { label: 'ready', tone: 'live' as const },
          render: () => (
            <Box sx={{ p: 2, display: 'grid', gap: 1.25, maxWidth: 680 }}>
              {isSuccess ? (
                <>
                  <Typography sx={{ fontSize: '0.8rem', color: '#1b7f3b' }}>
                    <TaskAlt
                      sx={{ fontSize: 16, verticalAlign: 'text-top', mr: 0.5 }}
                    />
                    {draft.id} is registered. Next: open it and register a
                    credential so it can be reached.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        onClose();
                        history.push(`/systems/${draft.id}`);
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Open the system
                    </Button>
                    <Button
                      size="small"
                      onClick={onClose}
                      sx={{ textTransform: 'none' }}
                    >
                      Done
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Typography
                    sx={{ fontSize: '0.72rem', color: 'text.secondary' }}
                  >
                    {missing > 0
                      ? 'The sections on the left say what still needs filling — this is what would be sent so far.'
                      : 'Everything required is in place. This is the exact request:'}
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 1.25,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'rgba(0,0,0,0.02)',
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      lineHeight: 1.5,
                      overflow: 'auto',
                      maxHeight: 340,
                    }}
                  >
                    {JSON.stringify(request, null, 2)}
                  </Box>
                  {error && (
                    <ErrorDetail
                      message={(error as Error).message}
                      fontSize="0.7rem"
                    />
                  )}
                  <Box>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={missing > 0 || isLoading}
                      onClick={submit}
                      startIcon={
                        isLoading ? (
                          <CircularProgress
                            size={13}
                            sx={{ color: 'inherit' }}
                          />
                        ) : undefined
                      }
                      sx={{ textTransform: 'none' }}
                    >
                      {isLoading ? 'Registering…' : 'Create system'}
                    </Button>
                    {error != null && (
                      <Button
                        size="small"
                        onClick={() => reset()}
                        sx={{ textTransform: 'none', ml: 1 }}
                      >
                        clear the refusal
                      </Button>
                    )}
                  </Box>
                </>
              )}
            </Box>
          ),
        },
      ],
    },
  ];

  return (
    <Dialog
      open={true}
      onClose={onClose}
      transitionDuration={{ enter: 90, exit: 120 }}
      fullScreen={fullScreen}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: fullScreen ? '100%' : 'min(960px, calc(100vw - 32px))',
          height: fullScreen ? '100%' : 'min(700px, calc(100vh - 32px))',
          borderRadius: fullScreen ? 0 : '10px',
          overflow: 'hidden',
        },
      }}
    >
      <SectionedPanel
        groups={groups}
        title="New system — guided"
        caption={
          missing > 0 ? `${missing} field${missing === 1 ? '' : 's'} to go` : ''
        }
        onClose={onClose}
        initialSection="identity"
      />
    </Dialog>
  );
};

export default NewSystemGuidedDialog;
