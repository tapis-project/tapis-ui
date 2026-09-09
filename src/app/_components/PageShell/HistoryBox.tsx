/**
 * A service's change ledger at card size: a half-column box previewing
 * the newest few, and `expand` into the whole thing (HistoryDialog).
 *
 * Load-on-press, because history is provenance rather than a fact you
 * need on every visit — the request waits for the ask.
 *
 * Presentational: the caller owns both pieces of state and the query, so
 * one read can serve the preview and the dialog, and each service keeps
 * its own hook. Systems and apps both wear this.
 */
import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Tooltip,
  Typography,
} from '@mui/material';
import { OpenInFullRounded } from '@mui/icons-material';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import { InnerBox, MICRO_BTN_SX } from './cardKit';
import HistoryDialog from './HistoryDialog';
import { HistoryEntry, actorLine, opLabel, opTone } from './historyLedger';

/** how many events the half-column preview shows before deferring to expand */
export const HISTORY_PREVIEW = 5;

const HistoryBox: React.FC<{
  /** the app or system id — the dialog's title, and what this is about */
  subject: string;
  /** newest first; the caller's hook owns the fetching */
  items: HistoryEntry[];
  isLoading?: boolean;
  error?: Error | null;
  /** the preview is showing (the caller's query is enabled) */
  open: boolean;
  onToggleOpen: () => void;
  expanded: boolean;
  onExpand: () => void;
  onCloseExpanded: () => void;
  /** no ledger to ask for — a deleted object, say */
  disabled?: boolean;
  /** what to say instead, when disabled */
  disabledNote?: string;
  /** the resting line, before anything is loaded */
  restingNote?: string;
  /**
   * The third column of a preview row. Defaults to who did it, which is
   * the whole question on a system or an app; a job's events are all
   * written by the service itself, so that page passes the event's own
   * detail instead of "by someone" twenty times over.
   */
  asideOf?: (item: HistoryEntry) => string;
}> = ({
  subject,
  items,
  isLoading,
  error,
  open,
  onToggleOpen,
  expanded,
  onExpand,
  onCloseExpanded,
  disabled,
  disabledNote = 'not available right now',
  restingNote = 'Log of changes. Press load to fetch',
  asideOf = (item) => `by ${actorLine(item)}`,
}) => {
  const preview = items.slice(0, HISTORY_PREVIEW);
  const rest = items.length - preview.length;

  return (
    <>
      <InnerBox
        title="History"
        actions={
          <>
            <Button
              size="small"
              disabled={disabled}
              onClick={onToggleOpen}
              sx={{
                ...MICRO_BTN_SX,
                ...(open && {
                  color: 'primary.main',
                  borderColor: 'primary.main',
                }),
              }}
            >
              {open ? 'hide' : 'load'}
            </Button>
            <Tooltip
              title="The whole ledger: every operation with what it carried"
              arrow
              describeChild
            >
              {/* a span so the tooltip still has a host while disabled */}
              <span style={{ display: 'inline-flex' }}>
                <Button
                  size="small"
                  aria-label="Expand history"
                  disabled={disabled}
                  onClick={onExpand}
                  sx={{ ...MICRO_BTN_SX, gap: 0.4 }}
                >
                  <OpenInFullRounded sx={{ fontSize: 11 }} />
                  expand
                </Button>
              </span>
            </Tooltip>
          </>
        }
      >
        <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
          {disabled ? (
            <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>
              {disabledNote}
            </Typography>
          ) : !open ? (
            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
              {restingNote}
            </Typography>
          ) : isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CircularProgress size={11} />
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                asking the ledger…
              </Typography>
            </Box>
          ) : error ? (
            <ErrorDetail message={error.message} fontSize="0.68rem" />
          ) : items.length === 0 ? (
            <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>
              the ledger has no entries yet
            </Typography>
          ) : (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'max-content max-content minmax(0, 1fr)',
                  columnGap: 1,
                  rowGap: 0.4,
                  alignItems: 'baseline',
                  minWidth: 0,
                }}
              >
                {preview.map((item, i) => (
                  <React.Fragment key={`${item.created}-${i}`}>
                    <Typography
                      title={item.created}
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.66rem',
                        color: 'text.disabled',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {(item.created ?? '').slice(0, 10)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.64rem',
                        fontWeight: 700,
                        color: opTone(item.operation).color,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {opLabel(item.operation)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.68rem',
                        color: 'text.secondary',
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {asideOf(item)}
                    </Typography>
                  </React.Fragment>
                ))}
              </Box>
              {/* the preview is a preview, and says so rather than
                  pretending the ledger is five entries long */}
              <Typography
                sx={{ fontSize: '0.66rem', color: 'text.disabled', mt: 0.5 }}
              >
                {rest > 0
                  ? `newest ${HISTORY_PREVIEW} of ${items.length}. Expand for the rest, with what each carried`
                  : `all ${items.length}. Expand for what each carried`}
              </Typography>
            </>
          )}
        </Box>
      </InnerBox>

      <HistoryDialog
        subject={subject}
        items={items}
        isLoading={isLoading}
        error={error ?? null}
        open={expanded}
        onClose={onCloseExpanded}
      />
    </>
  );
};

export default HistoryBox;
