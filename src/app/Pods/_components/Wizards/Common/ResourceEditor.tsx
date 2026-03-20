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
  Menu,
  MenuItem,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ErrorOutline as ErrorIcon,
  CheckCircleOutline as SuccessIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDarkInit } from '@uiw/codemirror-theme-vscode';
import { EditorView } from '@codemirror/view';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { computeDiff, pruneForSubmission, DiffResult } from './computeDiff';
import { makeDiffHighlightPlugin } from './diffHighlight';
import { updateState } from '@redux';

export type ResourceEditorMode = 'edit' | 'create';

export interface FieldTemplate {
  label: string;
  field: string;
  defaultValue: any;
  description?: string;
}

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
  fieldTemplates?: FieldTemplate[];
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

const DIFF_GREEN = {
  line: 'rgba(46, 125, 50, 0.18)',
  word: 'rgba(46, 160, 50, 0.45)',
};
const DIFF_RED = {
  line: 'rgba(198, 40, 40, 0.18)',
  word: 'rgba(220, 50, 50, 0.45)',
};

const paneHeaderSx = {
  px: 1,
  py: 0.5,
  borderBottom: '1px solid rgba(112,112,112,0.25)',
  color: '#b0b0b0',
  fontWeight: 600,
  letterSpacing: 0.5,
  fontSize: '0.75rem',
} as const;

const splitPaneSx = {
  outer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    height: 'calc(100vh - 220px)',
    maxHeight: 'calc(100vh - 220px)',
    border: '1px solid rgba(112, 112, 112, 0.25)',
  },
  left: {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid rgba(112,112,112,0.25)',
  },
  right: {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
  },
} as const;

/** Check if a formik value counts as "populated" (non-empty). */
function isFieldPopulated(val: any): boolean {
  if (val === undefined || val === null || val === '') return false;
  if (Array.isArray(val) && val.length === 0) return false;
  if (typeof val === 'object' && val !== null && Object.keys(val).length === 0)
    return false;
  return true;
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
  fieldTemplates = [],
}) => {
  const [leftTab, setLeftTab] = useState<LeftTab>('form');
  const [jsonError, setJsonError] = useState<string | undefined>(undefined);
  const [errorsOpen, setErrorsOpen] = useState(false);
  const [addFieldAnchor, setAddFieldAnchor] = useState<null | HTMLElement>(
    null
  );

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
        DIFF_GREEN.line,
        DIFF_GREEN.word,
        'left'
      ),
    [origJsonStr]
  );
  const rightHighlightExt = useMemo(
    () =>
      makeDiffHighlightPlugin(
        () => jsonTextRef.current,
        DIFF_RED.line,
        DIFF_RED.word,
        'right'
      ),
    []
  );
  const formRightHighlightExt = useMemo(
    () =>
      makeDiffHighlightPlugin(
        () => origJsonStr,
        DIFF_GREEN.line,
        DIFF_GREEN.word,
        'left'
      ),
    [origJsonStr]
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
  // Debounced persistence so NavPods can check for unsaved edits
  // without slowing down every keystroke / form field change.
  const formikValuesRef = useRef(formik.values);
  formikValuesRef.current = formik.values;
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (reduxDraftKey && dispatch) {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
      draftTimerRef.current = setTimeout(() => {
        dispatch(updateState({ [reduxDraftKey]: formikValuesRef.current }));
      }, 500);
    }
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values, reduxDraftKey, dispatch]);
  // Also flush on unmount
  useEffect(() => {
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
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

  const handleAddField = useCallback(
    (ft: FieldTemplate) => {
      formik.setFieldValue(ft.field, ft.defaultValue);
      if (leftTab === 'json') {
        const updated = { ...formik.values, [ft.field]: ft.defaultValue };
        const str = JSON.stringify(updated, null, 2);
        setJsonText(str);
        jsonTextRef.current = str;
      }
      setAddFieldAnchor(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leftTab]
  );

  const handleRevertField = useCallback(
    (ft: FieldTemplate, e: React.MouseEvent) => {
      e.stopPropagation();
      formik.setFieldValue(ft.field, undefined);
      if (leftTab === 'json') {
        const updated = { ...formik.values };
        delete updated[ft.field];
        const str = JSON.stringify(updated, null, 2);
        setJsonText(str);
        jsonTextRef.current = str;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leftTab]
  );

  const tabs: { id: LeftTab; label: string }[] = [
    { id: 'form', label: 'Form' },
    { id: 'json', label: 'JSON' },
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
        {/* Left: tabs + add field */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          <ButtonGroup variant="outlined" size="small" sx={{ height: '32px' }}>
            {tabs.map((t) => (
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
          {fieldTemplates.length > 0 && (
            <>
              <Tooltip title="Add a field with default values">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => setAddFieldAnchor(e.currentTarget)}
                  sx={{
                    height: '32px',
                    minWidth: 'unset',
                    px: 1,
                    whiteSpace: 'nowrap',
                  }}
                  startIcon={<AddIcon fontSize="small" />}
                >
                  Field
                </Button>
              </Tooltip>
              <Menu
                anchorEl={addFieldAnchor}
                open={Boolean(addFieldAnchor)}
                onClose={() => setAddFieldAnchor(null)}
                slotProps={{
                  paper: {
                    sx: {
                      maxHeight: 560,
                      minWidth: 200,
                    },
                  },
                }}
              >
                {fieldTemplates.map((ft) => {
                  const hasValue = isFieldPopulated(formik.values[ft.field]);
                  return (
                    <MenuItem
                      key={ft.field}
                      onClick={() => !hasValue && handleAddField(ft)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        ...(hasValue && { opacity: 0.5 }),
                      }}
                    >
                      <ListItemText
                        primary={ft.label}
                        secondary={hasValue ? 'Currently set' : ft.description}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                          sx: { fontSize: '0.7rem' },
                        }}
                      />
                      {hasValue && (
                        <Tooltip title="Revert field">
                          <IconButton
                            size="small"
                            edge="end"
                            onClick={(e) => handleRevertField(ft, e)}
                            sx={{
                              ml: 1,
                              color: 'rgba(211, 47, 47, 0.5)',
                              '&:hover': { color: '#d32f2f' },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </MenuItem>
                  );
                })}
              </Menu>
            </>
          )}
        </Stack>

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
        <Box sx={splitPaneSx.outer}>
          {/* Left: Form pane */}
          <Box sx={splitPaneSx.left}>
            <Typography variant="caption" component="div" sx={paneHeaderSx}>
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
          {/* Right: New changes (user edits as JSON, green diff highlights) */}
          <Box sx={splitPaneSx.right}>
            <Typography variant="caption" component="div" sx={paneHeaderSx}>
              New Changes
            </Typography>
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <CodeMirror
                value={formikJsonStr}
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
        <Box sx={{ ...splitPaneSx.outer, overflow: 'auto' }}>
          {/* Single scroll container with both editors side-by-side */}
          <Box
            sx={{ display: 'flex', flexDirection: 'row', minHeight: '100%' }}
          >
            {/* Left: editable JSON — green diff highlights */}
            <Box sx={splitPaneSx.left}>
              <Typography variant="caption" component="div" sx={paneHeaderSx}>
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
            <Box sx={splitPaneSx.right}>
              <Typography variant="caption" component="div" sx={paneHeaderSx}>
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
