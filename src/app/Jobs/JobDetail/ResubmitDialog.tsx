import React, { useMemo } from 'react';
import { Jobs } from '@tapis/tapis-typescript';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { ReplayRounded, TuneRounded } from '@mui/icons-material';
import { jobTerminalStatuses } from '@tapis/tapisui-common';
import { parseAvailableProjects } from '../_components/knownAllocations';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';

/**
 * Resubmit, with a beat to think.
 *
 * The button used to fire immediately, which is faithful to what the
 * endpoint is: POST /jobs/{uuid}/resubmit takes no body and re-runs the
 * stored definition exactly as it was submitted. There is nothing to edit
 * on that path — which is precisely why a job that failed for a fixable
 * reason (a missing -A, a wrong input) deserved a dialog rather than an
 * instant identical failure.
 *
 * So: the as-is path works today and says what it will do. The
 * adjust-first path opens the launcher pre-filled from this job's
 * definition and submits a NEW job through the normal submit path,
 * because that is the only way to change anything.
 */

const QUIET_BTN_SX = {
  textTransform: 'none',
  borderRadius: '5px',
  borderColor: 'divider',
  color: 'text.primary',
  fontSize: '0.75rem',
} as const;

const ResubmitDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  job: Jobs.Job;
  /** the real endpoint — definition as stored, nothing editable */
  onResubmit: () => void;
  /** the launcher, pre-filled from this job — a fresh submission */
  onAdjust?: () => void;
  busy?: boolean;
  /** the flight failed — said here, where the press happened */
  error?: Error | null;
}> = ({ open, onClose, job, onResubmit, onAdjust, busy, error }) => {
  const failed = job.condition && job.condition !== 'NORMAL_COMPLETION';
  // the one refusal we can see coming again: it named the projects, and an
  // unchanged resubmission will bounce off the same wall
  const refusedProjects = useMemo(
    () => (failed ? parseAvailableProjects(job.lastMessage) : []),
    [failed, job.lastMessage]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: '0.95rem', fontWeight: 700, pb: 0.5 }}>
        Run {job.name ?? 'this job'} again
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <Typography
          sx={{ fontSize: '0.78rem', color: 'text.secondary', mb: 1.5 }}
        >
          Resubmitting re-runs the definition this job was created from — same
          app, same inputs, same scheduler flags. The service takes the stored
          definition whole; nothing about it can be changed on this path.
          {/* offered on running jobs too — the second-run nature is the
              thing to say before the press */}
          {!jobTerminalStatuses.includes(job.status!) &&
            ' This run is still going: resubmitting starts a second, independent run and does not touch this one.'}
        </Typography>

        {refusedProjects.length > 0 && (
          <Box
            sx={{
              border: '1px solid',
              borderColor: '#e6d3ae',
              bgcolor: '#fdf8ec',
              borderRadius: 1,
              px: 1.25,
              py: 0.75,
              mb: 1.5,
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', color: '#7a5200' }}>
              This run was refused for not naming a project, and an unchanged
              resubmission will be refused the same way. Adjust before running
              below opens the launcher with this job&apos;s definition, and its
              Scheduler section offers this system&apos;s projects (
              {refusedProjects.join(', ')}) as one-press chips.
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
          <Button
            size="small"
            variant="contained"
            disableElevation
            startIcon={
              busy ? (
                <CircularProgress size={13} sx={{ color: 'inherit' }} />
              ) : (
                <ReplayRounded sx={{ fontSize: 15 }} />
              )
            }
            disabled={busy}
            onClick={onResubmit}
            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
          >
            {busy ? 'Submitting…' : 'Resubmit as it was'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={onClose}
            sx={QUIET_BTN_SX}
          >
            Cancel
          </Button>
          {/* the dialog holds the flight — it used to close on the press and
              leave seconds of nothing until the new job page appeared */}
          {busy && (
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
              handing the definition to the scheduler — you&apos;ll land on the
              new job
            </Typography>
          )}
        </Box>

        {error && !busy && (
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{ fontSize: '0.72rem', color: 'error.main', mb: 0.5 }}
            >
              The resubmission was refused:
            </Typography>
            <ErrorDetail message={error.message} fontSize="0.72rem" />
          </Box>
        )}

        {/* ── the second door: same definition, editable ──────────────── */}
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            px: 1.25,
            py: 1,
            bgcolor: '#fcfcfb',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <TuneRounded sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
              Adjust before running
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '0.72rem',
              color: 'text.secondary',
              lineHeight: 1.55,
              mt: 0.5,
              mb: 1,
            }}
          >
            Opens the launcher pre-filled from this job&apos;s definition, so a
            bounced allocation or a wrong input can be fixed before it runs
            again. This submits a new job through the normal submit path; run
            directories are not carried over and fall back to the app&apos;s
            defaults.
          </Typography>
          <Button
            size="small"
            variant="outlined"
            disabled={!onAdjust || busy}
            onClick={onAdjust}
            startIcon={<TuneRounded sx={{ fontSize: 14 }} />}
            sx={QUIET_BTN_SX}
          >
            Open in launcher
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ResubmitDialog;
