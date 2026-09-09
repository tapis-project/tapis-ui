/**
 * The job's summary card.
 *
 * It used to be six 18px rows — app, system, archive — stacked at 16px gaps,
 * with the actions marooned below a divider at the bottom. Three facts in the
 * space of a screen, while everything a person actually asks a finished job
 * ("which scheduler id? how many nodes? where did it write?") was only in the
 * JSON dump.
 *
 * So: one head line that identifies the run and carries its actions, one
 * meta line for who and when, then a dense two-column fact grid in the
 * landing pages' well. The grid is ordered by how often it is asked — what
 * ran, where, how big, what the scheduler called it — and it collapses, on
 * its own accordion rather than on the global ? switch, so the card is as
 * short as you want it and complete when you open it.
 *
 * A directory belongs to the system it is on, so the system id is the entry
 * — "Execution", "Archive" — and its directories sit tabbed underneath it
 * rather than floating in rows of their own. That is also what stops the
 * job's output directory and the archive directory reading as two unrelated
 * "output" facts. Each one carries the same three presses: open it in the
 * listing at the bottom of this page, open it in the Files page, copy it.
 */
import React, {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  knownProjects,
  parseAvailableProjects,
  rememberProjects,
  subscribeKnownProjects,
} from '../_components/knownAllocations';
import { explainJobEnd, explainJobHold } from '../_components/jobMessages';
import { Jobs } from '@tapis/tapis-typescript';
import {
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Category,
  ContentCopyRounded,
  DoneRounded,
  ExpandMoreRounded,
  FolderOpenRounded,
  GridViewRounded,
  TimerOutlined,
} from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { JobTypeChip } from '@tapis/tapisui-common';
import { timeAgo } from 'app/_components/NavV2Kit/navKit';
import { CellLink, WELL } from 'app/_components/PageShell/overviewKit';
import DetailHead, {
  HiddenChip,
  useDetailActs,
} from 'app/_components/PageShell/detailHead';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import {
  fmtDuration,
  parseSchedulerNotes,
  runtimeMs,
} from '../_components/jobsData';
import { spell } from '../_components/jobVerdict';
import { CardMosaic } from 'app/_components/PageShell/cardKit';
import { getJobFacts, setJobFacts, subscribeJobFacts } from './jobFacts';
import JobGlyph from '../_components/JobGlyph';
import NotesBox from 'app/_components/PageShell/NotesBox';
import JobAccessPanel from './JobAccessPanel';
import JobLifecyclePanel from './JobLifecyclePanel';
import JobHistoryBox from './JobHistoryBox';

const LABEL_SX = {
  fontSize: '0.62rem',
  fontWeight: 700,
  color: 'text.secondary',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
  pt: '2px',
} as const;

const VALUE_SX = { fontSize: '0.76rem', minWidth: 0 } as const;

const MUTED_SX = { fontSize: '0.72rem', color: 'text.secondary' } as const;

const PATH_SX = {
  fontFamily: 'monospace',
  fontSize: '0.72rem',
  color: 'text.secondary',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
} as const;

/**
 * A tooltip that does not stand between you and the next press.
 *
 * There are three of these per directory and up to four directories, so a
 * column of twelve identical buttons. With MUI's defaults the first hover
 * opens a tooltip below the button — over the next one down — and every
 * subsequent hover opens instantly, so walking down the column is walking
 * through a wall of black boxes.
 *
 * disableInteractive is the important half: it gives the popper
 * `pointer-events: none`, so a tooltip sitting over the button below is
 * clicked straight through. The delays are the other half — half a second
 * on the first and on every one after it, which a hand moving down a column
 * never spends in one place.
 */
const QuietTip: React.FC<
  React.PropsWithChildren<{ title: React.ReactNode }>
> = ({ title, children }) => (
  <Tooltip
    title={title}
    placement="top"
    disableInteractive
    enterDelay={500}
    enterNextDelay={500}
    leaveDelay={0}
  >
    {children as React.ReactElement}
  </Tooltip>
);

const ICON_BUTTON_SX = {
  border: 'none',
  background: 'none',
  p: 0.25,
  lineHeight: 0,
  cursor: 'pointer',
  color: 'text.disabled',
  borderRadius: '4px',
  flexShrink: 0,
  textDecoration: 'none',
  display: 'inline-flex',
  '&:hover': { color: '#1565c0', bgcolor: 'rgba(21,101,192,0.08)' },
  '& svg': { fontSize: 14, display: 'block' },
} as const;

/** One press in a directory's button cluster. */
const IconAction: React.FC<
  React.PropsWithChildren<{ label: string; hint: string; onClick: () => void }>
> = ({ label, hint, onClick, children }) => (
  <QuietTip title={hint}>
    <Box
      component="button"
      type="button"
      aria-label={label}
      onClick={onClick}
      sx={ICON_BUTTON_SX}
    >
      {children}
    </Box>
  </QuietTip>
);

/**
 * The same press, as a real anchor.
 *
 * The Files page is a page, so this is a link: middle-click and ⌘-click open
 * it in a tab the way they do everywhere else, and the left click is
 * intercepted for the router so it stays a SPA navigation.
 */
const IconLink: React.FC<
  React.PropsWithChildren<{ label: string; hint: string; to: string }>
> = ({ label, hint, to, children }) => {
  const history = useHistory();
  return (
    <QuietTip title={hint}>
      <Box
        component="a"
        aria-label={label}
        href={`/#${to}`}
        onClick={(event: React.MouseEvent) => {
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0
          ) {
            return;
          }
          event.preventDefault();
          history.push(to);
        }}
        sx={ICON_BUTTON_SX}
      >
        {children}
      </Box>
    </QuietTip>
  );
};

/** Copy, on its own, so it can sit at the end of a cluster. */
export const CopyButton: React.FC<{ value: string; label: string }> = ({
  value,
  label,
}) => {
  const [copied, setCopied] = useState(false);
  return (
    <QuietTip title={copied ? 'Copied' : `Copy ${label}`}>
      <Box
        component="button"
        type="button"
        aria-label={`Copy ${label}`}
        onClick={() => {
          navigator.clipboard?.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        sx={{
          ...ICON_BUTTON_SX,
          ...(copied ? { color: '#1b7f3b' } : {}),
        }}
      >
        {copied ? <DoneRounded /> : <ContentCopyRounded />}
      </Box>
    </QuietTip>
  );
};

/** A grid row. `display: contents` so every label column lines up as one. */
const Fact: React.FC<
  React.PropsWithChildren<{
    label: string;
    when?: boolean;
    /** a cell with stacked directory lines in it cannot be centred */
    stack?: boolean;
    /**
     * A border of its own, for the rows that describe a machine. The
     * execution system and the archive system are different computers, and
     * boxing each one's entry-plus-directories makes that boundary readable
     * at a glance instead of two more rows of the same grid.
     */
    boxed?: boolean;
  }>
> = ({ label, when = true, stack, boxed, children }) =>
  when ? (
    <Box sx={{ display: 'contents' }}>
      <Typography
        sx={{
          ...LABEL_SX,
          // the label reads as the box's caption, so it sits level with the
          // box's first line rather than centred on the whole block
          ...(boxed && { alignSelf: 'start', pt: '9px' }),
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          ...VALUE_SX,
          display: 'flex',
          ...(stack
            ? { flexDirection: 'column', alignItems: 'stretch', gap: 0.25 }
            : { alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }),
          ...(boxed && {
            alignSelf: 'start',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper',
            px: 1,
            py: 0.75,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  ) : null;

/**
 * One directory of the job, and the three things you do with one.
 *
 * The buttons lead, because they are the point and because a row of paths
 * with the presses at the far right is a row of presses at four different
 * x positions. Open-here first (it is the one that costs nothing), then the
 * Files page, then copy.
 */
export const DirLine: React.FC<{
  /** omitted = no label column — for rows whose context already says it */
  label?: string;
  systemId: string;
  path: string;
  /** what the presses call it, when the label alone would not read ("dir") */
  name?: string;
  onBrowse?: (path: string, systemId: string) => void;
  /** the Files-page link is on by default; a DELETED system's paths turn
   *  it off — that page cannot see the system, so the door leads nowhere */
  filesLink?: boolean;
}> = ({
  label,
  systemId,
  path,
  name = label ? `${label} directory` : 'directory',
  onBrowse,
  filesLink = true,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
    {label != null && (
      <Typography sx={{ ...LABEL_SX, pt: 0, width: 42, flexShrink: 0 }}>
        {label}
      </Typography>
    )}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
      {onBrowse && (
        <IconAction
          label={`Browse ${name}`}
          hint="Open in the listing below"
          onClick={() => onBrowse(path, systemId)}
        >
          <FolderOpenRounded />
        </IconAction>
      )}
      {filesLink && (
        <IconLink
          label={`Open ${name} in Files`}
          hint="Open in the Files page"
          to={`/files/${systemId}${path}`}
        >
          <GridViewRounded />
        </IconLink>
      )}
      <CopyButton value={path} label={name} />
    </Box>
    <QuietTip title={path}>
      <Box component="span" sx={PATH_SX}>
        {path}
      </Box>
    </QuietTip>
  </Box>
);

/** An identifier you are going to paste somewhere else. */
export const CopyText: React.FC<{ value: string; title?: string }> = ({
  value,
  title,
}) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.25,
      minWidth: 0,
    }}
  >
    <QuietTip title={title ?? value}>
      <Box
        component="span"
        sx={{
          fontFamily: 'monospace',
          fontSize: '0.72rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </Box>
    </QuietTip>
    <CopyButton value={value} label={title ?? value} />
  </Box>
);

const SMALL_CHIP_SX = {
  height: 18,
  fontSize: '0.65rem',
  borderRadius: '4px',
} as const;

/** One project the cluster named; pressing it copies the id. */
const ProjectChip: React.FC<{ project: string }> = ({ project }) => {
  const [copied, setCopied] = useState(false);
  return (
    <Chip
      size="small"
      variant="outlined"
      label={copied ? 'copied' : project}
      onClick={() => {
        navigator.clipboard?.writeText(project);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      sx={{
        ...SMALL_CHIP_SX,
        fontFamily: 'monospace',
        cursor: 'pointer',
        ...(copied ? { color: '#1b7f3b', borderColor: '#1b7f3b' } : {}),
      }}
    />
  );
};

// the tab under a system's entry line, so its directories read as belonging
// to it rather than as more rows of the grid
const DIRS_UNDER_SYSTEM_SX = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0.25,
  pl: 1.5,
} as const;

/** "2 nodes × 48 cores · 192 GB · up to 60m" — only the parts that exist. */
export const resourceSummary = (job: Jobs.Job): string => {
  const parts: string[] = [];
  if (job.nodeCount) {
    parts.push(`${job.nodeCount} node${job.nodeCount === 1 ? '' : 's'}`);
  }
  if (job.coresPerNode) {
    parts.push(
      `${job.coresPerNode} core${job.coresPerNode === 1 ? '' : 's'}/node`
    );
  }
  if (job.memoryMB) {
    parts.push(
      job.memoryMB >= 1024
        ? `${Math.round((job.memoryMB / 1024) * 10) / 10} GB`
        : `${job.memoryMB} MB`
    );
  }
  if (job.maxMinutes)
    parts.push(`up to ${fmtDuration(job.maxMinutes * 60000)}`);
  return parts.join(' · ');
};

const JobSummaryCard: React.FC<{
  job: Jobs.Job;
  /** a cancel is in flight — asked for, not yet delivered by the scheduler */
  cancelling?: boolean;
  /** the cancel POST came back 2xx — Tapis has the request queued */
  cancelConfirmed?: boolean;
  /** the acts that earn a visible press — Cancel, while there is one */
  actions?: React.ReactNode;
  /** the head line's cog: the acts that do not */
  cog?: React.ReactNode;
  /** the record is a card of its own below this one; the page owns it */
  showJSON?: boolean;
  onToggleJSON?: () => void;
  /** point the listing below the card at one of the job's directories */
  onBrowse?: (path: string, systemId: string) => void;
  /** the session box — a fact box among the others, in the mosaic */
  belowDetails?: React.ReactNode;
  /** the card's last section — for whatever the page wants under it all */
  belowAll?: React.ReactNode;
}> = ({
  job,
  cancelling,
  cancelConfirmed,
  actions,
  cog,
  showJSON = false,
  onToggleJSON,
  onBrowse,
  belowDetails,
  belowAll,
}) => {
  // the card wears the server's status even mid-cancel — the strip below
  // carries the in-flight story instead of a premature Cancelled
  const status = job.status!;
  const failed = job.condition && job.condition !== 'NORMAL_COMPLETION';
  const resources = resourceSummary(job);
  const open = useSyncExternalStore(subscribeJobFacts, getJobFacts);
  // A job's notes arrive as a JSON STRING (the launcher writes one), unlike
  // a system's object — parse when it parses, and keep prose as prose so
  // the box can say it either way.
  const jobNotes = useMemo(() => {
    const raw = (job as { notes?: unknown }).notes;
    if (!raw) return undefined;
    if (typeof raw === 'object') return raw as object;
    try {
      const parsed = JSON.parse(String(raw));
      return parsed && typeof parsed === 'object'
        ? (parsed as object)
        : { notes: String(raw) };
    } catch {
      return { notes: String(raw) };
    }
  }, [job]);
  // Cancel, the record switch and the cog — placed by the preference
  const acts = useDetailActs({
    actions,
    json: onToggleJSON ? { open: showJSON, onToggle: onToggleJSON } : undefined,
    cog,
  });
  const availableProjects = useMemo(
    () => (failed ? parseAvailableProjects(job.lastMessage) : []),
    [failed, job.lastMessage]
  );
  // What this run itself said to the scheduler — its own -A and
  // --reservation, straight out of parameterSet. Per-run fact, first-class.
  const schedNotes = useMemo(
    () => parseSchedulerNotes(job.parameterSet),
    [job.parameterSet]
  );
  // ...and what the cluster has listed for this exec system (learned from
  // submit refusals) — alternatives, minus the one this run already used
  const knownForSystem = useSyncExternalStore(subscribeKnownProjects, () =>
    knownProjects(job.execSystemId)
  );
  const allocations = useMemo(
    () => knownForSystem.filter((p) => p !== schedNotes.allocation),
    [knownForSystem, schedNotes.allocation]
  );
  // a BLOCKED run is parked, not over — its own translated sentence
  const hold = useMemo(
    () => explainJobHold({ status, lastMessage: job.lastMessage }),
    [status, job.lastMessage]
  );
  // the human reading of how it ended — a cancel is quiet, not red
  const ended = useMemo(
    () =>
      explainJobEnd({
        status,
        condition: job.condition as string | undefined,
        lastMessage: job.lastMessage,
      }),
    [status, job.condition, job.lastMessage]
  );
  // remembered per system, so the launcher can offer them before the next
  // submission has a chance to bounce the same way
  useEffect(() => {
    rememberProjects(job.execSystemId, availableProjects);
  }, [job.execSystemId, availableProjects]);
  // the three directories on the exec system, in the order they are asked
  // for: where it wrote, where it ran, what it was given
  const dirs = (
    [
      ['output', job.execSystemOutputDir],
      ['exec', job.execSystemExecDir],
      ['input', job.execSystemInputDir],
    ] as const
  ).filter(([, dir]) => Boolean(dir)) as Array<[string, string]>;
  // what the box is worth when it is shut: the three things asked most
  const summary = [job.execSystemId, resources, job.remoteJobId]
    .filter(Boolean)
    .join(' · ');

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        // the same padding every other card in the shell uses (WELL). This
        // was 1.5, and being the first thing on the page that showed as the
        // job detail starting lower than the app detail beside it.
        p: 1.25,
        minWidth: 0,
      }}
    >
      {/* ── who this is, and what you can do to it ───────────────────── */}
      <Box sx={{ mb: 1.25 }}>
        <DetailHead
          leading={
            <JobGlyph
              job={job as never}
              animation={
                [
                  Jobs.JobStatusEnum.Running,
                  Jobs.JobListDTOStatusEnum.Running,
                ].includes(status)
                  ? 'rotate'
                  : undefined
              }
              cancelling={cancelling}
            />
          }
          title={job.name}
          chips={
            <>
              {/* rectangular, 18px, with the same glyph the app detail uses
                  for the same fact — the pill this used to be was the one
                  chip on either page that did not match the others */}
              <JobTypeChip
                size="small"
                jobType={job.jobType!}
                icon={<Category sx={{ fontSize: 12 }} />}
                sx={SMALL_CHIP_SX}
              />
              {job.remoteStarted && (
                <Tooltip
                  title={
                    // one phrase for both states: the chip means the same
                    // thing whether the clock is still moving or stopped,
                    // and the allowance is the number that gives it scale
                    job.maxMinutes
                      ? `Time on the machine, of the ${spell(
                          job.maxMinutes * 60 * 1000
                        )} it asked for`
                      : 'Time on the machine'
                  }
                >
                  <Chip
                    size="small"
                    icon={<TimerOutlined sx={{ fontSize: 12 }} />}
                    label={`${fmtDuration(runtimeMs(job as never))}${
                      job.ended ? '' : ' so far'
                    }`}
                    sx={SMALL_CHIP_SX}
                  />
                </Tooltip>
              )}
              {job.condition && (
                <Chip
                  size="small"
                  label={String(job.condition)
                    .toLowerCase()
                    .replaceAll('_', ' ')}
                  sx={{
                    ...SMALL_CHIP_SX,
                    fontWeight: 600,
                    ...(failed
                      ? { bgcolor: '#fce8e6', color: '#c62828' }
                      : { bgcolor: '#e7f4ea', color: '#1b7f3b' }),
                  }}
                />
              )}
              <HiddenChip visible={job.visible} />
            </>
          }
          acts={acts}
          // never behind the header's ? switch: that preference is about the
          // app's own explanatory prose, and it was hiding what the SUBMITTER
          // wrote about this run
          description={job.description}
          uuid={job.uuid}
          uuidLabel="Job UUID"
          created={job.created as never}
          updated={job.lastUpdated as never}
        />
      </Box>

      {/* The async truth, said while it is true: the cancel press only
          queued a command, and the run honestly keeps its status until the
          scheduler delivers it. Sent / accepted / acknowledged is as much
          confirmation as the servers give. */}
      {cancelling && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            border: '1px solid #e6d3ae',
            bgcolor: '#fdf8ec',
            borderRadius: 1,
            px: 1,
            py: 0.5,
            mb: 1.25,
          }}
        >
          <CircularProgress
            size={12}
            sx={{ color: '#7a5200', flexShrink: 0 }}
          />
          <Typography
            sx={{ fontSize: '0.72rem', color: '#7a5200', lineHeight: 1.5 }}
          >
            Cancelling. The request{' '}
            {cancelConfirmed ? 'was sent and accepted' : 'is on its way'}
            {/JOB_CANCEL/.test(job.lastMessage ?? '')
              ? ', and the job has acknowledged it'
              : ''}
            . Cancels are asynchronous: the run keeps its real status until the
            scheduler acts, and this page is watching for the end.
          </Typography>
        </Box>
      )}

      {/* BLOCKED is not an ending — Tapis parked the run on a recoverable
          condition (usually a quota) and retries by itself. Said in the
          same grammar as an ending: a translated headline, the transcript
          one press away, and what happens next in plain words. */}
      {hold && (
        <Box sx={{ mb: 1.25 }}>
          {job.lastMessage ? (
            <ErrorDetail
              message={job.lastMessage}
              fontSize="0.72rem"
              headline={hold.headline}
              tone="neutral"
            />
          ) : (
            <Typography sx={{ fontSize: '0.72rem' }}>
              {hold.headline}
            </Typography>
          )}
          <Typography sx={{ ...MUTED_SX, mt: 0.5 }}>{hold.detail}</Typography>
        </Box>
      )}

      {/* A failed submission arrives as a chain of wrappers with the real
          cause at the far end; this shows the cause and keeps the transcript
          one press away. */}
      {job.lastMessage && failed && (
        <Box sx={{ mb: 1.25 }}>
          <ErrorDetail
            message={job.lastMessage}
            fontSize="0.72rem"
            headline={ended?.headline}
            tone={
              ended && (ended.tone === 'quiet' || ended.tone === 'ok')
                ? 'neutral'
                : 'error'
            }
          />
          {/* The one refusal that carries its own remedy: the submit filter
              names every project the user may charge. Said here, and kept —
              the launcher offers these on the next attempt. */}
          {availableProjects.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flexWrap: 'wrap',
                mt: 0.75,
              }}
            >
              <Typography sx={MUTED_SX}>
                the cluster listed your projects, pick one to copy:
              </Typography>
              {availableProjects.map((project) => (
                <ProjectChip key={project} project={project} />
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* ── the facts, in a box you can shut ─────────────────────────── */}
      <Box sx={{ ...WELL, p: 0, overflow: 'hidden' }}>
        <Box
          component="button"
          type="button"
          aria-expanded={open}
          onClick={() => setJobFacts(!open)}
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            minWidth: 0,
            px: 1.25,
            py: 0.75,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
          }}
        >
          <ExpandMoreRounded
            sx={{
              fontSize: 16,
              color: 'text.secondary',
              transform: open ? 'none' : 'rotate(-90deg)',
              transition: 'transform 120ms',
            }}
          />
          <Typography sx={{ ...LABEL_SX, pt: 0 }}>Details</Typography>
          {/* shut, the header still answers the two questions the box is
              opened for most of the time */}
          {!open && summary && (
            <Typography sx={{ ...MUTED_SX, minWidth: 0 }} noWrap>
              {summary}
            </Typography>
          )}
        </Box>

        <Collapse in={open} unmountOnExit>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'max-content minmax(0, 1fr)',
              columnGap: 1.5,
              rowGap: 0.75,
              alignItems: 'center',
              px: 1.25,
              pb: 1.25,
            }}
          >
            <Fact label="App" when={Boolean(job.appId)}>
              <CellLink kind="app" to={`/apps/${job.appId}/${job.appVersion}`}>
                {job.appId}:{job.appVersion}
              </CellLink>
            </Fact>

            {/* the system is the entry; its directories sit indented under
                it — a path is a fact about a machine, not a fact of its own */}
            <Fact
              label="Execution"
              when={Boolean(job.execSystemId)}
              stack
              boxed
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  flexWrap: 'wrap',
                  minWidth: 0,
                }}
              >
                <CellLink kind="system" to={`/systems/${job.execSystemId}`}>
                  {job.execSystemId}
                </CellLink>
                {job.execSystemLogicalQueue && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={job.execSystemLogicalQueue}
                    sx={SMALL_CHIP_SX}
                  />
                )}
                {job.dynamicExecSystem && (
                  <QuietTip title="Tapis chose this system at submit time">
                    <Chip size="small" label="dynamic" sx={SMALL_CHIP_SX} />
                  </QuietTip>
                )}
                {/* the run's own scheduler notes first: the allocation it
                    charged and the reservation it rode, from parameterSet */}
                {schedNotes.allocation && (
                  <QuietTip
                    title={`This run charged allocation ${schedNotes.allocation}, from the job's own scheduler options. Press to copy`}
                  >
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`-A ${schedNotes.allocation}`}
                      onClick={() =>
                        navigator.clipboard?.writeText(schedNotes.allocation!)
                      }
                      sx={{
                        ...SMALL_CHIP_SX,
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        borderColor: '#2e7d32',
                        color: '#1b5e20',
                      }}
                    />
                  </QuietTip>
                )}
                {schedNotes.reservation && (
                  <QuietTip
                    title={`This run rode reservation ${schedNotes.reservation}, from the job's own scheduler options. Press to copy`}
                  >
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`rsv ${schedNotes.reservation}`}
                      onClick={() =>
                        navigator.clipboard?.writeText(schedNotes.reservation!)
                      }
                      sx={{
                        ...SMALL_CHIP_SX,
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        maxWidth: 220,
                        borderColor: '#2e7d32',
                        color: '#1b5e20',
                      }}
                    />
                  </QuietTip>
                )}
                {/* then the alternatives the cluster has listed for this
                    machine — learned from submit refusals */}
                {allocations.map((project) => (
                  <QuietTip
                    key={project}
                    title={`The cluster has listed ${project} as one of your allocations on ${job.execSystemId}. Press to copy for -A`}
                  >
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`-A ${project}`}
                      onClick={() => navigator.clipboard?.writeText(project)}
                      sx={{
                        ...SMALL_CHIP_SX,
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                      }}
                    />
                  </QuietTip>
                ))}
              </Box>
              {dirs.length > 0 && (
                <Box sx={DIRS_UNDER_SYSTEM_SX}>
                  {dirs.map(([label, dir]) => (
                    <DirLine
                      key={label}
                      label={label}
                      systemId={job.execSystemId!}
                      path={dir}
                      onBrowse={onBrowse}
                    />
                  ))}
                </Box>
              )}
            </Fact>

            <Fact
              label="Archive"
              when={Boolean(job.archiveSystemId)}
              stack
              boxed
            >
              <Box>
                <CellLink kind="system" to={`/systems/${job.archiveSystemId}`}>
                  {job.archiveSystemId}
                </CellLink>
              </Box>
              {job.archiveSystemDir && (
                <Box sx={DIRS_UNDER_SYSTEM_SX}>
                  <DirLine
                    label="dir"
                    name="archive directory"
                    systemId={job.archiveSystemId!}
                    path={job.archiveSystemDir}
                    onBrowse={onBrowse}
                  />
                </Box>
              )}
            </Fact>

            <Fact label="Resources" when={Boolean(resources)}>
              <Typography sx={VALUE_SX}>{resources}</Typography>
              {job.mpi && <Chip size="small" label="MPI" sx={SMALL_CHIP_SX} />}
            </Fact>

            {/* The scheduler's own id — what you type into squeue, and the one
            thing a support ticket always asks for. It was JSON-only. */}
            <Fact label="Scheduler" when={Boolean(job.remoteJobId)}>
              <CopyText value={job.remoteJobId!} title="Remote job id" />
              {job.remoteQueue && (
                <Typography sx={MUTED_SX}>on {job.remoteQueue}</Typography>
              )}
              {job.remoteOutcome && (
                <Typography sx={MUTED_SX}>
                  ·{' '}
                  {String(job.remoteOutcome).toLowerCase().replaceAll('_', ' ')}
                </Typography>
              )}
            </Fact>

            {/* Retries and blocks are quiet by default and worth shouting about
            when they are not zero — they explain a job that looks stuck. */}
            <Fact
              label="Trouble"
              when={Boolean(job.remoteSubmitRetries || job.blockedCount)}
            >
              {Boolean(job.remoteSubmitRetries) && (
                <Chip
                  size="small"
                  label={`${job.remoteSubmitRetries} submit retries`}
                  sx={{
                    ...SMALL_CHIP_SX,
                    bgcolor: '#fff4e5',
                    color: '#8a6d00',
                  }}
                />
              )}
              {Boolean(job.blockedCount) && (
                <Chip
                  size="small"
                  label={`blocked ${job.blockedCount}×`}
                  sx={{
                    ...SMALL_CHIP_SX,
                    bgcolor: '#fff4e5',
                    color: '#8a6d00',
                  }}
                />
              )}
            </Fact>

            <Fact label="Timeline">
              <Typography sx={MUTED_SX}>
                {[
                  job.remoteSubmitted &&
                    `submitted ${timeAgo(job.remoteSubmitted as never)}`,
                  job.remoteStarted &&
                    `started ${timeAgo(job.remoteStarted as never)}`,
                  job.ended && `ended ${timeAgo(job.ended as never)}`,
                  !job.ended &&
                    job.lastUpdated &&
                    `last update ${timeAgo(job.lastUpdated as never)}`,
                ]
                  .filter(Boolean)
                  .join(' · ') || 'not started yet'}
              </Typography>
            </Fact>
            <Fact label="Tenant" when={Boolean(job.tenant)}>
              <Typography sx={MUTED_SX}>
                {job.tenant}
                {job.createdby && job.createdby !== job.owner
                  ? ` · submitted by ${job.createdby}`
                  : ''}
              </Typography>
            </Fact>
          </Box>
        </Collapse>
      </Box>

      {/* the boxes the other two detail cards have carried and this one did
          not: whose run this is and who else can reach it, and the run's own
          ledger. Same grid, same 340px minimum, same card. */}
      {/* the session rides the mosaic with the fact boxes, and STAYS there
          when its frame opens — the frame is a fixed-position window over
          the page, not a wide child of this box, so nothing here has to
          move for it. Moving it was what shut it: a different parent is a
          remount, and a remounted card has no frame open. */}
      <CardMosaic sx={{ mt: 1 }}>
        {belowDetails}
        {(jobNotes || (job.tags ?? []).length > 0) && (
          <NotesBox notes={jobNotes} tags={job.tags} />
        )}
        <JobAccessPanel job={job} />
        <JobLifecyclePanel job={job} />
        {job.uuid && <JobHistoryBox jobUuid={job.uuid} />}
      </CardMosaic>

      {acts.foot}
      {belowAll}
    </Box>
  );
};

export default JobSummaryCard;
