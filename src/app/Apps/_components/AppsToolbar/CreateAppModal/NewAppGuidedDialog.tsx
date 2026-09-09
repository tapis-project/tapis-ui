/**
 * NewAppGuidedDialog — creating an app the way the launcher v2 runs one:
 * a SectionedPanel with a short path through the decisions (who it is,
 * what container it runs, what a run needs), and a review section that
 * shows the exact definition before it is sent. The form and JSON modes
 * stay for people who know the shape by heart; this is the door for
 * everyone else.
 */
import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { Apps as Hooks } from '@tapis/tapisui-hooks';
import { Apps } from '@tapis/tapis-typescript';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  BadgeOutlined,
  Inventory2Outlined,
  RocketLaunch,
  TaskAlt,
  TuneRounded,
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

type Draft = {
  id: string;
  version: string;
  description: string;
  runtime: Apps.RuntimeEnum;
  runtimeOption: Apps.RuntimeOptionEnum | '';
  containerImage: string;
  jobType: Apps.JobTypeEnum;
  nodeCount: string;
  coresPerNode: string;
  memoryMB: string;
  maxMinutes: string;
};

const EMPTY: Draft = {
  id: '',
  version: '',
  description: '',
  runtime: Apps.RuntimeEnum.Docker,
  runtimeOption: '',
  containerImage: '',
  jobType: Apps.JobTypeEnum.Batch,
  nodeCount: '',
  coresPerNode: '',
  memoryMB: '',
  maxMinutes: '',
};

// the same rules the form mode validates with, said per field
const NAME_RE = /^[a-zA-Z0-9_.-]+$/;
const IMAGE_RE = /^[a-zA-Z0-9_.\-/:@]+$/;

export const draftProblems = (d: Draft): Record<string, string> => {
  const problems: Record<string, string> = {};
  if (!d.id) problems.id = 'an app needs an id';
  else if (!NAME_RE.test(d.id) || d.id.length > 80)
    problems.id = "letters, digits, '.', '_' or '-', at most 80";
  if (!d.version) problems.version = 'an app needs a version';
  else if (!NAME_RE.test(d.version) || d.version.length > 80)
    problems.version = "letters, digits, '.', '_' or '-', at most 80";
  if (!d.containerImage) problems.containerImage = 'what image does it run?';
  else if (!IMAGE_RE.test(d.containerImage) || d.containerImage.length > 256)
    problems.containerImage = 'not a valid image reference';
  for (const key of [
    'nodeCount',
    'coresPerNode',
    'memoryMB',
    'maxMinutes',
  ] as const) {
    const raw = d[key];
    if (raw !== '' && (!/^\d+$/.test(raw) || Number(raw) < 1))
      problems[key] = 'a whole number, at least 1';
  }
  return problems;
};

/** the request exactly as it will be sent — the review shows this verbatim */
export const assembleApp = (d: Draft): Apps.ReqPostApp => {
  const num = (raw: string) => (raw === '' ? undefined : Number(raw));
  const jobAttributes: Record<string, unknown> = {};
  if (num(d.nodeCount) != null) jobAttributes.nodeCount = num(d.nodeCount);
  if (num(d.coresPerNode) != null)
    jobAttributes.coresPerNode = num(d.coresPerNode);
  if (num(d.memoryMB) != null) jobAttributes.memoryMB = num(d.memoryMB);
  if (num(d.maxMinutes) != null) jobAttributes.maxMinutes = num(d.maxMinutes);
  return {
    id: d.id,
    version: d.version,
    containerImage: d.containerImage,
    ...(d.description ? { description: d.description } : {}),
    runtime: d.runtime,
    ...(d.runtime !== Apps.RuntimeEnum.Docker && d.runtimeOption
      ? { runtimeOptions: [d.runtimeOption] }
      : {}),
    jobType: d.jobType,
    ...(Object.keys(jobAttributes).length ? { jobAttributes } : {}),
  } as Apps.ReqPostApp;
};

// ── the dialog ─────────────────────────────────────────────────────────────

const NewAppGuidedDialog: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const history = useHistory();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const problems = useMemo(() => draftProblems(draft), [draft]);
  const missing = Object.keys(problems).length;
  const request = useMemo(() => assembleApp(draft), [draft]);

  const queryClient = useQueryClient();
  const { createApp, isLoading, isSuccess, error, reset } =
    Hooks.useCreateApp();
  const submit = () =>
    createApp({ reqPostApp: request }, true, {
      onSuccess: () => queryClient.invalidateQueries(Hooks.queryKeys.list),
    });

  const identityMissing = ['id', 'version'].filter((k) => problems[k]).length;
  const containerMissing = problems.containerImage ? 1 : 0;
  const execMissing = [
    'nodeCount',
    'coresPerNode',
    'memoryMB',
    'maxMinutes',
  ].filter((k) => problems[k]).length;

  const blocking = (count: number) =>
    count > 0
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
          subtitle: 'what this app is called, and which cut of it this is',
          icon: <BadgeOutlined />,
          state: blocking(identityMissing),
          render: () => (
            <SectionBody lead="Apps are versioned: the id names the tool, the version names this exact definition — runs remember both.">
              <GField
                autoFocus
                label="App id"
                value={draft.id}
                onChange={(v) => set('id', v)}
                problem={problems.id}
                helper="letters, digits, '.', '_' or '-'"
                mono
              />
              <GField
                label="Version"
                value={draft.version}
                onChange={(v) => set('version', v)}
                problem={problems.version}
                helper="0.0.1 is a fine start"
                mono
              />
              <GField
                label="Description"
                value={draft.description}
                onChange={(v) => set('description', v)}
                helper="what would you tell a colleague this runs?"
              />
            </SectionBody>
          ),
        },
        {
          id: 'container',
          label: 'Container',
          title: 'Container',
          subtitle: 'the image that actually runs',
          icon: <Inventory2Outlined />,
          state: blocking(containerMissing),
          render: () => (
            <SectionBody lead="Every Tapis app runs a container. Name the image; the runtime says which engine the execution system should use.">
              <GField
                label="Container image"
                value={draft.containerImage}
                onChange={(v) => set('containerImage', v)}
                problem={problems.containerImage}
                helper="e.g. ghcr.io/you/tool:1.2 or docker.io/library/python:3.12"
                mono
              />
              <ChipChoice
                label="runtime"
                options={[
                  { value: Apps.RuntimeEnum.Docker, hint: 'Docker engine' },
                  {
                    value: Apps.RuntimeEnum.Singularity,
                    hint: 'Apptainer/Singularity — the HPC-friendly engine',
                  },
                  { value: Apps.RuntimeEnum.Zip, hint: 'a zip of executables' },
                ]}
                value={draft.runtime}
                onChange={(v) => set('runtime', v as Apps.RuntimeEnum)}
              />
              {draft.runtime === Apps.RuntimeEnum.Singularity && (
                <ChipChoice
                  label="singularity mode"
                  options={[
                    {
                      value: Apps.RuntimeOptionEnum.SingularityRun,
                      hint: 'singularity run — batch-style',
                    },
                    {
                      value: Apps.RuntimeOptionEnum.SingularityStart,
                      hint: 'singularity instance start — long-running',
                    },
                  ]}
                  value={draft.runtimeOption}
                  onChange={(v) =>
                    set('runtimeOption', v as Apps.RuntimeOptionEnum)
                  }
                />
              )}
            </SectionBody>
          ),
        },
        {
          id: 'execution',
          label: 'Execution',
          title: 'Execution defaults',
          subtitle: 'what a run asks for unless the job says otherwise',
          icon: <TuneRounded />,
          state: blocking(execMissing),
          render: () => (
            <SectionBody lead="Optional defaults every job of this app starts from — each one can still be changed at launch. Blank means the system's own default.">
              <ChipChoice
                label="job type"
                options={[
                  {
                    value: Apps.JobTypeEnum.Batch,
                    hint: 'through the scheduler',
                  },
                  {
                    value: Apps.JobTypeEnum.Fork,
                    hint: 'straight on the host',
                  },
                ]}
                value={draft.jobType}
                onChange={(v) => set('jobType', v as Apps.JobTypeEnum)}
              />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 1.5,
                }}
              >
                <GField
                  label="Nodes"
                  value={draft.nodeCount}
                  onChange={(v) => set('nodeCount', v)}
                  problem={problems.nodeCount}
                  mono
                />
                <GField
                  label="Cores per node"
                  value={draft.coresPerNode}
                  onChange={(v) => set('coresPerNode', v)}
                  problem={problems.coresPerNode}
                  mono
                />
                <GField
                  label="Memory (MB)"
                  value={draft.memoryMB}
                  onChange={(v) => set('memoryMB', v)}
                  problem={problems.memoryMB}
                  mono
                />
                <GField
                  label="Max minutes"
                  value={draft.maxMinutes}
                  onChange={(v) => set('maxMinutes', v)}
                  problem={problems.maxMinutes}
                  mono
                />
              </Box>
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
            <Box sx={{ p: 2, display: 'grid', gap: 1.25, maxWidth: 640 }}>
              {isSuccess ? (
                <>
                  <Typography sx={{ fontSize: '0.8rem', color: '#1b7f3b' }}>
                    <TaskAlt
                      sx={{ fontSize: 16, verticalAlign: 'text-top', mr: 0.5 }}
                    />
                    {draft.id}:{draft.version} exists now.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<RocketLaunch sx={{ fontSize: 14 }} />}
                      onClick={() => {
                        onClose();
                        history.push(`/apps/${draft.id}/${draft.version}`);
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Open the app
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
                      overflowX: 'auto',
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
                      {isLoading ? 'Creating…' : 'Create app'}
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
          width: fullScreen ? '100%' : 'min(900px, calc(100vw - 32px))',
          height: fullScreen ? '100%' : 'min(640px, calc(100vh - 32px))',
          borderRadius: fullScreen ? 0 : '10px',
          overflow: 'hidden',
        },
      }}
    >
      <SectionedPanel
        groups={groups}
        title="New app — guided"
        caption={
          missing > 0 ? `${missing} field${missing === 1 ? '' : 's'} to go` : ''
        }
        onClose={onClose}
        initialSection="identity"
      />
    </Dialog>
  );
};

export default NewAppGuidedDialog;
