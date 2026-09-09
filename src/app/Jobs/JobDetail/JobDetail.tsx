import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { Jobs } from '@tapis/tapis-typescript';
import { Box, Skeleton, Typography } from '@mui/material';
import {
  FileListing,
  SystemProvider,
  QueryWrapper,
  jobTerminalStatuses,
  jobRunningStatuses,
} from '@tapis/tapisui-common';
import { Replay, Dangerous } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { HeadAction } from 'app/_components/PageShell/overviewKit';
import { SettingsCog } from 'app/_components/PageShell/detailHead';
import RecordJson from 'app/_components/PageShell/RecordJson';
import ToolbarV2 from 'app/Files/_components/Toolbar/ToolbarV2';
import {
  FilesProvider,
  useFilesSelect,
} from 'app/Files/_components/FilesContext';
import FilesBreadcrumbs, {
  useFilesNavigation,
} from 'app/Files/_components/FilesBreadcrumbs';
import { useDropUpload } from 'app/Files/_components/useDropUpload';
import { explorerFit, usePinGapPx } from 'app/_components/PageShell/viewPrefs';
import { usePinnedCap } from 'app/_components/PageShell/tableShell';
import shellStyles from 'app/_components/PageShell/PageShell.module.scss';
import { useCancelledJobs } from '../_components/JobsLayoutToolbar/CancelledJobsContext';
import { useSpineWriter } from 'app/_components/NavSpine';
import SessionCard from '../_components/SessionCard';
import JobSummaryCard from './JobSummaryCard';
import ResubmitDialog from './ResubmitDialog';
import { jobToSeed } from 'app/Apps/JobLauncherV2/_components/seed';

// The launcher is a page's worth of code and this path is rare — it loads
// on the first 'Adjust before running' press, not with every job detail.
const JobLauncherV2Dialog = lazy(
  () => import('app/Apps/JobLauncherV2/_components/JobLauncherV2Dialog')
);

const createJobDisplay = (job: any) => {
  const keysToPrettyPrint = ['parameterSet', 'fileInputs', 'notes'];
  const jobDisplay: { [key: string]: any } = {};

  for (const key in job) {
    if (keysToPrettyPrint.includes(key) && typeof job[key] === 'string') {
      try {
        jobDisplay[key] = JSON.parse(job[key]);
      } catch (e) {
        jobDisplay[key] = job[key];
      }
    } else {
      jobDisplay[key] = job[key];
    }
  }

  return jobDisplay;
};

/**
 * The job's output directory, browsed in place.
 *
 * Genuinely in place: opening a directory used to be a link to the Files
 * page, so every press abandoned the job you were reading to look at one of
 * its folders. It keeps its own path now, and the same bar the Files page
 * has drives it — back, forward, the trail, up a directory — on its own
 * trail, so walking around in here does not rewrite where you were there.
 *
 * On the icon rail (ToolbarV2), not the wide V1 text toolbar this used to
 * carry. Two reasons beyond the width: V1 wraps itself in a QueryWrapper over
 * its own permissions call, so a system you cannot reach printed a raw Tapis
 * error chain above the listing — the very dumps the Files page stopped
 * showing. And the rail keeps the whole feature set at a fraction of the
 * height, which matters under a card rather than in a page header.
 */
const JobOutputList: React.FC<{
  job: Jobs.Job;
  /** owned by the page, so the card's directory buttons can move it */
  systemId: string;
  path: string;
  onGo: (path: string, systemId: string) => void;
}> = ({ job, systemId, path, onGo }) => {
  const { select, selectedFiles, unselect, clear } = useFilesSelect();
  // a drop here stages the files in the same upload modal the rail opens
  const { onDropFiles, modal } = useDropUpload(systemId, path);

  // a selection is about the directory it was made in
  useEffect(() => {
    clear();
  }, [path, systemId, clear]);

  // The same navigation the Files page wires — back walks THIS browser's
  // trail (falling through to climbing a directory when the trail runs
  // out), up and top climb in place. Shared with the breadcrumb bar below,
  // so ← and ⌫ can never disagree with its buttons about where back is.
  const trail = `job:${job.uuid}`;
  const { back, top, up } = useFilesNavigation(systemId, trail, onGo, path);

  // The explorer preference. Pinned, the listing fits whatever the cards
  // above leave of the window (floored at PIN_EXPLORER_MIN, so a
  // card-heavy page scrolls a little instead of serving a porthole) and
  // scrolls its own rows — which also makes its scroll-to-load real: in
  // flow layout the internal scroller never moves, so a directory past
  // the first page could never fetch the rest.
  const pinned = explorerFit.use() === 'pinned';
  const { ref: capRef, cap } = usePinnedCap(pinned, 'explorer');

  // The listing's keys are a window-level listener, so they must not run
  // while the rest of a scrolling page owns ↑ and ↓. Engaged = the pointer
  // or the focus is in here — arrows drive the listing exactly while you
  // are at it, and the page scrolls again the moment you leave.
  const [engaged, setEngaged] = useState(false);
  const hovering = useRef(false);
  const focused = useRef(false);
  const settleEngagement = () =>
    setEngaged(hovering.current || focused.current);

  return (
    <Box
      sx={{ minWidth: 0 }}
      onMouseEnter={() => {
        hovering.current = true;
        settleEngagement();
      }}
      onMouseLeave={() => {
        hovering.current = false;
        settleEngagement();
      }}
      onFocus={() => {
        focused.current = true;
        settleEngagement();
      }}
      onBlur={(event) => {
        focused.current = event.currentTarget.contains(
          event.relatedTarget as Node
        );
        settleEngagement();
      }}
    >
      {/* no heading: the breadcrumbs already say where this is, and the rail
          says what can be done there */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 0.75,
          flexWrap: 'wrap',
          minWidth: 0,
        }}
      >
        <Box sx={{ flex: 1 }} />
        {/* the rail acts on wherever you have walked to, not on the job's
            output directory forever */}
        <ToolbarV2 systemId={systemId} currentPath={path} />
      </Box>
      {/* the same path bar the Files page has, on this browser's own trail */}
      <FilesBreadcrumbs
        systemId={systemId}
        path={path}
        onNavigate={onGo}
        trail={trail}
      />
      <Box
        ref={capRef}
        // says in devtools (and in tests) whether the cap actually engaged
        data-pinned={pinned && cap ? '' : undefined}
        sx={
          pinned && cap
            ? {
                // max, not height: the cap RESERVES space — a directory
                // with three files renders three files tall, and only a
                // listing that outgrows the room scrolls internally
                maxHeight: cap,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                minWidth: 0,
              }
            : { minWidth: 0 }
        }
      >
        <FileListing
          className={pinned && cap ? shellStyles['listing-fill'] : undefined}
          systemId={systemId}
          path={path}
          location={`/files/${systemId}${path}`}
          // with this, a directory is a button that moves this listing rather
          // than a link that leaves for the Files page
          onNavigate={(file) => onGo(file.path ?? '/', systemId)}
          // the full Files-page keyboard model, but only while engaged (see
          // above) — a section of a scrolling page must not hold ↑ and ↓
          // hostage the rest of the time
          keyboard={engaged}
          onBack={back}
          onUp={up}
          onTop={top}
          onDropFiles={onDropFiles}
          selectMode={{ mode: 'multi', types: ['dir', 'file'] }}
          selectedFiles={selectedFiles}
          onSelect={(files) => select(files, 'multi')}
          onUnselect={unselect}
        />
      </Box>
      {modal}
    </Box>
  );
};

/**
 * The summary card's shape, before the job arrives — head line, three fact
 * columns, an output box. Direct links to /jobs/:uuid land here first, and
 * the page arriving as itself beats a spinner it later pops out of.
 */
const DetailSkeleton: React.FC = () => {
  const factBox = (key: number) => (
    <Box
      key={key}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 1,
      }}
    >
      <Skeleton variant="text" width="40%" sx={{ fontSize: '0.7rem' }} />
      {[68, 52, 60].map((w, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={`${w - key * 7}%`}
          sx={{ fontSize: '0.72rem' }}
        />
      ))}
    </Box>
  );
  return (
    <Box
      data-detailskeleton=""
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Skeleton variant="text" width="34%" sx={{ fontSize: '0.95rem' }} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="rounded" width={72} height={22} />
        <Skeleton variant="rounded" width={56} height={22} />
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 1,
        }}
      >
        {[0, 1, 2].map(factBox)}
      </Box>
      <Typography
        sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 1.25 }}
      >
        fetching the run: status, timings, outputs, and its session if it has
        one
      </Typography>
    </Box>
  );
};

const JobDetail: React.FC<{ jobUuid: string }> = ({ jobUuid }) => {
  const [confirmResubmit, setConfirmResubmit] = useState(false);
  // the adjust-first path: the launcher, seeded from this job
  const [adjusting, setAdjusting] = useState(false);
  const [showJSON, setShowJSON] = useState(false);
  const [refetchInterval, setRefetchInterval] = useState(5);
  const {
    data,
    isLoading,
    error,
    refetch: refetchJob,
  } = Hooks.useDetails(jobUuid, {
    // A finished job cannot change again, so the poll STOPS rather than
    // settling at its last backoff. It used to keep asking for the whole
    // record every 5–30s forever: the backoff effect below returns early
    // on a terminal status, which left whatever interval it had reached
    // still running. The page people leave open longest was the one that
    // never stopped fetching.
    //
    // The function form because the answer depends on the data this very
    // query returns — the same shape the jobs listing uses to stop
    // polling once nothing is RUNNING.
    refetchInterval: ((latest?: Jobs.RespGetJob) =>
      jobTerminalStatuses.includes(latest?.result?.status as never)
        ? false
        : refetchInterval * 1000) as never,
  });
  const job: Jobs.Job | undefined = useMemo(() => data?.result, [data]);
  const {
    resubmit,
    isLoading: isLoadingResubmit,
    error: resubmitError,
  } = Hooks.useResubmit({
    jobUuid,
  });
  const {
    cancel,
    isLoading: cancelIsLoading,
    isSuccess: cancelIsSuccess,
    reset: cancelReset,
  } = Hooks.useCancel();
  const { cancelledUuids, markCancelled, unmarkCancelled } = useCancelledJobs();
  // The ledger records the REQUEST, not the outcome: Tapis's cancel is
  // asynchronous (the POST only queues a JOB_CANCEL command), so between
  // the press and the server reporting a terminal status the truthful word
  // is "cancelling" — never a premature "cancelled". The ledger lives
  // session-wide because this page outlives navigation.
  const cancelRequested = cancelledUuids.has(jobUuid);
  const cancelling =
    cancelRequested && !!job && !jobTerminalStatuses.includes(job.status!);
  // A page that outlives navigation: the mutation's success latch must start
  // clean for every job — it used to leak, leaving every next job's Cancel
  // button dead until a reload.
  useEffect(() => {
    cancelReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobUuid]);
  // Write-through to the nav spine: this page's poll sees a status change
  // (JOB_LAUNCH_FAILURE, FINISHED…) seconds before the list would — the nav
  // row must not keep spinning "pending" on stale window data.
  const writeJob = useSpineWriter('jobs');
  useEffect(() => {
    if (!job?.uuid) return;
    // The spine carries server truth only. The old optimistic CANCELLED
    // write overstated (the job is genuinely still running while the
    // scheduler works); the nav row now reads the cancel ledger itself and
    // says "cancelling" over the real status.
    writeJob(job.uuid, {
      uuid: job.uuid,
      status: job.status,
      condition: job.condition,
      lastUpdated: job.lastUpdated,
      ended: job.ended,
      name: job.name,
      appId: job.appId,
      execSystemId: job.execSystemId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.uuid, job?.status, job?.condition, job?.lastUpdated]);
  const jobDisplay = job ? createJobDisplay(job) : undefined;
  const history = useHistory();

  // Where the listing is pointed lives here rather than inside the listing,
  // because the card's directory buttons move it — and the archive directory
  // is on another system, so the system travels with the path. null means
  // "wherever the job wrote", which is only known once the job has loaded.
  const [browse, setBrowse] = useState<{
    systemId: string;
    path: string;
  } | null>(null);
  // a walk taken in one job's files must not carry into the next job — the
  // page re-renders across /jobs/:uuid rather than remounting, so this
  // resets the listing to "wherever the new job wrote" on every move
  useEffect(() => {
    setBrowse(null);
  }, [jobUuid]);
  const outputRef = useRef<HTMLDivElement | null>(null);
  const move = useCallback(
    (path: string, systemId: string) => setBrowse({ systemId, path }),
    []
  );
  // The card's buttons scroll; the listing's own presses do not. Walking
  // into a folder should leave the page where you put it, but a press up in
  // the card is on something that may well be off the bottom of the screen,
  // and moving it out of sight would look like the button did nothing.
  const goTo = useCallback(
    (path: string, systemId: string) => {
      move(path, systemId);
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [move]
  );

  useEffect(() => {
    if (jobTerminalStatuses.includes(job?.status!)) {
      return;
    }

    if (
      refetchInterval === 5 &&
      job?.status &&
      !jobRunningStatuses.includes(job?.status)
    ) {
      setRefetchInterval(10);
      return;
    }

    if (jobRunningStatuses.includes(job?.status!)) {
      // backs off, but CAPS: unbounded 1.5x growth left long runs polling
      // every few minutes, and the card lagged far behind a refreshed nav
      setRefetchInterval(Math.min(refetchInterval * 1.5, 30));
    }
  }, [data]);

  // One cancel path for both doors — the head-line Cancel button and the
  // FlexServ card's "Done? Stop the job".
  const requestCancel = () => {
    if (!job?.uuid) return;
    const uuid = job.uuid;
    // the mark alone flips every surface to "cancelling" — no status lies
    markCancelled(uuid);
    cancel(
      { jobUuid: uuid },
      {
        // poll fast while the scheduler works, so the real end lands soon
        onSuccess: () => setRefetchInterval(5),
        // the service refused — take the request mark back off
        onError: () => unmarkCancelled(uuid),
      }
    );
  };

  // The actions belong to the page (they are its hooks) but read as part of
  // the card's head line, so they are handed over rather than stranded under
  // a divider at the bottom of it.
  // Cancel is the one act that is time-critical — a running job is burning
  // an allocation while you look for the press — so it alone stays a
  // visible button. Resubmit is never urgent and rides the cog with the
  // rest, the way the systems card has always kept its acts.
  const actions = job && !jobTerminalStatuses.includes(job.status!) && (
    <HeadAction
      danger
      label={cancelling ? 'Cancelling…' : 'Cancel'}
      icon={<Dangerous />}
      busy={cancelIsLoading || cancelling}
      disabled={cancelIsLoading || cancelling}
      title={
        cancelling
          ? 'Sent. The scheduler takes a moment to act on it'
          : 'Ask the scheduler to stop this run'
      }
      onClick={requestCancel}
    />
  );

  const cog = job && (
    <SettingsCog
      label="Job settings"
      items={[
        {
          key: 'resubmit',
          label: 'Resubmit',
          icon: <Replay fontSize="small" />,
          disabled: isLoadingResubmit,
          // ONE way in, not two. The dialog it opens shows what would be
          // re-run and offers 'Adjust before running' itself, so a second
          // cog entry straight to the launcher was the same act with less
          // information in front of it.
          hint: 'Run this again, as it was or with changes',
          onClick: () => setConfirmResubmit(true),
        },
        // Hide/unhide is NOT here. It lives in the card's Lifecycle box,
        // with the state it changes: a switch whose current position can
        // only be read by opening the menu that sets it is a switch nobody
        // can see. The box also asks first, which a menu row cannot.
      ]}
    />
  );

  // with the output browser pinned at the page's end, the tail padding
  // tightens to the shared gap so the listing sits close to the bottom bar
  // (hooks first, THEN the &&: short-circuiting a hook call is a crash)
  const pinnedExplorer = explorerFit.use() === 'pinned';
  const gapPx = usePinGapPx();
  const hasOutput = Boolean(
    job && job.status && job.execSystemId && job.execSystemOutputDir
  );
  const tightTail = hasOutput && pinnedExplorer;

  return (
    // first load renders the card's own shape, not QueryWrapper's spinner
    <QueryWrapper isLoading={false} error={error}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          // no top or side padding: the shell's right-pane margin is the
          // page's inset, the same as the jobs dashboard next door
          pb: tightTail ? `${gapPx}px` : 2,
          minWidth: 0,
        }}
      >
        {isLoading && !job && <DetailSkeleton />}
        {job && (
          <JobSummaryCard
            job={job}
            cancelling={cancelling}
            cancelConfirmed={cancelIsSuccess}
            actions={actions}
            cog={cog}
            showJSON={showJSON}
            onToggleJSON={() => setShowJSON(!showJSON)}
            onBrowse={job.execSystemId ? goTo : undefined}
            // the way into a running session app (FlexServ, ParaView, …) —
            // docked under the Details box so nobody has to dig the address
            // out of tapisjob.out by hand
            belowDetails={
              <SessionCard
                job={job}
                onStop={requestCancel}
                stopping={cancelIsLoading || cancelling}
              />
            }
          />
        )}
        {/* the record, as its own card below — the same place the system
            and app pages put theirs */}
        {showJSON && jobDisplay && (
          <RecordJson
            title="Job definition"
            json={jobDisplay}
            onClose={() => setShowJSON(false)}
          />
        )}
        {job && (
          <ResubmitDialog
            open={confirmResubmit}
            onClose={() => setConfirmResubmit(false)}
            job={job}
            busy={isLoadingResubmit}
            error={resubmitError}
            onAdjust={
              job.appId && job.appVersion
                ? () => {
                    setConfirmResubmit(false);
                    setAdjusting(true);
                  }
                : undefined
            }
            onResubmit={() => {
              // the dialog STAYS OPEN and shows the flight — closing it
              // immediately left seconds of dead air before the navigation
              resubmit({
                onSuccess: (values) => {
                  setConfirmResubmit(false);
                  history.push(`/jobs/${values.result?.uuid}`);
                },
              });
              cancelReset();
            }}
          />
        )}
        {adjusting && job?.appId && job.appVersion && (
          <Suspense fallback={null}>
            <JobLauncherV2Dialog
              appId={job.appId}
              appVersion={job.appVersion}
              onClose={() => setAdjusting(false)}
              seedValues={jobToSeed(job)}
              seededFrom={{ uuid: job.uuid ?? '', name: job.name ?? undefined }}
            />
          </Suspense>
        )}
        {job && job.status && job.execSystemId && job.execSystemOutputDir && (
          <FilesProvider>
            <SystemProvider systemId={browse?.systemId ?? job.execSystemId}>
              <Box ref={outputRef} sx={{ minWidth: 0, scrollMarginTop: 8 }}>
                <JobOutputList
                  job={job}
                  systemId={browse?.systemId ?? job.execSystemId}
                  path={browse?.path ?? job.execSystemOutputDir}
                  onGo={move}
                />
              </Box>
            </SystemProvider>
          </FilesProvider>
        )}
      </Box>
    </QueryWrapper>
  );
};

export default JobDetail;
