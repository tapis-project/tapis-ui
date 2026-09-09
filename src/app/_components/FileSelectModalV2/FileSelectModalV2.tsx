/**
 * FileSelectModalV2: the file picker, made to read as one.
 *
 * V1 (tapisui-common's FileSelectModal) is a reactstrap modal around the file
 * explorer: a grey box at a fixed height, a title that is the only
 * instruction, breadcrumbs with nothing between them that ran off the edge,
 * and a single click that OPENS whatever it lands on. For a directory that is
 * right; for a file it meant a preview, which is the one thing a click in a
 * picker should not do. V2 takes the same props and the same listing and
 * changes what is around them:
 *
 *   - the house dialog: a title bar with a close, and the listing in its own
 *     frame at a steady height, so opening a directory never resizes it
 *   - one line saying what a click does, for the kind of choice asked for
 *   - a path bar (PickerPath): Files / system / path, up, and back down
 *   - a click on a file chooses it; a click on a directory opens it
 *   - a footer naming what Select will hand back, before it is pressed
 *   - where a directory may be chosen, Select with nothing picked takes the
 *     directory you are in, which is what "choose a directory" usually means
 *
 * It holds where you are itself, rather than leaving that to the explorer,
 * because the path bar has to be able to move it.
 *
 * Handed to pickers through FileSelectModalProvider, so V1 stays wherever
 * nothing has moved on purpose yet.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { Files } from '@tapis/tapis-typescript';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { CloseRounded, FolderOpenRounded } from '@mui/icons-material';
import {
  FileListing,
  SystemListing,
  type FileSelectModalProps,
} from '@tapis/tapisui-common';
import { ACTION_BTN_SX } from 'app/_components/PageShell/actionButton';
import PickerPath, {
  leadsTo,
  locationPath,
  type PickerLocation,
} from './PickerPath';
import styles from './FileSelectModalV2.module.scss';

const segments = (path?: string) => (path ?? '').split('/').filter(Boolean);

const lastName = (path: string) => segments(path).slice(-1)[0] ?? '/';

/** what a click does here, said once, for the choice being asked for */
export const pickerHint = (
  multi: boolean,
  files: boolean,
  dirs: boolean
): string => {
  const open = 'Click a directory to open it';
  if (multi) {
    if (files && dirs)
      return `${open}, click files to add or remove them, and tick a directory to add it.`;
    if (dirs) return `${open}, and tick the directories you want.`;
    return `${open}, and click files to add or remove them.`;
  }
  if (files && dirs)
    return `${open} and a file to choose it. With nothing chosen, Select takes the directory you are in.`;
  if (dirs) return `${open}, then Select to use the directory you are in.`;
  return `${open} and a file to choose it.`;
};

export const pickerTitle = (
  multi: boolean,
  files: boolean,
  dirs: boolean
): string => {
  if (multi)
    return files && dirs
      ? 'Choose files or directories'
      : dirs
      ? 'Choose directories'
      : 'Choose files';
  return files && dirs
    ? 'Choose a file or directory'
    : dirs
    ? 'Choose a directory'
    : 'Choose a file';
};

const FileSelectModalV2: React.FC<FileSelectModalProps> = ({
  systemId,
  path,
  allowSystemChange,
  onSelect,
  toggle,
  selectMode = { mode: 'single', types: ['file', 'dir'] },
  initialSelection,
}) => {
  const multi = selectMode.mode === 'multi';
  const types = selectMode.types ?? [];
  const files = types.includes('file');
  const dirs = types.includes('dir');

  const [chosen, setChosen] = useState<Array<Files.FileInfo>>(
    initialSelection ?? []
  );
  // where you are, and the deepest place on the way you came
  const [loc, setLoc] = useState<PickerLocation>(() =>
    systemId ? [systemId, ...segments(path)] : []
  );
  const [trail, setTrail] = useState<PickerLocation>(() =>
    systemId ? [systemId, ...segments(path)] : []
  );
  const system = loc[0] ?? null;
  const current = locationPath(loc);
  const ahead = leadsTo(loc, trail) ? trail.slice(loc.length) : [];

  const go = useCallback((next: PickerLocation) => {
    setLoc(next);
    // going up the trail keeps it; a turn anywhere else starts a new one
    setTrail((prev) => (leadsTo(next, prev) ? prev : next));
    setChosen([]);
  }, []);

  // the listing's own ticks (the box, ctrl/⌘ and shift)
  const add = useCallback(
    (picked: Array<Files.FileInfo>) =>
      setChosen((prev) =>
        multi
          ? [
              ...prev,
              ...picked.filter(
                (file) => !prev.some((had) => had.path === file.path)
              ),
            ]
          : picked.slice(0, 1)
      ),
    [multi]
  );
  const remove = useCallback(
    (dropped: Array<Files.FileInfo>) =>
      setChosen((prev) =>
        multi
          ? prev.filter(
              (had) => !dropped.some((gone) => gone.path === had.path)
            )
          : []
      ),
    [multi]
  );

  // a click on a file: choose it, or in a list, take it out again
  const openFile = useCallback(
    (file: Files.FileInfo) => {
      if (!files) return;
      setChosen((prev) => {
        const had = prev.some((one) => one.path === file.path);
        if (!multi) return [file];
        return had
          ? prev.filter((one) => one.path !== file.path)
          : [...prev, file];
      });
    },
    [files, multi]
  );

  // what Select hands back: the choice, or, where one directory may be
  // chosen, the directory you are in
  const answer = useMemo<Array<Files.FileInfo>>(() => {
    if (chosen.length) return chosen;
    if (dirs && !multi && system)
      return [{ name: lastName(current), path: current }];
    return [];
  }, [chosen, dirs, multi, system, current]);

  const choose = () => {
    toggle();
    if (answer.length) onSelect?.(system, answer);
  };

  const footer: { label: string; path?: string } = chosen.length
    ? multi
      ? { label: `${chosen.length} chosen` }
      : { label: 'Chosen', path: chosen[0].path }
    : answer.length
    ? { label: 'This directory', path: answer[0].path }
    : { label: 'Nothing chosen yet' };

  return (
    <Dialog
      open
      onClose={toggle}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 1.5 } }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <FolderOpenRounded sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography sx={{ flex: 1, fontSize: '0.9rem', fontWeight: 600 }}>
          {pickerTitle(multi, files, dirs)}
        </Typography>
        <Tooltip title="Close (Esc)" describeChild>
          <IconButton size="small" aria-label="Close" onClick={toggle}>
            <CloseRounded sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ px: 2, pt: 1, pb: 1.25 }}>
        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
          {system
            ? pickerHint(multi, files, dirs)
            : 'Click a system to open it.'}
        </Typography>
        <PickerPath
          here={loc}
          ahead={ahead}
          allowSystemChange={allowSystemChange}
          onGo={go}
        />
        {system ? (
          <FileListing
            className={styles.listing}
            systemId={system}
            path={current}
            onNavigate={(dir: Files.FileInfo) =>
              dir.name && go([...loc, dir.name])
            }
            // a picker: you are choosing, so one click opens a directory
            openOn="single"
            // and choosing is not an invitation to upload
            dropToUpload={false}
            onOpenFile={openFile}
            onSelect={add}
            onUnselect={remove}
            selectedFiles={chosen}
            fields={['size', 'lastModified']}
            selectMode={selectMode}
            onUp={loc.length > 1 ? () => go(loc.slice(0, -1)) : undefined}
            onTop={() => go([system])}
          />
        ) : (
          <SystemListing
            className={styles.listing}
            onNavigate={(picked) => picked.id && go([picked.id])}
          />
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          noWrap
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: '0.74rem',
            color: answer.length ? 'text.primary' : 'text.disabled',
          }}
        >
          <Box
            component="span"
            sx={{
              color: answer.length ? 'text.secondary' : 'inherit',
              mr: 0.75,
            }}
          >
            {footer.label}
          </Box>
          {footer.path && (
            <Box component="span" sx={{ fontFamily: 'monospace' }}>
              {footer.path}
            </Box>
          )}
        </Typography>
        <Button size="small" onClick={toggle} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          disableElevation
          disabled={!answer.length}
          onClick={choose}
          sx={{ ...ACTION_BTN_SX, textTransform: 'none' }}
        >
          Select
        </Button>
      </Box>
    </Dialog>
  );
};

export default FileSelectModalV2;
