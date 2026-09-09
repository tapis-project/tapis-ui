import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Async clipboard API, with a document.execCommand fallback for old or
 * permission-blocked contexts. Rejects if neither wrote the text.
 */
export const copyTextToClipboard = async (text: string): Promise<void> => {
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // blocked by permissions: fall through to execCommand
    }
  }
  if (typeof document === 'undefined') return;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!copied) throw new Error('Copy failed');
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
