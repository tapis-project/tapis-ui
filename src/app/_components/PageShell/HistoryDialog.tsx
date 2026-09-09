/**
 * A service's change ledger, whole — every operation it recorded, with
 * everything it recorded about it: the exact stamp, who acted and on
 * whose behalf, which tenants, and the JSON the operation carried.
 *
 * Shared: systems and apps keep the same ledger record, so they get the
 * same window. An entry that names a version (apps do) wears it.
 *
 * A timeline rather than a table. The ledger is a sequence of events by
 * different people at irregular intervals, and a table of seven columns
 * (most of them repeating the same tenant) buries that; a dated rail with
 * one dot per event says "this happened, then this" at a glance, and the
 * per-entry detail can be as wide as it needs to be.
 */
import React, { useMemo, useState } from 'react';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Tooltip,
  Typography,
} from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import { timeAgo } from 'app/_components/NavV2Kit/navKit';
import { MICRO_BTN_SX } from './cardKit';
import {
  HistoryEntry,
  actorLine,
  countByOperation,
  groupByDay,
  opLabel,
  opTone,
  parseDescription,
  tenantLine,
  timeOf,
} from './historyLedger';

/** the operation, worn as its family's colour */
const OpChip: React.FC<{ operation?: string }> = ({ operation }) => {
  const tone = opTone(operation);
  return (
    <Box
      component="span"
      sx={{
        px: 0.6,
        py: '1px',
        borderRadius: '4px',
        bgcolor: tone.bg,
        color: tone.color,
        fontSize: '0.66rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {opLabel(operation)}
    </Box>
  );
};

/** what the operation carried: the service's JSON as rows, prose as prose.
 *  `unknown` because the live service sends an object where the spec
 *  promises a string — parseDescription takes either. */
const Payload: React.FC<{ description?: unknown }> = ({ description }) => {
  const parsed = parseDescription(description);
  if (!parsed) return null;
  return (
    <Box
      sx={{
        mt: 0.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '4px',
        bgcolor: 'rgba(0,0,0,0.015)',
        px: 0.75,
        py: 0.5,
        minWidth: 0,
      }}
    >
      {parsed.kind === 'text' ? (
        <Typography
          sx={{
            fontSize: '0.7rem',
            color: 'text.secondary',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
          }}
        >
          {parsed.text}
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'max-content minmax(0, 1fr)',
            columnGap: 1.25,
            rowGap: 0.25,
            alignItems: 'baseline',
          }}
        >
          {parsed.fields.map((field) => (
            <React.Fragment key={field.key}>
              <Typography
                sx={{
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                }}
              >
                {field.key}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.68rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                  minWidth: 0,
                }}
              >
                {field.value}
              </Typography>
            </React.Fragment>
          ))}
        </Box>
      )}
    </Box>
  );
};

const HistoryDialog: React.FC<{
  /** what the ledger is about — the app or system id, shown in the title */
  subject: string;
  items: HistoryEntry[];
  isLoading?: boolean;
  error?: Error | null;
  open: boolean;
  onClose: () => void;
}> = ({ subject, items, isLoading, error, open, onClose }) => {
  // which operation the timeline is narrowed to; null is everything
  const [only, setOnly] = useState<string | null>(null);
  const counts = useMemo(() => countByOperation(items), [items]);
  const shown = useMemo(
    () => (only ? items.filter((item) => item.operation === only) : items),
    [items, only]
  );
  const days = useMemo(() => groupByDay(shown), [shown]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          History
          <Box
            component="span"
            sx={{ fontFamily: 'monospace', fontSize: '0.8rem', ml: 0.75 }}
          >
            {subject}
          </Box>
        </Box>
        <Typography
          sx={{ fontSize: '0.72rem', color: 'text.secondary', ml: 'auto' }}
        >
          {items.length} {items.length === 1 ? 'entry' : 'entries'}
        </Typography>
        <Box
          component="button"
          type="button"
          aria-label="Close"
          onClick={onClose}
          sx={{
            border: 'none',
            background: 'none',
            p: 0.25,
            lineHeight: 0,
            cursor: 'pointer',
            color: 'text.secondary',
            borderRadius: '4px',
            '& svg': { fontSize: 18, display: 'block' },
            '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' },
          }}
        >
          <CloseRounded />
        </Box>
      </DialogTitle>

      {/* the operations actually present, as filters — a vocabulary of 14
          is not worth a legend, but the four that happened to this system
          are worth being able to isolate */}
      {counts.length > 1 && (
        <Box
          sx={{
            px: 3,
            pb: 1,
            display: 'flex',
            gap: 0.5,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Box
            component="button"
            type="button"
            aria-pressed={only === null}
            onClick={() => setOnly(null)}
            sx={{
              ...MICRO_BTN_SX,
              cursor: 'pointer',
              ...(only === null && {
                color: 'primary.main',
                borderColor: 'primary.main',
              }),
            }}
          >
            all {items.length}
          </Box>
          {counts.map(({ operation, n }) => {
            const tone = opTone(operation);
            const active = only === operation;
            return (
              <Box
                key={operation}
                component="button"
                type="button"
                aria-pressed={active}
                onClick={() => setOnly(active ? null : operation)}
                sx={{
                  ...MICRO_BTN_SX,
                  cursor: 'pointer',
                  color: tone.color,
                  ...(active && { bgcolor: tone.bg, borderColor: tone.color }),
                }}
              >
                {opLabel(operation)} {n}
              </Box>
            );
          })}
        </Box>
      )}

      <DialogContent dividers sx={{ px: 3, py: 1.5 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
            <CircularProgress size={14} />
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
              asking the ledger…
            </Typography>
          </Box>
        ) : error ? (
          <ErrorDetail message={error.message} fontSize="0.72rem" />
        ) : days.length === 0 ? (
          <Typography sx={{ fontSize: '0.78rem', color: 'text.disabled' }}>
            {items.length === 0
              ? 'The ledger has no entries yet.'
              : 'No entries of that operation.'}
          </Typography>
        ) : (
          days.map((group) => (
            <Box key={group.day} sx={{ mb: 2 }}>
              {/* the day, held at the top while its entries scroll under */}
              <Box
                sx={{
                  position: 'sticky',
                  top: -12,
                  zIndex: 1,
                  bgcolor: 'background.paper',
                  py: 0.5,
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {group.day}
                </Typography>
                <Typography
                  sx={{ fontSize: '0.66rem', color: 'text.disabled' }}
                >
                  {timeAgo(group.items[0]?.created)} ·{' '}
                  {group.items.length === 1
                    ? '1 entry'
                    : `${group.items.length} entries`}
                </Typography>
              </Box>

              {group.items.map((entry, at) => {
                const tone = opTone(entry.operation);
                const tenants = tenantLine(entry);
                const last = at === group.items.length - 1;
                return (
                  <Box
                    key={`${entry.created}-${at}`}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'max-content 14px minmax(0, 1fr)',
                      columnGap: 1,
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.66rem',
                        fontFamily: 'monospace',
                        color: 'text.disabled',
                        pt: '3px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {timeOf(entry)}
                    </Typography>
                    {/* the rail: a dot for this event, a line to the next */}
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          bgcolor: tone.color,
                          mt: '6px',
                          flexShrink: 0,
                          zIndex: 1,
                        }}
                      />
                      {!last && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '10px',
                            bottom: 0,
                            width: '1px',
                            bgcolor: 'divider',
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ minWidth: 0, pb: last ? 0.5 : 1.25 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                          flexWrap: 'wrap',
                        }}
                      >
                        <OpChip operation={entry.operation} />
                        <Typography sx={{ fontSize: '0.74rem' }}>
                          {actorLine(entry)}
                        </Typography>
                        {entry.appVersion && (
                          <Tooltip
                            title="The version this operation touched"
                            arrow
                          >
                            <Box
                              component="span"
                              sx={{
                                px: 0.5,
                                py: '1px',
                                borderRadius: '4px',
                                border: '1px solid',
                                borderColor: 'divider',
                                fontFamily: 'monospace',
                                fontSize: '0.62rem',
                                color: 'text.secondary',
                              }}
                            >
                              v{entry.appVersion}
                            </Box>
                          </Tooltip>
                        )}
                        {tenants && (
                          <Tooltip
                            title="The tenant the request was signed in, and the tenant it acted for"
                            arrow
                          >
                            <Typography
                              sx={{
                                fontSize: '0.64rem',
                                color: 'text.disabled',
                                fontFamily: 'monospace',
                              }}
                            >
                              {tenants}
                            </Typography>
                          </Tooltip>
                        )}
                      </Box>
                      <Payload description={entry.description} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ))
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HistoryDialog;
