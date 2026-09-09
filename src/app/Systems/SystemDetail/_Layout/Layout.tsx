import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Systems as Hooks, Files as FilesHooks } from '@tapis/tapisui-hooks';
import { Box, Skeleton, Typography } from '@mui/material';
import { QueryWrapper } from '@tapis/tapisui-common';
import { useSpineWriter } from 'app/_components/NavSpine';
import { useSystemsSource } from 'app/Files/_components/systemsSource';
import { explorerFit, usePinGapPx } from 'app/_components/PageShell/viewPrefs';
import RecordJson from 'app/_components/PageShell/RecordJson';
import SystemSummaryCard from '../SystemSummaryCard';
import SystemFilesPanel from '../SystemFilesPanel';

/**
 * The card's shape before the system arrives — head line, four fact boxes.
 * Rarely seen now: the window usually already holds the system whole, and
 * the card renders from that seed while the fresh read lands.
 */
const DetailSkeleton: React.FC = () => (
  <Box
    data-detailskeleton=""
    sx={{
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      p: 1.25,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Skeleton variant="text" width="28%" sx={{ fontSize: '1rem' }} />
      <Skeleton variant="rounded" width={44} height={16} />
      <Box sx={{ flex: 1 }} />
      <Skeleton variant="rounded" width={64} height={22} />
    </Box>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 1,
      }}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1,
          }}
        >
          <Skeleton variant="text" width="35%" sx={{ fontSize: '0.78rem' }} />
          {[64, 48, 56].map((w, j) => (
            <Skeleton
              key={j}
              variant="text"
              width={`${w - i * 5}%`}
              sx={{ fontSize: '0.72rem' }}
            />
          ))}
        </Box>
      ))}
    </Box>
    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 1.25 }}>
      fetching the system — host, credentials, queues, and the controls
    </Typography>
  </Box>
);

/**
 * The pauses between knocks after a credential lands. A freshly minted or
 * pasted key is often not honored for a few seconds (registration and the
 * host's own key propagation), and the old single instant re-probe was
 * reliably too early — it failed, and the page read as "still broken" with
 * nothing left to press.
 */
const SETTLE_DELAYS_MS = [2500, 5000, 10000, 20000];

export type SettleState = {
  /** 1-based try currently running (or just refused, when gaveUp) */
  attempt: number;
  of: number;
  gaveUp: boolean;
};

const Layout: React.FC<{ systemId: string }> = ({ systemId }) => {
  // the card's directory rows point the panel below and scroll to it —
  // the same bargain the job page's card makes with its listing
  const filesRef = React.useRef<HTMLDivElement | null>(null);
  const [browsePath, setBrowsePath] = useState('/');
  // the record is a card of its own below the summary, so the page owns the
  // switch — reading the JSON no longer costs you the card you were reading
  const [showJSON, setShowJSON] = useState(false);
  useEffect(() => {
    setBrowsePath('/');
  }, [systemId]);
  const { data, isLoading, error } = Hooks.useDetails({
    systemId,
    select: 'allAttributes',
  });
  // The window already holds this system with allAttributes — render from
  // that seed the instant the row is clicked, and let the fresh read land
  // over it. The old page held a blank pane through the whole round-trip.
  const source = useSystemsSource();
  const seeded = source.systems.find((s) => s.id === systemId);
  // A DELETED system still has a page: the single-system GET cannot see it
  // (no showDeleted), but the deleted listing can, whole — the same read
  // the nav already caches. The card renders from that, read-only.
  const { data: deletedData, isFetching: deletedFetching } =
    Hooks.useDeletedList({
      search: 'deleted.eq.true',
      showDeleted: true,
      select: 'allAttributes',
    });
  const deletedSeed = (deletedData?.result ?? []).find(
    (s) => s.id === systemId
  );
  // The deleted listing WINS: right after a delete the detail query still
  // holds the record it fetched while the system lived, and "stale but
  // present" must not outvote "the deleted list has it now".
  const isDeleted = !!deletedSeed;
  const live = isDeleted ? undefined : data?.result ?? seeded;
  const system = live ?? deletedSeed;
  // The moment between "delete succeeded" and "the deleted listing has
  // refreshed": the detail read 404s (SYSAPI_NOT_FOUND) while deletedSeed
  // is still empty. Hold quiet instead of flashing the raw refusal —
  // the listing lands in a beat and the banner takes over.
  const notFound = !!error && /NOT_FOUND|not found/i.test(error.message);
  const maybeJustDeleted = notFound && deletedFetching;
  // restore flips isDeleted false while useDetails still holds its 404 —
  // drop that stale refusal, and hold the page quiet (skeleton, not a red
  // SYSAPI_NOT_FOUND flash) until the fresh record lands
  const wasDeleted = React.useRef(false);
  const [restoringView, setRestoringView] = useState(false);
  const queryClient = useQueryClient();
  useEffect(() => {
    if (wasDeleted.current && !isDeleted) {
      setRestoringView(true);
      queryClient.invalidateQueries('systems/details');
    }
    wasDeleted.current = isDeleted;
  }, [isDeleted, queryClient]);
  useEffect(() => {
    if (restoringView && data?.result) setRestoringView(false);
  }, [restoringView, data?.result]);

  // The access check, lifted here so both the card (facts, gates, alert)
  // and the inline files panel read one answer. limit: 1 — this asks "can
  // I list?", not for the listing; the panel below fetches the real one.
  // It also keeps this probe's cache apart from the panel's actual root.
  const probe = FilesHooks.useList(
    { systemId, path: '/', limit: 1 },
    // a deleted system answers nothing — knocking would only manufacture
    // a refusal to display
    { retry: 1, enabled: !isDeleted }
  );
  // The probe's verdict, LATCHED at each settle. Two failed shapes came
  // before this: a latch set on first success and never unset (a revoked
  // credential read "listing works" forever), then deriving straight from
  // query status — but react-query v3 drops an errored query back to
  // 'loading' on every refetch (it has no data to hold), so each re-knock
  // unmounted the door box and remounted it a second later: pop out, pop
  // in, four times per settle cycle. The latch holds the LAST SETTLED
  // answer while a run is in flight and is replaced the moment the run
  // lands — revocation still shows on the next settle, nothing blinks
  // in between.
  const [verdict, setVerdict] = useState<{
    access: boolean;
    error: Error | null;
  } | null>(null);
  // Navigating BACK to a system already probed this session hits
  // react-query's cache: `probe` reflects the new systemId's answer
  // synchronously, in this same render. Resetting verdict via a
  // useEffect (as this used to) corrects it only AFTER a paint — one
  // frame shows the OLD system's verdict against the NEW system's card,
  // which for a just-left refused system is the full "No way in yet"
  // box, flashed in front of an already-authenticated system before
  // collapsing away. Comparing systemId during render and correcting
  // state right there — the documented "adjusting state on a prop
  // change" pattern — throws the stale render away before it paints:
  // a cache hit resolves in the same pass, and only a genuinely new
  // probe (no cached answer yet) shows the honest "checking" state.
  const [verdictForSystem, setVerdictForSystem] = useState(systemId);
  if (verdictForSystem !== systemId) {
    setVerdictForSystem(systemId);
    if (probe.isFetching) setVerdict(null);
    else if (probe.isSuccess) setVerdict({ access: true, error: null });
    else if (probe.isError)
      setVerdict({ access: false, error: probe.error as Error });
    else setVerdict(null);
  }
  // Keyed on the error's MESSAGE, not the Error object. react-query hands
  // back a stable error reference for an unchanged failed query, so the
  // object worked — but only by that grace: anything handing a fresh
  // Error per render (a wrapper that re-boxes it, a test double) turns
  // this into setState → render → new object → setState, forever. It did,
  // once, and took the tab's memory with it. A string cannot do that.
  const probeErrorMessage = probe.error?.message;
  useEffect(() => {
    if (probe.isFetching) return; // only settled answers land
    if (probe.isSuccess) setVerdict({ access: true, error: null });
    else if (probe.isError)
      setVerdict({ access: false, error: probe.error as Error });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [probe.isFetching, probe.isSuccess, probe.isError, probeErrorMessage]);
  const access = verdict?.access ?? false;
  const accessError = verdict?.error ?? null;
  // first load and re-check are different moods: the first has nothing to
  // show yet, a re-check must NOT blink anything away while it tries
  const checkingAccess = probe.isFetching && verdict == null;
  const rechecking = probe.isFetching && verdict != null;
  // The settle cycle: a credential just landed, so keep knocking on a
  // backoff until the host says yes or the tries run out. Owned here with
  // the probe; the card only reports it and starts it.
  const [settle, setSettle] = useState<SettleState | null>(null);
  const settleRun = useRef(0);
  const probeRefetch = useRef(probe.refetch);
  probeRefetch.current = probe.refetch;
  useEffect(
    () => () => {
      // leaving the system (or the page) orphans any cycle in flight
      settleRun.current += 1;
      setSettle(null);
    },
    [systemId]
  );
  const beginSettle = useCallback(async () => {
    const run = ++settleRun.current;
    const of = SETTLE_DELAYS_MS.length + 1;
    for (let i = 0; i < of; i++) {
      if (settleRun.current !== run) return;
      setSettle({ attempt: i + 1, of, gaveUp: false });
      const result = await probeRefetch.current();
      if (settleRun.current !== run) return;
      if (!result.error) {
        setSettle(null);
        return;
      }
      if (i < SETTLE_DELAYS_MS.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, SETTLE_DELAYS_MS[i])
        );
      }
    }
    if (settleRun.current === run) {
      setSettle({ attempt: of, of, gaveUp: true });
    }
  }, []);

  // the probe's honest cost, timed here, said on the card — part of
  // deciding which access check to lean on long-term
  const probeStarted = React.useRef<number | null>(null);
  const [probeMs, setProbeMs] = useState<number | null>(null);
  useEffect(() => {
    if (probe.isFetching) {
      probeStarted.current = Date.now();
    } else if (probeStarted.current != null) {
      setProbeMs(Date.now() - probeStarted.current);
      probeStarted.current = null;
    }
  }, [probe.isFetching]);

  // Write-through to the nav spine: enable/disable/share from this page
  // should flip the nav row and the landing table without a refetch.
  const writeSystem = useSpineWriter('systems');
  useEffect(() => {
    if (!data?.result?.id) return;
    const fresh = data.result;
    writeSystem(fresh.id!, {
      id: fresh.id,
      enabled: fresh.enabled,
      isPublic: fresh.isPublic,
      owner: fresh.owner,
      host: fresh.host,
      systemType: fresh.systemType,
      updated: fresh.updated,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data?.result?.id,
    data?.result?.enabled,
    data?.result?.isPublic,
    data?.result?.updated,
  ]);

  // with the files panel pinned at the page's end, the tail padding
  // tightens to the shared gap so the listing sits close to the bottom bar
  // (hooks first, THEN the &&: short-circuiting a hook call is a crash)
  const pinnedExplorer = explorerFit.use() === 'pinned';
  const gapPx = usePinGapPx();
  const tightTail = Boolean(system && access && !isDeleted) && pinnedExplorer;

  return (
    // first load renders the card's own shape, not QueryWrapper's spinner
    <QueryWrapper
      isLoading={false}
      error={isDeleted || maybeJustDeleted || restoringView ? null : error}
    >
      <Box
        sx={{
          pb: tightTail ? `${gapPx}px` : 2,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {(isLoading || restoringView) && !system && <DetailSkeleton />}
        {/* keyed by id: JSON toggle and menus start clean for every system
            instead of leaking across nav moves */}
        {system && (
          <SystemSummaryCard
            key={system.id}
            system={system}
            deleted={isDeleted}
            access={access}
            checkingAccess={checkingAccess}
            rechecking={rechecking}
            accessMs={probeMs}
            // what the host actually said when it refused — the box says
            // it; latched with the verdict so it cannot blink mid-flight
            accessError={accessError}
            // re-run the probe: after a credential lands, or on demand
            onRecheck={() => probe.refetch()}
            // a credential just landed — knock patiently, not once
            onCredentialed={beginSettle}
            settle={settle}
            onViewFiles={(path) => {
              setBrowsePath(path || '/');
              filesRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }}
            showJSON={showJSON}
            onToggleJSON={() => setShowJSON((s) => !s)}
          />
        )}
        {system && showJSON && (
          <RecordJson
            title="System record"
            json={system}
            onClose={() => setShowJSON(false)}
          />
        )}
        {/* the jobs-page bargain, here: with access, the system's files are
            browsable in place instead of behind a link */}
        {system && access && !isDeleted && (
          <Box ref={filesRef} sx={{ minWidth: 0, scrollMarginTop: 8 }}>
            <SystemFilesPanel
              key={`files:${system.id}`}
              systemId={system.id!}
              path={browsePath}
              onGo={(p) => setBrowsePath(p || '/')}
            />
          </Box>
        )}
      </Box>
    </QueryWrapper>
  );
};

export default Layout;
