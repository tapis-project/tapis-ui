import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Stack,
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
  Badge,
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  CheckCircleOutline as SuccessIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDarkInit } from '@uiw/codemirror-theme-vscode';
import { EditorView, ViewPlugin, Decoration } from '@codemirror/view';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { computeDiff, pruneForSubmission, DiffResult } from './computeDiff';
import { updateState } from '@redux';

export type ResourceEditorMode = 'edit' | 'create';

export interface ResourceEditorProps {
  currentValues: Record<string, any>;
  formContent: (formik: any) => React.ReactNode;
  validationSchema: Yup.ObjectSchema<any>;
  onSubmit: (
    prunedValues: Record<string, any>,
    fullValues: Record<string, any>,
    diff: DiffResult
  ) => void;
  readOnlyFields?: string[];
  isLoading?: boolean;
  error?: Error | null;
  isSuccess?: boolean;
  reset?: () => void;
  successMessage?: string;
  submitLabel?: string;
  mode?: ResourceEditorMode;
  reduxDraftKey?: string;
  dispatch?: any;
  existingDraft?: Record<string, any>;
}

type LeftTab = 'form' | 'json';

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

/**
 * Compute which 1-indexed line numbers differ between two strings.
 * Normalizes valid JSON before comparing so that whitespace / formatting
 * changes alone never produce false-positive highlights.
 */
function computeLineDiffs(
  leftStr: string,
  rightStr: string
): { leftLines: Set<number>; rightLines: Set<number> } {
  let normLeft = leftStr;
  let normRight = rightStr;
  try {
    normLeft = JSON.stringify(JSON.parse(leftStr), null, 2);
  } catch {
    /* not valid JSON — use raw text */
  }
  try {
    normRight = JSON.stringify(JSON.parse(rightStr), null, 2);
  } catch {
    /* not valid JSON — use raw text */
  }
  const leftArr = normLeft.split('\n');
  const rightArr = normRight.split('\n');
  const maxLen = Math.max(leftArr.length, rightArr.length);
  const leftLines = new Set<number>();
  const rightLines = new Set<number>();
  for (let i = 0; i < maxLen; i++) {
    if ((leftArr[i] ?? '') !== (rightArr[i] ?? '')) {
      if (i < leftArr.length) leftLines.add(i + 1);
      if (i < rightArr.length) rightLines.add(i + 1);
    }
  }
  return { leftLines, rightLines };
}

/**
 * CodeMirror ViewPlugin that highlights lines differing from a comparison string.
 * `getComparisonStr` returns the other side's text; `side` picks which
 * set of changed lines to highlight.
 */
function makeDiffHighlightPlugin(
  getComparisonStr: () => string,
  bgColor: string,
  side: 'left' | 'right'
) {
  const mark = Decoration.line({
    attributes: { style: `background-color: ${bgColor}` },
  });
  return ViewPlugin.fromClass(
    class {
      decorations: any;
      constructor(view: EditorView) {
        this.decorations = this.build(view);
      }
      update(u: any) {
        this.decorations = this.build(u.view);
      }
      build(view: EditorView) {
        const doc = view.state.doc;
        const thisStr = doc.toString();
        const otherStr = getComparisonStr();
        const { leftLines, rightLines } = computeLineDiffs(
          side === 'left' ? thisStr : otherStr,
          side === 'left' ? otherStr : thisStr
        );
        const lines = side === 'left' ? leftLines : rightLines;
        const ranges: any[] = [];
        for (let i = 1; i <= doc.lines; i++) {
          if (lines.has(i)) {
            ranges.push(mark.range(doc.line(i).from));
          }
        }
        return Decoration.set(ranges);
      }
    },
    { decorations: (v: any) => v.decorations }
  );
}

const ResourceEditor: React.FC<ResourceEditorProps> = ({
  currentValues,
  formContent,
  validationSchema,
  onSubmit,
  readOnlyFields = [],
  isLoading = false,
  error = null,
  isSuccess = false,
  reset,
  successMessage = 'Success',
  submitLabel = 'Submit',
  mode = 'edit',
  reduxDraftKey,
  dispatch,
  existingDraft,
}) => {
  const [leftTab, setLeftTab] = useState<LeftTab>('form');
  const [jsonError, setJsonError] = useState<string | undefined>(undefined);
  const [errorsOpen, setErrorsOpen] = useState(false);

  // --- initial values ---
  const initialValues = useMemo(() => {
    if (
      mode === 'create' &&
      existingDraft &&
      typeof existingDraft === 'object' &&
      Object.keys(existingDraft).length > 0
    ) {
      return { ...existingDraft };
    }
    return { ...currentValues };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      if (mode === 'edit') {
        const diff = computeDiff(currentValues, values);
        onSubmit(diff.patch, values, diff);
      } else {
        const pruned = pruneForSubmission(values, readOnlyFields);
        const diff = computeDiff(currentValues, pruned);
        onSubmit(pruned, values, diff);
      }
      setSubmitting(false);
    },
    enableReinitialize: false,
  });

  // --- diff ---
  const diff = useMemo(
    () => computeDiff(currentValues, formik.values),
    [formik.values, currentValues]
  );

  // --- JSON editor state ---
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(formik.values, null, 2)
  );

  // Sync jsonText when switching TO json tab
  useEffect(() => {
    if (leftTab === 'json') {
      setJsonText(JSON.stringify(formik.values, null, 2));
      setJsonError(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftTab]);

  // Sync formik values when switching FROM json tab
  const prevTab = useRef(leftTab);
  useEffect(() => {
    if (prevTab.current === 'json' && leftTab !== 'json' && !jsonError) {
      try {
        formik.setValues(JSON.parse(jsonText));
      } catch {
        /* keep previous */
      }
    }
    prevTab.current = leftTab;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftTab]);

  // --- diff highlighting in JSON tab ---
  const origJsonStr = useMemo(
    () => JSON.stringify(currentValues, null, 2),
    [currentValues]
  );
  const jsonTextRef = useRef(jsonText);
  jsonTextRef.current = jsonText;
  const rightViewRef = useRef<EditorView | null>(null);
  const formRightViewRef = useRef<EditorView | null>(null);

  // Current formik values as JSON for form-tab right pane comparison
  const formikJsonStr = useMemo(
    () => JSON.stringify(formik.values, null, 2),
    [formik.values]
  );
  const formikJsonRef = useRef(formikJsonStr);
  formikJsonRef.current = formikJsonStr;

  const leftHighlightExt = useMemo(
    () =>
      makeDiffHighlightPlugin(
        () => origJsonStr,
        'rgba(46, 125, 50, 0.25)',
        'left'
      ),
    [origJsonStr]
  );
  const rightHighlightExt = useMemo(
    () =>
      makeDiffHighlightPlugin(
        () => jsonTextRef.current,
        'rgba(198, 40, 40, 0.25)',
        'right'
      ),
    []
  );
  const formRightHighlightExt = useMemo(
    () =>
      makeDiffHighlightPlugin(
        () => formikJsonRef.current,
        'rgba(198, 40, 40, 0.25)',
        'right'
      ),
    []
  );
  const leftJsonExts = useMemo(
    () => [json(), EditorView.lineWrapping, leftHighlightExt],
    [leftHighlightExt]
  );
  const rightJsonExts = useMemo(
    () => [json(), EditorView.lineWrapping, rightHighlightExt],
    [rightHighlightExt]
  );
  const formRightExts = useMemo(
    () => [json(), EditorView.lineWrapping, formRightHighlightExt],
    [formRightHighlightExt]
  );

  // Trigger right editor to rebuild diff highlights when JSON or form values change
  useEffect(() => {
    if (leftTab === 'json' && rightViewRef.current) {
      requestAnimationFrame(() => rightViewRef.current?.dispatch({}));
    }
    if (leftTab === 'form' && formRightViewRef.current) {
      requestAnimationFrame(() => formRightViewRef.current?.dispatch({}));
    }
  }, [jsonText, leftTab, formikJsonStr]);

  // --- Redux draft persistence ---
  const formikValuesRef = useRef(formik.values);
  formikValuesRef.current = formik.values;
  useEffect(() => {
    return () => {
      if (reduxDraftKey && dispatch) {
        dispatch(updateState({ [reduxDraftKey]: formikValuesRef.current }));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxDraftKey, dispatch]);

  // --- handlers ---
  const handleJsonChange = useCallback(
    (value: string) => {
      setJsonText(value);
      jsonTextRef.current = value;
      // Trigger right editor to rebuild diff highlights
      requestAnimationFrame(() => rightViewRef.current?.dispatch({}));
      if (value === '') {
        setJsonError(undefined);
        return;
      }
      try {
        formik.setValues(JSON.parse(value));
        setJsonError(undefined);
      } catch (e) {
        setJsonError((e as Error).message);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleResetToServer = useCallback(() => {
    formik.resetForm({ values: { ...currentValues } });
    setJsonText(JSON.stringify(currentValues, null, 2));
    setJsonError(undefined);
    if (reset) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValues, reset]);

  const handleClear = useCallback(() => {
    const emptyValues: Record<string, any> = {};
    for (const key of Object.keys(currentValues)) {
      const val = currentValues[key];
      if (typeof val === 'string') emptyValues[key] = '';
      else if (Array.isArray(val)) emptyValues[key] = [];
      else if (typeof val === 'object' && val !== null) emptyValues[key] = {};
      else emptyValues[key] = '';
    }
    formik.resetForm({ values: emptyValues });
    setJsonText(JSON.stringify(emptyValues, null, 2));
    if (reset) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValues, reset]);

  const handleSubmitJson = useCallback(() => {
    if (jsonError) return;
    try {
      const parsed = JSON.parse(jsonText);
      if (mode === 'edit') {
        const d = computeDiff(currentValues, parsed);
        onSubmit(d.patch, parsed, d);
      } else {
        const pruned = pruneForSubmission(parsed, readOnlyFields);
        const d = computeDiff(currentValues, pruned);
        onSubmit(pruned, parsed, d);
      }
    } catch {
      /* noop */
    }
  }, [jsonText, jsonError, readOnlyFields, currentValues, onSubmit, mode]);

  // --- error aggregation ---
  const formErrors =
    Object.keys(formik.errors).length > 0 && formik.submitCount > 0;
  const hasAnyError = !!error || !!jsonError || formErrors;
  const errorCount =
    (error ? 1 : 0) +
    (jsonError ? 1 : 0) +
    (formErrors ? Object.keys(formik.errors).length : 0);

  const tabs: { id: LeftTab; label: string; show: boolean }[] = [
    { id: 'form', label: 'Form', show: true },
    { id: 'json', label: 'JSON', show: true },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 0.5,
          gap: 1,
        }}
      >
        {/* Left: tabs */}
        <ButtonGroup variant="outlined" size="small" sx={{ height: '32px' }}>
          {tabs
            .filter((t) => t.show)
            .map((t) => (
              <Button
                key={t.id}
                onClick={() => setLeftTab(t.id)}
                color={leftTab === t.id ? 'secondary' : 'primary'}
                sx={{ minWidth: '50px', whiteSpace: 'nowrap' }}
              >
                {t.label}
                {t.id === 'json' && mode === 'edit' && diff.hasChanges && (
                  <Box
                    component="span"
                    sx={{
                      ml: 0.5,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#42a5f5',
                      display: 'inline-block',
                    }}
                  />
                )}
              </Button>
            ))}
        </ButtonGroup>

        {/* Right: actions */}
        <Stack spacing={0.5} direction="row" alignItems="center">
          {/* Error/success indicator button */}
          {isSuccess && (
            <Tooltip title={successMessage}>
              <IconButton
                size="small"
                onClick={() => reset?.()}
                sx={{ color: '#66bb6a' }}
              >
                <SuccessIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip
            title={
              hasAnyError
                ? `${errorCount} error(s) — click to expand`
                : 'No errors'
            }
          >
            <IconButton
              size="small"
              onClick={() => hasAnyError && setErrorsOpen((o) => !o)}
              sx={{
                color: hasAnyError ? '#ef5350' : 'rgba(255,255,255,0.2)',
                transition: 'color 0.2s',
              }}
            >
              <Badge
                badgeContent={hasAnyError ? errorCount : 0}
                color="error"
                max={99}
              >
                <ErrorIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {mode === 'edit' && (
            <Tooltip title="Reset to current server values">
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleResetToServer}
                  disabled={!diff.hasChanges && !formErrors}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Reset
                </Button>
              </span>
            </Tooltip>
          )}
          {mode === 'create' && (
            <Tooltip title="Clear all fields">
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={handleClear}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Clear
              </Button>
            </Tooltip>
          )}
          <LoadingButton
            variant="outlined"
            size="small"
            color="primary"
            loading={isLoading}
            disabled={
              isLoading ||
              (leftTab === 'json' && !!jsonError) ||
              (mode === 'edit' && !diff.hasChanges)
            }
            onClick={() => {
              if (leftTab === 'json') {
                handleSubmitJson();
              } else {
                formik.handleSubmit();
              }
            }}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {submitLabel}
          </LoadingButton>
        </Stack>
      </Box>

      {/* Collapsible error panel */}
      <Collapse in={errorsOpen && hasAnyError}>
        <Box
          sx={{
            mb: 0.5,
            maxHeight: '150px',
            overflow: 'auto',
          }}
        >
          {error && (
            <Alert
              severity="error"
              onClose={() => {
                reset?.();
                setErrorsOpen(false);
              }}
              sx={{ mb: 0.5 }}
            >
              <AlertTitle>API Error</AlertTitle>
              {error.message}
            </Alert>
          )}
          {jsonError && (
            <Alert severity="warning" sx={{ mb: 0.5 }}>
              <AlertTitle>JSON Parse Error</AlertTitle>
              {jsonError}
            </Alert>
          )}
          {formErrors && (
            <Alert severity="warning" sx={{ mb: 0.5 }}>
              <AlertTitle>Validation Errors</AlertTitle>
              {Object.entries(formik.errors).map(([field, msg]) => (
                <Typography
                  key={field}
                  variant="body2"
                  sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                >
                  <strong>{field}:</strong>{' '}
                  {typeof msg === 'string' ? msg : JSON.stringify(msg)}
                </Typography>
              ))}
            </Alert>
          )}
        </Box>
      </Collapse>

      {/* Content area */}
      {leftTab === 'form' && (
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'row',
            height: 'calc(100vh - 220px)',
            maxHeight: 'calc(100vh - 220px)',
            border: '1px solid rgba(112, 112, 112, 0.25)',
          }}
        >
          {/* Left: Form pane */}
          <Box
            sx={{
              width: '50%',
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid rgba(112,112,112,0.25)',
            }}
          >
            <Typography
              variant="caption"
              component="div"
              sx={{
                px: 1,
                py: 0.5,
                borderBottom: '1px solid rgba(112,112,112,0.25)',
                color: '#b0b0b0',
                fontWeight: 600,
                letterSpacing: 0.5,
                fontSize: '0.75rem',
              }}
            >
              User Edit Pane
            </Typography>
            <Box sx={{ flexGrow: 1, overflow: 'auto', padding: '8px' }}>
              <FormikProvider value={formik}>
                <form id="resource-editor-form" onSubmit={formik.handleSubmit}>
                  {formContent(formik)}
                </form>
              </FormikProvider>
            </Box>
          </Box>
          {/* Right: Server values */}
          <Box
            sx={{
              width: '50%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              variant="caption"
              component="div"
              sx={{
                px: 1,
                py: 0.5,
                borderBottom: '1px solid rgba(112,112,112,0.25)',
                color: '#b0b0b0',
                fontWeight: 600,
                letterSpacing: 0.5,
                fontSize: '0.75rem',
              }}
            >
              Server Side
            </Typography>
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <CodeMirror
                value={origJsonStr}
                editable={false}
                readOnly={true}
                extensions={formRightExts}
                height="auto"
                width="100%"
                theme={cmTheme}
                style={cmStyle}
                onCreateEditor={(view: EditorView) => {
                  formRightViewRef.current = view;
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {leftTab === 'json' && (
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            height: 'calc(100vh - 220px)',
            maxHeight: 'calc(100vh - 220px)',
            border: '1px solid rgba(112, 112, 112, 0.25)',
          }}
        >
          {/* Single scroll container with both editors side-by-side */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              minHeight: '100%',
            }}
          >
            {/* Left: editable JSON — green diff highlights */}
            <Box
              sx={{
                width: '50%',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid rgba(112,112,112,0.25)',
              }}
            >
              <Typography
                variant="caption"
                component="div"
                sx={{
                  px: 1,
                  py: 0.5,
                  borderBottom: '1px solid rgba(112,112,112,0.25)',
                  color: '#b0b0b0',
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  fontSize: '0.75rem',
                }}
              >
                User Edit Pane
              </Typography>
              <CodeMirror
                value={jsonText}
                editable={true}
                extensions={leftJsonExts}
                height="auto"
                theme={cmTheme}
                onChange={handleJsonChange}
                style={cmStyle}
              />
            </Box>

            {/* Right: server values — red diff highlights */}
            <Box
              sx={{
                width: '50%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                variant="caption"
                component="div"
                sx={{
                  px: 1,
                  py: 0.5,
                  borderBottom: '1px solid rgba(112,112,112,0.25)',
                  color: '#b0b0b0',
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  fontSize: '0.75rem',
                }}
              >
                Server Side
              </Typography>
              <CodeMirror
                value={origJsonStr}
                editable={false}
                readOnly={true}
                extensions={rightJsonExts}
                height="auto"
                width="100%"
                theme={cmTheme}
                style={cmStyle}
                onCreateEditor={(view: EditorView) => {
                  rightViewRef.current = view;
                }}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ResourceEditor;
