import React, { useCallback, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PanelResizeHandle, {
  PanelSize,
  readStoredPanelSize,
} from 'app/_components/SectionedPanel/PanelResizeHandle';
import JobLauncherV2, { JobLauncherV2Props } from './JobLauncherV2';

// The launcher as a modal, on the same mechanics as the Settings dialog: the
// panel is the ONLY child, so there is no second title bar or ✕ wrapped around
// it — the panel's own header carries the app name, the blocker count, Submit
// and close. Drag the bottom-right grip to resize; the size is remembered.
const JobLauncherV2Dialog: React.FC<{
  appId: string;
  appVersion: string;
  open?: boolean;
  onClose: () => void;
  /** Open straight on the JSON editor — the 'submit with JSON' path */
  initialJson?: boolean;
  /** Pre-fill from an existing job — the adjust-and-run-again path */
  seedValues?: JobLauncherV2Props['seedValues'];
  seededFrom?: JobLauncherV2Props['seededFrom'];
}> = ({
  appId,
  appVersion,
  open = true,
  onClose,
  initialJson,
  seedValues,
  seededFrom,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [size, setSize] = useState<PanelSize | null>(() =>
    readStoredPanelSize('joblauncher')
  );

  // A job setup is minutes of work and nothing persists it. The guard lives
  // here rather than on the panel's ✕ because the backdrop and Escape close
  // this dialog too, and they lose the work just as thoroughly.
  const unsavedRef = useRef(false);
  const [confirming, setConfirming] = useState(false);
  const guardedClose = useCallback(() => {
    if (unsavedRef.current) {
      setConfirming(true);
      return;
    }
    onClose();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={guardedClose}
      transitionDuration={{ enter: 90, exit: 120 }}
      fullScreen={fullScreen}
      maxWidth={false}
      PaperProps={{
        sx: {
          position: 'relative', // anchors the resize grip
          width:
            size && !fullScreen
              ? `min(${size.w}px, calc(100vw - 24px))`
              : 'min(1100px, calc(100vw - 32px))',
          // Vertical room is the scarce thing in a launcher — a section is a
          // form you scroll. Default to nearly the whole viewport rather than
          // 880px, and let MUI's own paperScrollPaper cap (100% - 64px) go
          // with the smaller margin so the dialog can actually reach it.
          m: 1,
          height: fullScreen
            ? '100%'
            : size
            ? `min(${size.h}px, calc(100vh - 16px))`
            : 'calc(100vh - 16px)',
          maxHeight: 'calc(100vh - 16px)',
          borderRadius: fullScreen ? 0 : '10px',
          overflow: 'hidden',
        },
      }}
    >
      {!fullScreen && (
        <PanelResizeHandle storageKey="joblauncher" onCommit={setSize} />
      )}
      <JobLauncherV2
        appId={appId}
        appVersion={appVersion}
        onClose={guardedClose}
        initialJson={initialJson}
        unsavedRef={unsavedRef}
        seedValues={seedValues}
        seededFrom={seededFrom}
      />
      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontSize: '1rem', pb: 1 }}>
          Discard this job setup?
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <DialogContentText sx={{ fontSize: '0.85rem' }}>
            You have changes that have not been submitted. Closing the launcher
            throws them away — nothing here is saved as a draft.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            onClick={() => setConfirming(false)}
            sx={{ textTransform: 'none' }}
          >
            Keep editing
          </Button>
          <Button
            size="small"
            color="error"
            variant="contained"
            onClick={() => {
              setConfirming(false);
              onClose();
            }}
            sx={{ textTransform: 'none' }}
          >
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default JobLauncherV2Dialog;
