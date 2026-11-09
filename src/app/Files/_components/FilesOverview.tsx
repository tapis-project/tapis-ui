/**
 * FilesOverview — the /files landing.
 *
 * Its one job is picking a system to browse with full context — the nav is
 * deliberately compact, so this pane affords the columns the nav cannot:
 * host, root dir, who you become on the host, auth method, and the state
 * glyphs. A plain dense table, every row a click into the listing.
 */
import React, { useMemo, useSyncExternalStore } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Lock, Person, Public } from '@mui/icons-material';
import {
  Cell,
  CellLink,
  EmptyRow,
  GLYPH_COLUMN,
  GlyphCell,
  HCell,
  SkeletonRows,
} from 'app/_components/PageShell/overviewKit';
import { useSystemsSource } from './systemsSource';
import { nounFor } from 'app/_components/NavSpine';
import {
  SortLabel,
  sortRows,
  useTableSort,
} from 'app/_components/PageShell/tableSort';
import { getFilesSearch, subscribeFilesSearch } from './filesSearch';
import PageAbout from 'app/_components/PageShell/PageAbout';
import { TableShell, windowFacts } from 'app/_components/PageShell/tableShell';
import {
  ColumnsButton,
  makeColumnsStore,
} from 'app/_components/PageShell/tableColumns';

const TYPE_COLORS: Record<string, { bg: string; fg: string }> = {
  LINUX: { bg: '#e8f5e9', fg: '#2e7d32' },
  S3: { bg: '#fff3e0', fg: '#e65100' },
  IRODS: { bg: '#e3f2fd', fg: '#1565c0' },
  GLOBUS: { bg: '#f3e5f5', fg: '#6a1b9a' },
};

const TypeChip: React.FC<{ type?: string }> = ({ type }) => {
  const c = TYPE_COLORS[type ?? ''] ?? { bg: '#eceff1', fg: '#37474f' };
  return (
    <Chip
      size="small"
      label={type ?? '?'}
      sx={{
        height: 16,
        fontSize: '0.6rem',
        fontWeight: 600,
        bgcolor: c.bg,
        color: c.fg,
        borderRadius: '4px',
        '& .MuiChip-label': { px: 0.5 },
      }}
    />
  );
};

/** every column this table can grow — the window fetches full records */
const FILE_COLUMNS: Array<{
  id: string;
  label: string;
  hint?: string;
  mono?: boolean;
  raw?: boolean;
  cell: (s: any) => React.ReactNode;
  /** what this column contributes to an ordering; a chip does not compare */
  sortValue?: (s: any) => string | number;
}> = [
  { id: 'host', label: 'Host', mono: true, cell: (s) => s.host ?? '' },
  {
    id: 'rootDir',
    label: 'Root dir',
    mono: true,
    cell: (s) => s.rootDir ?? '/',
  },
  {
    id: 'effUser',
    label: 'On host as',
    mono: true,
    cell: (s) => s.effectiveUserId ?? '',
  },
  { id: 'auth', label: 'Auth', cell: (s) => s.defaultAuthnMethod ?? '' },
  {
    id: 'type',
    label: 'Type',
    raw: true,
    cell: (s) => <TypeChip type={s.systemType} />,
    sortValue: (s) => s.systemType ?? '',
  },
  { id: 'owner', label: 'Owner', cell: (s) => s.owner ?? '' },
  {
    id: 'port',
    label: 'Port',
    mono: true,
    cell: (s) => (s.port != null && s.port !== -1 ? String(s.port) : ''),
    sortValue: (s) => (s.port != null && s.port !== -1 ? s.port : ''),
  },
];

/** the same key rule the systems table uses: these are the same rows */
const fileSystemSortKey = (s: any, columnId: string) => {
  const spec = FILE_COLUMNS.find((c) => c.id === columnId);
  if (columnId === 'id') return s.id ?? '';
  if (!spec) return undefined;
  return spec.sortValue ? spec.sortValue(s) : String(spec.cell(s) ?? '');
};
const filesColumnsStore = makeColumnsStore('files.columns', [
  'host',
  'rootDir',
  'effUser',
  'auth',
  'type',
]);

const FilesOverview: React.FC = () => {
  const history = useHistory();
  // the nav's own read — this table shows exactly what the nav has loaded,
  // and growing the window there grows this too
  const source = useSystemsSource();
  const { isLoading, error, spine } = source;
  const systems = source.systems as any[];
  // one search for the whole page: the nav's box drives this table too
  const q = useSyncExternalStore(subscribeFilesSearch, getFilesSearch);
  // which columns this browser shows, in registry order
  const chosenColumns = filesColumnsStore.use();
  // the same press the systems table answers to; these are the same rows
  const { sort, cycleSort } = useTableSort();
  const columns = useMemo(
    () => FILE_COLUMNS.filter((c) => chosenColumns.includes(c.id)),
    [chosenColumns]
  );

  const publicCount = systems.filter((s) => s.isPublic).length;
  const disabledCount = systems.filter((s) => s.enabled === false).length;

  const needle = q.trim().toLowerCase();
  const rows = useMemo(() => {
    const matched = systems
      .filter(
        (s) =>
          !needle ||
          [s.id, s.host, s.rootDir, s.owner, s.systemType]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(needle)
      )
      .sort((a, b) => (a.id ?? '').localeCompare(b.id ?? ''));
    return sortRows(matched, sort, fileSystemSortKey, (s) => s.id ?? '');
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
          title="Files"
          stats={[
            { n: systems.length, label: 'systems' },
            { n: publicCount, label: 'public', color: '#1565c0' },
            { n: systems.length - publicCount, label: 'mine & shared' },
            {
              n: disabledCount,
              label: 'disabled',
              color: '#c62828',
              when: disabledCount > 0,
            },
          ]}
          lead="Files live on systems: storage hosts (a cluster, an S3 bucket) registered with Tapis."
          points={[
            'Pick a system from the list or the table to browse its filesystem.',
            "Uploads, transfers, sharing and go-to-$HOME live in the toolbar once you've selected a system.",
            'New systems are registered on the Systems page.',
          ]}
        />
        {/* the same shell as every landing table — the strip carries the
            transient words, the window facts, and the presses */}
        <TableShell
          title="Systems to browse"
          hint={
            isLoading
              ? 'listing systems, recently browsed first'
              : q
              ? `filtered by nav search: "${q}"`
              : undefined
          }
          about="The nav's search box filters this table too: one search drives both surfaces. The counts above the table are computed from the loaded window, not every system you can reach."
          controls={
            <ColumnsButton
              sections={[
                {
                  label: 'Columns',
                  options: FILE_COLUMNS.map((c) => ({
                    id: c.id,
                    label: c.label,
                    hint: c.hint,
                  })),
                },
              ]}
              chosen={chosenColumns}
              onToggle={filesColumnsStore.toggle}
              onReset={filesColumnsStore.reset}
              isDefault={filesColumnsStore.isDefault(chosenColumns)}
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
                    rest evenly */}
                <HCell width="24%">
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
                  onClick={() => history.push(`/files/${s.id}`)}
                  sx={{
                    cursor: 'pointer',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                  }}
                >
                  {/* one state glyph per row, in its own centred
                          column, so they read down the left edge */}
                  <GlyphCell>
                    {s.enabled === false ? (
                      <Tooltip title="Disabled: listings fail" arrow>
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
                    {/* the row browses the system; its name opens the
                            system's own page — definition, credentials,
                            sharing — which the listing cannot give you */}
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
                  detail="Files live on systems. Register one or ask for a share, and it shows up here ready to browse."
                />
              )}
            </Box>
          </Box>
        </TableShell>
      </Box>
    </QueryWrapper>
  );
};

export default FilesOverview;
