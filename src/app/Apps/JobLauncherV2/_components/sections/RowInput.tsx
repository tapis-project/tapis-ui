import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A row cell that keeps its own value while you type and pushes into formik on
 * a short debounce (or on blur).
 *
 * Formik's state lives above every field, and `useField` subscribes through
 * context — so with one controlled input per cell, a single keystroke in one
 * argument re-rendered all thirteen rows, three inputs each. Holding the
 * keystroke locally means typing costs one small component, and formik hears
 * about it once the burst stops.
 *
 * A plain <input> on purpose: an MUI TextField is a nest of styled components,
 * and there are ~40 of these on screen. The focus ring is one emotion rule on
 * the container instead of per-cell styling.
 */
export const ROW_INPUT_SX = {
  '& input.row-input': {
    fontSize: 12,
    padding: '4px 6px',
    fontFamily: 'monospace',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '4px',
    background: 'transparent',
    color: 'inherit',
    outline: 'none',
    minWidth: 0,
    width: '100%',
  },
  '& input.row-input:focus': { borderColor: 'primary.main' },
  '& input.row-input:disabled': { color: 'text.disabled' },
  // 'quiet' cells read as text until you go near them — used for the
  // description line, which is reference material nine times out of ten.
  '& input.row-input-quiet': {
    border: '1px solid transparent',
    borderRadius: '4px',
    background: 'transparent',
    color: 'inherit',
    outline: 'none',
    fontSize: 11,
    padding: '2px 6px',
    width: '100%',
    minWidth: 0,
  },
  '& input.row-input-quiet::placeholder': { fontStyle: 'italic' },
  '& input.row-input-quiet:hover': { borderColor: 'divider' },
  '& input.row-input-quiet:focus': { borderColor: 'primary.main' },
};

const COMMIT_DELAY_MS = 200;

const RowInput: React.FC<{
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  /** 'quiet' drops the box until hover/focus */
  variant?: 'box' | 'quiet';
  'aria-label'?: string;
}> = ({ value, onCommit, placeholder, disabled, style, variant, ...rest }) => {
  const [local, setLocal] = useState(value);
  const timer = useRef<number | undefined>(undefined);
  // what still owes formik a write, readable from the unmount cleanup
  const pending = useRef<string | undefined>(undefined);

  // Accept upstream edits (a reset, a value written by another control) only
  // while this cell is not mid-burst, or it would fight the typist.
  useEffect(() => {
    if (pending.current === undefined) {
      setLocal(value);
    }
  }, [value]);

  const commit = useCallback(
    (next: string) => {
      pending.current = undefined;
      onCommit(next);
    },
    [onCommit]
  );

  // Switching sections within the debounce window must not drop the keystroke
  const commitRef = useRef(commit);
  commitRef.current = commit;
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      if (pending.current !== undefined) {
        commitRef.current(pending.current);
      }
    },
    []
  );

  return (
    <input
      className={variant === 'quiet' ? 'row-input-quiet' : 'row-input'}
      value={local}
      placeholder={placeholder}
      disabled={disabled}
      style={style}
      {...rest}
      onChange={(event) => {
        const next = event.target.value;
        setLocal(next);
        pending.current = next;
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => commit(next), COMMIT_DELAY_MS);
      }}
      onBlur={() => {
        window.clearTimeout(timer.current);
        if (pending.current !== undefined) {
          commit(pending.current);
        }
      }}
    />
  );
};

export default RowInput;
