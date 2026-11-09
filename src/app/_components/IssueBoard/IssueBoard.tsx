import React from 'react';
import { Box, Link, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LABEL_SX, SECTION_BG } from 'app/_components/PageShell/cardKit';
import { fadeGlowSx, fadeTintSx } from 'app/_components/PageShell/glow';
// straight from the module, not the app/_components barrel: that barrel also
// exports the chat panel, which drags react-markdown and pixi into every test
// that touches this file
import WaveText from 'app/_components/WaveText';

export type BoardIssueKind = 'blocker' | 'warning';

export type BoardIssue = {
  kind: BoardIssueKind;
  /** stable list key */
  key: string;
  /** the step or section that owns it, already turned into a label */
  where: string;
  message: string;
  /** take me to it */
  onGo?: () => void;
  // Deliberately no "fix it from here" press: one on the board got pressed
  // out of fidget more than intent. The board tells; the section does.
};

type Tone = 'error' | 'warning';

const TONE_OF: Record<BoardIssueKind, Tone> = {
  blocker: 'error',
  warning: 'warning',
};

// The section link's colour: the house red and the house amber, so where a
// problem lives reads as a place to go, in the colour of what is wrong there.
const LINK_TONE: Record<BoardIssueKind, string> = {
  blocker: '#b3261e',
  warning: '#8a6d00',
};

/** the head line's severity mark, in the size the cards use for one */
const Dot: React.FC<{ tone: Tone }> = ({ tone }) => (
  <Box
    aria-hidden
    sx={{
      width: 7,
      height: 7,
      borderRadius: '50%',
      flexShrink: 0,
      bgcolor: `${tone}.main`,
    }}
  />
);

/**
 * One issue as a fact row.
 *
 * The owning step is the card grammar's uppercase label in a fixed gutter
 * rather than a link buried at the head of the sentence: with four of these
 * the eye wants a column to run down, and the gutter is what a fact row on
 * every other card in this app already looks like. The rail carries the
 * severity, so the prose stays black and readable.
 */
const IssueRow: React.FC<{
  issue: BoardIssue;
  first: boolean;
  /** the board's glow, so each row's link lights up with the card */
  ring: number;
}> = ({ issue, first, ring }) => {
  const tone = TONE_OF[issue.kind];
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        py: 0.5,
        ...(first
          ? undefined
          : { borderTop: '1px solid', borderColor: 'divider' }),
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 3,
          borderRadius: 3,
          alignSelf: 'stretch',
          flexShrink: 0,
          bgcolor: (theme) => alpha(theme.palette[tone].main, 0.6),
        }}
      />
      {issue.onGo ? (
        <Link
          component="button"
          type="button"
          underline="always"
          onClick={issue.onGo}
          title={`Go to ${issue.where}`}
          sx={{
            ...LABEL_SX,
            flexShrink: 0,
            width: 84,
            textAlign: 'left',
            lineHeight: 1.6,
            // room for the wash around the word, without moving the word
            px: '3px',
            mx: '-3px',
            // the gutter is a column, so it may not become two lines when a
            // label is long; the full name rides on the title attribute
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            // A link has to look like one before anyone hovers: grey caps
            // read as a caption. The severity's colour, underlined, says
            // "the fix is over here".
            color: LINK_TONE[issue.kind],
            textDecorationStyle: 'dotted',
            textDecorationColor: alpha(LINK_TONE[issue.kind], 0.6),
            textUnderlineOffset: '3px',
            '&:hover': {
              textDecorationStyle: 'solid',
              textDecorationColor: LINK_TONE[issue.kind],
            },
            // lit with the card, on the same beats
            ...(ring > 0 &&
              fadeTintSx(
                LINK_TONE[issue.kind],
                ring % 2 ? 'fadeGlowA' : 'fadeGlowB'
              )),
          }}
        >
          {issue.where}
        </Link>
      ) : (
        <Typography
          sx={{ ...LABEL_SX, flexShrink: 0, width: 84, lineHeight: 1.6 }}
        >
          {issue.where}
        </Typography>
      )}
      <Typography
        sx={{ flex: 1, minWidth: 0, fontSize: '0.76rem', lineHeight: 1.5 }}
      >
        {issue.message}
      </Typography>
    </Box>
  );
};

/**
 * Everything wrong with what a wizard is about to send, in one card.
 *
 * The launcher had this as two stacked alert boxes, each with a bulleted list
 * inside it and both amber, which spent a third of the review pane before the
 * request body got a look in and gave a blocker and a warning the same colour.
 * This is the card the detail pages use instead: a title, its counts on the
 * right, one tinted well of fact rows. Red heads it whenever there is red,
 * since a warning does not stop a submission and cannot be the first thing
 * said.
 *
 * It lives here rather than in the launcher because the systems creator owes
 * its reader exactly the same answer, in exactly the same words.
 */
const IssueBoard: React.FC<{
  issues: Array<BoardIssue>;
  /** "3 things to fix before this job can be submitted" */
  blockerHeading: (count: number) => string;
  /** "1 setting will not be sent"; omit if a caller has no amber half */
  warningHeading?: (count: number) => string;
  /**
   * Bumped when the caller wants the card noticed (the launcher's Review &
   * submit glows it with the Submit button): each new value is one slow
   * swell, red when anything blocks, amber otherwise.
   */
  ring?: number;
}> = ({ issues, blockerHeading, warningHeading, ring = 0 }) => {
  const blockers = issues.filter((issue) => issue.kind === 'blocker');
  const warnings = issues.filter((issue) => issue.kind === 'warning');
  if (!issues.length) {
    return null;
  }
  const amber = warningHeading?.(warnings.length) ?? '';
  const replay = warnings.map((issue) => issue.message).join();

  return (
    <Box
      data-ring={ring > 0 ? ring : undefined}
      sx={{
        mb: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        p: 1.25,
        minWidth: 0,
        // alternating names replay the swell on each press without
        // remounting the card (see fadeGlowSx)
        ...(ring > 0 &&
          fadeGlowSx(
            blockers.length ? '#b3261e' : '#c89a00',
            ring % 2 ? 'fadeGlowA' : 'fadeGlowB',
            5
          )),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          flexWrap: 'wrap',
          mb: 1,
        }}
      >
        <Dot tone={blockers.length ? 'error' : 'warning'} />
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>
          {blockers.length ? (
            blockerHeading(blockers.length)
          ) : (
            <WaveText text={amber} replay={replay} loop />
          )}
        </Typography>
        <Box sx={{ flex: 1 }} />
        {/* both severities present: the amber count rides on the right of the
            same line rather than opening a second heading */}
        {blockers.length > 0 && warnings.length > 0 && (
          <Typography sx={{ ...LABEL_SX, pt: 0, color: 'warning.dark' }}>
            <WaveText text={amber} replay={replay} loop />
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          bgcolor: SECTION_BG,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          px: 1,
          py: 0.25,
          minWidth: 0,
        }}
      >
        {[...blockers, ...warnings].map((issue, index) => (
          <IssueRow
            key={issue.key}
            issue={issue}
            first={index === 0}
            ring={ring}
          />
        ))}
      </Box>
    </Box>
  );
};

export default IssueBoard;
