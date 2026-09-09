import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The one clipboard write used by every copy affordance (CodeSnippet corners,
 * table copy buttons, chat message actions, board snapshots) — async
 * clipboard API with a document.execCommand fallback for old or
 * permission-blocked contexts, so every copy button gets the fallback.
 */
export const copyTextToClipboard = async (text: string): Promise<void> => {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  if (typeof document === 'undefined') return;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

/**
 * Copied-flag pattern behind copy buttons: `copy(text)` writes the clipboard
 * and flips `copied` true for `ms` (glyph → check), with timer cleanup on
 * unmount and on rapid re-copies.
 */
export const useCopiedFlag = (
  ms = 1200
): { copied: boolean; copy: (text: string) => void } => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  const copy = useCallback(
    (text: string) => {
      void copyTextToClipboard(text)
        .then(() => {
          setCopied(true);
          if (timer.current) window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setCopied(false), ms);
        })
        .catch(() => {
          // clipboard blocked — leave the glyph as-is
        });
    },
    [ms]
  );
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );
  return { copied, copy };
};
