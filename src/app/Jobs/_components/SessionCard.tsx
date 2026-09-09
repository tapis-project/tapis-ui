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
import { HeadAction } from 'app/_components/PageShell/overviewKit';
import { SECTION_BG } from 'app/_components/PageShell/cardKit';
import { sessionAppFor, SessionAppSpec } from './sessionApps';
import useJobAnnouncement from './useJobAnnouncement';
import { reachedItsWallClock, spell } from './jobVerdict';
import FlexServFrame from './FlexServFrame';

/** the fold press — shared by the live box and the gravestone */
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
    // truncates rather than pushing the status word or the docs button
    // out of the header — a flex child with nowrap text otherwise refuses
    // to shrink below its own content width and just spills past the
    // card's edge instead of wrapping
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  } as const);

/** parse's identity sits in the hook's dependency arrays — module-level */
const parseNothing = () => undefined;

/** Tapis machinery before the scheduler even has the job — quick, usually */
const PRE_QUEUE = new Set([
  'PENDING',
  'PROCESSING_INPUTS',
  'STAGING_INPUTS',
  'STAGING_JOB',
  'SUBMITTING_JOB',
]);

/**
 * What the box says while there is no address yet — phase-aware, because
 * "usually appears a few minutes in" is only true once the run has begun.
 * A queued job can sit for hours on a busy machine, and promising minutes
 * there is a lie; the announcement hook already restarts its watch clock
 * at RUNNING for the same reason. Checked before gaveUp so a long queue
 * never reads as the watch having failed.
 */
const waitingCopy = (
  status: string | undefined,
  spec: SessionAppSpec,
  gaveUp: boolean
): string => {
  if (status === 'BLOCKED' || status === 'PAUSED') {
    /* held jobs have not started — promising "a few minutes"
       while a quota holds the run would be a lie */
    return 'The job is held right now (see above), so the server has not started - watching resumes the moment it runs.';
  }
  if (status === 'QUEUED') {
    return "Still in the scheduler's queue - a busy machine can hold a job here for a while, and that wait is normal. The address arrives a few minutes after the run starts; this page keeps checking, so you can leave it open.";
  }
  if (status && PRE_QUEUE.has(status)) {
    return 'The job is being staged and handed to the scheduler - the address arrives a few minutes after the run itself starts. This page checks for you; you can leave it open.';
  }
  if (gaveUp) {
    return 'No address after 30 minutes - reload the page to look again, or check tapisjob.out below.';
  }
  /* a loading state that teaches something, per the house style */
  return `Waiting for the server to announce itself - the address${
    spec.hasToken ? ' and token usually appear' : ' usually appears'
  } a few minutes in. This page checks for you; you can leave it open.`;
};

/** the header's still word — same phases, one syllable each */
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

/** the page-header book glyph, pointed at the app's own docs — a sibling of
 *  the fold press, because a button inside a button is not a thing */
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
          // fixed, so Address and Token stack with their boxes flush
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
        {/* a fixed run of dots — the mask should not leak the length either */}
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
 * Session-app jobs do not produce a result, they produce a server — and the
 * way in is a URL (and sometimes a one-time token) printed into the run's
 * output partway through. Finding that by hand means opening the output
 * listing, picking the file out, downloading it and reading the log.
 *
 * This card watches for you and hands over the things that matter. Which
 * apps get one, and how each announces itself, lives in the sessionApps
 * registry — this component renders nothing for jobs that match no entry.
 * Once a job is over it keeps a small gravestone — the session is dead, run
 * the app for a new one — and takes one quiet look at the final output for
 * the address it used to answer on, shown struck through when the log still
 * has it. Never the token, which has no afterlife.
 */
const SessionCard: React.FC<{
  job?: Jobs.Job;
  /** cancel the job from the card — a session you're done with should end
   *  where it lives, not via a hunt for the red button */
  onStop?: () => void;
  stopping?: boolean;
}> = ({ job, onStop, stopping }) => {
  // The session, framed right here — movable, resizable, closable. The
  // frame is a `position: fixed` window with its own remembered geometry,
  // so it is NOT laid out inside this box and the card's own width is
  // irrelevant to it. It stays state-of-this-card for that reason: the
  // presses that open and close it are here, and nothing outside needs to
  // know. (An earlier version told the page, which moved this component
  // to a different place in the tree — a different parent, so React
  // remounted it, and the fresh instance's `framed` was false again. The
  // panel opened and shut itself in the same beat.)
  const [framed, setFramed] = useState(false);
  // the Details-box bargain: shut it and the header keeps the address
  const [open, setOpen] = useState(true);
  // the floating frame is per-run; the page outlives navigation
  useEffect(() => setFramed(false), [job?.uuid]);

  const spec = sessionAppFor(job);
  // all the backend mechanics — the file-first watchers with their backoff
  // and ceiling, the cache-derived value, the over-job look-back, and the
  // found-it files nudge — live in the reusable hook; this card is only
  // one app's reading of them
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
  // a session that has reached its wall clock is very likely already
  // unreachable, whatever the status still says
  const wall = reachedItsWallClock((job ?? {}) as never);

  if (!job || !spec) return null;
  const accent = spec.accent;

  if (over) {
    // The box stands whether or not an address survives. It used to hide
    // when the final read found none — but once Tapis archives the output
    // dir, tapisjob.out 404s and EVERY dead session lost its gravestone a
    // few minutes after it earned one. The ending is the fact worth
    // showing; the address is a detail we add when the log still has it.
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
        {/* the same foldable header the living box has — dead sessions get
            the docs and the shut option too */}
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
            {/* shut, the dead address still rides the header — struck */}
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
        // the fact boxes' own tint and frame: this box sits among them in
        // the mosaic, and it was the one reading as a different kind of
        // thing — paper where they are tinted, and a shorter header
        bgcolor: SECTION_BG,
        overflow: 'hidden',
      }}
    >
      {/* the Details-box grammar: a header you can shut, that still says
          the one thing that matters while shut */}
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
          {/* a still word, not a spinner — the rotating circle nagged at
              the eye through every held or queued job; '· held', '· queued'
              and '· waiting' say the same thing and sit still, in the same
              family as the gravestone's '· over' */}
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
          {/* shut, the header still answers where it lives */}
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
          {/* the one-line what-this-is; the book above carries the rest */}
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
          {/* the address outlives the server by about a minute: the
              scheduler pulls the node at the wall clock, and the job only
              reads as over once Tapis notices. In that window this card
              would otherwise still be offering a link to nothing */}
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
              {/* address, token, actions — three quiet lines */}
              <CopyField label="Address" value={session.address} />
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
                <HeadAction
                  label={`Open ${spec.openLabel}`}
                  icon={<OpenInNewRounded />}
                  href={session.address}
                  title="The session in its own tab - always works"
                />
                {/* only for apps that tolerate an iframe — a DCV-style
                    session refuses framing, and a button that opens a
                    blank box is worse than no button.
                    Short labels on purpose: this row lives in a 340px
                    mosaic column (its full-width home is the frame, once
                    open), and "Open in panel" + "Done? Stop the job"
                    together with the tab button no longer fit one line —
                    the wrap read as broken rather than deliberate. The
                    dropped words move into the title, which was already
                    carrying the fuller explanation. */}
                {spec.framable !== false && (
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
                    // the press is a stop; the state underneath is the job
                    // cancelling — in flight it says what the rest of the
                    // page says
                    label={stopping ? 'Cancelling…' : 'Stop'}
                    busy={stopping}
                    onClick={onStop}
                    title="Done? Stop the job - the server runs until its time limit unless you stop it. Stopping when you're done is the normal end of a session, and frees the node."
                  />
                )}
              </Box>
            </Box>
          ) : (
            <Typography
              sx={{
                fontSize: '0.72rem',
                color: 'text.secondary',
                // teaching text is a paragraph — give the lines air
                lineHeight: 1.6,
              }}
            >
              {waitingCopy(job?.status as string | undefined, spec, gaveUp)}
            </Typography>
          )}
          {/* a 404 is the normal state before the announcement exists, so it
              is not shown; anything else is worth saying out loud */}
          {error && !session && !/not found|404/i.test(error.message) && (
            <Typography
              sx={{ fontSize: '0.68rem', color: 'warning.main', mt: 0.5 }}
            >
              Could not read {spec.file ?? 'tapisjob.out'}: {error.message}
            </Typography>
          )}
        </Box>
      </Collapse>

      {framed && session && spec.framable !== false && (
        <FlexServFrame
          address={session.address}
          token={session.token || undefined}
          label={job?.name ?? undefined}
          title={spec.title}
          accent={accent}
          onClose={() => setFramed(false)}
        />
      )}
    </Box>
  );
};

export default SessionCard;
