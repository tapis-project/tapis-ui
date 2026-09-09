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

/** Placeholder card shape (head line, four fact boxes) shown before the system loads. */
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
      Loading the system: host, credentials, queues, controls
    </Typography>
  </Box>
);

/**
 * Delays between access re-probes after a credential is saved. A new key is
 * often not honoured for a few seconds (registration, host key propagation).
 */
const SETTLE_DELAYS_MS = [2500, 5000, 10000, 20000];

export type SettleState = {
  /** 1-based try currently running (or just refused, when gaveUp) */
  attempt: number;
  of: number;
  gaveUp: boolean;
};

const Layout: React.FC<{ systemId: string }> = ({ systemId }) => {
  // directory rows in the card set this panel's path and scroll to it
  const filesRef = React.useRef<HTMLDivElement | null>(null);
  const [browsePath, setBrowsePath] = useState('/');
  // the record is a separate card below the summary, so the page owns the toggle
  const [showJSON, setShowJSON] = useState(false);
  useEffect(() => {
    setBrowsePath('/');
  }, [systemId]);
  const { data, isLoading, error } = Hooks.useDetails({
    systemId,
    select: 'allAttributes',
  });
  // The nav window holds this system with allAttributes: render from that
  // seed immediately and replace it when the fresh read lands.
  const source = useSystemsSource();
  const seeded = source.systems.find((s) => s.id === systemId);
  // A deleted system still has a page. The single-system GET cannot return
  // it (no showDeleted), but the deleted listing (cached by the nav) can.
  // The card renders from that, read-only.
  const { data: deletedData, isFetching: deletedFetching } =
    Hooks.useDeletedList({
      search: 'deleted.eq.true',
      showDeleted: true,
      select: 'allAttributes',
    });
  const deletedSeed = (deletedData?.result ?? []).find(
    (s) => s.id === systemId
  );
  // The deleted listing takes precedence: right after a delete the detail
  // query still holds the earlier record.
  const isDeleted = !!deletedSeed;
  const live = isDeleted ? undefined : data?.result ?? seeded;
  const system = live ?? deletedSeed;
  // Between delete succeeding and the deleted listing refreshing, the detail
  // read 404s (SYSAPI_NOT_FOUND) while deletedSeed is empty. Suppress the error.
  const notFound = !!error && /NOT_FOUND|not found/i.test(error.message);
  const maybeJustDeleted = notFound && deletedFetching;
  // restore sets isDeleted false while useDetails still holds its 404:
  // ignore that error and show the skeleton until the fresh record loads
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

  // Access check shared by the card and the inline files panel. limit: 1
  // because it only tests whether listing works; the cache stays separate
  // from the panel's own listing.
  const probe = FilesHooks.useList(
    { systemId, path: '/', limit: 1 },
    // a deleted system answers nothing — knocking would only manufacture
    // a refusal to display
    { retry: 1, enabled: !isDeleted }
  );
  // Probe verdict, latched at each settle. react-query v3 returns an errored
  // query to 'loading' on every refetch, which would unmount and remount the
  // access box each re-probe. The latch keeps the last settled answer while a
  // run is in flight and replaces it when the run settles.
  const [verdict, setVerdict] = useState<{
    access: boolean;
    error: Error | null;
  } | null>(null);
  // Reset the verdict during render when systemId changes (the "adjust state
  // on prop change" pattern), not in an effect: for a cached probe, an effect
  // would paint one frame with the previous system's verdict.
  const [verdictForSystem, setVerdictForSystem] = useState(systemId);
  if (verdictForSystem !== systemId) {
    setVerdictForSystem(systemId);
    if (probe.isFetching) setVerdict(null);
    else if (probe.isSuccess) setVerdict({ access: true, error: null });
    else if (probe.isError)
      setVerdict({ access: false, error: probe.error as Error });
    else setVerdict(null);
  }
  // Keyed on the error message, not the Error object: a new Error per render
  // (re-boxed or mocked) would loop setState -> render -> setState.
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
  // first load has nothing to show yet; a re-check must keep the current display
  const checkingAccess = probe.isFetching && verdict == null;
  const rechecking = probe.isFetching && verdict != null;
  // Settle cycle: after a credential is saved, re-probe with backoff until
  // access works or the tries run out. The card only starts it and reads it.
  const [settle, setSettle] = useState<SettleState | null>(null);
  const settleRun = useRef(0);
  const probeRefetch = useRef(probe.refetch);
  probeRefetch.current = probe.refetch;
  useEffect(
    () => () => {
      // leaving the system or page cancels any cycle in flight
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

  // probe duration, shown on the card
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

  // Write-through to the nav spine so enable/disable/share update the nav row and landing table without a refetch.
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

  // With the files panel pinned, the tail padding uses the shared gap.
  // Call hooks before the && (a short-circuited hook call breaks hook order).
  const pinnedExplorer = explorerFit.use() === 'pinned';
  const gapPx = usePinGapPx();
  const tightTail = Boolean(system && access && !isDeleted) && pinnedExplorer;

  return (
    // first load renders the card skeleton, not QueryWrapper's spinner
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
        {/* keyed by id: toggle and menu state reset per system */}
        {system && (
          <SystemSummaryCard
            key={system.id}
            system={system}
            deleted={isDeleted}
            access={access}
            checkingAccess={checkingAccess}
            rechecking={rechecking}
            accessMs={probeMs}
            // the host's refusal message, latched with the verdict
            accessError={accessError}
            // re-run the probe: after a credential lands, or on demand
            onRecheck={() => probe.refetch()}
            // credential saved: start the re-probe cycle
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
        {/* with access, files are browsable in place */}
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
