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
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataObjectRounded, InfoOutlined } from '@mui/icons-material';
import { useJobLauncher } from '@tapis/tapisui-common';
import SectionedPanel from 'app/_components/SectionedPanel/SectionedPanel';
import { ACCENT, HEAD_BTN_SX } from 'app/_components/SectionedPanel/panelKit';
import IssueStatus from 'app/_components/SectionedPanel/IssueStatus';
import { WalkActionButton } from 'app/_components/SectionedPanel/StepPager';
import { buildGroups } from './sections';
import SummaryPane from './SummaryPane';
import { computeSummaryLines } from './summaryLines';
import { launcherSummary } from 'app/_components/PageShell/viewPrefs';
import { issuesBySection, mergeIssues } from './issues';
import { sectionMeta } from './sections/meta';
import {
  NavigationProvider,
  useLauncherIssues,
  useLauncherNavigation,
  useSubmission,
} from './context';
import { firstIssue } from './flow';
import { useDebouncedValue } from './hooks';
import { errorsForFields, flattenErrorPaths } from './utils';
import JobJsonDialog from './JobJsonDialog';

type JobValues = Partial<Jobs.ReqSubmitJob>;

// The panel shell renders nav, header chrome and one section body. Formik
// fields are context consumers and update regardless of this boundary, so
// memoizing here only skips the work that has nothing to do with the keystroke.
const MemoSectionedPanel = React.memo(SectionedPanel);

/**
 * The in-nav summary, on and off, from the pager's second row: the same ⓘ
 * the other panels wear for their nav lines, bound to the launcher's own
 * preference so it and Settings › Preferences cannot disagree. Off is the
 * plain list: labels, badges, and the red and amber lines that say what is
 * wrong, which are not a summary. The side pane stays a Settings choice.
 */
const SummaryToggle: React.FC = () => {
  const on = launcherSummary.use() === 'nav';
  return (
    <Tooltip
      title={
        on
          ? 'Hide the summary under each section'
          : 'Show a summary under each section'
      }
    >
      <IconButton
        size="small"
        aria-label="Summary in the nav"
        aria-pressed={on}
        onClick={() => launcherSummary.set(on ? 'off' : 'nav')}
        sx={{ color: on ? ACCENT : 'text.disabled' }}
      >
        <InfoOutlined sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>
  );
};

/**
 * The walk's way to the end, in the pager's second row: to Review, and a
 * glow on the one button that submits. The same label and the same press on
 * every step, Review included, where it rings that button again. When
 * something still blocks, the nav's red counts ring as well, so you arrive
 * at the list already knowing which sections it is about.
 */
const LaunchAction: React.FC = () => {
  const { scrollTo, pulseSubmit, pulseIssues } = useLauncherNavigation();
  return (
    <WalkActionButton
      hint="Skip to the last step, where the whole job is checked and sent"
      onClick={() => {
        scrollTo('review');
        pulseSubmit();
        pulseIssues();
      }}
    >
      Review &amp; Submit
    </WalkActionButton>
  );
};

// The launcher is a walk: one pager under the nav, with the summary switch
// and Review & Submit in its second row. Module-level so the memoized panel
// sees one object.
const LAUNCH_WALK = {
  tools: <SummaryToggle />,
  action: <LaunchAction />,
};

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

const sectionName = (id: string) =>
  sectionMeta.find((section) => section.id === id)?.label ?? id;

const LauncherHeaderExtras: React.FC<{
  checked: boolean;
  onOpenJson: () => void;
  seededFrom?: { uuid: string; name?: string };
}> = ({ checked, onOpenJson, seededFrom }) => {
  const { values } = useFormikContext<JobValues>();
  const submission = useSubmission();
  const { scrollTo, pulseIssues } = useLauncherNavigation();
  const { blockers, warnings } = useLauncherIssues();

  // Debounced on its own, never as { values, errors }: formik hands back the
  // same objects while nothing changes, but a literal is new on every render,
  // so the effect would reschedule forever and the panel would re-render every
  // 200ms — which, among other things, closes any open native <select>.
  const settledValues = useDebouncedValue(values);
  const blocked = !!blockers.length;
  // One chip per severity: the count, where the first of them lives, every
  // item on hover, and a press straight to that section. The nav's counts
  // ring as it lands, so the list itself shows the rest of the way.
  const groups = useMemo(() => {
    const group = (kind: 'blocker' | 'warning') => {
      const items = mergeIssues(
        kind === 'blocker' ? blockers : [],
        kind === 'warning' ? warnings : []
      );
      const first =
        kind === 'blocker'
          ? firstIssue(blockers, [])
          : firstIssue([], warnings);
      return {
        count: items.length,
        where: first ? sectionName(first.id) : undefined,
        lines: items.map(
          (item) => `${sectionName(item.sectionId)}: ${item.short}`
        ),
        onGo: first
          ? () => {
              scrollTo(first.id);
              pulseIssues();
            }
          : undefined,
      };
    };
    return { blockers: group('blocker'), warnings: group('warning') };
  }, [blockers, warnings, scrollTo, pulseIssues]);

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

  // The head line holds the form's standing and the two presses that belong
  // to the panel rather than to a step: what is left, JSON, and (drawn by
  // the shell after a divider) close. Review & Submit lives in the pager
  // now, beside the walk it finishes.
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
      {/* 'submitted' is a receipt, not a resting state: the moment the form
          has a problem again it goes back to counting, and it can be
          dismissed to start the next job. */}
      <IssueStatus
        checked={checked}
        blockers={groups.blockers}
        warnings={groups.warnings}
        readyLabel="ready to submit"
        done={
          submission.isSuccess && !blocked ? (
            <Tooltip title="Dismiss — submit another job">
              <Chip
                size="small"
                color="success"
                variant="outlined"
                label="submitted"
                onDelete={() => submission.reset()}
              />
            </Tooltip>
          ) : undefined
        }
      />
      {/* describeChild: the hint describes the press, the label names it */}
      <Tooltip title="Edit the job as JSON  ·  ⌘J" describeChild>
        <Button
          size="small"
          onClick={onOpenJson}
          startIcon={<DataObjectRounded sx={{ fontSize: 15 }} />}
          sx={{ ...HEAD_BTN_SX, '& .MuiButton-startIcon': { mr: 0.5, ml: 0 } }}
        >
          JSON
        </Button>
      </Tooltip>
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
  // In-nav by default: the section list doubles as the overview, so the
  // launcher opens with the job readable in one column instead of two, and
  // the form gets the width back. Off is one press, on the ⓘ under the
  // pager; the side pane is a Settings › Preferences choice, kept out of
  // the head line, which is the scarcest strip here.
  const summaryPref = launcherSummary.use();
  const summaryMode: SummaryMode = summaryPref === 'off' ? null : summaryPref;
  // The JSON editor, a dialog over the step you are on, never a jump to
  // Review: a stray press used to land someone on the last step inside a
  // code editor. initialJson opens it.
  const [jsonOpen, setJsonOpen] = useState(initialJson);
  const [checked, setChecked] = useState(false);
  const onChecked = useCallback(() => setChecked(true), []);
  const scrollTo = useCallback((id: string) => {
    setSectionRequest((previous) => ({
      id,
      nonce: (previous?.nonce ?? 0) + 1,
    }));
  }, []);
  // The header's Review & Submit is a hand-off, and a hand-off should point:
  // while this is nonzero, Review rings its Submit button once. Cleared by
  // the flash itself, so arriving at Review any other way stays quiet.
  const [submitFlash, setSubmitFlash] = useState(0);
  const pulseSubmit = useCallback(
    () => setSubmitFlash((nonce) => nonce + 1),
    []
  );
  const clearSubmitFlash = useCallback(() => setSubmitFlash(0), []);
  // Rings the nav's problem counts; a nonce, so asking twice rings twice.
  const [issuePulse, setIssuePulse] = useState(0);
  const pulseIssues = useCallback(
    () => setIssuePulse((nonce) => nonce + 1),
    []
  );
  // One way in to the JSON editor, whether it is pressed, shortcut, or the
  // launcher was opened straight onto it.
  const openJson = useCallback(() => setJsonOpen(true), []);
  const closeJson = useCallback(() => setJsonOpen(false), []);

  // ⌘J / Ctrl+J from anywhere in the panel: the JSON editor is the one
  // place people arrive at with something already on the clipboard.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        openJson();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [openJson]);

  // Section chips and per-section error counts settle a beat behind the
  // keystroke; between beats `groups` keeps its identity and the shell below
  // re-renders nothing.
  const settledValues = useDebouncedValue(values);
  const settledErrors = useDebouncedValue(errors);
  // The provider's one list feeds the nav: each row's badge and the issue
  // lines under it read the same list, so a row cannot count one thing and
  // say another.
  const {
    blockers: panelBlockers,
    warnings: panelWarnings,
    issues: panelIssues,
  } = useLauncherIssues();
  const navigation = useMemo(
    () => ({
      scrollTo,
      openJson,
      submitFlash,
      pulseSubmit,
      clearSubmitFlash,
      pulseIssues,
      close: onClose,
      checked,
    }),
    [
      scrollTo,
      openJson,
      submitFlash,
      pulseSubmit,
      clearSubmitFlash,
      pulseIssues,
      onClose,
      checked,
    ]
  );

  const groups = useMemo(() => {
    const errorPaths = flattenErrorPaths(settledErrors);
    const blockers = panelBlockers;
    const warnings = panelWarnings;
    const lines =
      summaryMode === 'nav'
        ? computeSummaryLines({ values: settledValues, app, systems })
        : undefined;
    // one merged, ordered list, indexed by owner: the nav, the board and the
    // walk are then three readings of the same thing
    const issuesHere = issuesBySection(panelIssues);
    return buildGroups(
      { values: settledValues, app, systems },
      (meta) =>
        meta.id === 'review'
          ? blockers.length
          : errorsForFields(errorPaths, meta.fields).length,
      (meta) =>
        warnings.filter((warning) => warning.sectionId === meta.id).length,
      (meta) => {
        const sectionIssues = issuesHere[meta.id] ?? [];
        // The pane can afford a line per fact; a nav column cannot. Facts
        // run together separated by dots and wrap as one paragraph, which
        // is most of the height back.
        const facts = (lines?.[meta.id] ?? [])
          // problems used to be written twice, once as a red summary line
          // and once as a blocker with different wording. The issue list
          // below is the real one, so the summary keeps only the facts.
          .filter((line) => !line.error)
          .map((line) => line.text)
          .join(' \u00b7 ');
        if (!sectionIssues.length && !facts) {
          return undefined;
        }
        return (
          <Box>
            {/* Not a summary, so it does not answer to the summary switch:
                a count on the row says there is something wrong, and this
                says what, which is the difference between having to open
                every section and knowing which one to open. Red for what
                stops a submission, amber for what does not; the colour is
                the whole marking, and a glyph in front of every line only
                made the column noisy. */}
            {sectionIssues.map((issue) => (
              <Typography
                key={issue.key}
                title={
                  issue.kind === 'blocker'
                    ? 'Must be fixed before this job can be submitted'
                    : 'A warning; it will not stop the job'
                }
                sx={{
                  fontSize: 10.5,
                  lineHeight: 1.35,
                  wordBreak: 'break-word',
                  color:
                    issue.kind === 'blocker' ? 'error.main' : 'warning.dark',
                }}
              >
                {issue.short}
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
      }
    );
    // settledErrors stays in the list: the body still reads it for the
    // per-section error counts, and dropping it left the nav badges a beat
    // behind forever rather than for one beat
  }, [
    panelBlockers,
    panelWarnings,
    panelIssues,
    settledValues,
    settledErrors,
    app,
    systems,
    summaryMode,
  ]);

  const headerExtras = useMemo(
    () => (
      <LauncherHeaderExtras
        checked={checked}
        onOpenJson={openJson}
        seededFrom={seededFrom}
      />
    ),
    [checked, openJson, seededFrom]
  );
  const aside = useMemo(
    () => (summaryMode === 'pane' ? <SummaryPane /> : undefined),
    [summaryMode]
  );
  // the app, set as a quiet tag beside the title rather than as loose words
  const caption = useMemo(
    () => (
      <Box
        component="span"
        sx={{
          fontFamily: 'monospace',
          fontSize: 11.5,
          color: 'text.secondary',
          px: 0.6,
          py: 0.15,
          borderRadius: '4px',
          bgcolor: 'rgba(0,0,0,0.045)',
        }}
      >
        {app.id} v{app.version}
      </Box>
    ),
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
        walk={LAUNCH_WALK}
        badgePulse={issuePulse}
        // A launcher section is a form you scroll to the bottom of; one stray
        // flick there should not throw you into the next one.
        pageGestures={3}
        // summary-in-nav answers to the launcher's own preference, through
        // SummaryToggle, not to the shell's per-panel ⓘ memory
        navDetailsToggle={false}
        aside={aside}
        // wider than the 190 default: these rows carry a status badge as well
        // as V1's two-word labels ("Execution Options" beside an exec system
        // id), and the pager's second row fits the summary switch, the step
        // and the skip
        navWidth={summaryMode === 'nav' ? 300 : 250}
      />
      <JobJsonDialog open={jsonOpen} onClose={closeJson} />
    </NavigationProvider>
  );
};

export default LauncherPanel;
