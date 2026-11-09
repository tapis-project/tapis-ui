/**
 * Read-only JSON view with syntax colours. One `<pre>` with one `<span>` per
 * coloured run, styled by CSS class. Tokens are memoised on the text.
 * Dark by default; `theme="light"` or the stored preference overrides it.
 */
import React, { useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { MICRO_BTN_SX } from './cardKit';
import { useCopiedFlag } from 'app/_components/copyToClipboard';
import { jsonBlobTheme } from './viewPrefs';
import { sliceBlob, tokenizeJson } from './jsonTokens';
import styles from './JsonBlob.module.scss';

const CLASS_OF: Record<string, string | undefined> = {
  key: styles.key,
  string: styles.string,
  number: styles.number,
  boolean: styles.boolean,
  null: styles.null,
  plain: undefined,
};

const JsonBlob: React.FC<{
  /** the text to draw, already stringified */
  text: string;
  /** how tall the blob is before it scrolls */
  height?: string | number;
  /** dark unless the caller says otherwise; the preference wins when unset */
  theme?: 'dark' | 'light';
  /** extra controls shown beside the built-in ones */
  tools?: React.ReactNode;
}> = ({ text, height = 360, theme, tools }) => {
  const [all, setAll] = useState(false);
  const [wrap, setWrap] = useState(false);
  const { copied, copy } = useCopiedFlag();
  const preference = jsonBlobTheme.use();
  const dark = (theme ?? preference) === 'dark';

  const { text: shown, held } = useMemo(
    () => sliceBlob(text, undefined, all),
    [text, all]
  );
  const tokens = useMemo(() => tokenizeJson(shown), [shown]);

  return (
    <Box sx={{ minWidth: 0 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          pb: 0.5,
          flexWrap: 'wrap',
        }}
      >
        {held > 0 && (
          <Typography sx={{ fontSize: '0.64rem', color: 'text.secondary' }}>
            showing the first {sliceBlob(text).text.split('\n').length} lines,{' '}
            {held} more
          </Typography>
        )}
        {held > 0 && (
          <Box
            component="button"
            type="button"
            onClick={() => setAll(true)}
            sx={{ ...MICRO_BTN_SX, cursor: 'pointer' }}
          >
            show all
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 4 }} />
        {tools}
        <Box
          component="button"
          type="button"
          aria-pressed={wrap}
          title="Wrap long lines instead of scrolling sideways"
          onClick={() => setWrap((was) => !was)}
          sx={{
            ...MICRO_BTN_SX,
            cursor: 'pointer',
            ...(wrap && { color: 'primary.main', borderColor: 'primary.main' }),
          }}
        >
          wrap
        </Box>
        <Box
          component="button"
          type="button"
          title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={() => jsonBlobTheme.set(dark ? 'light' : 'dark')}
          sx={{ ...MICRO_BTN_SX, cursor: 'pointer' }}
        >
          {dark ? 'light' : 'dark'}
        </Box>
        <Box
          component="button"
          type="button"
          onClick={() => copy(text)}
          sx={{
            ...MICRO_BTN_SX,
            cursor: 'pointer',
            ...(copied && { color: '#1b7f3b', borderColor: '#1b7f3b55' }),
          }}
        >
          {copied ? 'copied' : 'copy'}
        </Box>
      </Box>
      <Box
        component="pre"
        className={`${styles.blob} ${dark ? '' : styles.light} ${
          wrap ? styles.wrap : ''
        }`}
        sx={{ height, maxHeight: height }}
      >
        {tokens.map((token, at) => {
          const className = CLASS_OF[token.kind];
          return className ? (
            <span key={at} className={className}>
              {token.text}
            </span>
          ) : (
            token.text
          );
        })}
      </Box>
    </Box>
  );
};

export default JsonBlob;
