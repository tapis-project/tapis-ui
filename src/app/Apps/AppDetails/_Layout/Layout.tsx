/**
 * App detail — context instead of a JSON dump.
 *
 * The page used to be <JSONDisplay json={app} />: complete, and useless for
 * the questions people actually bring here — does this app work, when did it
 * last run, what happened. Three cards answer those now, in the arrangement
 * the systems and jobs pages use: the app and its fact boxes, its activity,
 * and — when asked for — the record itself, still complete and one press
 * away rather than deleted.
 */
import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { Box, Chip, Skeleton, Tooltip, Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import {
  Apps as Hooks,
  Jobs as JobsHooks,
  useTapisConfig,
} from '@tapis/tapisui-hooks';
import { QueryWrapper } from '@tapis/tapisui-common';
import {
  Cell,
  CellLink,
  GLYPH_COLUMN,
  GlyphCell,
  HCell,
  NO_VALUE,
} from 'app/_components/PageShell/overviewKit';
import {
  SortLabel,
  sortRows,
  useTableSort,
} from 'app/_components/PageShell/tableSort';
import { TableShell } from 'app/_components/PageShell/tableShell';
import {
  ColumnsButton,
  makeColumnsStore,
} from 'app/_components/PageShell/tableColumns';
import JobGlyph from 'app/Jobs/_components/JobGlyph';
import { jobVerdict } from 'app/Jobs/_components/jobVerdict';
import { Category, Memory, RocketLaunch } from '@mui/icons-material';
import PodBarButton from 'app/Pods/_utils/PodBarButton';
import { normTs, timeAgo } from 'app/_components/NavV2Kit/navKit';
import {
  knownProjects,
  subscribeKnownProjects,
} from 'app/Jobs/_components/knownAllocations';
import { useJobsSource } from 'app/Jobs/_components/jobsSource';
import {
  JobLite,
  classifyStatus,
  fmtDuration,
  runtimeMs,
} from 'app/Jobs/_components/jobsData';
import { recentRunsForApp } from 'app/Apps/_components/appsData';
import ContainerImageChip from 'app/Apps/_components/ContainerImageChip';
import CreateAppModal from 'app/Apps/_components/AppsToolbar/CreateAppModal';
import UpdateAppModal from 'app/Apps/_components/AppsToolbar/UpdateAppModal';
import JobLaunchModal from 'app/Apps/_components/AppsToolbar/JobLaunchModal';
import { CardMosaic, Fact, InnerBox } from 'app/_components/PageShell/cardKit';
import DetailHead, {
  DisabledChip,
  LockedChip,
  VisibilityChip,
  useDetailActs,
} from 'app/_components/PageShell/detailHead';
import RecordJson from 'app/_components/PageShell/RecordJson';
import NotesBox from 'app/_components/PageShell/NotesBox';
import DeletedRecordStrip from 'app/_components/PageShell/DeletedRecordStrip';
import AppAccessPanel from '../_components/AppAccessPanel';
import AppSettingsCog from '../_components/AppSettingsCog';
import AppLifecyclePanel from '../_components/AppLifecyclePanel';
import AppHistoryBox from '../_components/AppHistoryBox';

/** the page's cards: paper, like the system and job cards */
const CARD = {
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  p: 1.25,
} as const;

/** the tint a tile wears against that paper */
const WELL = {
  bgcolor: '#fcfcfb',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  p: 1.25,
} as const;

/**
 * How a run READS, as opposed to what its last transition was called.
 *
 * The table used to print j.status straight, which meant a FlexServ
 * session cancelled on purpose after an hour of work said CANCELLED in
 * alarm colours, and a job the scheduler ended at its wall clock having
 * done everything said FAILED. jobVerdict already separates "did work
 * happen" from "what ended it"; the default Status column shows that
 * reading, and the service's own word is available as its own column for
 * anyone who wants the literal record.
 */
const READING: Record<string, { word: string; bg: string; fg: string }> = {
  worked: { word: 'worked', bg: '#eceff1', fg: '#37474f' },
  partial: { word: 'partial', bg: '#fff8e1', fg: '#8d6e00' },
  'never-ran': { word: 'never ran', bg: '#fbe9e7', fg: '#c62828' },
  running: { word: 'running', bg: '#e8f5e9', fg: '#2e7d32' },
  queued: { word: 'queued', bg: '#e3f2fd', fg: '#1565c0' },
  blocked: { word: 'held', bg: '#fff8e1', fg: '#8d6e00' },
};

const readingOf = (j: JobLite) => {
  const verdict = jobVerdict(j);
  // a live run has no verdict yet, so it says which live state it is in
  const key =
    verdict.outcome === 'in-flight'
      ? classifyStatus(j.status)
      : verdict.outcome;
  return { verdict, ...(READING[key] ?? READING.queued) };
};

const StatusChip: React.FC<{ job: JobLite }> = ({ job }) => {
  const { verdict, word, bg, fg } = readingOf(job);
  return (
    <Tooltip title={verdict.headline} arrow disableInteractive>
      <Chip
        size="small"
        label={word}
        sx={{
          height: 16,
          fontSize: '0.58rem',
          borderRadius: '4px',
          bgcolor: bg,
          color: fg,
          fontWeight: 600,
        }}
      />
    </Tooltip>
  );
};

/** every column the runs table can grow, in the other tables' grammar */
const RUN_COLUMNS: Array<{
  id: string;
  label: string;
  hint?: string;
  mono?: boolean;
  raw?: boolean;
  width?: number;
  cell: (j: JobLite) => React.ReactNode;
  sortValue?: (j: JobLite) => string | number;
}> = [
  {
    id: 'ran',
    label: 'Ran',
    hint: 'wall time on the host, dashed until the run started',
    width: 72,
    cell: (j) =>
      j.remoteStarted ? (
        fmtDuration(runtimeMs(j))
      ) : (
        <Tooltip
          title="Never reached RUNNING, so there is no runtime to measure"
          arrow
          disableInteractive
        >
          <span>{NO_VALUE}</span>
        </Tooltip>
      ),
    sortValue: (j) => (j.remoteStarted ? runtimeMs(j) : ''),
  },
  {
    id: 'status',
    label: 'Status',
    hint: 'whether work happened, not which transition was last',
    raw: true,
    width: 84,
    cell: (j) => <StatusChip job={j} />,
    sortValue: (j) => readingOf(j).word,
  },
  {
    id: 'rawStatus',
    label: 'Status (raw)',
    hint: "the service's own word, exactly as the record carries it",
    mono: true,
    width: 96,
    cell: (j) => j.status ?? '',
    sortValue: (j) => j.status ?? '',
  },
  {
    id: 'created',
    label: 'Created',
    width: 76,
    cell: (j) => timeAgo(j.created),
    sortValue: (j) => (j.created ? -normTs(j.created) : ''),
  },
  {
    id: 'ended',
    label: 'Ended',
    width: 76,
    cell: (j) => (j.ended ? timeAgo(j.ended) : ''),
    sortValue: (j) => (j.ended ? -normTs(j.ended) : ''),
  },
  {
    id: 'system',
    label: 'System',
    mono: true,
    cell: (j) => j.execSystemId ?? '',
  },
  { id: 'owner', label: 'Owner', cell: (j) => j.owner ?? '' },
  { id: 'uuid', label: 'UUID', mono: true, cell: (j) => j.uuid ?? '' },
];

const runColumnsStore = makeColumnsStore('apps.runs.columns', [
  'ran',
  'status',
  'created',
]);

/** a run's own key for each sortable column, off the registry above */
const runSortKey = (j: JobLite, columnId: string) => {
  if (columnId === 'name') return j.name ?? j.uuid ?? '';
  const spec = RUN_COLUMNS.find((c) => c.id === columnId);
  if (!spec) return undefined;
  return spec.sortValue ? spec.sortValue(j) : String(spec.cell(j) ?? '');
};

/**
 * Tapis writes "!tapis_not_set" where an app leaves a job attribute to the
 * system's default. Printed as-is it looks like a misconfiguration; it means
 * the opposite, so it is simply not a fact worth a row.
 */
const NOT_SET = '!tapis_not_set';
const set = (value?: string) => Boolean(value) && value !== NOT_SET;

const MONO_PATH = {
  fontFamily: 'monospace',
  fontSize: '0.7rem',
  color: 'text.secondary',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

const CHIP_SX = {
  height: 18,
  fontSize: '0.65rem',
  borderRadius: '4px',
} as const;

/**
 * What the app says about where its jobs run.
 *
 * jobAttributes was JSON-only, so the answer to "which machine does this
 * thing land on" — the first question anyone asks before submitting — meant
 * opening the definition tab and reading a nested object. The exec system is
 * a link, because it is a page in this app.
 */
/** whether the app says anything at all about where it runs */
export const hasRunsOn = (app: any) => {
  const attrs = app?.jobAttributes ?? {};
  return Boolean(
    set(attrs.execSystemId) ||
      attrs.dynamicExecSystem ||
      set(attrs.dtnSystemInputDir) ||
      set(attrs.dtnSystemOutputDir) ||
      set(attrs.dtnSystemId)
  );
};

export const JobAttributes: React.FC<{ app: any }> = ({ app }) => {
  const attrs = app.jobAttributes ?? {};
  // allocations the cluster itself has listed for this exec system — learned
  // from submit-filter refusals and kept per system (knownAllocations)
  const allocations = useSyncExternalStore(subscribeKnownProjects, () =>
    knownProjects(attrs.execSystemId)
  );
  if (!hasRunsOn(app)) return null;

  // bare rows, not a grid of their own: these sit in an InnerBox now and
  // share its label column with every other fact box on the page
  return (
    <>
      <Fact
        label="Runs on"
        when={set(attrs.execSystemId) || attrs.dynamicExecSystem}
      >
        {set(attrs.execSystemId) ? (
          <CellLink kind="system" to={`/systems/${attrs.execSystemId}`}>
            {attrs.execSystemId}
          </CellLink>
        ) : (
          <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary' }}>
            chosen at submit time
          </Typography>
        )}
        {set(attrs.execSystemLogicalQueue) && (
          <Chip
            size="small"
            variant="outlined"
            label={attrs.execSystemLogicalQueue}
            sx={CHIP_SX}
          />
        )}
        {allocations.map((project) => (
          <Tooltip
            key={project}
            title={`The cluster has listed ${project} as one of your allocations on ${attrs.execSystemId}. Press to copy for -A`}
          >
            <Chip
              size="small"
              variant="outlined"
              label={`-A ${project}`}
              onClick={() => navigator.clipboard?.writeText(project)}
              sx={{ ...CHIP_SX, fontFamily: 'monospace', cursor: 'pointer' }}
            />
          </Tooltip>
        ))}
        {attrs.dynamicExecSystem && (
          <Tooltip title="Tapis picks the system per submission from the app's constraints">
            <Chip size="small" label="dynamic" sx={CHIP_SX} />
          </Tooltip>
        )}
      </Fact>

      <Fact
        label="DTN"
        when={
          set(attrs.dtnSystemId) ||
          set(attrs.dtnSystemInputDir) ||
          set(attrs.dtnSystemOutputDir)
        }
      >
        {set(attrs.dtnSystemId) && (
          <CellLink kind="system" to={`/systems/${attrs.dtnSystemId}`}>
            {attrs.dtnSystemId}
          </CellLink>
        )}
        {set(attrs.dtnSystemInputDir) && (
          <Typography sx={MONO_PATH}>in {attrs.dtnSystemInputDir}</Typography>
        )}
        {set(attrs.dtnSystemOutputDir) && (
          <Typography sx={MONO_PATH}>out {attrs.dtnSystemOutputDir}</Typography>
        )}
      </Fact>
    </>
  );
};

const Tile: React.FC<{ value: string; label: string; color?: string }> = ({
  value,
  label,
  color,
}) => (
  <Box sx={{ ...WELL, minWidth: 92, textAlign: 'center', px: 1.5 }}>
    <Typography
      sx={{
        fontSize: 20,
        fontWeight: 700,
        lineHeight: 1.15,
        color: color ?? 'text.primary',
      }}
    >
      {value}
    </Typography>
    <Typography sx={{ fontSize: '0.64rem', color: 'text.secondary' }}>
      {label}
    </Typography>
  </Box>
);

const Layout: React.FC<{ appId: string; appVersion: string }> = ({
  appId,
  appVersion,
}) => {
  const history = useHistory();
  // the record opens as its own card below this one, the way it does on
  // systems and jobs — it is no longer a tab that costs you the overview
  const [showJSON, setShowJSON] = useState(false);
  const [modal, setModal] = useState<string | undefined>(undefined);
  const { data, isLoading, error } = Hooks.useDetail({ appId, appVersion });

  // A DELETED app still has a page. The single-app GET cannot see it — it
  // answers APPAPI_NOT_FOUND the moment the delete lands, which is what
  // used to slam a raw Tapis refusal over the card you were standing on —
  // but the deleted listing can, whole, because it asks with showDeleted.
  // The card renders from that, read-only, so undelete stays reachable.
  const { data: deletedData, isFetching: deletedFetching } =
    Hooks.useDeletedApps();
  // delete is per APP, not per version (deleteApp takes appId alone), so
  // the row that comes back may be a different version than the URL asked
  // for. It is the right record for the one question left on this page.
  const deletedSeed = (deletedData?.result ?? []).find((a) => a.id === appId);
  // The deleted listing WINS: right after a delete the detail query still
  // holds the record it fetched while the app lived, and "stale but
  // present" must not outvote "the deleted list has it now".
  const isDeleted = !!deletedSeed;
  const app: any = (isDeleted ? undefined : data?.result) ?? deletedSeed;

  // The moment between "delete succeeded" and "the deleted listing has
  // refreshed": the detail read 404s while deletedSeed is still empty.
  // Hold quiet rather than flashing the refusal — the listing lands in a
  // beat and the Lifecycle box takes over with its restore press.
  const notFound = !!error && /NOT_FOUND|not found/i.test(error.message);
  const justDeleted = notFound && (deletedFetching || isDeleted);
  const shownError = justDeleted ? null : error;

  // the way back, on the card as well as on the nav row's trash badge
  const { undelete, isLoading: restoringNow } = Hooks.useUndeleteApp();
  // the panels are owner-gated; the service refuses everyone else anyway,
  // and offering a press that cannot work is worse than not offering it
  const { claims } = useTapisConfig();
  const isOwner = !!app?.owner && app.owner === claims['tapis/username'];

  const jobs = useJobsSource().jobs as JobLite[];
  const runs = useMemo(() => recentRunsForApp(jobs, appId, 10), [jobs, appId]);
  // press a header to reorder; the third press returns to newest-first,
  // which is the order recentRunsForApp hands them over in
  const { sort, cycleSort } = useTableSort();
  // which columns this browser shows for the runs table, in registry order
  const chosenRunColumns = runColumnsStore.use();
  const runColumns = useMemo(
    () => RUN_COLUMNS.filter((c) => chosenRunColumns.includes(c.id)),
    [chosenRunColumns]
  );
  const sortedRuns = useMemo(
    () => sortRows(runs, sort, runSortKey, (j) => j.uuid ?? ''),
    [runs, sort]
  );
  const total = useMemo(
    () => jobs.filter((j) => j.appId === appId).length,
    [jobs, appId]
  );
  const runningNow = useMemo(
    () =>
      jobs.filter((j) => j.appId === appId && j.status === 'RUNNING').length,
    [jobs, appId]
  );

  // built once, placed by the preference — head line, under the id, or a
  // bar at the card's foot
  const acts = useDetailActs({
    actions: (
      <PodBarButton onClick={() => setModal('submitapp')}>
        <RocketLaunch
          sx={{ fontSize: 14, mr: 0.25, verticalAlign: 'text-top' }}
        />
        submit job
      </PodBarButton>
    ),
    json: { open: showJSON, onToggle: () => setShowJSON((s) => !s) },
    cog: app ? (
      <AppSettingsCog
        app={app}
        canManage={isOwner}
        onUpdate={() => setModal('updateapp')}
        onCreate={() => setModal('createapp')}
      />
    ) : undefined,
  });

  return (
    <QueryWrapper isLoading={isLoading} error={shownError}>
      {!app ? (
        <Skeleton variant="rectangular" sx={{ width: '100%', height: 300 }} />
      ) : (
        <Box
          sx={{
            pb: 2,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* the app itself — paper, like the system and job cards. It was
              the one detail card wearing the section tint, which made its
              inner boxes disappear into it. No top margin: the shell's
              right-pane margin is the page's inset. */}
          <Box sx={CARD}>
            <DetailHead
              mono
              title={app.id}
              chips={
                <>
                  <Chip size="small" label={`v${app.version}`} sx={CHIP_SX} />
                  <VisibilityChip isPublic={app.isPublic} />
                  <DisabledChip
                    enabled={app.enabled}
                    what="Disabled: no new jobs can be launched from it"
                  />
                  <LockedChip
                    locked={app.locked}
                    what={`Locked: v${app.version} cannot be edited`}
                  />
                  {app.jobType && (
                    <Chip
                      size="small"
                      icon={<Category sx={{ fontSize: 12 }} />}
                      label={app.jobType}
                      sx={CHIP_SX}
                    />
                  )}
                  {app.runtime && (
                    <Chip
                      size="small"
                      icon={<Memory sx={{ fontSize: 12 }} />}
                      label={app.runtime}
                      sx={CHIP_SX}
                    />
                  )}
                  {/* what it actually runs — beside the runtime, which is how */}
                  <ContainerImageChip value={app.containerImage} />
                </>
              }
              acts={acts}
              description={app.description}
              uuid={app.uuid}
              uuidLabel="App UUID"
              created={app.created}
              updated={app.updated}
            >
              {/* the page is rendered from the deleted listing here, with
                  most of its doors shut — without this it reads as an
                  ordinary app that has quietly stopped working */}
              {isDeleted && (
                <DeletedRecordStrip
                  noun="app"
                  consequence="it appears in no listing and launches no jobs"
                  busy={restoringNow}
                  onRestore={() => undelete({ appId })}
                />
              )}
            </DetailHead>

            {/* The systems card's shape: boxes inside a card, on the same
                auto-fit grid, so an app and a system read as the same kind
                of page. Each box answers one question — where it runs, by
                whom, whether it runs, what changed. */}
            <CardMosaic sx={{ mt: 1.25 }}>
              {/* "Runs on" was loose text under the description — the one
                  fact block on these three pages not living in a box */}
              {hasRunsOn(app) && (
                <InnerBox title="Where it runs">
                  <JobAttributes app={app} />
                </InnerBox>
              )}
              {(app.notes || (app.tags ?? []).length > 0) && (
                <NotesBox notes={app.notes} tags={app.tags} />
              )}
              <AppAccessPanel app={app} />
              <AppLifecyclePanel app={app} canManage={isOwner} />
              <AppHistoryBox appId={app.id} deleted={app.deleted} />
            </CardMosaic>
            {acts.foot}
          </Box>

          {showJSON && (
            <RecordJson
              title="App definition"
              json={app}
              onClose={() => setShowJSON(false)}
            />
          )}

          {/* ── what it has been doing ───────────────────────────────────
              Not a card of its own. It was one, with an "Activity" title
              and a "from the shared jobs window" caption, which put a
              frame around a frame: the tiles carry their own labels and
              the table now wears TableShell, whose strip says where its
              rows come from. The outer box was titling things that had
              already named themselves.

              The runs table stays OUT of the card above because it is five
              columns wide and unreadable in a 340px grid cell, the same
              reason the file explorer sits below the system card rather
              than inside it. Metrics charts land beside the tiles when
              they arrive (docs/WIDE_CARDS_PLAN.md is what would let them
              back into a grid). */}
          {/* no top margin: this is a child of the page's flex column, and
              that column's gap already spaces it from the card above. The
              margin was stacking on the gap. */}
          <Box sx={{ minWidth: 0 }}>
            {/* run tiles. No success-rate tile: "0% success" is accurate
                  and reads as an indictment — a FlexServ ends by cancel on
                  purpose, so the percentage judges apps for how they are
                  used. The per-run endings below carry the same facts
                  without a verdict. */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <Tile value={String(total)} label="recent runs" />
              <Tile
                value={String(runningNow)}
                label="running now"
                color={runningNow ? '#1b7f3b' : undefined}
              />
              <Tile
                value={runs[0]?.created ? timeAgo(runs[0].created) : 'never'}
                label="last run"
              />
            </Box>

            {/* the landing tables' own shell, so this reads as the same
                furniture: a title, the columns / density / info presses,
                and the provenance line along the bottom. It was an
                InnerBox with a hand-rolled table and a loose caption. */}
            <TableShell
              title="Recent runs"
              about="Counted from the shared jobs window, so a run older than that window is not here. Status is this page's reading of the run (whether work happened), not the last state transition; add the raw column for the service's own word. Full logs are on each job."
              controls={
                <ColumnsButton
                  sections={[
                    {
                      label: 'Columns',
                      options: RUN_COLUMNS.map((c) => ({
                        id: c.id,
                        label: c.label,
                        hint: c.hint,
                      })),
                    },
                  ]}
                  chosen={chosenRunColumns}
                  onToggle={runColumnsStore.toggle}
                  onReset={runColumnsStore.reset}
                  isDefault={runColumnsStore.isDefault(chosenRunColumns)}
                />
              }
              facts={`Window: the last ${jobs.length} jobs. Older runs are not counted.`}
            >
              {runs.length === 0 ? (
                <Typography
                  sx={{ fontSize: '0.72rem', color: 'text.secondary', p: 1 }}
                >
                  No runs in the last {jobs.length} jobs. Use Submit Job above
                  to launch this app.
                </Typography>
              ) : (
                <Box
                  component="table"
                  sx={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    tableLayout: 'fixed',
                  }}
                >
                  <Box component="thead">
                    <Box component="tr">
                      <HCell width={GLYPH_COLUMN}> </HCell>
                      <HCell>
                        <SortLabel
                          id="name"
                          label="Job"
                          sort={sort}
                          onSort={cycleSort}
                        />
                      </HCell>
                      {runColumns.map((c) => (
                        <HCell key={c.id} width={c.width}>
                          <SortLabel
                            id={c.id}
                            label={c.label}
                            sort={sort}
                            onSort={cycleSort}
                          />
                        </HCell>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {sortedRuns.map((j) => (
                      <Box
                        component="tr"
                        key={j.uuid}
                        onClick={() =>
                          j.uuid && history.push(`/jobs/${j.uuid}`)
                        }
                        sx={{
                          cursor: 'pointer',
                          borderTop: '1px solid',
                          borderColor: 'divider',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                        }}
                      >
                        {/* the glyph says whether work happened and badges
                            what ended it. It replaces a red exclamation
                            that fired on any condition but NORMAL_COMPLETION,
                            so a session cancelled on purpose wore an alarm. */}
                        <GlyphCell>
                          <JobGlyph job={j} />
                        </GlyphCell>
                        <Cell mono>{j.name ?? j.uuid}</Cell>
                        {runColumns.map((c) =>
                          c.raw ? (
                            <Box key={c.id} component="td" sx={{ px: 0.75 }}>
                              {c.cell(j)}
                            </Box>
                          ) : (
                            <Cell key={c.id} mono={c.mono} muted>
                              {c.cell(j)}
                            </Cell>
                          )
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </TableShell>
          </Box>

          {/* the acts the head line offers, as their dialogs. They used to
              come bundled with AppsToolbar's buttons; the buttons moved
              (one to the head line, two into the cog) and the dialogs
              stayed behind, so the page owns them now. */}
          {modal === 'submitapp' && (
            <JobLaunchModal app={app} toggle={() => setModal(undefined)} />
          )}
          {modal === 'updateapp' && (
            <UpdateAppModal app={app} toggle={() => setModal(undefined)} />
          )}
          {modal === 'createapp' && (
            <CreateAppModal toggle={() => setModal(undefined)} />
          )}
        </Box>
      )}
    </QueryWrapper>
  );
};

export default React.memo(Layout);
