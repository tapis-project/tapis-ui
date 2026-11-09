/**
 * The system's files, browsed in place — the same bargain the job page
 * makes with its output directory. The full Files-page feature set (the
 * icon rail, the path bar with its own trail, drop-to-upload, selection,
 * and the complete keyboard while the pointer or focus is in here) without
 * leaving the system you were reading about.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { FileListing, SystemProvider } from '@tapis/tapisui-common';
import ToolbarV2 from 'app/Files/_components/Toolbar/ToolbarV2';
import {
  FilesProvider,
  useFilesSelect,
} from 'app/Files/_components/FilesContext';
import FilesBreadcrumbs, {
  useFilesNavigation,
} from 'app/Files/_components/FilesBreadcrumbs';
import { useDropUpload } from 'app/Files/_components/useDropUpload';
import { explorerFit } from 'app/_components/PageShell/viewPrefs';
import { usePinnedCap } from 'app/_components/PageShell/tableShell';
import shellStyles from 'app/_components/PageShell/PageShell.module.scss';

const Panel: React.FC<{
  systemId: string;
  /** owned by the page, so the card's directory rows can point this */
  path: string;
  onGo: (path: string) => void;
}> = ({ systemId, path, onGo }) => {
  const { select, selectedFiles, unselect, clear } = useFilesSelect();
  // this browser's own trail, so walking around here rewrites nothing on
  // the Files page — and ←/⌫ walk it exactly like the bar's buttons
  const trail = `system:${systemId}`;
  const { back, top, up } = useFilesNavigation(systemId, trail, onGo, path);
  // a drop stages the files in the same upload modal the rail opens
  const { onDropFiles, modal } = useDropUpload(systemId, path);

  // the explorer preference, exactly as the job page wears it: pinned
  // fits the listing into whatever the card above leaves of the window
  // (floored at PIN_EXPLORER_MIN, so a card-heavy page scrolls a little
  // instead of serving a porthole); flow keeps grow-with-the-page
  const pinned = explorerFit.use() === 'pinned';
  const { ref: capRef, cap } = usePinnedCap(pinned, 'explorer');

  // a selection is about the directory it was made in
  useEffect(() => {
    clear();
  }, [path, clear]);

  // The listing's keys are a window-level listener, so they must not run
  // while the rest of a scrolling page owns ↑ and ↓. Engaged = the pointer
  // or the focus is in here.
  const [engaged, setEngaged] = useState(false);
  const hovering = useRef(false);
  const focused = useRef(false);
  const settleEngagement = () =>
    setEngaged(hovering.current || focused.current);

  return (
    <Box
      sx={{ minWidth: 0 }}
      onMouseEnter={() => {
        hovering.current = true;
        settleEngagement();
      }}
      onMouseLeave={() => {
        hovering.current = false;
        settleEngagement();
      }}
      onFocus={() => {
        focused.current = true;
        settleEngagement();
      }}
      onBlur={(event) => {
        focused.current = event.currentTarget.contains(
          event.relatedTarget as Node
        );
        settleEngagement();
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 0.75,
          flexWrap: 'wrap',
          minWidth: 0,
        }}
      >
        <Box sx={{ flex: 1 }} />
        {/* the rail acts on wherever you have walked to */}
        <ToolbarV2 systemId={systemId} currentPath={path} />
      </Box>
      <FilesBreadcrumbs
        systemId={systemId}
        path={path}
        onNavigate={onGo}
        trail={trail}
      />
      <Box
        ref={capRef}
        // says in devtools (and in tests) whether the cap actually engaged
        data-pinned={pinned && cap ? '' : undefined}
        sx={
          pinned && cap
            ? {
                // max, not height: the cap RESERVES space — a directory
                // with three files renders three files tall, and only a
                // listing that outgrows the room scrolls internally
                maxHeight: cap,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                minWidth: 0,
              }
            : { minWidth: 0 }
        }
      >
        <FileListing
          className={pinned && cap ? shellStyles['listing-fill'] : undefined}
          systemId={systemId}
          path={path}
          location={`/files/${systemId}${path}`}
          // a directory is a button that moves this listing rather than a
          // link that leaves for the Files page
          onNavigate={(file) => onGo(file.path ?? '/')}
          keyboard={engaged}
          onBack={back}
          onUp={up}
          onTop={top}
          onDropFiles={onDropFiles}
          selectMode={{ mode: 'multi', types: ['dir', 'file'] }}
          selectedFiles={selectedFiles}
          onSelect={(files) => select(files, 'multi')}
          onUnselect={unselect}
        />
      </Box>
      {modal}
    </Box>
  );
};

const SystemFilesPanel: React.FC<{
  systemId: string;
  path: string;
  onGo: (path: string) => void;
}> = ({ systemId, path, onGo }) => (
  <FilesProvider>
    <SystemProvider systemId={systemId}>
      <Panel systemId={systemId} path={path} onGo={onGo} />
    </SystemProvider>
  </FilesProvider>
);

export default SystemFilesPanel;
