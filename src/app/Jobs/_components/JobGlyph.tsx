/**
 * A job's status as one glyph — in two flavours, because which one reads
 * better is a real question and not one to settle by assertion.
 *
 * 'classic' is JobStatusIcon exactly as it has always drawn: one Tapis
 * status, one icon.
 *
 * 'rebuilt' draws the SAME icons, chosen better. The only change to the
 * glyph itself is that a run the verdict says actually worked gets the
 * finished icon even when its status says CANCELLED or FAILED — because a
 * two-hour session you stopped, and a job the scheduler cut off after a
 * full day of work, both did the work. What ended it moves to a small
 * corner dot: the same 7px dot, white ring and colour the pending-cancel
 * mark already uses, so this is one piece of vocabulary rather than two.
 *
 * No new icons. The dot cannot say WHY on its own, so the tooltip carries
 * the sentence — "Ran 2h, then you cancelled it".
 *
 * Flip between the two in Settings › Preferences; both are live everywhere
 * a job's status is drawn.
 */
import React from 'react';
import { Box } from '@mui/material';
import { JobStatusIcon } from '@tapis/tapisui-common';
import { jobGlyphStyle } from 'app/_components/PageShell/viewPrefs';
import { JobLite } from './jobsData';
import { Reason, jobVerdict } from './jobVerdict';

/** the pending-cancel dot's amber, and the two other tones it needs */
const DOT: Record<Exclude<Reason, null>, string> = {
  // you did this on purpose — the house purple, not a warning colour
  'cancelled-by-you': '#5f4bb5',
  'cancelled-by-scheduler': '#c77700',
  timeout: '#c77700',
  'out-of-memory': '#c62828',
  'staging-failed': '#c62828',
  'archiving-failed': '#c77700',
  failed: '#c62828',
};

const CANCELLING_AMBER = '#c77700';

/** the mark itself: the old dot, unchanged in size, ring and weight */
const Dot: React.FC<{ color: string }> = ({ color }) => (
  <Box
    component="span"
    sx={{
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 7,
      height: 7,
      borderRadius: '50%',
      bgcolor: color,
      boxShadow: '0 0 0 1.5px #fff',
    }}
  />
);

const JobGlyph: React.FC<{
  job: JobLite;
  /** the running spin, where the caller wants one */
  animation?: 'rotate' | 'pulse';
  /** a cancel is queued and the servers have not caught up */
  cancelling?: boolean;
}> = ({ job, animation, cancelling }) => {
  const style = jobGlyphStyle.use();
  const verdict = jobVerdict(job);
  const rebuilt = style === 'rebuilt' && verdict.outcome !== 'in-flight';

  // The one substitution rebuilt makes: a run that did its work wears the
  // finished icon, whatever transition happened to be last. Everything
  // else keeps the status's own icon — a job that never started should
  // still look like the refusal it was.
  const shown =
    rebuilt && verdict.outcome === 'worked' ? 'FINISHED' : job.status;

  // ONE tooltip, and it lives on the icon. Wrapping JobStatusIcon (which
  // carries its own) in a second Tooltip is what the pending-cancel dot
  // used to do, and it stacks two poppers on one hover.
  const icon = (
    <JobStatusIcon
      status={shown as never}
      // dropped for a promoted run: the condition is what would send
      // JobStatusIcon back to the grey timeout glyph we just moved past
      condition={
        rebuilt && verdict.outcome === 'worked'
          ? undefined
          : (job.condition as never)
      }
      animation={animation}
      tooltip={
        cancelling
          ? 'Cancelling — sent; the run continues until the scheduler acts'
          : rebuilt
          ? verdict.headline
          : undefined
      }
    />
  );

  // nothing to mark: a clean run, or the classic drawing, or one still in
  // flight with no cancel pending
  if (!cancelling && !(rebuilt && verdict.reason)) return icon;

  return (
    <Box component="span" sx={{ display: 'inline-flex', position: 'relative' }}>
      {icon}
      {/* a pending cancel outranks the ending: it is the newest thing
          known about the run, and it is about the future not the past */}
      <Dot
        color={
          cancelling
            ? CANCELLING_AMBER
            : DOT[verdict.reason as Exclude<Reason, null>]
        }
      />
    </Box>
  );
};

export default JobGlyph;
