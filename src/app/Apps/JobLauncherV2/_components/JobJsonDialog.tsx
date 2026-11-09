import React, { useState } from 'react';
import { useFormikContext } from 'formik';
import { Jobs } from '@tapis/tapis-typescript';
import { Box, Dialog, IconButton, Tooltip, Typography } from '@mui/material';
import { CloseRounded, DataObjectRounded } from '@mui/icons-material';
import { useJobLauncher } from '@tapis/tapisui-common';
import JsonEditor from 'app/_components/JsonEditor';
import { assembleJob } from './utils';
import { keepFixedRows } from './fixedRows';

type JobValues = Partial<Jobs.ReqSubmitJob>;

const requireObject = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? undefined
    : 'A job is a JSON object';

const TITLE = 'Edit the job as JSON';

/**
 * The job as it stands, to read, edit or replace. Updating fills in the
 * steps; it never submits on its own, so whatever lands here meets the same
 * blockers as the form. The press stays grey until the text says something
 * different from the job it opened with, so a stray press cannot rewrite
 * the form.
 */
const JsonBody: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const { values, setValues } = useFormikContext<JobValues>();
  const { app } = useJobLauncher();
  // what it opened with, held still: the form does not move under an editor
  const [job] = useState<JobValues>(() => assembleJob(values, app));

  return (
    <>
      <Typography
        sx={{
          mb: 1.25,
          fontSize: '0.8rem',
          lineHeight: 1.55,
          color: 'text.secondary',
        }}
      >
        Your current job is loaded below. What you change here goes into the job
        you submit, including settings the steps don&apos;t show.
      </Typography>
      <JsonEditor<JobValues>
        value={job}
        placeholder="Paste a job here"
        applyLabel="Update the steps"
        applyHint="Puts this job into the steps. Nothing is sent until you submit.  ·  ⌘↵"
        validate={requireObject}
        onApply={(next) => {
          // the editor shows the job as submitted, FIXED rows left out;
          // the form keeps showing them
          setValues(keepFixedRows(next, values, app));
          onDone();
        }}
      />
    </>
  );
};

/**
 * The launcher's JSON editor, in a dialog of its own over the launcher: the
 * head line's JSON press, ⌘J and Review's Edit as JSON all open it. It never
 * moves you: Esc or the ✕ and you are on the step you left. (A sheet over
 * the step was tried beside it; the user picked this.)
 */
const JobJsonDialog: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
    PaperProps={{
      'aria-label': TITLE,
      // keys typed here must not page the steps behind it; Esc is the
      // dialog's own
      onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Escape') {
          event.stopPropagation();
        }
      },
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <DataObjectRounded sx={{ fontSize: 18, color: 'text.secondary' }} />
      <Typography sx={{ flex: 1, fontSize: '0.9rem', fontWeight: 600 }}>
        {TITLE}
      </Typography>
      <Tooltip title="Close (Esc)" describeChild>
        <IconButton size="small" aria-label="Close JSON" onClick={onClose}>
          <CloseRounded sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
    <Box sx={{ px: 2, py: 1.5 }}>
      <JsonBody onDone={onClose} />
    </Box>
  </Dialog>
);

export default JobJsonDialog;
