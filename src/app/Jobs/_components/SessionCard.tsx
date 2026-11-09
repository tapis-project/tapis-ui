import React, { useEffect, useState } from 'react';
import { Jobs } from '@tapis/tapis-typescript';
import { Box, Collapse, IconButton, Tooltip, Typography } from '@mui/material';
import {
  ContentCopyRounded,
  DoneRounded,
  ExpandMoreRounded,
  OpenInNewRounded,
  PictureInPictureRounded,
  StopCircleRounded,
  VisibilityOffRounded,
  VisibilityRounded,
  WarningAmberRounded,
} from '@mui/icons-material';
import { Help } from '@tapis/tapisui-common';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import { HeadAction } from 'app/_components/PageShell/overviewKit';
import { SECTION_BG } from 'app/_components/PageShell/cardKit';
import { sessionAppFor, SessionAppSpec } from './sessionApps';
import useJobAnnouncement from './useJobAnnouncement';
import { reachedItsWallClock, spell } from './jobVerdict';
import FlexServFrame from './FlexServFrame';
import { addressPlacement } from './flexserv';

/** fold button, shared by the active and over boxes */
const FOLD_BTN_SX = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  minWidth: 0,
  px: 1,
  py: 0.75,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
} as const;

const titleSx = (accent: string) =>
  ({
    fontSize: '0.78rem',
    fontWeight: 700,
    color: accent,
    whiteSpace: 'nowrap',
    // truncate so the status word and docs button stay in the header
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  } as const);

/** module-level: parse is in the hook's dependency arrays */
const parseNothing = () => undefined;

/** statuses before the scheduler has the job */
const PRE_QUEUE = new Set([
  'PENDING',
  'PROCESSING_INPUTS',
  'STAGING_INPUTS',
  'STAGING_JOB',
  'SUBMITTING_JOB',
]);

/**
 * Text shown while there is no address yet, by job phase. The "few minutes"
 * estimate only holds once the run has started; the announcement hook
 * restarts its watch clock at RUNNING for the same reason. Held and queued
 * states are checked before gaveUp.
 */
const waitingCopy = (
  status: string | undefined,
  spec: SessionAppSpec,
  gaveUp: boolean
): string => {
  if (status === 'BLOCKED' || status === 'PAUSED') {
    return 'The job is held (see above), so the server has not started. Checking resumes when it runs.';
  }
  if (status === 'QUEUED') {
    return 'Queued in the scheduler. The address appears a few minutes after the run starts. This page rechecks until the job ends.';
  }
  if (status && PRE_QUEUE.has(status)) {
    return 'The job is being staged for the scheduler. The address appears a few minutes after the run starts. This page rechecks until the job ends.';
  }
  if (gaveUp) {
    return 'No address after 30 minutes. Reload the page to check again, or read tapisjob.out below.';
  }
  return `Waiting for the server address. ${
    spec.hasToken
      ? 'The address and token usually appear'
      : 'The address usually appears'
  } a few minutes in. This page rechecks until the job ends.`;
};

/** header status word by phase */
const stillWord = (status?: string): string =>
  status === 'BLOCKED' || status === 'PAUSED'
    ? '· held'
    : status === 'QUEUED'
    ? '· queued'
    : '· waiting';

const Chevron: React.FC<{ open: boolean }> = ({ open }) => (
  <ExpandMoreRounded
    sx={{
      fontSize: 16,
      color: 'text.secondary',
      transform: open ? 'none' : 'rotate(-90deg)',
      transition: 'transform 120ms',
    }}
  />
);

/** docs link for the app; a sibling of the fold button (no nested buttons) */
const DocsButton: React.FC<{ spec: SessionAppSpec }> = ({ spec }) => (
  <Box sx={{ pr: 1, display: 'inline-flex', flexShrink: 0 }}>
    <Help
      variant="doc"
      headerStyle="banner"
      title={spec.title}
      bannerText={spec.docs.bannerText}
      iframeUrl={spec.docs.url}
    />
  </Box>
);

const CopyField: React.FC<{
  label: string;
  value: string;
  mono?: boolean;
  secret?: boolean;
}> = ({ label, value, mono, secret }) => {
  const [copied, setCopied] = useState(false);
  const [shown, setShown] = useState(false);
  const masked = secret && !shown;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: '0.68rem',
          color: 'text.secondary',
          flexShrink: 0,
          // fixed width so the Address and Token boxes align
          width: 54,
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          px: 0.75,
          py: 0.25,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '4px',
          bgcolor: '#fcfcfb',
          fontSize: '0.72rem',
          fontFamily: mono ? 'monospace' : undefined,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...(masked && { letterSpacing: '0.15em', color: 'text.secondary' }),
        }}
      >
        {/* fixed-length mask, so the value length is not shown */}
        {masked ? '••••••••••' : value}
      </Box>
      {secret && (
        <Tooltip
          title={
            shown
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
        >
          <IconButton
            size="small"
            sx={{ p: 0.25 }}
            onClick={() => setShown((s) => !s)}
            aria-label={
              shown
                ? `Hide ${label.toLowerCase()}`
                : `Show ${label.toLowerCase()}`
            }
          >
            {shown ? (
              <VisibilityOffRounded sx={{ fontSize: 15 }} />
            ) : (
              <VisibilityRounded sx={{ fontSize: 15 }} />
            )}
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title={copied ? 'Copied' : `Copy ${label.toLowerCase()}`}>
        <IconButton
          size="small"
          sx={{ p: 0.25 }}
          onClick={() => {
            navigator.clipboard?.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
          aria-label={`Copy ${label.toLowerCase()}`}
        >
          {copied ? (
            <DoneRounded sx={{ fontSize: 15, color: 'success.main' }} />
          ) : (
            <ContentCopyRounded sx={{ fontSize: 15 }} />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

/**
 * Shows the address (and one-time token) a session-app job prints into its
 * output. Which apps get a card, and how each prints its address, is set in
 * the sessionApps registry; jobs that match no entry render nothing.
 * After the job ends the card shows an "over" box with the last address,
 * struck through, if the final output still has it. The token is not kept.
 */
const SessionCard: React.FC<{
  job?: Jobs.Job;
  /** cancels the job */
  onStop?: () => void;
  stopping?: boolean;
}> = ({ job, onStop, stopping }) => {
  // The frame is a position: fixed window, so it does not depend on this
  // box's width. Its open state must stay in this component: lifting it to
  // the page changes the parent and remounts the card, which resets it.
  const [framed, setFramed] = useState(false);
  // when closed, the header still shows the address
  const [open, setOpen] = useState(true);
  // the floating frame is per-run; the page outlives navigation
  useEffect(() => setFramed(false), [job?.uuid]);

  const spec = sessionAppFor(job);
  // file watching, backoff and the look-back after the job ends are in the hook
  const {
    announced: session,
    wasAnnounced,
    over,
    gaveUp,
    error,
  } = useJobAnnouncement({
    job,
    enabled: !!spec,
    file: spec?.file,
    parse: spec?.parse ?? parseNothing,
  });
  const wasAt = wasAnnounced?.address;
  // the address comes from job output: frame it only on the execution system's domain
  const systemQuery = SystemsHooks.useDetails(
    { systemId: job?.execSystemId ?? '', select: 'host' },
    { enabled: !!spec && !!job?.execSystemId }
  );
  const systemHost = systemQuery?.data?.result?.host;
  const placement = session
    ? addressPlacement(session.address, systemHost)
    : undefined;
  // past the wall clock the session is probably unreachable, whatever the status
  const wall = reachedItsWallClock((job ?? {}) as never);

  if (!job || !spec) return null;
  const accent = spec.accent;

  if (over) {
    // Shown even with no address: once Tapis archives the output dir,
    // tapisjob.out returns 404, so the address is optional.
    return (
      <Box
        sx={{
          border: '1px dashed',
          borderColor: `${accent}8c`,
          borderRadius: 1,
          bgcolor: SECTION_BG,
          overflow: 'hidden',
        }}
      >
        {/* same foldable header as the active box */}
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <Box
            component="button"
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            sx={FOLD_BTN_SX}
          >
            <Chevron open={open} />
            <Typography sx={titleSx(accent)}>{spec.title} session</Typography>
            <Typography
              sx={{
                fontSize: '0.7rem',
                color: 'text.disabled',
                flexShrink: 0,
              }}
            >
              · over
            </Typography>
            {/* when closed, the old address stays in the header, struck through */}
            {!open && wasAt && (
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  color: 'text.disabled',
                  textDecoration: 'line-through',
                  minWidth: 0,
                }}
                noWrap
              >
                {wasAt}
              </Typography>
            )}
          </Box>
          <DocsButton spec={spec} />
        </Box>
        <Collapse in={open} unmountOnExit>
          <Box sx={{ px: 1, pb: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '0.72rem',
                color: 'text.secondary',
                lineHeight: 1.6,
              }}
            >
              {wasAt
                ? wasAnnounced?.token
                  ? 'Ended with the job, so address and token are dead. Run the app again for a new session.'
                  : 'Ended with the job, so that address is dead. Run the app again for a new session.'
                : 'Ended with the job. Run the app again for a new session.'}
            </Typography>
            {wasAt && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  mt: 0.75,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.68rem',
                    color: 'text.secondary',
                    flexShrink: 0,
                  }}
                >
                  Was at
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                    color: 'text.disabled',
                    textDecoration: 'line-through',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                  }}
                >
                  {wasAt}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: session ? `${accent}66` : 'divider',
        borderRadius: 1,
        // same tint and frame as the neighbouring fact boxes
        bgcolor: SECTION_BG,
        overflow: 'hidden',
      }}
    >
      {/* foldable header; the address stays visible when closed */}
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
        <Box
          component="button"
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          sx={FOLD_BTN_SX}
        >
          <Chevron open={open} />
          <Typography sx={titleSx(accent)}>{spec.title} session</Typography>
          {/* static phase word ('· held', '· queued', '· waiting') */}
          {!session && (
            <Typography
              sx={{
                fontSize: '0.7rem',
                color: 'text.disabled',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {stillWord(job.status as string | undefined)}
            </Typography>
          )}
          {/* when closed, show the address in the header */}
          {!open && session && (
            <Typography
              sx={{
                fontSize: '0.7rem',
                color: 'text.secondary',
                fontFamily: 'monospace',
                minWidth: 0,
              }}
              noWrap
            >
              {session.address}
            </Typography>
          )}
        </Box>
        <DocsButton spec={spec} />
      </Box>

      <Collapse in={open} unmountOnExit>
        <Box sx={{ px: 1, pb: 1, pt: 0.25, minWidth: 0 }}>
          {/* one-line description; the docs button has the rest */}
          <Typography
            sx={{
              fontSize: '0.68rem',
              color: 'text.secondary',
              lineHeight: 1.5,
              mb: 0.75,
            }}
          >
            {spec.whatIs}
          </Typography>
          {/* the scheduler removes the node at the wall clock, but the job
              shows as over only once Tapis notices; warn in that window */}
          {wall && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 0.4,
                mb: 0.75,
                color: '#b26a00',
              }}
            >
              <WarningAmberRounded sx={{ fontSize: 13, mt: '1px' }} />
              <Typography sx={{ fontSize: '0.68rem', lineHeight: 1.5 }}>
                Past its {spell(wall.allowanceMs)} limit. The address stops
                answering before the job reads as over.
              </Typography>
            </Box>
          )}
          {session ? (
            <Box sx={{ display: 'grid', gap: 0.6 }}>
              <CopyField label="Address" value={session.address} />
              {placement === 'elsewhere' && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 0.4,
                    color: '#b26a00',
                  }}
                >
                  <WarningAmberRounded sx={{ fontSize: 13, mt: '1px' }} />
                  <Typography sx={{ fontSize: '0.68rem', lineHeight: 1.5 }}>
                    This address is not on {systemHost ?? "the job's system"},
                    so it is not opened from here.
                  </Typography>
                </Box>
              )}
              {!!session.token && (
                <CopyField label="Token" value={session.token} mono secret />
              )}
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.75,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  minWidth: 0,
                  mt: 0.25,
                }}
              >
                {placement !== 'elsewhere' && (
                  <HeadAction
                    label={`Open ${spec.openLabel}`}
                    icon={<OpenInNewRounded />}
                    href={session.address}
                    title="The session in its own tab - always works"
                  />
                )}
                {/* only for apps that allow an iframe (DCV-style sessions refuse framing).
                    Labels are short to fit the 340px column; details are in the title. */}
                {spec.framable !== false && placement === 'on-system' && (
                  <HeadAction
                    label="Panel"
                    icon={<PictureInPictureRounded />}
                    onClick={() => setFramed(true)}
                    title="Open in panel - frame the session inside this page, movable and resizable. Some apps refuse framing; the tab button always works."
                  />
                )}
                {onStop && (
                  <HeadAction
                    danger
                    icon={<StopCircleRounded />}
                    label={stopping ? 'Cancelling…' : 'Stop'}
                    busy={stopping}
                    onClick={onStop}
                    // Same action as Cancel on the job header. The label is short
                    // for the 340px column; the tooltip carries the meaning.
                    title={
                      stopping
                        ? 'Cancel request sent. The scheduler may take a moment to act.'
                        : "Stop session (cancels the job). Same action as Cancel on the job header. Ending the job is the only way to end a session. Otherwise the server runs until the job's time limit."
                    }
                  />
                )}
              </Box>
            </Box>
          ) : (
            <Typography
              sx={{
                fontSize: '0.72rem',
                color: 'text.secondary',
                lineHeight: 1.6,
              }}
            >
              {waitingCopy(job?.status as string | undefined, spec, gaveUp)}
            </Typography>
          )}
          {/* 404 is expected before the address exists; show other errors */}
          {error && !session && !/not found|404/i.test(error.message) && (
            <Typography
              sx={{ fontSize: '0.68rem', color: 'warning.main', mt: 0.5 }}
            >
              Could not read {spec.file ?? 'tapisjob.out'}: {error.message}
            </Typography>
          )}
        </Box>
      </Collapse>

      {framed &&
        session &&
        spec.framable !== false &&
        placement === 'on-system' && (
          <FlexServFrame
            address={session.address}
            token={session.token || undefined}
            label={job?.name ?? undefined}
            title={spec.title}
            accent={accent}
            clipboardKey={job?.uuid}
            onClose={() => setFramed(false)}
          />
        )}
    </Box>
  );
};

export default SessionCard;
