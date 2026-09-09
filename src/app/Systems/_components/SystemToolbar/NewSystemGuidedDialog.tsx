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
  Stepper,
  Step,
  StepLabel,
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
import IssueStatus from 'app/_components/SectionedPanel/IssueStatus';
import PanelResizeHandle, {
  PanelSize,
  readStoredPanelSize,
} from 'app/_components/SectionedPanel/PanelResizeHandle';
import type { PanelGroup } from 'app/_components/SectionedPanel/SectionedPanel';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import {
  ChipChoice,
  GField,
  SectionBody,
} from 'app/_components/SectionedPanel/guidedKit';
import {
  LABEL_SX,
  MICRO_BTN_SX,
  SECTION_BG,
} from 'app/_components/PageShell/cardKit';
import IssueBoard, { BoardIssue } from 'app/_components/IssueBoard';
import ConfirmModal from 'app/_components/PageShell/ConfirmModal';
import RecordJson from 'app/_components/PageShell/RecordJson';

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
  port: string;
  bucketName: string;
  rootDir: string;
  effectiveUserId: string;
  owner: string;
  enabled: boolean;
  allowChildren: boolean;
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
  envVars: Array<{ key: string; value: string; description: string }>;
  capabilities: Array<{
    category: string;
    name: string;
    value: string;
    precedence: string;
  }>;
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
  port: '22',
  bucketName: '',
  rootDir: '/',
  effectiveUserId: '${apiUserId}',
  owner: '',
  enabled: true,
  allowChildren: false,
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

/**
 * What each kind of system looks like when it is right.
 *
 * The four system types are not four labels on one form: an S3 bucket has no
 * shell to exec on, iRODS listens on a port nothing else does, and a Globus
 * endpoint authenticates with a token. Picking the type used to change one
 * enum and leave the rest of the form describing a Linux box, so the first
 * refusal from the service was where you found out. Each type now carries its
 * own port, auth method, root and whether jobs can run on it, plus a worked
 * example to fill the form from.
 *
 * Port -1 is how Tapis says "the protocol default"; a real number here is
 * kinder because the reader can see what it will dial.
 */
export type SystemTypePreset = {
  hint: string;
  port: string;
  authn: Systems.AuthnEnum;
  rootDir: string;
  canExec: boolean;
  /** what the host field wants for this type */
  hostHelper: string;
  example: { id: string; host: string; rootDir: string; bucketName?: string };
};

export const SYSTEM_TYPE_PRESETS: Record<
  Systems.SystemTypeEnum,
  SystemTypePreset
> = {
  [Systems.SystemTypeEnum.Linux]: {
    hint: 'SSH-reachable host',
    port: '22',
    authn: Systems.AuthnEnum.PkiKeys,
    rootDir: '/',
    canExec: true,
    hostHelper: 'the hostname you would ssh to',
    example: {
      id: 'frontera-scratch',
      host: 'frontera.tacc.utexas.edu',
      rootDir: '/scratch1',
    },
  },
  [Systems.SystemTypeEnum.S3]: {
    hint: 'an S3 bucket',
    port: '443',
    authn: Systems.AuthnEnum.AccessKey,
    rootDir: '/',
    canExec: false,
    hostHelper: 'the endpoint, not the bucket URL',
    example: {
      id: 'lab-object-store',
      host: 's3.us-east-1.amazonaws.com',
      rootDir: '/',
      bucketName: 'my-lab-bucket',
    },
  },
  [Systems.SystemTypeEnum.Irods]: {
    hint: 'an iRODS grid',
    port: '1247',
    authn: Systems.AuthnEnum.Password,
    rootDir: '/tempZone/home',
    canExec: false,
    hostHelper: 'the iCAT server',
    example: {
      id: 'campus-irods',
      host: 'irods.example.edu',
      rootDir: '/tempZone/home',
    },
  },
  [Systems.SystemTypeEnum.Globus]: {
    hint: 'a Globus endpoint',
    port: '443',
    authn: Systems.AuthnEnum.Token,
    rootDir: '/',
    canExec: false,
    hostHelper: 'the collection UUID or its hostname',
    example: {
      id: 'globus-collection',
      host: 'g-abc123.data.globus.org',
      rootDir: '/',
    },
  },
};

/**
 * Move the draft onto a type, carrying the type's defaults with it.
 *
 * Only the fields the reader has not made their own: a port they typed, or a
 * root they chose, survives the switch. Otherwise picking a type twice by
 * accident would throw away their work.
 */
export const applySystemType = (
  draft: SysDraft,
  next: Systems.SystemTypeEnum
): SysDraft => {
  const was = SYSTEM_TYPE_PRESETS[draft.systemType];
  const now = SYSTEM_TYPE_PRESETS[next];
  const untouched = (value: string, previousDefault: string) =>
    value === '' || value === previousDefault;
  return {
    ...draft,
    systemType: next,
    port: untouched(draft.port, was.port) ? now.port : draft.port,
    rootDir: untouched(draft.rootDir, was.rootDir)
      ? now.rootDir
      : draft.rootDir,
    defaultAuthnMethod:
      draft.defaultAuthnMethod === was.authn
        ? now.authn
        : draft.defaultAuthnMethod,
    // a bucket only means anything on S3, and a stale one would be sent
    bucketName: next === Systems.SystemTypeEnum.S3 ? draft.bucketName : '',
    // storage has no shell: exec off is not a preference here, it is the truth
    canExec: now.canExec ? draft.canExec : false,
  };
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
  if (d.owner && !USER_RE.test(d.owner)) problems.owner = 'not a valid account';
  // -1 is how Tapis says "the protocol default", so it is allowed through
  if (d.port !== '' && d.port !== '-1' && !isCount(d.port))
    problems.port = 'a port number, or -1 for the protocol default';
  else if (isCount(d.port) && Number(d.port) > 65535)
    problems.port = 'ports stop at 65535';
  // the only field the service will not infer: an S3 system with no bucket is
  // refused on create, and the refusal does not say which field it meant
  if (d.systemType === Systems.SystemTypeEnum.S3 && !d.bucketName)
    problems.bucketName = 'an S3 system needs a bucket';
  if (d.useProxy) {
    if (!d.proxyHost) problems.proxyHost = 'a proxy needs a host';
    if (d.proxyPort !== '' && !isCount(d.proxyPort))
      problems.proxyPort = 'a port number';
  }
  for (const key of ['jobMaxJobs', 'jobMaxJobsPerUser'] as const) {
    if (d[key] !== '' && !isCount(d[key])) problems[key] = 'a whole number';
  }
  d.capabilities.forEach((capability, i) => {
    if (capability.precedence !== '' && !isCount(capability.precedence))
      problems[`capability-${i}`] = `capability ${
        i + 1
      }: precedence is a whole number`;
  });
  // assembleSystem drops rows without a key or name, so say so before submit
  if (d.canExec) {
    d.envVars.forEach((v, i) => {
      if (!v.key) problems[`envvar-${i}`] = `variable ${i + 1} needs a key`;
    });
    d.capabilities.forEach((c, i) => {
      if (!c.name)
        problems[`capname-${i}`] = `capability ${i + 1} needs a name`;
    });
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
      else if (d.queues.findIndex((other) => other.name === q.name) < i)
        problems[`queue-${i}`] = `queue ${i + 1}: name "${q.name}" is repeated`;
    });
  }
  return problems;
};

/** the request exactly as it will be sent — the review shows this verbatim */
export const assembleSystem = (d: SysDraft): Systems.ReqPostSystem => {
  // undefined and unparseable both mean "not set". Number('') is 0 and
  // Number(undefined) is NaN, and NaN reaches the wire as null, which is a
  // field sent wrong rather than a field left out.
  const num = (raw?: string) => {
    if (raw == null || raw === '') return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const text = (raw: string) => (raw === '' ? undefined : raw);
  const exec = d.canExec;
  const batch = exec && d.canRunBatch;
  return {
    id: d.id,
    ...(d.description ? { description: d.description } : {}),
    systemType: d.systemType,
    host: d.host,
    ...(num(d.port) != null ? { port: num(d.port) } : {}),
    ...(d.systemType === Systems.SystemTypeEnum.S3 && text(d.bucketName)
      ? { bucketName: d.bucketName }
      : {}),
    rootDir: d.rootDir || '/',
    defaultAuthnMethod: d.defaultAuthnMethod,
    enabled: d.enabled,
    ...(d.allowChildren ? { allowChildren: true } : {}),
    ...(text(d.owner) ? { owner: d.owner } : {}),
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
                  .map((v) => ({
                    key: v.key,
                    value: v.value,
                    ...(v.description ? { description: v.description } : {}),
                  })),
              }
            : {}),
          ...(d.capabilities.length
            ? {
                jobCapabilities: d.capabilities
                  .filter((c) => c.name)
                  .map((c) => ({
                    category: (c.category ||
                      'SCHEDULER') as Systems.CategoryEnum,
                    name: c.name,
                    ...(c.value ? { value: c.value } : {}),
                    ...(num(c.precedence) != null
                      ? { precedence: num(c.precedence) }
                      : {}),
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

/**
 * The step order, flat. The panel groups these under "Define" and "Create";
 * the stepper across the top numbers them 1..N, which is the affordance the
 * classic creator had and this one lost when it became a nav you can enter
 * anywhere. Both are true at once: the nav is still there to jump with, and
 * the numbers still say how far in you are.
 */
// A walk: one pager under the nav; its second row carries the ⓘ and the
// small blue press to Review & Create, which left the head line for it.
const SYSTEM_WALK = { skipTo: { id: 'review', label: 'Review & Create' } };
const STEP_IDS = ['identity', 'host', 'execution', 'batch', 'review'] as const;
const STEP_LABELS: Record<string, string> = {
  identity: 'Identity',
  host: 'Host',
  execution: 'Execution',
  batch: 'Batch',
  review: 'Review & Create',
};

/**
 * The numbered overview, in the body.
 *
 * It started in the panel's banner, which spans the nav column as well, so
 * every section row was pushed down by a strip that had nothing to do with
 * the nav. Here it sits above the step it describes and leaves the sidebar
 * where it was.
 */
const StepStrip: React.FC<{
  id: string;
  onGo: (id: string) => void;
}> = ({ id, onGo }) => {
  const index = STEP_IDS.indexOf(id as (typeof STEP_IDS)[number]);
  return (
    <Box sx={{ mb: 1.5 }}>
      <Stepper activeStep={Math.max(0, index)} alternativeLabel>
        {STEP_IDS.map((step) => (
          <Step key={step} completed={false}>
            <StepLabel onClick={() => onGo(step)} sx={{ cursor: 'pointer' }}>
              {STEP_LABELS[step]}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

/**
 * A worked example of the type currently picked, and one press to take it.
 *
 * The four types differ in ways a blank form cannot show: an iRODS host is
 * not a hostname you would ssh to, a Globus host is a collection UUID, and
 * an S3 endpoint is not the bucket. Seeing one filled in is worth more than
 * a helper line under each field, and it fills the fields it describes so
 * nobody has to retype it.
 */
const ExampleRow: React.FC<{
  preset: SystemTypePreset;
  type: Systems.SystemTypeEnum;
  onUse: () => void;
}> = ({ preset, type, onUse }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      flexWrap: 'wrap',
      px: 1,
      py: 0.6,
      borderRadius: 1,
      bgcolor: SECTION_BG,
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Typography sx={{ ...LABEL_SX, pt: 0 }}>{type} example</Typography>
    <Typography
      sx={{
        fontFamily: 'monospace',
        fontSize: '0.7rem',
        color: 'text.secondary',
        minWidth: 0,
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {preset.example.host}:{preset.port} {preset.example.rootDir}
      {preset.example.bucketName ? ` (${preset.example.bucketName})` : ''}
      {' · '}
      {preset.authn}
      {preset.canExec ? ' · jobs can run here' : ' · storage only'}
    </Typography>
    <Button size="small" onClick={onUse} sx={MICRO_BTN_SX}>
      use it
    </Button>
  </Box>
);

const NewSystemGuidedDialog: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  // the launcher has had a bottom-right grip since it shipped; this dialog is
  // the same kind of form at the same fixed size, and wanting it bigger is
  // the same wish
  const [size, setSize] = useState<PanelSize | null>(() =>
    readStoredPanelSize('newsystem')
  );
  const history = useHistory();
  const [draft, setDraft] = useState<SysDraft>(EMPTY_SYSTEM);
  const set = <K extends keyof SysDraft>(key: K, value: SysDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const [tagInput, setTagInput] = useState('');
  // Escape, the backdrop and the close press ask before throwing away typed
  // work; a pristine form, or one already created, closes at once
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  // the numbered walk: which step the panel is on, and the way to ask it to
  // move — the nav can still jump anywhere, this just keeps the count honest
  const [activeStep, setActiveStep] = useState<string>('identity');
  // rings the nav's problem counts; a nonce, so asking twice rings twice
  const [issuePulse, setIssuePulse] = useState(0);
  const [stepRequest, setStepRequest] = useState<{
    id: string;
    nonce: number;
  }>();
  const goToStep = (id: string) =>
    setStepRequest((previous) => ({ id, nonce: (previous?.nonce ?? 0) + 1 }));

  const preset = SYSTEM_TYPE_PRESETS[draft.systemType];
  const problems = useMemo(() => systemProblems(draft), [draft]);
  const missing = Object.keys(problems).length;
  const request = useMemo(() => assembleSystem(draft), [draft]);
  const dirty =
    tagInput !== '' || JSON.stringify(draft) !== JSON.stringify(EMPTY_SYSTEM);
  const askClose = () => {
    // a create in flight has a result to show
    if (isLoading) return;
    if (dirty && !isSuccess) setConfirmDiscard(true);
    else onClose();
  };

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

  // which step owns which complaint: the nav badge, the review board and the
  // step chips all read this, so a problem can never be counted twice or land
  // on a step that does not hold the field
  const STEP_FIELDS: Record<string, string[]> = {
    identity: ['id', 'owner'],
    host: [
      'host',
      'port',
      'bucketName',
      'rootDir',
      'effectiveUserId',
      'proxyHost',
      'proxyPort',
    ],
    execution: ['jobMaxJobs', 'jobMaxJobsPerUser'],
    batch: ['batchSchedulerProfile'],
  };
  const ownerOf = (key: string) =>
    Object.keys(STEP_FIELDS).find((step) => STEP_FIELDS[step].includes(key)) ??
    (key.startsWith('queue-')
      ? 'batch'
      : key.startsWith('capability-') ||
        key.startsWith('capname-') ||
        key.startsWith('envvar-')
      ? 'execution'
      : 'review');
  const countFor = (step: string) =>
    Object.keys(problems).filter((key) => ownerOf(key) === step).length;

  // every complaint, in step order, as the board says them
  const boardIssues: Array<BoardIssue> = STEP_IDS.flatMap((step) =>
    Object.keys(problems)
      .filter((key) => ownerOf(key) === step)
      .map((key) => ({
        kind: 'blocker' as const,
        key: `problem-${key}`,
        where: STEP_LABELS[step] ?? step,
        message: problems[key],
        onGo: () => goToStep(step),
      }))
  );

  /**
   * What each step has decided, for the nav rows.
   *
   * The apps launcher folds its summary into the section list so the nav
   * doubles as the overview; this is the same idea in the same words, and it
   * rides on SectionedPanel's own details toggle rather than a second switch.
   * Problems come first and in red: they are the reason to look.
   */
  const stepFacts = (step: string): string[] => {
    const some = (n: number, one: string, many = `${one}s`) =>
      `${n} ${n === 1 ? one : many}`;
    switch (step) {
      case 'identity':
        return [
          draft.id || 'no id yet',
          ...(draft.owner ? [`owned by ${draft.owner}`] : []),
          ...(draft.enabled ? [] : ['disabled on create']),
          ...(draft.tags.length ? [some(draft.tags.length, 'tag')] : []),
        ];
      case 'host':
        return [
          `${draft.systemType} ${draft.host || 'host?'}${
            draft.port ? `:${draft.port}` : ''
          }`,
          ...(draft.bucketName ? [`bucket ${draft.bucketName}`] : []),
          draft.rootDir || '/',
          `as ${draft.effectiveUserId || 'the caller'}`,
          draft.defaultAuthnMethod,
          ...(draft.useProxy ? [`via ${draft.proxyHost || 'a proxy'}`] : []),
          ...(draft.dtnSystemId ? [`DTN ${draft.dtnSystemId}`] : []),
          ...(draft.allowChildren ? ['children allowed'] : []),
        ];
      case 'execution':
        return draft.canExec
          ? [
              draft.runtimeType,
              draft.jobWorkingDir || '/',
              ...(draft.envVars.length
                ? [some(draft.envVars.length, 'variable')]
                : []),
              ...(draft.capabilities.length
                ? [
                    some(
                      draft.capabilities.length,
                      'capability',
                      'capabilities'
                    ),
                  ]
                : []),
            ]
          : ['storage only'];
      case 'batch':
        return draft.canExec && draft.canRunBatch
          ? [
              draft.batchScheduler,
              draft.batchSchedulerProfile || 'no profile',
              ...(draft.queues.length
                ? [some(draft.queues.length, 'queue')]
                : ['no queues']),
            ]
          : ['no scheduler'];
      default:
        return [];
    }
  };

  const navDetail = (step: string) => {
    const mine = Object.keys(problems).filter((key) => ownerOf(key) === step);
    const facts = stepFacts(step).filter(Boolean).join(' \u00b7 ');
    if (!mine.length && !facts) return undefined;
    return (
      <Box>
        {mine.map((key) => (
          <Typography
            key={`nav-problem-${key}`}
            sx={{
              fontSize: 10.5,
              lineHeight: 1.35,
              wordBreak: 'break-word',
              color: 'error.main',
            }}
          >
            {problems[key]}
          </Typography>
        ))}
        {!!facts && (
          <Typography
            sx={{
              fontSize: 10.5,
              lineHeight: 1.35,
              wordBreak: 'break-word',
              color: 'text.secondary',
            }}
          >
            {facts}
          </Typography>
        )}
      </Box>
    );
  };

  const firstIssue = boardIssues[0];

  const identityMissing = countFor('identity');
  const hostMissing = countFor('host');
  const execMissing = countFor('execution');
  const batchMissing = countFor('batch');

  const stateOf = (count: number, offLabel?: string) =>
    offLabel != null
      ? {
          label: offLabel,
          tone: 'planned' as const,
          hint: 'This step does not apply to the system as configured',
        }
      : count > 0
      ? {
          label: `${count} to fill`,
          tone: 'blocking' as const,
          hint: 'Fields in this step the system cannot be created without',
        }
      : {
          label: 'ready',
          tone: 'live' as const,
          hint: 'Nothing in this step is missing',
        };

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
          detail: navDetail('identity'),
          render: () => (
            <>
              <StepStrip id="identity" onGo={goToStep} />
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
                <GField
                  label="Owner (optional)"
                  value={draft.owner}
                  onChange={(v) => set('owner', v)}
                  problem={problems.owner}
                  helper="left blank, you own it; naming someone else hands it over on create"
                  mono
                />
                {/* disabled is a real state a system can be created in, and
                    the only way to register one before it is reachable */}
                <ChipChoice
                  label="availability"
                  options={[
                    {
                      value: 'yes',
                      label: 'enabled',
                      hint: 'jobs and file moves may use it',
                    },
                    {
                      value: 'no',
                      label: 'disabled',
                      hint: 'registered, but refused until enabled',
                    },
                  ]}
                  value={draft.enabled ? 'yes' : 'no'}
                  onChange={(v) => set('enabled', v === 'yes')}
                />
                <Box>
                  <Box
                    sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}
                  >
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
                      sx={{
                        display: 'flex',
                        gap: 0.5,
                        flexWrap: 'wrap',
                        mt: 1,
                      }}
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
            </>
          ),
        },
        {
          id: 'host',
          label: 'Host',
          title: 'Host & Access',
          subtitle: 'where it lives and how Tapis signs in',
          icon: <Dns />,
          state: stateOf(hostMissing),
          detail: navDetail('host'),
          render: () => (
            <>
              <StepStrip id="host" onGo={goToStep} />
              <SectionBody lead="The machine itself: its address, the directory Tapis treats as root, and the account it lands as.">
                {/* the type is not a label on one form: it decides the port,
                    the auth method, the root and whether jobs can run here at
                    all, so picking one moves those with it */}
                <ChipChoice
                  label="system type"
                  options={(
                    Object.keys(SYSTEM_TYPE_PRESETS) as Systems.SystemTypeEnum[]
                  ).map((type) => ({
                    value: type,
                    hint: SYSTEM_TYPE_PRESETS[type].hint,
                  }))}
                  value={draft.systemType}
                  onChange={(v) =>
                    setDraft((d) =>
                      applySystemType(d, v as Systems.SystemTypeEnum)
                    )
                  }
                />
                <ExampleRow
                  preset={preset}
                  type={draft.systemType}
                  onUse={() =>
                    setDraft((d) => ({
                      ...d,
                      id: d.id || preset.example.id,
                      host: preset.example.host,
                      rootDir: preset.example.rootDir,
                      port: preset.port,
                      bucketName: preset.example.bucketName ?? '',
                      defaultAuthnMethod: preset.authn,
                    }))
                  }
                />
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: 1.5,
                  }}
                >
                  <GField
                    label="Host"
                    value={draft.host}
                    onChange={(v) => set('host', v)}
                    problem={problems.host}
                    helper={preset.hostHelper}
                    mono
                  />
                  <GField
                    label="Port"
                    value={draft.port}
                    onChange={(v) => set('port', v)}
                    problem={problems.port}
                    helper={`${preset.port} for ${draft.systemType}`}
                    mono
                  />
                </Box>
                {draft.systemType === Systems.SystemTypeEnum.S3 && (
                  <GField
                    label="Bucket name"
                    value={draft.bucketName}
                    onChange={(v) => set('bucketName', v)}
                    problem={problems.bucketName}
                    helper="the bucket itself, without the endpoint"
                    mono
                  />
                )}
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
                  label="child systems"
                  options={[
                    {
                      value: 'no',
                      label: 'this system only',
                      hint: 'the usual case',
                    },
                    {
                      value: 'yes',
                      label: 'allow children',
                      hint: 'users may create their own under this one',
                    },
                  ]}
                  value={draft.allowChildren ? 'yes' : 'no'}
                  onChange={(v) => set('allowChildren', v === 'yes')}
                />
                <ChipChoice
                  label="auth method"
                  options={[
                    { value: Systems.AuthnEnum.PkiKeys, hint: 'SSH keypair' },
                    {
                      value: Systems.AuthnEnum.Password,
                      hint: 'host password',
                    },
                    {
                      value: Systems.AuthnEnum.TmsKeys,
                      hint: 'TMS-minted keys',
                    },
                    {
                      value: Systems.AuthnEnum.AccessKey,
                      hint: 'S3 access key',
                    },
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
            </>
          ),
        },
        {
          id: 'execution',
          label: 'Execution',
          title: 'Execution',
          subtitle: 'whether jobs run here, and how',
          icon: <PlayCircleOutline />,
          state: stateOf(execMissing, draft.canExec ? undefined : 'off'),
          detail: navDetail('execution'),
          render: () => (
            <>
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
                    <StepStrip id="execution" onGo={goToStep} />
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
                        set('envVars', [
                          ...draft.envVars,
                          { key: '', value: '', description: '' },
                        ])
                      }
                      rows={draft.envVars.map((v, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr auto',
                            gap: 1,
                          }}
                        >
                          <GField
                            label="Key"
                            problem={problems[`envvar-${i}`]}
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
                          <GField
                            label="Description (optional)"
                            value={v.description}
                            onChange={(description) =>
                              set(
                                'envVars',
                                draft.envVars.map((row, j) =>
                                  j === i ? { ...row, description } : row
                                )
                              )
                            }
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
                          {
                            category: 'SCHEDULER',
                            name: '',
                            value: '',
                            precedence: '',
                          },
                        ])
                      }
                      rows={draft.capabilities.map((c, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr 0.6fr auto',
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
                            problem={problems[`capname-${i}`]}
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
                          <GField
                            label="Precedence"
                            value={c.precedence}
                            onChange={(precedence) =>
                              set(
                                'capabilities',
                                draft.capabilities.map((row, j) =>
                                  j === i ? { ...row, precedence } : row
                                )
                              )
                            }
                            problem={problems[`capability-${i}`]}
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
            </>
          ),
        },
        {
          id: 'batch',
          label: 'Batch',
          title: 'Batch & Queues',
          subtitle: 'the scheduler, its profile, the queues',
          icon: <Schedule />,
          state: stateOf(
            batchMissing,
            draft.canExec && draft.canRunBatch ? undefined : 'off'
          ),
          detail: navDetail('batch'),
          render: () => (
            <>
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
                    <StepStrip id="batch" onGo={goToStep} />
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
            </>
          ),
        },
      ],
    },
    {
      label: 'Create',
      items: [
        {
          id: 'review',
          label: 'Review & Create',
          title: 'Review & Create',
          subtitle: 'the definition exactly as it will be sent',
          icon: <TaskAlt />,
          state:
            missing > 0
              ? { label: `${missing} to fill`, tone: 'blocking' as const }
              : { label: 'ready', tone: 'live' as const },
          detail: navDetail('review'),
          render: () => (
            <Box sx={{ p: 2, display: 'grid', gap: 1.25, maxWidth: 680 }}>
              <StepStrip id="review" onGo={goToStep} />
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
                  {/* the same board the job launcher's review carries: every
                      complaint in one card, each one a press to the step that
                      owns it, rather than a sentence telling you to go and
                      look down the left-hand side for them */}
                  {missing > 0 ? (
                    <IssueBoard
                      issues={boardIssues}
                      blockerHeading={(count) =>
                        `${count} thing${
                          count > 1 ? 's' : ''
                        } to fix before this system can be created`
                      }
                    />
                  ) : (
                    <Typography
                      sx={{ fontSize: '0.72rem', color: 'text.secondary' }}
                    >
                      Everything required is in place. This is the exact
                      request:
                    </Typography>
                  )}
                  <RecordJson
                    title="System definition"
                    json={request}
                    defaultEmpty
                  />
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
    <>
      <Dialog
        open={true}
        onClose={askClose}
        transitionDuration={{ enter: 90, exit: 120 }}
        fullScreen={fullScreen}
        maxWidth={false}
        PaperProps={{
          sx: {
            position: 'relative', // anchors the resize grip
            width:
              size && !fullScreen
                ? `min(${size.w}px, calc(100vw - 24px))`
                : 'min(960px, calc(100vw - 32px))',
            height: fullScreen
              ? '100%'
              : size
              ? `min(${size.h}px, calc(100vh - 24px))`
              : 'min(700px, calc(100vh - 32px))',
            maxHeight: 'calc(100vh - 24px)',
            borderRadius: fullScreen ? 0 : '7px',
            overflow: 'hidden',
          },
        }}
      >
        {!fullScreen && (
          <PanelResizeHandle storageKey="newsystem" onCommit={setSize} />
        )}
        <SectionedPanel
          groups={groups}
          title="New system — guided"
          caption={draft.id || 'unnamed'}
          headerExtras={
            /* the same head line the job launcher wears: what is left, where
             it starts, the whole list on hover, and one press to that step.
             Review & Create is the small blue press under Continue now. */
            <IssueStatus
              checked
              width={220}
              readyLabel="ready to create"
              blockers={{
                count: missing,
                where: firstIssue?.where,
                lines: boardIssues.map(
                  (issue) => `${issue.where}: ${issue.message}`
                ),
                onGo: firstIssue
                  ? () => {
                      firstIssue.onGo?.();
                      setIssuePulse((nonce) => nonce + 1);
                    }
                  : undefined,
              }}
              done={
                isSuccess ? (
                  <Chip
                    size="small"
                    color="success"
                    variant="outlined"
                    label="created"
                  />
                ) : undefined
              }
            />
          }
          onClose={askClose}
          initialSection="identity"
          onSectionChange={setActiveStep}
          sectionRequest={stepRequest}
          walk={SYSTEM_WALK}
          badgePulse={issuePulse}
          // the rows carry a summary as well as a label now, and like the apps
          // wizard they carry it from the first paint; the header's toggle is
          // still there to fold them away
          navWidth={260}
          navDetailsDefault
        />
      </Dialog>
      <ConfirmModal
        open={confirmDiscard}
        title="Discard this system?"
        confirmText="Discard"
        danger
        onClose={() => setConfirmDiscard(false)}
        onConfirm={onClose}
      >
        The definition has not been created. Closing discards everything entered
        in the four steps.
      </ConfirmModal>
    </>
  );
};

export default NewSystemGuidedDialog;
