/**
 * AppsOverview — the /apps landing, replacing "select an app" prose.
 *
 * Built from the two reads the page already makes (apps list + the shared
 * jobs window): the registry's shape as tiles, then every app as a table with
 * its run count and when it last ran.
 *
 * It used to rank instead — 'Recently run' beside 'Most run · failed share in
 * red'. Ranking turns a page you open to FIND something into a scoreboard,
 * and painting the failed share red reads as an accusation when the reason an
 * app failed nine times is that someone is still building it. Success rate
 * still lives on the app's own page, where it is being asked for.
 */
import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { Box, Tooltip } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { Apps } from '@tapis/tapis-typescript';
import { QueryWrapper } from '@tapis/tapisui-common';
import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  Lock,
  Person,
  Public,
} from '@mui/icons-material';
import {
  Cell,
  EmptyRow,
  GLYPH_COLUMN,
  GlyphCell,
  HCell,
  SkeletonRows,
} from 'app/_components/PageShell/overviewKit';
import { normTs } from 'app/_components/NavV2Kit/navKit';
import PageAbout from 'app/_components/PageShell/PageAbout';
import { TableShell, windowFacts } from 'app/_components/PageShell/tableShell';
import { nounFor } from 'app/_components/NavSpine';
import { useJobsSource } from 'app/Jobs/_components/jobsSource';
import { JobLite } from 'app/Jobs/_components/jobsData';
import { runContextByApp } from './appsData';
import { useAppsSource } from './appsSource';
import AppsToolbar from './AppsToolbar';
import { getAppsSearch, subscribeAppsSearch } from './appsSearch';
import {
  AppsSort,
  columnById,
  getAppsColumns,
  sortApps,
  subscribeAppsColumns,
} from './appsColumns';
import AppsColumnsMenu from './AppsColumnsMenu';
import { SortLabel, useTableSort } from 'app/_components/PageShell/tableSort';

const AppsOverview: React.FC = () => {
  const history = useHistory();
  const { apps, isLoading, error, spine } = useAppsSource();
  const jobsSource = useJobsSource();
  const runCtx = useMemo(
    () => runContextByApp(jobsSource.jobs as JobLite[]),
    [jobsSource.jobs]
  );

  const publicCount = apps.filter((a) => a.isPublic).length;
  const disabledCount = apps.filter((a) => a.enabled === false).length;
  const ranApps = apps.filter((a) => runCtx.has(a.id ?? ''));
  const openApp = (a: any) => history.push(`/apps/${a.id}/${a.version}`);

  // the nav's search box, so the page has one search rather than two
  const q = useSyncExternalStore(subscribeAppsSearch, getAppsSearch);
  // which columns this browser shows, and which one (if any) rules the order
  const chosenIds = useSyncExternalStore(subscribeAppsColumns, getAppsColumns);
  const columns = useMemo(
    () =>
      chosenIds
        .map(columnById)
        .filter((c): c is NonNullable<typeof c> => !!c && c.id !== 'app'),
    [chosenIds]
  );
  // the same press every landing table answers to now
  const { sort, cycleSort } = useTableSort();

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const matched = apps.filter(
      (a: any) =>
        !needle ||
        [
          a.id,
          a.version,
          a.owner,
          a.runtime,
          a.jobType,
          a.containerImage,
          // tags are searchable now that they can be columns
          ...(a.tags ?? []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(needle)
    );
    // What you ran lately is what you are most likely looking for; apps with
    // no runs in range sort after it, alphabetically, rather than vanishing.
    const byRecency = matched.sort((a: any, b: any) => {
      const la = normTs(runCtx.get(a.id)?.last ?? 0);
      const lb = normTs(runCtx.get(b.id)?.last ?? 0);
      return lb - la || (a.id ?? '').localeCompare(b.id ?? '');
    });
    // a header press rules instead, until pressed back to the default
    return sortApps(byRecency, sort, (a) => runCtx.get(a.id ?? ''));
  }, [apps, q, runCtx, sort]);

  return (
    // the page renders as itself on first load — real About, real table
    // header, skeleton rows — instead of a spinner the chrome pops out of
    <QueryWrapper isLoading={false} error={error}>
      {/* no top or side padding: the shell's right-pane margin is
          the page's inset, the same as every Pods page */}
      <Box sx={{ pb: 2 }}>
        <PageAbout
          loading={isLoading}
          title="Apps"
          stats={[
            { n: apps.length, label: 'apps' },
            { n: publicCount, label: 'public', color: '#1565c0' },
            { n: apps.length - publicCount, label: 'mine & shared' },
            // 'run in window' meant 'appears in the shared jobs read', which
            // is a fact about our request, not about the app. The label says
            // what a person would say; the hint says exactly what was counted.
            {
              n: ranApps.length,
              label: 'run recently',
              color: '#1b7f3b',
              hint: `Apps that appear in the last ${jobsSource.jobs.length} jobs`,
            },
            {
              n: disabledCount,
              label: 'disabled',
              color: '#c62828',
              when: disabledCount > 0,
            },
          ]}
          actions={<AppsToolbar include={['create']} />}
          lead="An app is a runnable definition: a job runtime, inputs, and parameters, versioned and shareable."
          points={[
            'Pick an app from the list or the table to view runs, its definition, and launch the app as a job.',
            <>
              Create your own with <strong>new app</strong>.
            </>,
          ]}
        />

        {/* One table instead of 'Recently run' and 'Most run'. Those two
                panels ranked apps and painted the failed share of each bar
                red, which turns a page you open to FIND something into a
                scoreboard — and reads as an accusation when the reason a
                thing failed nine times is that you are still building it.
                Runs are a plain count here; the success rate lives on the
                app's own page, where it is being asked for. */}
        <TableShell
          title="Apps"
          hint={
            isLoading
              ? 'fetching apps. The nav groups a burst of runs by app'
              : q
              ? `filtered by nav search: "${q}"`
              : undefined
          }
          about={
            "The nav's search box filters this table too: one search drives " +
            'both surfaces. The counts above the table are computed from the ' +
            `loaded window. Run counts come from the last ${jobsSource.jobs.length} ` +
            'jobs; an app with nothing in that range shows a dash.'
          }
          controls={<AppsColumnsMenu apps={apps} />}
          error={(error as Error) ?? null}
          facts={windowFacts(apps.length, nounFor('apps', apps.length), spine)}
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
                {/* App keeps its width; the chosen columns split the rest
                    evenly — fixed layout keeps any count of them honest */}
                <HCell width="26%">
                  <SortLabel
                    id="app"
                    label="App"
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
              {rows.map((a) => {
                const ctx = runCtx.get(a.id ?? '');
                return (
                  <Box
                    component="tr"
                    key={`${a.id}:${a.version}`}
                    onClick={() => openApp(a)}
                    sx={{
                      cursor: 'pointer',
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                    }}
                  >
                    <GlyphCell>
                      {a.enabled === false ? (
                        <Tooltip title="Disabled: cannot be launched">
                          <Lock sx={{ color: '#c62828' }} />
                        </Tooltip>
                      ) : a.isPublic ? (
                        <Tooltip title="Public: tenant-wide">
                          <Public sx={{ color: '#1565c0' }} />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Yours or shared with you">
                          <Person sx={{ color: 'text.disabled' }} />
                        </Tooltip>
                      )}
                    </GlyphCell>
                    <Cell mono>{a.id}</Cell>
                    {columns.map((c) => (
                      <Cell key={c.id} mono={c.mono} muted>
                        {c.value(a, ctx)}
                      </Cell>
                    ))}
                  </Box>
                );
              })}
              {rows.length === 0 && !isLoading && (
                <EmptyRow
                  colSpan={2 + columns.length}
                  query={q || undefined}
                  title="No apps yet."
                  detail="An app is a runnable definition. Register one, and Launch turns it into jobs."
                />
              )}
            </Box>
          </Box>
        </TableShell>
      </Box>
    </QueryWrapper>
  );
};

export default AppsOverview;
