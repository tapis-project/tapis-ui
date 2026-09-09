import React, { useState } from 'react';
import { Dialog, useMediaQuery, useTheme } from '@mui/material';
import SettingsPanel from '../PageSettings/SettingsPanel';
import PanelResizeHandle, {
  PanelSize,
  readStoredPanelSize,
} from 'app/_components/SectionedPanel/PanelResizeHandle';

// Settings as a quick modal (gear menu → Settings). Tall rounded-rectangular
// dialog on desktop, full-screen on phones; the panel inside owns all layout.
// Drag the bottom-right grip to resize — the size is remembered (same
// mechanics as the node detail panel).
const SettingsDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  initialSection?: string;
}> = ({ open, onClose, initialSection }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [size, setSize] = useState<PanelSize | null>(() =>
    readStoredPanelSize('settings')
  );
  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      // MUI's default enter transition (225ms) was most of the perceived
      // open time once the chunk and mount were warmed. Short enough to feel
      // immediate, long enough not to flash.
      transitionDuration={{ enter: 90, exit: 120 }}
      fullScreen={fullScreen}
      maxWidth={false}
      PaperProps={{
        sx: {
          position: 'relative', // anchors the resize grip
          width:
            size && !fullScreen
              ? `min(${size.w}px, calc(100vw - 24px))`
              : 'min(1000px, calc(100vw - 32px))',
          height: fullScreen
            ? '100%'
            : size
            ? `min(${size.h}px, 90vh)`
            : 'min(880px, calc(100vh - 32px))',
          maxHeight: '100%',
          borderRadius: fullScreen ? 0 : '10px',
          overflow: 'hidden',
        },
      }}
    >
      {!fullScreen && (
        <PanelResizeHandle storageKey="settings" onCommit={setSize} />
      )}
      {/* keepAlive + open: sections you've visited stay warm while the
          dialog is up; closing prunes back to one section, so the
          keepMounted dialog never grows a background footprint. */}
      <SettingsPanel
        onClose={onClose}
        initialSection={initialSection}
        keepAlive
        open={open}
      />
    </Dialog>
  );
};

export default SettingsDialog;
