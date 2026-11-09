/**
 * App detail page: the app and its fact boxes, its activity (recent runs),
 * and the full record on request. Same layout as the systems and jobs pages.
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
import CreateAppModal from 'app/Apps/_components/AppsToolbar/CreateAppModal';
import UpdateAppModal from 'app/Apps/_components/AppsToolbar/UpdateAppModal';
import JobLaunchModal from 'app/Apps/_components/AppsToolbar/JobLaunchModal';
import { CardMosaic, Fact } from 'app/_components/PageShell/cardKit';
import AppDetailsBox from '../_components/AppDetailsBox';
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
 * Display of a run's outcome from jobVerdict (did work happen), instead of
 * the raw status. The default Status column uses this; the service's own
 * status is a separate column.
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
  // a live run has no verdict yet: show its live state
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

/** every column the runs table can show, same shape as the other tables */
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

/** sort key for a run in a column, from the registry above */
const runSortKey = (j: JobLite, columnId: string) => {
  if (columnId === 'name') return j.name ?? j.uuid ?? '';
  const spec = RUN_COLUMNS.find((c) => c.id === columnId);
  if (!spec) return undefined;
  return spec.sortValue ? spec.sortValue(j) : String(spec.cell(j) ?? '');
};

/** Tapis writes "!tapis_not_set" where an app leaves an attribute to the system default. Not shown. */
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

/** whether the app defines where it runs (exec system, DTN system or dirs) */
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
  // allocations listed by the cluster for this exec system (from submit-filter refusals, see knownAllocations)
  const allocations = useSyncExternalStore(subscribeKnownProjects, () =>
    knownProjects(attrs.execSystemId)
  );
  if (!hasRunsOn(app)) return null;

  // bare rows in the App Details box, sharing its label column
  return (
    <>
      <Fact
        label="runs on"
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
  // the record opens as its own card below this one
  const [showJSON, setShowJSON] = useState(false);
  const [modal, setModal] = useState<string | undefined>(undefined);
  const { data, isLoading, error } = Hooks.useDetail({ appId, appVersion });

  // A deleted app still has a page. The single-app GET returns
  // APPAPI_NOT_FOUND after delete, but the deleted listing (showDeleted)
  // has the record. The card renders from it, read-only, so undelete works.
  const { data: deletedData, isFetching: deletedFetching } =
    Hooks.useDeletedApps();
  // delete is per app, not per version (deleteApp takes appId only), so this
  // row may be a different version than the URL's.
  const deletedSeed = (deletedData?.result ?? []).find((a) => a.id === appId);
  // The deleted listing takes precedence: right after a delete the detail
  // query still holds the earlier record.
  const isDeleted = !!deletedSeed;
  const app: any = (isDeleted ? undefined : data?.result) ?? deletedSeed;

  // Between delete succeeding and the deleted listing refreshing, the detail
  // read 404s while deletedSeed is empty. Suppress the error in that window.
  const notFound = !!error && /NOT_FOUND|not found/i.test(error.message);
  const justDeleted = notFound && (deletedFetching || isDeleted);
  const shownError = justDeleted ? null : error;

  const { undelete, isLoading: restoringNow } = Hooks.useUndeleteApp();
  // the panels are owner-gated (the service refuses everyone else)
  const { claims } = useTapisConfig();
  const isOwner = !!app?.owner && app.owner === claims['tapis/username'];

  const jobs = useJobsSource().jobs as JobLite[];
  const runs = useMemo(() => recentRunsForApp(jobs, appId, 10), [jobs, appId]);
  // header click cycles the sort; the third click restores newest-first (recentRunsForApp order)
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

  // placed by the preference: head line, under the id, or a bar at the card foot
  const acts = useDetailActs({
    actions: (
      // primary action, accent-coloured to stand apart from the JSON toggle and cog
      <PodBarButton accent onClick={() => setModal('submitapp')}>
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
          {/* the app card; paper background like the system and job cards.
              No top margin: the shell's right-pane margin is the inset. */}
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
                  {/* the image is shown in the Details box (too long for a chip) */}
                </>
              }
              acts={acts}
              description={app.description}
              uuid={app.uuid}
              uuidLabel="App UUID"
              created={app.created}
              updated={app.updated}
            >
              {/* rendered from the deleted listing: most actions are disabled */}
              {isDeleted && (
                <DeletedRecordStrip
                  noun="app"
                  consequence="it appears in no listing and launches no jobs"
                  busy={restoringNow}
                  onRestore={() => undelete({ appId })}
                />
              )}
            </DetailHead>

            {/* Same layout as the systems card. Order: Details (with where it
                runs), sharing, lifecycle and history, notes. */}
            <CardMosaic sx={{ mt: 1.25 }}>
              <AppDetailsBox app={app}>
                {hasRunsOn(app) && <JobAttributes app={app} />}
              </AppDetailsBox>
              <AppAccessPanel app={app} />
              {/* whether it runs and what changed it: one box */}
              <AppLifecyclePanel
                app={app}
                canManage={isOwner}
                history={
                  <AppHistoryBox
                    appId={app.id}
                    deleted={app.deleted}
                    embedded
                  />
                }
              />
              {/* last on every detail page; one line when empty */}
              <NotesBox notes={app.notes} tags={app.tags} />
            </CardMosaic>
            {acts.foot}
          </Box>

          {showJSON && (
            <RecordJson
              title="App Definition"
              json={app}
              onClose={() => setShowJSON(false)}
            />
          )}

          {/* Activity: run tiles and the runs table. Outside the card above
              because the table is too wide for a 340px grid cell. */}
          {/* no top margin: the page's flex column gap spaces it */}
          <Box sx={{ minWidth: 0 }}>
            {/* run tiles. No success-rate tile: FlexServ sessions end by
                  cancel on purpose, so a percentage would misreport them. */}
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

            {/* same table shell as the landing tables */}
            <TableShell
              title="Recent Runs"
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
                        {/* glyph: whether work happened, badge for what ended it */}
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

          {/* dialogs for the actions in the head line and cog menu */}
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
