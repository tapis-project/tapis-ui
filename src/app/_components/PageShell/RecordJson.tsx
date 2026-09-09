/**
 * The record, exactly as the API returns it — as a readable tree instead of
 * a black slab.
 *
 * What this replaces: `JSONDisplay`, which paints a #1E1E1E block with 24px
 * of padding in the middle of a page of white cards, and hangs a reactstrap
 * checkbox labelled "Include Empty Parameters" above it. It is the only
 * dark surface in the app, the checkbox is the only reactstrap control left
 * on these pages, and neither says which record you are looking at.
 *
 * It also lives BELOW the top card on every page now, rather than inside it
 * on two pages and instead of it on a third. The record is a second
 * subject, so it gets a second card — and reading it never costs you the
 * page you were on.
 */
import React, { useMemo, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { KeyboardArrowDownRounded } from '@mui/icons-material';
import {
  MICRO_BTN_SX,
  SECTION_BG,
  LABEL_SX,
  QuietTip,
} from 'app/_components/PageShell/cardKit';

const KEY_COLOR = '#5f4bb5';
const TYPE_COLOR: Record<string, string> = {
  string: '#1b7f3b',
  number: '#1565c0',
  boolean: '#6a1b9a',
};

const MONO = {
  fontFamily: 'monospace',
  fontSize: '0.72rem',
  lineHeight: 1.6,
} as const;

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isBranch = (v: unknown) => isObj(v) || Array.isArray(v);

const entriesOf = (v: unknown): Array<[string, unknown]> =>
  Array.isArray(v)
    ? v.map((item, i) => [String(i), item])
    : Object.entries(v as Record<string, unknown>);

/**
 * A value nobody asked to see: empty strings, empty lists, empty objects,
 * and the nulls the services send for every field a record does not use.
 * A Tapis system record is well over half these, so hiding them by default
 * is the difference between a readable tree and a scroll.
 */
const isEmpty = (v: unknown): boolean => {
  if (v === null || v === undefined || v === '') return true;
  if (Array.isArray(v)) return v.length === 0;
  if (isObj(v)) return Object.keys(v).length === 0;
  return false;
};

/** drops the empties, recursively — a branch left empty by the prune goes too */
export const prune = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(prune).filter((v) => !isEmpty(v));
  if (isObj(value)) {
    const out: Record<string, unknown> = {};
    Object.entries(value).forEach(([k, v]) => {
      const kept = prune(v);
      if (!isEmpty(kept)) out[k] = kept;
    });
    return out;
  }
  return value;
};

/** Sets are not JSON; the SDK hands us a few and they must not render as {} */
const plain = (value: unknown): unknown => {
  if (value instanceof Set) return Array.from(value).map(plain);
  if (Array.isArray(value)) return value.map(plain);
  if (isObj(value)) {
    const out: Record<string, unknown> = {};
    Object.entries(value).forEach(([k, v]) => {
      out[k] = plain(v);
    });
    return out;
  }
  return value;
};

const Leaf: React.FC<{ value: unknown }> = ({ value }) => {
  if (value === null || value === undefined)
    return (
      <Box component="span" sx={{ ...MONO, color: 'text.disabled' }}>
        null
      </Box>
    );
  const type = typeof value;
  return (
    <Box
      component="span"
      sx={{
        ...MONO,
        color: TYPE_COLOR[type] ?? 'text.primary',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {type === 'string' ? `"${value}"` : String(value)}
    </Box>
  );
};

/**
 * One key and its value. A branch is a press: shut, it says what is inside
 * it so a closed row is still an answer ("4 items", "12 keys").
 */
const Node: React.FC<{ name: string; value: unknown; depth: number }> = ({
  name,
  value,
  depth,
}) => {
  const branch = isBranch(value);
  const rows = branch ? entriesOf(value) : [];
  // open the small and shallow: a record's own fields, not every nested
  // parameterSet three levels down
  const [open, setOpen] = useState(depth < 1 && rows.length <= 8);

  const summary = Array.isArray(value)
    ? `[ ${rows.length} ]`
    : `{ ${rows.length} }`;

  return (
    <Box sx={{ pl: depth ? 1.5 : 0 }}>
      <Box
        component={branch ? 'button' : 'div'}
        type={branch ? 'button' : undefined}
        onClick={branch ? () => setOpen((o) => !o) : undefined}
        aria-expanded={branch ? open : undefined}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 0.5,
          width: '100%',
          textAlign: 'left',
          border: 'none',
          background: 'none',
          p: 0,
          font: 'inherit',
          cursor: branch ? 'pointer' : 'default',
          borderRadius: '3px',
          ...(branch && { '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }),
        }}
      >
        <KeyboardArrowDownRounded
          sx={{
            fontSize: 14,
            mt: '2px',
            flexShrink: 0,
            color: 'text.disabled',
            visibility: branch ? 'visible' : 'hidden',
            transform: open ? 'none' : 'rotate(-90deg)',
            transition: 'transform 120ms',
          }}
        />
        <Box component="span" sx={{ ...MONO, color: KEY_COLOR, flexShrink: 0 }}>
          {name}
        </Box>
        {!branch && (
          <>
            <Box component="span" sx={{ ...MONO, color: 'text.disabled' }}>
              :
            </Box>
            <Leaf value={value} />
          </>
        )}
        {branch && !open && (
          <Box component="span" sx={{ ...MONO, color: 'text.disabled' }}>
            {summary}
          </Box>
        )}
      </Box>
      {branch && open && (
        <Box
          sx={{
            ml: '7px',
            pl: 1,
            borderLeft: '1px solid',
            borderColor: 'divider',
          }}
        >
          {rows.map(([k, v]) => (
            <Node key={k} name={k} value={v} depth={depth + 1} />
          ))}
        </Box>
      )}
    </Box>
  );
};

const RecordJson: React.FC<{
  /** what record this is — "System record", "Job definition" */
  title: string;
  json: unknown;
  /** the press that closes it, mirroring the head line's JSON toggle */
  onClose?: () => void;
}> = ({ title, json, onClose }) => {
  const [showEmpty, setShowEmpty] = useState(false);
  const [copied, setCopied] = useState(false);
  const shown = useMemo(() => {
    const cleaned = plain(json);
    return showEmpty ? cleaned : prune(cleaned);
  }, [json, showEmpty]);
  const text = useMemo(() => JSON.stringify(shown, null, 2), [shown]);
  const rows = isBranch(shown) ? entriesOf(shown) : [];

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        p: 1.25,
        minWidth: 0,
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
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography sx={{ ...LABEL_SX, pt: 0 }}>
          {rows.length} fields
        </Typography>
        <Box sx={{ flex: 1 }} />
        <QuietTip
          title={
            showEmpty
              ? 'Hide the fields this record leaves unset'
              : 'Show every field, including the ones left unset'
          }
        >
          <Button
            size="small"
            onClick={() => setShowEmpty((s) => !s)}
            sx={{
              ...MICRO_BTN_SX,
              ...(showEmpty
                ? { color: 'text.primary', bgcolor: 'rgba(0,0,0,0.05)' }
                : {}),
            }}
          >
            empty fields
          </Button>
        </QuietTip>
        <Button
          size="small"
          onClick={() => {
            navigator.clipboard?.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          sx={{
            ...MICRO_BTN_SX,
            ...(copied ? { color: '#1b7f3b', borderColor: '#1b7f3b55' } : {}),
          }}
        >
          {copied ? 'copied' : 'copy'}
        </Button>
        {onClose && (
          <Button size="small" onClick={onClose} sx={MICRO_BTN_SX}>
            close
          </Button>
        )}
      </Box>

      <Box
        sx={{
          bgcolor: SECTION_BG,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1,
          maxHeight: '60vh',
          overflow: 'auto',
          minWidth: 0,
        }}
      >
        {rows.length === 0 ? (
          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
            Nothing set on this record — press <b>empty fields</b> to see the
            ones it leaves unset.
          </Typography>
        ) : (
          rows.map(([k, v]) => <Node key={k} name={k} value={v} depth={0} />)
        )}
      </Box>
    </Box>
  );
};

export default RecordJson;
