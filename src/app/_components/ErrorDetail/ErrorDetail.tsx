import React, { useMemo, useState } from 'react';
import { Box, Collapse, IconButton, Stack, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ContentCopyRounded,
  DoneRounded,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { errorHeadline, formatErrorBody } from './errorText';

/**
 * A long error, one line until you want it.
 *
 * Both places that show a Tapis failure — the launcher's Review box and the
 * job page's status line — had the same problem: the message is a paragraph,
 * the box is a line, and the interesting half is at the end. Collapsed this
 * shows the cause rather than the wrapper (see errorHeadline); open, it is the
 * whole thing, wrapped, reflowed and copyable.
 *
 * One box, which grows. The red outline is the alert and the chevron is the
 * promise of more, so the line you read is also the thing you press — earlier
 * shapes put the summary in one box and the detail in another beneath it,
 * which read as two unrelated pieces of news.
 */
const ErrorDetail: React.FC<{
  message: string;
  /** matches the surrounding text where this sits inline, e.g. a card line */
  fontSize?: string | number;
  /** a caller who already understands the message says it better —
   *  the raw transcript stays behind the disclosure */
  headline?: string;
  /** neutral: an expected ending (a cancel) is not an error and must not
   *  wear red */
  tone?: 'error' | 'neutral';
}> = ({ message, fontSize = '0.8rem', headline: headlineOverride, tone }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const neutral = tone === 'neutral';
  const mainColor = neutral ? 'text.secondary' : 'error.main';
  const edgeColor = neutral ? 'divider' : 'error.main';

  const derived = useMemo(() => errorHeadline(message) ?? message, [message]);
  const headline = headlineOverride ?? derived;
  const body = useMemo(() => formatErrorBody(message), [message]);
  // Something to open if the collapsed line is not the whole story: a
  // headline that hid a wrapper chain, a reflow, or simply a message too long
  // to have fitted on one line anyway. An override always hides the raw.
  const hasMore =
    !!headlineOverride ||
    derived !== message ||
    body !== message ||
    message.length > 80;

  // The red text IS the control. A separate 'details' link asked people to
  // read the failure in one place and press somewhere else to see the rest of
  // it; an outlined pill over the normal background says both things at once —
  // this is bad, and there is more of it behind the chevron.
  const pill = {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flex: 1,
    minWidth: 0,
    textAlign: 'left' as const,
    px: 0.75,
    py: 0.25,
    borderRadius: '4px',
    border: '1px solid',
    borderColor: 'error.main',
    bgcolor: 'transparent',
    color: 'error.main',
    fontFamily: 'inherit',
    fontSize,
    lineHeight: 1.5,
  };

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        borderRadius: '4px',
        border: '1px solid',
        borderColor: edgeColor,
        overflow: 'hidden',
      }}
    >
      {/* The whole bar tints on hover, not just the text: the hover used to
          live on the headline button, so the copy button sat in an untinted
          patch that read as a white block stuck to the end of the row. */}
      <Stack
        direction="row"
        alignItems="center"
        sx={
          hasMore
            ? {
                '&:hover': {
                  bgcolor: (theme: any) =>
                    alpha(
                      neutral
                        ? theme.palette.text.secondary
                        : theme.palette.error.main,
                      0.08
                    ),
                },
              }
            : undefined
        }
      >
        <Box
          component={hasMore ? 'button' : 'div'}
          type={hasMore ? 'button' : undefined}
          aria-expanded={hasMore ? open : undefined}
          onClick={hasMore ? () => setOpen((wasOpen) => !wasOpen) : undefined}
          sx={{
            flex: 1,
            minWidth: 0,
            textAlign: 'left',
            px: 0.75,
            py: 0.25,
            border: 'none',
            bgcolor: 'transparent',
            color: mainColor,
            fontFamily: 'inherit',
            fontSize,
            lineHeight: 1.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            ...(hasMore && { cursor: 'pointer' }),
          }}
        >
          {headline}
        </Box>
        <Tooltip title={copied ? 'Copied' : 'Copy the full error'}>
          <IconButton
            size="small"
            disableRipple
            sx={{
              p: 0.25,
              flexShrink: 0,
              bgcolor: 'transparent',
              '&:hover': { bgcolor: 'transparent', color: mainColor },
            }}
            aria-label="Copy the full error"
            onClick={() => {
              navigator.clipboard?.writeText(message);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? (
              <DoneRounded sx={{ fontSize: 15, color: 'success.main' }} />
            ) : (
              <ContentCopyRounded sx={{ fontSize: 15 }} />
            )}
          </IconButton>
        </Tooltip>
        {/* The chevron sits last because that is where a disclosure lives, but
            the button is the headline — this is a mouse convenience, not a
            second control, so it stays out of the tab order and the a11y tree. */}
        {hasMore && (
          <Box
            component="span"
            aria-hidden="true"
            onClick={() => setOpen((wasOpen) => !wasOpen)}
            sx={{
              display: 'flex',
              flexShrink: 0,
              pr: 0.5,
              color: mainColor,
              cursor: 'pointer',
            }}
          >
            {open ? (
              <ExpandLess sx={{ fontSize: 16 }} />
            ) : (
              <ExpandMore sx={{ fontSize: 16 }} />
            )}
          </Box>
        )}
      </Stack>
      <Collapse in={open} unmountOnExit>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 1,
            maxHeight: '32vh',
            overflow: 'auto',
            // a rule, not a second border — the detail is part of this box
            borderTop: '1px solid',
            borderColor: (theme: any) =>
              alpha(
                neutral
                  ? theme.palette.text.secondary
                  : theme.palette.error.main,
                0.35
              ),
            color: 'text.primary',
            fontFamily: 'monospace',
            fontSize: '0.72rem',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {body}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ErrorDetail;
