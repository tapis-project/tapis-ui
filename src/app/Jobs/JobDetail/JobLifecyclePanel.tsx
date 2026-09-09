/**
 * JobLifecyclePanel — the box the apps and systems cards have and the job
 * card did not.
 *
 * A job's lifecycle is shorter than an app's or a system's, and the reason
 * is worth stating: the Jobs service has NO delete. Its spec carries no
 * DELETE on /jobs/{uuid} and no undelete — the only delete verbs in the
 * whole service are for subscriptions and shares. Hide is the nearest
 * thing a job has, and unlike a soft delete it destroys nothing at all.
 *
 * So, two states worth reading:
 *
 *   visible — listed, or hidden. The job, its output and its history are
 *             all kept; it just stops being listed.
 *   status  — the service's own status value, glossed. Not a bucket and not
 *             a coined word: the record says STAGING_INPUTS, so this says
 *             STAGING_INPUTS, and jobMessages.STATUS_COPY says what that
 *             means. Read-only on purpose — stopping a job is time-critical,
 *             it lives on the head line as the page's one visible button,
 *             and a second copy buried in a box is not where anybody looks.
 *             A live job past the wall clock it asked for gets a warning
 *             beside the value, not instead of it — RUNNING is still what
 *             the record says.
 *
 * Hiding is asked about first, because it is a one-way door for everything
 * except the link. Verified against tacc.develop on 2026-09-08: with a
 * hidden job on the account, GET /jobs/list drops it AND a POST /jobs/search
 * for `visible = false` returns nothing — the service filters hidden jobs
 * out of both paths, so no listing anywhere can offer them back. The page's
 * own URL is the only way in, and this box is the only way out.
 */
import React from 'react';
import { Jobs as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import {
  PlayCircleOutlineRounded,
  TaskAltRounded,
  VisibilityOffRounded,
  VisibilityRounded,
  WarningAmberRounded,
} from '@mui/icons-material';
import { jobTerminalStatuses } from '@tapis/tapisui-common';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import { explainJobStatus } from '../_components/jobMessages';
import { reachedItsWallClock, spell } from '../_components/jobVerdict';
import ConfirmModal from 'app/_components/PageShell/ConfirmModal';
import {
  Fact,
  InnerBox,
  MICRO_BTN_SX,
  MICRO_BTN_DANGER_SX,
} from 'app/_components/PageShell/cardKit';

const VALUE_SX = { fontSize: '0.74rem' } as const;

const JobLifecyclePanel: React.FC<{
  job: {
    uuid?: string;
    status?: string;
    visible?: boolean;
    owner?: string;
    createdby?: string;
    /** the wall clock it asked for and when it reached the machine —
     *  enough to know the scheduler's time is up while the page still
     *  says RUNNING. Detail record only; a listing row has neither */
    maxMinutes?: number;
    remoteStarted?: string;
    ended?: string;
  };
}> = ({ job }) => {
  const { claims } = useTapisConfig();
  const me = claims['tapis/username'];
  // the same gate Sharing & access uses: pipelines submit as one user on
  // behalf of another, and the service allows both
  const canManage = job.owner === me || job.createdby === me;

  const jobUuid = job.uuid ?? '';
  const hideQ = Hooks.useHideJob();
  const unhideQ = Hooks.useUnhideJob();
  // asked about on the way in only — unhiding takes nothing away
  const [confirmHide, setConfirmHide] = React.useState(false);

  const hidden = job.visible === false;
  const busy = hideQ.isLoading || unhideQ.isLoading;
  const error = hideQ.error ?? unhideQ.error ?? null;
  const over = jobTerminalStatuses.includes(job.status as never);
  const gloss = explainJobStatus(job.status);
  // live, and already at the wall clock it asked for — the record cannot
  // say this yet, because the status only moves once Tapis notices
  const wall = reachedItsWallClock(job);

  return (
    <InnerBox title="Lifecycle">
      <Fact label="visible">
        {hidden ? (
          <>
            <VisibilityOffRounded sx={{ fontSize: 14, color: '#455a64' }} />
            <Typography sx={VALUE_SX}>
              hidden: reachable only by its link, until you unhide it
            </Typography>
          </>
        ) : (
          <>
            <VisibilityRounded sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography sx={VALUE_SX}>listed</Typography>
          </>
        )}
        {canManage && (
          <Tooltip
            title={
              hidden
                ? 'Put this job back in the listings'
                : 'Keep the job, its output and its history; just stop listing it. Nothing is deleted, but no listing or search can offer it back, so keep the link.'
            }
            arrow
            describeChild
          >
            <Button
              size="small"
              disabled={busy || !jobUuid}
              sx={hidden ? MICRO_BTN_SX : MICRO_BTN_DANGER_SX}
              onClick={() =>
                hidden ? unhideQ.unhideJob(jobUuid) : setConfirmHide(true)
              }
            >
              {busy ? '…' : hidden ? 'unhide' : 'hide'}
            </Button>
          </Tooltip>
        )}
      </Fact>

      <Fact label="status" when={!!job.status}>
        {over ? (
          <TaskAltRounded sx={{ fontSize: 14, color: 'text.disabled' }} />
        ) : (
          <PlayCircleOutlineRounded sx={{ fontSize: 14, color: '#1b7f3b' }} />
        )}
        <Typography sx={VALUE_SX}>{job.status}</Typography>
        {gloss && (
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            · {gloss}
          </Typography>
        )}
        {/* the status stays true and the warning sits beside it: RUNNING is
            what the record says, and "the clock is up" is what the record
            cannot say yet */}
        {wall && (
          <Typography
            sx={{
              fontSize: '0.68rem',
              color: '#b26a00',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 0.4,
            }}
          >
            <WarningAmberRounded sx={{ fontSize: 12 }} />
            past its {spell(wall.allowanceMs)} limit. The scheduler ends it
            around now
          </Typography>
        )}
      </Fact>

      {error && (
        <Box sx={{ gridColumn: '1 / -1' }}>
          <ErrorDetail message={error.message} fontSize="0.68rem" />
        </Box>
      )}

      {/* not `danger`: nothing is destroyed. What it IS is a door only
          this page can open again, and the message says so rather than
          leaving it to be discovered */}
      <ConfirmModal
        open={confirmHide}
        title="Hide job"
        confirmText="Hide it"
        onClose={() => setConfirmHide(false)}
        onConfirm={() => {
          setConfirmHide(false);
          hideQ.hideJob(jobUuid);
        }}
      >
        It leaves every job listing <b>and search</b>: the Jobs service filters
        hidden jobs out of both, so nothing can offer it back to you. This
        page&rsquo;s link is the way back in, and this box is where you unhide
        it. Nothing is deleted: the job, its output and its history are all kept
        exactly as they are.
      </ConfirmModal>
    </InnerBox>
  );
};

export default JobLifecyclePanel;
