import React, { useEffect, useMemo, useState } from 'react';
import { Jobs } from '@tapis/tapis-typescript';
import { useFormikContext } from 'formik';
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CheckCircleOutline,
  CloseRounded,
  ContentCopyRounded,
  DataObjectRounded,
  DoneRounded,
  ErrorOutline,
  ExpandLess,
  ExpandMore,
  OpenInNewRounded,
} from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { useJobLauncher } from '@tapis/tapisui-common';
import RecordJson from 'app/_components/PageShell/RecordJson';
import { fadeGlowSx } from 'app/_components/PageShell/glow';
import {
  ACTION_BLUE,
  ACTION_BTN_SX,
} from 'app/_components/PageShell/actionButton';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import { HEAD_BTN_SX } from 'app/_components/SectionedPanel/panelKit';
import {
  useLauncherIssues,
  useLauncherNavigation,
  useSubmission,
} from '../context';
import { sectionLabel } from '../issues';
import IssueBoard, { BoardIssue } from 'app/_components/IssueBoard';
import { assembleJob } from '../utils';
import { useDebouncedValue } from '../hooks';

type JobValues = Partial<Jobs.ReqSubmitJob>;

export const useLauncherBlockers = () => useLauncherIssues().blockers;

/**
 * The amber half of the review: things that will still submit, but not the
 * way the form reads. The nav has counted these all along; the review board
 * is where someone looks last, so it is where they have to be spelled out.
 */
export const useLauncherWarnings = () => useLauncherIssues().warnings;

/**
 * The launcher's status box.
 *
 * MUI's Alert fills itself with a pastel block that nothing else in this app
 * does; every other box here is a thin outline over the page. This keeps the
 * severity colour but spends it on the border and a wash, so the boxes sit in
 * the same family as the wells and section cards around them — and it can
 * carry a dismiss, which an Alert only does with an action slot.
 */
const StatusBox: React.FC<
  React.PropsWithChildren<{
    tone: 'success' | 'warning' | 'error';
    icon: React.ReactNode;
    title: React.ReactNode;
    onDismiss?: () => void;
  }>
> = ({ tone, icon, title, onDismiss, children }) => (
  <Box
    sx={{
      display: 'flex',
      gap: 1,
      alignItems: 'flex-start',
      p: 1.25,
      mb: 1.5,
      borderRadius: 1,
      border: '1px solid',
      borderColor: (theme) => alpha(theme.palette[tone].main, 0.5),
      bgcolor: (theme) => alpha(theme.palette[tone].main, 0.06),
    }}
  >
    <Box sx={{ color: `${tone}.main`, display: 'flex', mt: '1px' }}>{icon}</Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, mb: children ? 0.75 : 0 }}
      >
        {title}
      </Typography>
      {children}
    </Box>
    {onDismiss && (
      <Tooltip title="Dismiss">
        <IconButton size="small" onClick={onDismiss} sx={{ p: 0.25 }}>
          <CloseRounded sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    )}
  </Box>
);

export const ReviewSection: React.FC = () => {
  const { values, submitForm, isSubmitting, status } =
    useFormikContext<JobValues>();

  const { scrollTo, openJson, submitFlash, clearSubmitFlash, close, checked } =
    useLauncherNavigation();
  const history = useHistory();
  const submission = useSubmission();
  const blockers = useLauncherBlockers();
  // set by the submit-time recheck when it refused a job the debounced list
  // had not caught yet; it describes those values only
  const refused: Array<string> =
    status?.values === values ? status.refused : [];
  const { issues } = useLauncherIssues();
  // Review & Submit rings the list of what is left along with the Submit
  // button: the two are one answer to "can this go yet". Its own count, so
  // the Submit ring clearing does not cut this one short.
  const [boardRing, setBoardRing] = useState(0);
  useEffect(() => {
    if (submitFlash > 0) {
      setBoardRing((ring) => ring + 1);
    }
  }, [submitFlash]);
  // JSONDisplay deep-clones what it is given and re-renders a json viewer, so
  // the preview settles a beat after the last edit instead of on every one.
  const { app } = useJobLauncher();
  const settledValues = useDebouncedValue(values, 300);
  // the preview is a promise about the request body, so it must assemble
  // with the same app-awareness the submit path uses
  // the launcher's own issue shape, said in the board's words: where it lives
  // as a label that goes there, and what is wrong, with no press that
  // changes the form from here
  const boardIssues = useMemo<Array<BoardIssue>>(
    () =>
      issues.map((issue) => ({
        kind: issue.kind,
        key: issue.key,
        where: sectionLabel(issue.sectionId),
        message: issue.message,
        onGo: () => scrollTo(issue.sectionId),
      })),
    [issues, scrollTo]
  );

  const job = useMemo(
    () => assembleJob(settledValues, app),
    [settledValues, app]
  );
  const submittedUuid = submission.data?.result?.uuid ?? '';

  return (
    <div>
      {/* One box, not three. It used to stack 'the job is ready for
          submission' on top of 'submitted job <uuid>', which read as a form
          that had not noticed what it had just done. Whichever state the
          launcher is actually in gets the box. */}
      {submission.isSuccess ? (
        <StatusBox
          tone="success"
          icon={<CheckCircleOutline fontSize="small" />}
          title="Job submitted"
          onDismiss={() => submission.reset()}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Box
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.72rem',
                px: 0.75,
                py: 0.25,
                borderRadius: '4px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              {submittedUuid}
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<OpenInNewRounded sx={{ fontSize: 15 }} />}
              disabled={!submittedUuid}
              onClick={() => {
                close?.();
                history.push(`/jobs/${submittedUuid}`);
              }}
              sx={{ textTransform: 'none', fontSize: '0.72rem' }}
            >
              Open job
            </Button>
            <Button
              size="small"
              onClick={() => submission.reset()}
              sx={{ textTransform: 'none', fontSize: '0.72rem' }}
            >
              Submit another
            </Button>
          </Stack>
        </StatusBox>
      ) : (
        <>
          {/* Green only when there is nothing red. The board below carries
              whatever is left, so this box no longer has to compete with a
              list of problems sitting directly under it. */}
          {!blockers.length && (
            <StatusBox
              tone="success"
              icon={<CheckCircleOutline fontSize="small" />}
              title="The job is ready for submission."
            />
          )}
          {/* One card, two severities. Amber never replaces red: a warning
              does not block a submission and the reader needs to know
              whether anything is wrong first, so the blocking half always
              heads the card. Both halves carry the fix as well as the
              complaint, because the checkbox that would settle it is two
              panes away and being told to go and find it is how these get
              ignored. */}
          <IssueBoard
            issues={boardIssues}
            ring={boardRing}
            blockerHeading={(count) =>
              `${count} thing${
                count > 1 ? 's' : ''
              } to fix before this job can be submitted`
            }
            warningHeading={(count) =>
              `${count} setting${count > 1 ? 's' : ''} will not be sent`
            }
          />
        </>
      )}

      {!!refused.length && (
        <StatusBox
          tone="error"
          icon={<ErrorOutline fontSize="small" />}
          title="The job was not submitted"
        >
          <Typography variant="body2">{refused.join(' ')}</Typography>
        </StatusBox>
      )}

      {submission.error && (
        <StatusBox
          tone="error"
          icon={<ErrorOutline fontSize="small" />}
          title="The job was not submitted"
        >
          <ErrorDetail message={submission.error.message} fontSize="0.875rem" />
        </StatusBox>
      )}

      {/* One control row, not two. Submit had a row of its own with a 16px
          margin under it, then the preview switch had another: on a review
          that already opens with a board of problems, that was two strips of
          chrome between the reader and the request body. They are the same
          row now, with the switch on the left and the press that sends it on
          the right, which is also where the pager's Review & Submit points. */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
        {/* the preview's own way into the editor: the same dialog the head
            line opens, rather than a second copy here, so the same press
            as the head line's JSON. "Edit", not "Paste": it opens with this
            job in it */}
        <Button
          size="small"
          startIcon={<DataObjectRounded sx={{ fontSize: 15 }} />}
          onClick={() => openJson()}
          sx={{ ...HEAD_BTN_SX, '& .MuiButton-startIcon': { mr: 0.5, ml: 0 } }}
        >
          Edit as JSON
        </Button>
        <Box sx={{ flex: 1 }} />
        <Box
          key={`submit-flash-${submitFlash}`}
          {...(submitFlash > 0 ? { 'data-submitflash': submitFlash } : {})}
          onAnimationEnd={submitFlash > 0 ? clearSubmitFlash : undefined}
          sx={{
            display: 'inline-flex',
            flexShrink: 0,
            borderRadius: 1,
            // one slow swell rather than a flash; the key above replays it
            ...(submitFlash > 0 && fadeGlowSx(ACTION_BLUE)),
          }}
        >
          <Button
            variant="contained"
            size="small"
            disabled={
              // green and live on open, corrected a moment later, is exactly
              // backwards for a launch button
              !checked ||
              !!blockers.length ||
              submission.isLoading ||
              submission.isSuccess ||
              isSubmitting
            }
            onClick={() => submitForm()}
            startIcon={
              submission.isLoading ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
            sx={ACTION_BTN_SX}
          >
            Submit Job
          </Button>
        </Box>
      </Stack>

      {/* the same reader the detail pages use for a Tapis record: a light
          collapsible tree with a field count, copy, and the empty fields
          shown here rather than hidden, because this pane's whole promise is
          that it is the request body verbatim. Editing it is the JSON
          editor's job, which opens over whichever step you are on. */}
      <RecordJson
        title="Job Definition"
        json={job}
        defaultEmpty
        // two levels: every section of the job at a glance beside Submit,
        // one press into any of them
        defaultDepth={2}
      />
    </div>
  );
};

export default ReviewSection;
