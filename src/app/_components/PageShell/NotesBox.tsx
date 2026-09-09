/**
 * NotesBox — the system's free-form notes, said readably instead of as a
 * dark JSON slab. Top-level keys become fact rows: strings read as prose
 * with URLs live, scalars stay mono, flat arrays become chips, and nested
 * objects flatten one level to `key: value` lines. The exact JSON is one
 * press away (raw), and the whole thing can be copied — nothing the old
 * JSONDisplay offered is lost.
 *
 * Halfable: the box rides the card grid like Batch & queues. When the
 * content runs past half a card it folds at a fixed height under a fade,
 * with "show all" to unfold.
 */
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Box, Button, Chip, Tooltip, Typography } from '@mui/material';
import {
  CopyButton,
  InnerBox,
  LABEL_SX,
  MICRO_BTN_SX,
  SMALL_CHIP_SX,
} from './cardKit';

/** folded height — about half a typical card column */
const FOLDED_PX = 170;

/**
 * The inner card each section wears — paper inside the box's tint, the
 * same frame the job card puts round Execution and Archive. Tags and
 * notes are different material (a record's labels and a record's prose),
 * and a shared background made them read as one long list.
 */
const SLAB_SX = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  bgcolor: 'background.paper',
  px: 1,
  py: 0.75,
  minWidth: 0,
} as const;

const URL_RE = /(https?:\/\/[^\s<>"')\]]+)/g;

/** prose with its URLs live; trailing sentence punctuation stays prose */
export const linkify = (text: string): React.ReactNode[] =>
  text.split(URL_RE).map((part, i) => {
    // split() with a capture group returns matches at odd indices — the
    // global regex itself is stateful and unsafe to .test() per part
    if (!/^https?:\/\//.test(part)) return <span key={i}>{part}</span>;
    const trimmed = part.replace(/[.,;:]+$/, '');
    const rest = part.slice(trimmed.length);
    return (
      <React.Fragment key={i}>
        <a
          href={trimmed}
          target="_blank"
          rel="noopener noreferrer"
          style={{ wordBreak: 'break-all' }}
        >
          {trimmed}
        </a>
        {rest}
      </React.Fragment>
    );
  });

const isScalar = (v: unknown): v is string | number | boolean =>
  typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';

/** a nested value on one line: scalars as themselves, the rest as JSON */
export const inlineValue = (v: unknown): string =>
  isScalar(v) ? String(v) : JSON.stringify(v);

const PROSE_SX = {
  fontSize: '0.74rem',
  lineHeight: 1.5,
  minWidth: 0,
  overflowWrap: 'anywhere',
} as const;

const NESTED_MONO_SX = {
  fontFamily: 'monospace',
  fontSize: '0.7rem',
  lineHeight: 1.5,
  minWidth: 0,
  overflowWrap: 'anywhere',
} as const;

/** a value that deserves the whole row: dicts and structured arrays —
 *  beside a label they were squeezed to half a half-column */
export const isBlock = (v: unknown): boolean =>
  v != null &&
  typeof v === 'object' &&
  !(Array.isArray(v) && (v as unknown[]).every(isScalar));

/** a top-level key, small-caps, tooltipped when it ellipsizes */
const NoteLabel: React.FC<{ name: string }> = ({ name }) => (
  <Tooltip title={name} arrow enterDelay={600}>
    <Typography
      sx={{
        ...LABEL_SX,
        maxWidth: 140,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {name}
    </Typography>
  </Tooltip>
);

/** one top-level note value, rendered by shape */
/** one line, ellipsized, with the whole thing on hover — until `wrap` */
const ONE_LINE_SX = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
} as const;

const NoteValue: React.FC<{ value: unknown; wrap?: boolean }> = ({
  value,
  wrap,
}) => {
  if (value == null)
    return (
      <Typography sx={{ fontSize: '0.74rem', color: 'text.disabled' }}>
        —
      </Typography>
    );
  if (typeof value === 'string')
    return (
      <Typography
        title={wrap ? undefined : value}
        sx={{ ...PROSE_SX, ...(wrap ? {} : ONE_LINE_SX) }}
      >
        {linkify(value)}
      </Typography>
    );
  if (isScalar(value))
    return (
      <Typography
        title={wrap ? undefined : String(value)}
        sx={{
          ...NESTED_MONO_SX,
          fontSize: '0.72rem',
          ...(wrap ? {} : ONE_LINE_SX),
        }}
      >
        {String(value)}
      </Typography>
    );
  if (Array.isArray(value) && value.every(isScalar))
    return (
      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          minWidth: 0,
          ...(wrap
            ? { flexWrap: 'wrap' }
            : { flexWrap: 'nowrap', overflow: 'hidden' }),
        }}
      >
        {value.map((item, i) => (
          <Chip
            key={`${item}-${i}`}
            size="small"
            label={String(item)}
            sx={SMALL_CHIP_SX}
          />
        ))}
      </Box>
    );
  if (!Array.isArray(value) && typeof value === 'object')
    // a real two-column grid, not inline "k: v" lines — sub-keys align,
    // and so do their values
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'max-content minmax(0, 1fr)',
          columnGap: 1,
          rowGap: 0.25,
          alignItems: 'start',
          minWidth: 0,
        }}
      >
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <React.Fragment key={k}>
            <Typography sx={{ ...NESTED_MONO_SX, color: 'text.secondary' }}>
              {k}:
            </Typography>
            <Typography sx={NESTED_MONO_SX}>
              {typeof v === 'string' ? linkify(v) : inlineValue(v)}
            </Typography>
          </React.Fragment>
        ))}
      </Box>
    );
  // arrays with structure inside — honest pretty JSON, but light-themed
  return (
    <Typography component="pre" sx={{ ...NESTED_MONO_SX, m: 0 }}>
      {JSON.stringify(value, null, 1)}
    </Typography>
  );
};

const NotesBox: React.FC<{
  notes?: object;
  /** the record's own tags — its labels, in the box that holds its prose */
  tags?: string[];
}> = ({ notes = {}, tags = [] }) => {
  const [raw, setRaw] = useState(false);
  // long values and links stay on one line until asked. A notes blob is
  // usually four short facts and one URL the length of a paragraph, and
  // that one value was setting the height of the whole box.
  const [wrap, setWrap] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const entries = Object.entries(notes as Record<string, unknown>);
  const hasNotes = entries.length > 0;
  const rawText = JSON.stringify(notes, null, 2);

  // does the content actually run past the fold? asked of the DOM, so the
  // toggle only exists when it would do something
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (el) setOverflows(el.scrollHeight > FOLDED_PX + 12);
  }, [raw, wrap, notes]);

  const folded = overflows && !expanded;

  return (
    <InnerBox
      title="Tags and Notes"
      actions={
        hasNotes ? (
          <>
            <Tooltip
              title={
                wrap
                  ? 'Back to one line each'
                  : 'Let long values and links wrap onto as many lines as they need'
              }
            >
              <Button
                size="small"
                aria-label={wrap ? 'Collapse values' : 'Expand values'}
                onClick={() => setWrap((w) => !w)}
                sx={{
                  ...MICRO_BTN_SX,
                  px: 0.5,
                  fontSize: '0.8rem',
                  lineHeight: 1.4,
                  ...(wrap && {
                    color: 'primary.main',
                    borderColor: 'primary.main',
                  }),
                }}
              >
                {wrap ? '⇱' : '⇲'}
              </Button>
            </Tooltip>
            <Button
              size="small"
              onClick={() => setRaw((r) => !r)}
              sx={{
                ...MICRO_BTN_SX,
                ...(raw && {
                  color: 'primary.main',
                  borderColor: 'primary.main',
                }),
              }}
            >
              {'{ } raw'}
            </Button>
            <CopyButton value={rawText} label="notes JSON" />
          </>
        ) : undefined
      }
    >
      <Box sx={{ gridColumn: '1 / -1', minWidth: 0, position: 'relative' }}>
        {/* tags first, and called `tags` — it is the record's own field
            name, and these pages are read next to the JSON. They rode the
            head line between the description and the uuid, where eight of
            them pushed the id off the fold. */}
        {tags.length > 0 && (
          <Box sx={{ mb: hasNotes ? 1 : 0 }}>
            <Typography sx={{ ...LABEL_SX, pt: 0, mb: 0.5 }}>tags</Typography>
            <Box
              sx={{ ...SLAB_SX, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}
            >
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  size="small"
                  label={tag}
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    borderRadius: '4px',
                    bgcolor: 'rgba(0,0,0,0.05)',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
        {hasNotes && (
          <Typography sx={{ ...LABEL_SX, pt: 0, mb: 0.5 }}>notes</Typography>
        )}
        <Box sx={hasNotes ? { ...SLAB_SX, position: 'relative' } : undefined}>
          <Box
            ref={bodyRef}
            sx={{
              maxHeight: folded ? `${FOLDED_PX}px` : 'none',
              overflow: 'hidden',
            }}
          >
            {raw ? (
              <Typography component="pre" sx={{ ...NESTED_MONO_SX, m: 0 }}>
                {rawText}
              </Typography>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'max-content minmax(0, 1fr)',
                  columnGap: 1.25,
                  rowGap: 0.5,
                  // the label is 0.62rem, the value 0.74 — top-aligned they
                  // sat at visibly different heights; text aligns on its
                  // baseline, not its box
                  alignItems: 'baseline',
                }}
              >
                {entries.map(([key, value]) =>
                  isBlock(value) ? (
                    // structured values were squeezed into the half beside
                    // the label — they get the whole row, label above
                    <Box key={key} sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
                      <NoteLabel name={key} />
                      <Box
                        sx={{
                          mt: 0.25,
                          pl: 1,
                          borderLeft: '2px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <NoteValue value={value} wrap={wrap} />
                      </Box>
                    </Box>
                  ) : (
                    <Box key={key} sx={{ display: 'contents' }}>
                      <NoteLabel name={key} />
                      <NoteValue value={value} wrap={wrap} />
                    </Box>
                  )
                )}
              </Box>
            )}
          </Box>
          {folded && (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 36,
                pointerEvents: 'none',
                background: (theme) =>
                  `linear-gradient(to bottom, rgba(255,255,255,0), ${theme.palette.background.paper})`,
              }}
            />
          )}
          {overflows && (
            <Button
              size="small"
              onClick={() => setExpanded((e) => !e)}
              sx={{ ...MICRO_BTN_SX, mt: 0.5 }}
            >
              {expanded ? 'show less' : 'show all'}
            </Button>
          )}
        </Box>
      </Box>
    </InnerBox>
  );
};

export default NotesBox;
