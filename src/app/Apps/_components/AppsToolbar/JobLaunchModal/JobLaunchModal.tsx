import { useState } from 'react';
import { Apps } from '@tapis/tapis-typescript';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { JobLauncher } from '@tapis/tapisui-common';
import JobLauncherV2Dialog from 'app/Apps/JobLauncherV2';

export type ToolbarModalProps = {
  toggle: () => void;
  app: Apps.TapisApp;
};

import {
  Close,
  DataObject,
  RocketLaunch,
  ViewSidebar,
} from '@mui/icons-material';

// the blue the app page's Submit job press wears, so the dialog it opens
// reads as the same act rather than a fresh set of options
const ACCENT = '#1565c0';
const ACCENT_HOVER = '#0d47a1';

// This modal is a chooser and nothing else now: each launcher owns its own
// submission, including the JSON one, which is the launcher's Review pane.
const JobLaunchModal: React.FC<ToolbarModalProps> = ({ toggle, app }) => {
  // 'panel' is the V2 launcher, 'wizard' the original step-by-step one, 'json'
  // is the V2 launcher opened straight onto its JSON editor. The V2 panel has
  // its own header, close and Submit, so it REPLACES this dialog rather than
  // rendering inside it — nesting the two put a "Submit Job" title bar and a
  // second ✕ around a panel that has both.
  type LaunchMode = 'panel' | 'wizard' | 'json';
  const [mode, setMode] = useState<LaunchMode | undefined>(undefined);

  if (mode === 'panel' || mode === 'json') {
    return (
      <JobLauncherV2Dialog
        appId={app.id!}
        appVersion={app.version!}
        onClose={toggle}
        // 'Submit with JSON' lands on the launcher's own JSON pane: same
        // editor, but what you paste is measured by the same blockers before
        // it can be submitted, and the rest of the job is one click away
        initialJson={mode === 'json'}
      />
    );
  }

  return (
    <Dialog
      open={true}
      onClose={() => {
        toggle();
      }}
      aria-labelledby="Submit Job"
      aria-describedby="A modal for submitting a job"
      maxWidth={false} // disables the default maxWidth constraints
      fullWidth={false} // prevents auto-stretching to 100%
      PaperProps={{
        style: { width: 'auto' }, // optional, helps content dictate width
      }}
    >
      <DialogTitle id="dialog-title">
        Submit Job
        <IconButton
          aria-label="close"
          onClick={toggle}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {mode === undefined && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              minWidth: '22rem',
            }}
          >
            {/* Three identical outlined buttons said these were three equal
                choices, which is not what we think: v2 is the launcher we
                keep. It is the same button as the other two, filled with the
                blue the app page's Submit job press wears, so the dialog
                reads as the same act rather than a fresh set of options. */}
            <Button
              variant="contained"
              onClick={() => {
                setMode('panel');
              }}
              size="large"
              startIcon={<ViewSidebar />}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                bgcolor: ACCENT,
                '&:hover': { bgcolor: ACCENT_HOVER },
              }}
            >
              Guided job launcher (v2)
            </Button>
            <Button
              variant={'outlined'}
              onClick={() => {
                setMode('wizard');
              }}
              size="large"
              startIcon={<RocketLaunch />}
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
            >
              Use guided job launcher (v1)
            </Button>
            <Button
              variant={'outlined'}
              onClick={() => {
                setMode('json');
              }}
              size="large"
              startIcon={<DataObject />}
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
            >
              Submit with JSON
            </Button>
          </div>
        )}
        {mode === 'wizard' && (
          <div style={{ display: 'block', width: '80vw' }}>
            <JobLauncher appId={app.id!} appVersion={app.version!} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobLaunchModal;
