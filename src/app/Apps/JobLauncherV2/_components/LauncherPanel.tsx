import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFormikContext } from 'formik';
import { Jobs } from '@tapis/tapis-typescript';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  DataObjectRounded,
  VerticalSplitOutlined,
  ViewSidebarOutlined,
} from '@mui/icons-material';
import { useJobLauncher } from '@tapis/tapisui-common';
import SectionedPanel from 'app/_components/SectionedPanel/SectionedPanel';
import { buildGroups } from './sections';
import SummaryPane from './SummaryPane';
import { computeSummaryLines } from './summaryLines';
import { sectionMeta } from './sections/meta';
import {
  NavigationProvider,
  useLauncherNavigation,
  useSubmission,
} from './context';
import { computeBlockers } from './blockers';
import { computeWarnings } from './warnings';
import { useDebouncedValue } from './hooks';
import { errorsForFields, flattenErrorPaths } from './utils';

type JobValues = Partial<Jobs.ReqSubmitJob>;

// The panel shell renders nav, header chrome and one section body. Formik
// fields are context consumers and update regardless of this boundary, so
// memoizing here only skips the work that has nothing to do with the keystroke.
const MemoSectionedPanel = React.memo(SectionedPanel);

export type LauncherPanelProps = {
  /** Rendered as the panel's close affordance when hosted in a dialog */
  onClose?: () => void;
  initialSection?: string;
  onSectionChange?: (id: string) => void;
  /** Open straight on Review with the JSON editor up */
  initialJson?: boolean;
  /** Written by the panel so the host can warn before discarding the work */
  unsavedRef?: React.MutableRefObject<boolean>;
  /** The job this form was pre-filled from, worn as a provenance chip */
  seededFrom?: { uuid: string; name?: string };
};

/**
 * Runs the full validation a beat after typing stops. Formik's validateOnChange
 * is off — the yup schema covers every array in the job and the exec-system
 * cross-checks run with it, which was a third of the cost of a keystroke. Blur
 * still validates immediately; this covers the pause between bursts, which is
 * when the blocker count and the nav badges want to be right anyway.
 *
 * (It lives here rather than beside <Formik>, which takes exactly one child.)
 */
const DebouncedValidation: React.FC<{ onChecked: () => void }> = ({
  onChecked,
}) => {
  const { values, validateForm } = useFormikContext<JobValues>();
  const settled = useDebouncedValue(values, 250);
  useEffect(() => {
    // validateForm resolves after the schema and the cross-checks have run;
    // until the first one lands the panel does not know what it is looking at
    validateForm().then(onChecked);
  }, [settled, validateForm, onChecked]);
  return null;
};

/**
 * Reports whether the form is worth warning about before a close.
 *
 * It has to live inside <Formik> to see `dirty`, but the thing that closes —
 * the dialog, including its backdrop and Escape — lives above it. A ref is the
 * seam: cheap to write on every keystroke, and read only at the moment
 * somebody tries to leave.
 */
const UnsavedWorkProbe: React.FC<{
  unsavedRef: React.MutableRefObject<boolean>;
}> = ({ unsavedRef }) => {
  const { dirty } = useFormikContext<JobValues>();
  const submission = useSubmission();
  useEffect(() => {
    // a submitted job is not lost work — there is nothing left to warn about
    unsavedRef.current = dirty && !submission.isSuccess;
  }, [dirty, submission.isSuccess, unsavedRef]);
  useEffect(
    () => () => {
      unsavedRef.current = false;
    },
    [unsavedRef]
  );
  return null;
};

/** Everything that has to keep up with the form, in one small subtree. */
export type SummaryMode = 'pane' | 'nav' | null;

const LauncherHeaderExtras: React.FC<{
  summaryMode: SummaryMode;
  onSummaryMode: (mode: SummaryMode) => void;
  checked: boolean;
  onOpenJson: () => void;
  seededFrom?: { uuid: string; name?: string };
}> = ({ summaryMode, onSummaryMode, checked, onOpenJson, seededFrom }) => {
  const { values, errors } = useFormikContext<JobValues>();
  const { app, systems } = useJobLauncher();
  const submission = useSubmission();
  const { scrollTo, pulseSubmit } = useLauncherNavigation();

  // Debounced SEPARATELY, never as { values, errors }: formik hands back the
  // same objects while nothing changes, but a literal is new on every render,
  // so the effect would reschedule forever and the panel would re-render every
  // 200ms — which, among other things, closes any open native <select>.
  const settledValues = useDebouncedValue(values);
  const settledErrors = useDebouncedValue(errors);
  const blockers = useMemo(
    () =>
      computeBlockers({
        values: settledValues,
        errors: settledErrors,
        app,
        systems,
      }),
    [settledValues, settledErrors, app, systems]
  );
  const blocked = !!blockers.length;

  // A receipt goes stale the moment it stops describing the form. Editing
  // after a submit means you are building the NEXT job, so the panel drops
  // the 'submitted' state and lets you submit again — without this, breaking
  // a field left the header claiming success and the button dead.
  const submittedWith = useRef<JobValues | null>(null);
  useEffect(() => {
    if (!submission.isSuccess) {
      submittedWith.current = null;
      return;
    }
    if (submittedWith.current === null) {
      submittedWith.current = settledValues;
      return;
    }
    if (submittedWith.current !== settledValues) {
      submission.reset();
    }
  }, [submission.isSuccess, submission.reset, settledValues, submission]);

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {/* Provenance, when this form did not start blank. The chip is the
          honest version of 'resubmit with changes': what submits here is a
          NEW job, and the old run's resolved directories were left behind. */}
      {seededFrom && (
        <Tooltip
          title={`Pre-filled from job ${seededFrom.uuid}${
            seededFrom.name ? ` (${seededFrom.name})` : ''
          }. Submitting creates a new job; the original is untouched. Run directories are not carried over, they fall back to the app's defaults.`}
          arrow
        >
          <Chip
            size="small"
            variant="outlined"
            label={`from ${seededFrom.name ?? 'a job'}`}
            sx={{
              height: 20,
              fontSize: '0.66rem',
              maxWidth: 180,
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          />
        </Tooltip>
      )}
      {/* Two readings of the same summary: its own column, or folded into the
          nav so the section list doubles as the overview. Press the active one
          again for neither. */}
      <ToggleButtonGroup
        size="small"
        exclusive
        value={summaryMode}
        onChange={(_event, next: SummaryMode) => onSummaryMode(next)}
        sx={{ display: { xs: 'none', md: 'inline-flex' } }}
      >
        <Tooltip title="Summary in its own pane">
          <ToggleButton value="pane" sx={{ py: 0.15, px: 0.75, fontSize: 11 }}>
            <ViewSidebarOutlined sx={{ fontSize: 15, mr: 0.5 }} />
            Pane
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Summary folded into the section list">
          <ToggleButton value="nav" sx={{ py: 0.15, px: 0.75, fontSize: 11 }}>
            <VerticalSplitOutlined sx={{ fontSize: 15, mr: 0.5 }} />
            In nav
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
      <Tooltip title="Paste a job as JSON  ·  ⌘J">
        <Button
          size="small"
          onClick={onOpenJson}
          startIcon={<DataObjectRounded sx={{ fontSize: 15 }} />}
          sx={{ textTransform: 'none', fontSize: 11, color: 'text.secondary' }}
        >
          JSON
        </Button>
      </Tooltip>
      {/* 'submitted' is a receipt, not a resting state: the moment the form
          has a problem again it goes back to counting, and it can be
          dismissed to start the next job. */}
      {submission.isSuccess && !blocked ? (
        <Tooltip title="Dismiss — submit another job">
          <Chip
            size="small"
            color="success"
            variant="outlined"
            label="submitted"
            onDelete={() => submission.reset()}
          />
        </Tooltip>
      ) : blocked && checked ? (
        // The count is the shortest description of the work left, so it is
        // also the way to it — Review lists every blocker with a link to the
        // section that owns it.
        <Tooltip title="See what needs fixing">
          <Typography
            component="button"
            type="button"
            variant="caption"
            onClick={() => scrollTo('review')}
            sx={{
              p: 0,
              border: 'none',
              background: 'none',
              // fontFamily only: `font: inherit` also reset the size, which
              // handed this the browser's button default and made it shout
              fontFamily: 'inherit',
              cursor: 'pointer',
              color: 'warning.main',
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
              textUnderlineOffset: '2px',
              '&:hover': { textDecorationStyle: 'solid' },
            }}
          >
            {blockers.length} to fix
          </Typography>
        </Tooltip>
      ) : (
        <Typography
          variant="caption"
          sx={{ color: !checked ? 'text.disabled' : 'success.main' }}
        >
          {/* Never claim 'ready to submit' before the first validation pass has
              come back — it flashed green-and-blue on open, then corrected
              itself, which is exactly backwards for a launch button. */}
          {!checked ? 'checking…' : 'ready to submit'}
        </Typography>
      )}
      {/* Not a submit — the header cannot show what it is about to send, so
          it hands you to Review, which can: the assembled body, the blocker
          list, and the button that actually does it. One place submits.
          The pulse rings that button so the hand-off has somewhere to look,
          and pressing this again just rings it again. */}
      <Button
        variant="contained"
        size="small"
        onClick={() => {
          scrollTo('review');
          pulseSubmit();
        }}
        startIcon={
          submission.isLoading ? (
            <CircularProgress size={14} color="inherit" />
          ) : undefined
        }
        sx={{ textTransform: 'none' }}
      >
        Review &amp; submit
      </Button>
    </Stack>
  );
};

/**
 * The panel body. One formik form holds the whole job, but only the selected
 * section is mounted — the same model as Settings and Pods Admin, so a
 * file-input array or a JSON preview costs nothing while you are elsewhere.
 * Section switching cannot lose field state: the values live in formik, above
 * the sections.
 */
const LauncherPanel: React.FC<LauncherPanelProps> = ({
  onClose,
  initialSection,
  onSectionChange,
  initialJson = false,
  unsavedRef,
  seededFrom,
}) => {
  const { values, errors } = useFormikContext<JobValues>();
  const { app, systems } = useJobLauncher();

  // Cross-section navigation: the Review section's blocker list sends the user
  // to whichever section owns the problem. The nonce is what lets the same
  // section be requested twice in a row.
  const [sectionRequest, setSectionRequest] = useState<{
    id: string;
    nonce: number;
  }>();
  // Neither summary by default: the section list plus the status in the
  // header answers 'what is left', and the panel opens at its widest.
  const [summaryMode, setSummaryMode] = useState<SummaryMode>(null);
  const [jsonMode, setJsonModeState] = useState(initialJson);
  // Bumped on every jump so the pane can flash even when it is already open
  const [jsonNonce, setJsonNonce] = useState(initialJson ? 1 : 0);
  const [checked, setChecked] = useState(false);
  const onChecked = useCallback(() => setChecked(true), []);
  const scrollTo = useCallback((id: string) => {
    setSectionRequest((previous) => ({
      id,
      nonce: (previous?.nonce ?? 0) + 1,
    }));
  }, []);
  // The header's Review & submit is a hand-off, and a hand-off should point:
  // while this is nonzero, Review rings its Submit button once. Cleared by
  // the flash itself, so arriving at Review any other way stays quiet.
  const [submitFlash, setSubmitFlash] = useState(0);
  const pulseSubmit = useCallback(
    () => setSubmitFlash((nonce) => nonce + 1),
    []
  );
  const clearSubmitFlash = useCallback(() => setSubmitFlash(0), []);
  // One way in to the JSON editor, whether it is pressed, shortcut, or the
  // launcher was opened straight onto it.
  const openJson = useCallback(
    (on: boolean) => {
      setJsonModeState(on);
      if (on) {
        setJsonNonce((nonce) => nonce + 1);
        scrollTo('review');
      }
    },
    [scrollTo]
  );

  // ⌘J / Ctrl+J from anywhere in the panel — the JSON pane is the one place
  // people arrive at with something already on the clipboard.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        openJson(true);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [openJson]);

  const navigation = useMemo(
    () => ({
      scrollTo,
      jsonMode,
      setJsonMode: openJson,
      jsonNonce,
      submitFlash,
      pulseSubmit,
      clearSubmitFlash,
      close: onClose,
      checked,
    }),
    [
      scrollTo,
      jsonMode,
      openJson,
      jsonNonce,
      submitFlash,
      pulseSubmit,
      clearSubmitFlash,
      onClose,
      checked,
    ]
  );

  // Section chips and per-section error counts settle a beat behind the
  // keystroke; between beats `groups` keeps its identity and the shell below
  // re-renders nothing.
  const settledValues = useDebouncedValue(values);
  const settledErrors = useDebouncedValue(errors);
  const groups = useMemo(() => {
    const errorPaths = flattenErrorPaths(settledErrors);
    const blockers = computeBlockers({
      values: settledValues,
      errors: settledErrors,
      app,
      systems,
    });
    const warnings = computeWarnings({ values: settledValues, app });
    const lines =
      summaryMode === 'nav'
        ? computeSummaryLines({ values: settledValues, app, systems })
        : undefined;
    return buildGroups(
      { values: settledValues, app, systems },
      (meta) =>
        meta.id === 'review'
          ? blockers.length
          : errorsForFields(errorPaths, meta.fields).length,
      (meta) =>
        warnings.filter((warning) => warning.sectionId === meta.id).length,
      lines &&
        ((meta) => {
          const sectionLines = lines[meta.id];
          if (!sectionLines?.length) {
            return undefined;
          }
          // The pane can afford a line per fact; a nav column cannot. Facts
          // run together separated by dots and wrap as one paragraph, which
          // is most of the height back. Problems keep their own line — they
          // are the reason to look.
          const facts = sectionLines
            .filter((line) => !line.error)
            .map((line) => line.text)
            .join(' · ');
          const problems = sectionLines.filter((line) => line.error);
          return (
            <Box>
              {problems.map((line, index) => (
                <Typography
                  key={`nav-summary-${meta.id}-error-${index}`}
                  sx={{
                    fontSize: 10.5,
                    lineHeight: 1.35,
                    wordBreak: 'break-word',
                    color: 'error.main',
                  }}
                >
                  {line.text}
                </Typography>
              ))}
              {!!facts && (
                <Typography
                  sx={{
                    fontSize: 10.5,
                    lineHeight: 1.35,
                    wordBreak: 'break-word',
                    color: 'text.secondary',
                  }}
                >
                  {facts}
                </Typography>
              )}
            </Box>
          );
        })
    );
  }, [settledValues, settledErrors, app, systems, summaryMode]);

  const headerExtras = useMemo(
    () => (
      <LauncherHeaderExtras
        summaryMode={summaryMode}
        onSummaryMode={setSummaryMode}
        checked={checked}
        onOpenJson={() => openJson(true)}
        seededFrom={seededFrom}
      />
    ),
    [summaryMode, checked, openJson, seededFrom]
  );
  const aside = useMemo(
    () => (summaryMode === 'pane' ? <SummaryPane /> : undefined),
    [summaryMode]
  );
  const caption = useMemo(
    () => `${app.id} v${app.version}`,
    [app.id, app.version]
  );

  return (
    <NavigationProvider value={navigation}>
      <DebouncedValidation onChecked={onChecked} />
      {unsavedRef && <UnsavedWorkProbe unsavedRef={unsavedRef} />}
      <MemoSectionedPanel
        groups={groups}
        title="Launch job"
        caption={caption}
        headerExtras={headerExtras}
        onClose={onClose}
        initialSection={initialSection ?? sectionMeta[0].id}
        onSectionChange={onSectionChange}
        sectionRequest={sectionRequest}
        // A launcher section is a form you scroll to the bottom of; one stray
        // flick there should not throw you into the next one.
        pageGestures={3}
        // summary-in-nav is governed by this panel's own header switch, not
        // the shared ⓘ toggle
        navDetailsToggle={false}
        aside={aside}
        // a touch wider than the 190 default: these rows carry a status badge
        // as well as a label, and an exec system id is not a short word
        navWidth={summaryMode === 'nav' ? 300 : 210}
      />
    </NavigationProvider>
  );
};

export default LauncherPanel;
