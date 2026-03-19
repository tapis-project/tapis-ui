import React, { useMemo, useCallback, useRef } from 'react';
import { Box, Typography, Chip, Alert, AlertTitle } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDarkInit } from '@uiw/codemirror-theme-vscode';
import { EditorView } from '@codemirror/view';
import { DiffResult, buildChangeSummary } from './computeDiff';

interface DiffViewProps {
  diff: DiffResult;
  editedValues: Record<string, any>;
  originalValues: Record<string, any>;
}

const cmTheme = vscodeDarkInit({
  settings: { caret: '#c6c6c6', fontFamily: 'monospace' },
});
const cmStyle = {
  width: '100%',
  height: '100%',
  fontSize: 12,
  fontFamily:
    'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
};

const typeColors = {
  added: {
    border: '#2e7d32',
    text: '#66bb6a',
    label: 'ADDED',
  },
  removed: {
    border: '#c62828',
    text: '#ef5350',
    label: 'REMOVED',
  },
  modified: {
    border: '#1565c0',
    text: '#42a5f5',
    label: 'MODIFIED',
  },
};

/**
 * Given two JSON strings, compute which 1-indexed line numbers differ.
 */
function computeLineDiffs(
  leftStr: string,
  rightStr: string
): { leftLines: Set<number>; rightLines: Set<number> } {
  const leftArr = leftStr.split('\n');
  const rightArr = rightStr.split('\n');
  const maxLen = Math.max(leftArr.length, rightArr.length);
  const leftLines = new Set<number>();
  const rightLines = new Set<number>();

  for (let i = 0; i < maxLen; i++) {
    const l = leftArr[i] ?? '';
    const r = rightArr[i] ?? '';
    if (l !== r) {
      if (i < leftArr.length) leftLines.add(i + 1);
      if (i < rightArr.length) rightLines.add(i + 1);
    }
  }
  return { leftLines, rightLines };
}

/**
 * Apply background highlighting to specific .cm-line DOM elements
 * after CodeMirror mounts. Works without @codemirror/state imports.
 */
function highlightLines(
  view: EditorView,
  lineNums: Set<number>,
  color: string
) {
  const cmLines = view.dom.querySelectorAll('.cm-line');
  cmLines.forEach((el, idx) => {
    if (lineNums.has(idx + 1)) {
      (el as HTMLElement).style.backgroundColor = color;
    }
  });
}

const cmExts = [json(), EditorView.lineWrapping];

const DiffView: React.FC<DiffViewProps> = ({
  diff,
  editedValues,
  originalValues,
}) => {
  const summary = buildChangeSummary(diff);

  const newJson = useMemo(
    () => JSON.stringify(editedValues, null, 2),
    [editedValues]
  );
  const origJson = useMemo(
    () => JSON.stringify(originalValues, null, 2),
    [originalValues]
  );

  const { leftLines, rightLines } = useMemo(
    () => computeLineDiffs(newJson, origJson),
    [newJson, origJson]
  );

  // Refs to track latest line sets (stable callbacks read from refs)
  const leftLinesRef = useRef(leftLines);
  leftLinesRef.current = leftLines;
  const rightLinesRef = useRef(rightLines);
  rightLinesRef.current = rightLines;

  const onCreateLeft = useCallback((view: EditorView) => {
    // Defer to next frame so CodeMirror has rendered all lines
    requestAnimationFrame(() =>
      highlightLines(view, leftLinesRef.current, 'rgba(46, 125, 50, 0.18)')
    );
  }, []);

  const onCreateRight = useCallback((view: EditorView) => {
    requestAnimationFrame(() =>
      highlightLines(view, rightLinesRef.current, 'rgba(198, 40, 40, 0.18)')
    );
  }, []);

  if (!diff.hasChanges) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info" variant="outlined">
          <AlertTitle>No Changes</AlertTitle>
          Edit values on the left to see what will change here.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Change summary bar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          px: 1,
          py: 0.5,
          borderBottom: '1px solid rgba(112,112,112,0.25)',
          alignItems: 'center',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
          {summary.length} change(s):
        </Typography>
        {summary.map(({ field, type }) => (
          <Chip
            key={field}
            label={`${field}`}
            size="small"
            sx={{
              backgroundColor: typeColors[type].border,
              color: '#fff',
              fontSize: '0.65rem',
              height: 20,
            }}
          />
        ))}
      </Box>

      {/* Side-by-side editors */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexGrow: 1,
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Left: new (edited) values — green highlights */}
        <Box
          sx={{
            width: '50%',
            overflow: 'auto',
            borderRight: '1px solid rgba(112,112,112,0.25)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.25,
              display: 'block',
              color: '#66bb6a',
              borderBottom: '1px solid rgba(112,112,112,0.15)',
            }}
          >
            Edited (new)
          </Typography>
          <CodeMirror
            key={newJson}
            value={newJson}
            editable={false}
            readOnly={true}
            extensions={cmExts}
            height="100%"
            theme={cmTheme}
            style={cmStyle}
            onCreateEditor={onCreateLeft}
          />
        </Box>

        {/* Right: original (server) values — red highlights */}
        <Box
          sx={{
            width: '50%',
            overflow: 'auto',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.25,
              display: 'block',
              color: '#ef5350',
              borderBottom: '1px solid rgba(112,112,112,0.15)',
            }}
          >
            Current (server)
          </Typography>
          <CodeMirror
            key={origJson}
            value={origJson}
            editable={false}
            readOnly={true}
            extensions={cmExts}
            height="100%"
            theme={cmTheme}
            style={cmStyle}
            onCreateEditor={onCreateRight}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DiffView;
