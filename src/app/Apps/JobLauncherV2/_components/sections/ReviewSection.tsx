import React, { useMemo, useState } from 'react';
import { Jobs } from '@tapis/tapis-typescript';
import { useFormikContext } from 'formik';
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  Link,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CheckCircleOutline,
  CloseRounded,
  ContentCopyRounded,
  DoneRounded,
  ErrorOutline,
  ExpandLess,
  ExpandMore,
  OpenInNewRounded,
} from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { JSONDisplay, JSONEditor, useJobLauncher } from '@tapis/tapisui-common';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import { useLauncherNavigation, useSubmission } from '../context';
import { computeBlockers } from '../blockers';
import { assembleJob } from '../utils';
import { useDebouncedValue } from '../hooks';
import { sectionMeta } from './meta';

type JobValues = Partial<Jobs.ReqSubmitJob>;

export const useLauncherBlockers = () => {
  const { values, errors } = useFormikContext<JobValues>();
  const { app, systems } = useJobLauncher();
  // Walking the whole error tree does not need to keep up with typing.
  // Debounced separately — see the note in LauncherPanel.
  const settledValues = useDebouncedValue(values);
  const settledErrors = useDebouncedValue(errors);
  return useMemo(
    () =>
      computeBlockers({
        values: settledValues,
        errors: settledErrors,
        app,
        systems,
      }),
    [settledValues, settledErrors, app, systems]
  );
};

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

const sectionName = (id: string) =>
  sectionMeta.find((section) => section.id === id)?.label ?? id;

export const ReviewSection: React.FC = () => {
  const { values, setValues, submitForm, isSubmitting } =
    useFormikContext<JobValues>();

  const {
    scrollTo,
    jsonMode,
    setJsonMode,
    jsonNonce,
    submitFlash,
    clearSubmitFlash,
    close,
    checked,
  } = useLauncherNavigation();
  const history = useHistory();
  const submission = useSubmission();
  const blockers = useLauncherBlockers();
  // JSONDisplay deep-clones what it is given and re-renders a json viewer, so
  // the preview settles a beat after the last edit instead of on every one.
  const { app } = useJobLauncher();
  const settledValues = useDebouncedValue(values, 300);
  // the preview is a promise about the request body, so it must assemble
  // with the same app-awareness the submit path uses
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
      ) : blockers.length ? (
        <StatusBox
          tone="warning"
          icon={<ErrorOutline fontSize="small" />}
          title={`${blockers.length} thing${
            blockers.length > 1 ? 's' : ''
          } to fix before this job can be submitted`}
        >
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            {blockers.map((blocker) => (
              <li key={`blocker-${blocker.sectionId}-${blocker.label}`}>
                <Typography variant="body2">
                  <Link
                    component="button"
                    type="button"
                    onClick={() => scrollTo(blocker.sectionId)}
                    sx={{ fontWeight: 600 }}
                  >
                    {sectionName(blocker.sectionId)}
                  </Link>
                  {' — '}
                  {blocker.message}
                </Typography>
              </li>
            ))}
          </Box>
        </StatusBox>
      ) : (
        <StatusBox
          tone="success"
          icon={<CheckCircleOutline fontSize="small" />}
          title="The job is ready for submission."
        />
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

      {/* On the right, directly under the header's Review & submit — the
          press that sent you here lands the eye where the real button is,
          and the ring below finishes the hand-off. */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="flex-end"
        sx={{ mb: 2 }}
      >
        <Box
          key={`submit-flash-${submitFlash}`}
          {...(submitFlash > 0 ? { 'data-submitflash': submitFlash } : {})}
          onAnimationEnd={submitFlash > 0 ? clearSubmitFlash : undefined}
          sx={{
            display: 'inline-flex',
            borderRadius: 1,
            ...(submitFlash > 0 && {
              '@keyframes launcherSubmitArrive': {
                '0%': {
                  boxShadow: (theme) =>
                    `0 0 0 4px ${alpha(theme.palette.primary.main, 0.55)}`,
                },
                '100%': { boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
              },
              animation: 'launcherSubmitArrive 900ms ease-out',
            }),
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
          >
            Submit Job
          </Button>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
        <Typography variant="body2" sx={{ flex: 1 }}>
          {!jsonMode
            ? 'The exact request body that will be sent — copy it for the CLI, or to reuse later.'
            : 'Paste a job here and apply it to the form. Anything the sections do not show is carried through untouched.'}
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={jsonMode ? 'json' : 'preview'}
          onChange={(_event, next: 'preview' | 'json' | null) =>
            next && setJsonMode(next === 'json')
          }
        >
          <ToggleButton value="preview" sx={{ py: 0.15, fontSize: 11 }}>
            Preview
          </ToggleButton>
          <ToggleButton value="json" sx={{ py: 0.15, fontSize: 11 }}>
            Paste JSON
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {!jsonMode ? (
        <JSONDisplay json={job} />
      ) : (
        // Paste feeds the FORM rather than submitting on its own: one submit
        // path, and whatever you paste is checked by the same blockers before
        // it can go anywhere. Fields no section renders survive the round trip
        // because they are set straight onto the form values.
        <Box
          key={`json-${jsonNonce}`}
          sx={{
            borderRadius: 1,
            '@keyframes launcherJsonArrive': {
              '0%': {
                boxShadow: (theme) =>
                  `0 0 0 3px ${alpha(theme.palette.primary.main, 0.55)}`,
              },
              '100%': { boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
            },
            animation: 'launcherJsonArrive 900ms ease-out',
          }}
        >
          <JSONEditor
            obj={job}
            renderNewlinesInError
            // long jobs scroll inside the editor; the actions above it stay put
            style={{ maxHeight: '55vh', overflow: 'auto' }}
            actions={[
              {
                name: 'apply to the form',
                disableOnError: true,
                disableOnUndefined: true,
                actionFn: (pasted: JobValues | undefined) => {
                  if (pasted) {
                    setValues(pasted);
                    setJsonMode(false);
                  }
                },
              },
            ]}
          />
        </Box>
      )}
    </div>
  );
};

export default ReviewSection;
