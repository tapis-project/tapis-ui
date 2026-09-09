/**
 * The JSON editor, second version, in the house's own presses.
 *
 * The first (tapisui-common's JSONEditor) sat a text "format" and outlined
 * info-blue action buttons over a dark CodeMirror, reported every parse
 * error in a pastel Alert, and let its action fire on text nobody had
 * touched. This one keeps one row above the text: what state the text is in
 * on the left; Format, Copy, Clear and Revert as the small outlined presses
 * the detail cards use; and the one press that does something, in the
 * launch blue, live only once the text parses AND says something different
 * from what it opened with.
 */
import React, { useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { EditorView } from '@codemirror/view';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { MICRO_BTN_SX, SECTION_BG } from 'app/_components/PageShell/cardKit';
import { ACTION_BTN_SX } from 'app/_components/PageShell/actionButton';

export type JsonEditorV2Props<T> = {
  /** what it opens with, and what Revert comes back to */
  value: T;
  /** the one press that does something with the text */
  applyLabel: string;
  /** a line on that press, for what it will do */
  applyHint?: string;
  onApply: (value: T) => void;
  /** a message when parsed JSON is the wrong shape; it is shown and not applied */
  validate?: (value: unknown) => string | undefined;
  /** shown while the text is empty, which Clear is for */
  placeholder?: string;
  /** the text scrolls inside this; the row above it stays put */
  maxHeight?: string;
};

type TextState = 'unchanged' | 'edited' | 'empty' | 'invalid' | 'rejected';

const STATE_LABEL: Record<TextState, string> = {
  unchanged: 'unchanged',
  edited: 'edited',
  empty: 'empty',
  invalid: 'not valid JSON',
  rejected: 'not accepted',
};

const STATE_COLOR: Record<TextState, string> = {
  unchanged: 'text.secondary',
  edited: '#1565c0',
  empty: 'text.secondary',
  invalid: '#b3261e',
  rejected: '#b3261e',
};

// Constant, so CodeMirror is not handed new extensions on every keystroke.
const EXTENSIONS = [json(), EditorView.lineWrapping];
const BASIC_SETUP = { highlightActiveLine: false };

const read = (text: string): { value?: unknown; error?: string } => {
  if (!text.trim()) {
    return {};
  }
  try {
    return { value: JSON.parse(text) };
  } catch (error) {
    return { error: (error as Error).message };
  }
};

const JsonEditorV2 = <T,>({
  value,
  applyLabel,
  applyHint,
  onApply,
  validate,
  placeholder = 'Paste JSON here',
  maxHeight = '60vh',
}: JsonEditorV2Props<T>): React.ReactElement => {
  const loaded = useMemo(() => JSON.stringify(value, null, 2), [value]);
  const [text, setText] = useState(loaded);
  const [copied, setCopied] = useState(false);
  const parsed = useMemo(() => read(text), [text]);
  const rejection = useMemo(
    () =>
      parsed.error === undefined && text.trim()
        ? validate?.(parsed.value)
        : undefined,
    [parsed, text, validate]
  );

  // Equal JSON is unchanged however it is laid out: formatting a job, or
  // pasting the same one back, is not an edit worth applying.
  const state: TextState = !text.trim()
    ? 'empty'
    : parsed.error !== undefined
    ? 'invalid'
    : rejection
    ? 'rejected'
    : JSON.stringify(parsed.value) === JSON.stringify(value)
    ? 'unchanged'
    : 'edited';
  const canApply = state === 'edited';
  const apply = () => {
    if (canApply) {
      onApply(parsed.value as T);
    }
  };

  return (
    <Box
      // ⌘↵ / Ctrl+Enter applies from inside the text
      onKeyDown={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          event.preventDefault();
          apply();
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          flexWrap: 'wrap',
          mb: 0.75,
        }}
      >
        <Typography
          aria-live="polite"
          sx={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: STATE_COLOR[state],
          }}
        >
          {STATE_LABEL[state]}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          disabled={state === 'empty' || state === 'invalid'}
          onClick={() => setText(JSON.stringify(parsed.value, null, 2))}
          sx={MICRO_BTN_SX}
        >
          Format
        </Button>
        <Button
          size="small"
          disabled={!text}
          onClick={() => {
            navigator.clipboard?.writeText(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          }}
          sx={{
            ...MICRO_BTN_SX,
            ...(copied && { color: '#1b7f3b', borderColor: '#1b7f3b55' }),
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
        {/* empties it for a paste; Revert is the way back */}
        <Button
          size="small"
          disabled={!text}
          onClick={() => setText('')}
          sx={MICRO_BTN_SX}
        >
          Clear
        </Button>
        {text !== loaded && (
          <Button
            size="small"
            onClick={() => setText(loaded)}
            sx={MICRO_BTN_SX}
          >
            Revert
          </Button>
        )}
        <Tooltip title={applyHint ?? ''} describeChild>
          {/* the span takes the hover: a disabled button cannot */}
          <span>
            <Button
              size="small"
              variant="contained"
              disabled={!canApply}
              onClick={apply}
              sx={{
                ...ACTION_BTN_SX,
                fontSize: '0.72rem',
                fontWeight: 600,
                py: 0.25,
                px: 1.25,
              }}
            >
              {applyLabel}
            </Button>
          </span>
        </Tooltip>
      </Box>

      {(state === 'invalid' || state === 'rejected') && (
        // what the parser said, in a line, not a pastel Alert over the text
        <Typography
          sx={{
            mb: 0.75,
            fontFamily: 'monospace',
            fontSize: '0.7rem',
            color: '#b3261e',
            wordBreak: 'break-word',
          }}
        >
          {parsed.error ?? rejection}
        </Typography>
      )}

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          fontSize: 12.5,
          '& .cm-editor': { bgcolor: SECTION_BG },
          '& .cm-editor.cm-focused': { outline: 'none' },
          '& .cm-gutters': {
            bgcolor: SECTION_BG,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <CodeMirror
          value={text}
          onChange={setText}
          extensions={EXTENSIONS}
          placeholder={placeholder}
          maxHeight={maxHeight}
          basicSetup={BASIC_SETUP}
        />
      </Box>
    </Box>
  );
};

export default JsonEditorV2;
