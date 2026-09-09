/**
 * SystemsOverview — the /systems landing, replacing "select a system" prose.
 *
 * The same landing grammar as Jobs, Apps and Files: the About block with the
 * registry's shape as tiles, then every loaded system as a dense table —
 * host, owner, auth method, whether it runs jobs — each row a click into the
 * system's own page. One search (the nav's box) filters both surfaces, and
 * the table shows exactly the window the nav has loaded.
 */
import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { Box, Tooltip } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Lock, Person, Public, Add } from '@mui/icons-material';
import {
  Cell,
  CellLink,
  EmptyRow,
  GLYPH_COLUMN,
  GlyphCell,
  HCell,
  SkeletonRows,
} from 'app/_components/PageShell/overviewKit';
import { normTs, timeAgo } from 'app/_components/NavV2Kit/navKit';
import { NO_VALUE } from 'app/_components/PageShell/overviewKit';
import {
  SortLabel,
  sortRows,
  useTableSort,
} from 'app/_components/PageShell/tableSort';
import { SystemTypeChip } from 'app/_components/NavV2Kit/SystemTypeTile';
import PageAbout from 'app/_components/PageShell/PageAbout';
import { TableShell, windowFacts } from 'app/_components/PageShell/tableShell';
import PodBarButton from 'app/Pods/_utils/PodBarButton';
import {
  ColumnsButton,
  makeColumnsStore,
} from 'app/_components/PageShell/tableColumns';
import { useSystemsSource } from 'app/Files/_components/systemsSource';
import { nounFor } from 'app/_components/NavSpine';
import NewSystemDialog from './SystemToolbar/NewSystemDialog';
import { getSystemsSearch, subscribeSystemsSearch } from './systemsSearch';

/** every column this table can grow — the window already fetches full
 *  records, so the extras cost nothing to offer */
const SYSTEM_COLUMNS: Array<{
  id: string;
  label: string;
  hint?: string;
  mono?: boolean;
  raw?: boolean;
  cell: (s: any) => React.ReactNode;
  /** what this column contributes to an ordering. A cell can be a chip or
   *  a link, and neither compares — so the sort reads this instead. */
  sortValue?: (s: any) => string | number;
}> = [
  { id: 'host', label: 'Host', mono: true, cell: (s) => s.host ?? '' },
  { id: 'owner', label: 'Owner', cell: (s) => s.owner ?? '' },
  { id: 'auth', label: 'Auth', cell: (s) => s.defaultAuthnMethod ?? '' },
  {
    id: 'type',
    label: 'Type',
    raw: true,
    cell: (s) => <SystemTypeChip type={s.systemType} />,
    sortValue: (s) => s.systemType ?? '',
  },
  {
    id: 'jobs',
    label: 'Jobs',
    hint: 'whether jobs can execute here',
    cell: (s) => (s.canExec ? 'runs jobs' : NO_VALUE),
    // the ones that run jobs first, not the string 'runs jobs' vs a dash
    sortValue: (s) => (s.canExec ? 0 : 1),
  },
  {
    id: 'updated',
    label: 'Updated',
    cell: (s) => (s.updated ? timeAgo(s.updated) : ''),
    // newest first on the first press: "Updated" means recency, and
    // sorting a date column alphabetically by "3 days ago" is nonsense
    sortValue: (s) => (s.updated ? -normTs(s.updated) : ''),
  },
  {
    id: 'rootDir',
    label: 'Root dir',
    mono: true,
    cell: (s) => s.rootDir ?? '',
  },
  {
    id: 'effUser',
    label: 'On host as',
    mono: true,
    hint: '${apiUserId} means everyone lands as themselves',
    cell: (s) => s.effectiveUserId ?? '',
  },
  {
    id: 'port',
    label: 'Port',
    mono: true,
    cell: (s) => (s.port != null && s.port !== -1 ? String(s.port) : ''),
    sortValue: (s) => (s.port != null && s.port !== -1 ? s.port : ''),
  },
  { id: 'tags', label: 'Tags', cell: (s) => (s.tags ?? []).join(', ') },
];

/** every column sorts on its own key, falling back to the rendered text
 *  when that text IS the value (host, owner, auth, root dir, tags) */
const systemSortKey = (s: any, columnId: string) => {
  const spec = SYSTEM_COLUMNS.find((c) => c.id === columnId);
  if (columnId === 'id') return s.id ?? '';
  if (!spec) return undefined;
  return spec.sortValue ? spec.sortValue(s) : String(spec.cell(s) ?? '');
};
const systemsColumnsStore = makeColumnsStore('systems.columns', [
  'host',
  'owner',
  'auth',
  'type',
  'jobs',
  'updated',
]);

const SystemsOverview: React.FC = () => {
  const history = useHistory();
  const source = useSystemsSource();
  const { isLoading, error, spine } = source;
  const systems = source.systems as any[];
  const { data: deletedData } = Hooks.useDeletedList();
  const deletedCount = deletedData?.result?.length ?? 0;
  const [creating, setCreating] = useState(false);

  // one search for the whole page: the nav's box drives this table too
  const q = useSyncExternalStore(subscribeSystemsSearch, getSystemsSearch);
  // which columns this browser shows, in registry order
  const chosenColumns = systemsColumnsStore.use();
  // press a header to order by it: asc, desc, then back to name order
  const { sort, cycleSort } = useTableSort();
  const columns = useMemo(
    () => SYSTEM_COLUMNS.filter((c) => chosenColumns.includes(c.id)),
    [chosenColumns]
  );

  const publicCount = systems.filter((s) => s.isPublic).length;
  const disabledCount = systems.filter((s) => s.enabled === false).length;
  const execCount = systems.filter((s) => s.canExec).length;

  const needle = q.trim().toLowerCase();
  const rows = useMemo(() => {
    const matched = systems
      .filter(
        (s) =>
          !needle ||
          [s.id, s.host, s.owner, s.systemType, s.defaultAuthnMethod]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(needle)
      )
      // the page's own order, and where a third press on a header returns
      .sort((a, b) => (a.id ?? '').localeCompare(b.id ?? ''));
    return sortRows(matched, sort, systemSortKey, (s) => s.id ?? '');
  }, [systems, needle, sort]);

  return (
    // the page renders as itself on first load — real About, real table
    // header, skeleton rows — instead of a spinner the chrome pops out of
    <QueryWrapper isLoading={false} error={error}>
      {/* no top or side padding: the shell's right-pane margin is
          the page's inset, the same as every Pods page */}
      <Box sx={{ pb: 2 }}>
        <PageAbout
          loading={isLoading}
          title="Systems"
          stats={[
            { n: systems.length, label: 'systems' },
            { n: publicCount, label: 'public', color: '#1565c0' },
            { n: systems.length - publicCount, label: 'mine & shared' },
            {
              n: execCount,
              label: 'run jobs',
              color: '#1b7f3b',
              hint: 'Systems with canExec: the ones jobs can execute on',
            },
            {
              n: disabledCount,
              label: 'disabled',
              color: '#c62828',
              when: disabledCount > 0,
            },
            {
              n: deletedCount,
              label: 'deleted',
              color: '#c62828',
              when: deletedCount > 0,
              hint: 'Soft-deleted, restorable from the bottom of the nav',
            },
          ]}
          actions={
            <PodBarButton onClick={() => setCreating(true)}>
              <Add sx={{ fontSize: 14, mr: 0.25, verticalAlign: 'text-top' }} />
              new system
            </PodBarButton>
          }
          lead="A system is a registered host (a cluster, a VM, an S3 bucket) that Tapis can reach for files and, when it allows it, run jobs on."
          points={[
            'Pick a system from the list or the table to see its definition, credentials and controls.',
            'Files live on systems; jobs run on the ones marked as able.',
            'Registering credentials happens on the system page once, then everything else just works.',
          ]}
        />
        <TableShell
          title="Systems"
          hint={
            isLoading
              ? 'listing systems: public ones are the tenant’s, the rest yours'
              : q
              ? `filtered by nav search: "${q}"`
              : undefined
          }
          about="The nav's search box filters this table too: one search drives both surfaces. The counts above the table are computed from the loaded window, not the whole registry."
          controls={
            <ColumnsButton
              sections={[
                {
                  label: 'Columns',
                  options: SYSTEM_COLUMNS.map((c) => ({
                    id: c.id,
                    label: c.label,
                    hint: c.hint,
                  })),
                },
              ]}
              chosen={chosenColumns}
              onToggle={systemsColumnsStore.toggle}
              onReset={systemsColumnsStore.reset}
              isDefault={systemsColumnsStore.isDefault(chosenColumns)}
            />
          }
          error={error as Error | null}
          facts={
            // this table IS the nav's window, so growing it there grows
            // this too — and it says nothing when nothing is missing
            windowFacts(
              systems.length,
              nounFor('systems', systems.length),
              spine
            )
          }
        >
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
            }}
          >
            <Box component="thead" sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <Box component="tr">
                <HCell width={GLYPH_COLUMN}> </HCell>
                {/* System keeps its width; the chosen columns split the
                    rest evenly — fixed layout keeps any count honest */}
                <HCell width="23%">
                  <SortLabel
                    id="id"
                    label="System"
                    sort={sort}
                    onSort={cycleSort}
                  />
                </HCell>
                {columns.map((c) => (
                  <HCell key={c.id}>
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
              {isLoading && <SkeletonRows cols={2 + columns.length} />}
              {rows.map((s) => (
                <Box
                  component="tr"
                  key={s.id}
                  onClick={() => history.push(`/systems/${s.id}`)}
                  sx={{
                    cursor: 'pointer',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                  }}
                >
                  <GlyphCell>
                    {s.enabled === false ? (
                      <Tooltip title="Disabled: jobs and listings fail" arrow>
                        <Lock sx={{ color: '#c62828' }} />
                      </Tooltip>
                    ) : s.isPublic ? (
                      <Tooltip title="Public: tenant-wide" arrow>
                        <Public sx={{ color: '#1565c0' }} />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Yours or shared with you" arrow>
                        <Person sx={{ color: 'text.disabled' }} />
                      </Tooltip>
                    )}
                  </GlyphCell>
                  <Cell mono>
                    {/* the row opens the system; the name is the same place,
                        offered as a real anchor for middle/⌘ clicks */}
                    <CellLink kind="system" to={`/systems/${s.id}`}>
                      {s.id}
                    </CellLink>
                  </Cell>
                  {columns.map((c) =>
                    c.raw ? (
                      <Box key={c.id} component="td" sx={{ px: 0.75 }}>
                        {c.cell(s)}
                      </Box>
                    ) : (
                      <Cell key={c.id} mono={c.mono} muted>
                        {c.cell(s)}
                      </Cell>
                    )
                  )}
                </Box>
              ))}
              {rows.length === 0 && !isLoading && (
                <EmptyRow
                  colSpan={2 + columns.length}
                  query={q || undefined}
                  title="No systems visible."
                  detail="Register a host with new system, or ask for a share, and it shows up here."
                />
              )}
            </Box>
          </Box>
        </TableShell>
        <NewSystemDialog open={creating} toggle={() => setCreating(false)} />
      </Box>
    </QueryWrapper>
  );
};

export default SystemsOverview;
