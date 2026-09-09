/**
 * Dropping files onto the listing offers to upload them here.
 *
 * Offers, rather than does. It used to upload on the drop, which is a write
 * to somebody's filesystem on the strength of one gesture — and the gesture
 * that starts it is the same one that begins a drag you meant to cancel. So
 * the drop hands the files to the upload modal the rail already opens, with
 * them already in its list, and the Upload press is the one that writes.
 *
 * Two things it has to get right that a naive drop handler does not:
 *
 *   · a drag has to be a drag OF FILES. The browser fires the same events for
 *     text dragged out of a paragraph, and an explorer that offers to upload
 *     a selected word is worse than one that offers nothing.
 *   · dragenter and dragleave fire for every child the pointer crosses, so a
 *     listing of four hundred rows flickers the overlay all the way down the
 *     page unless the events are counted rather than toggled.
 */
import React, { useCallback, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import {
  CloseRounded,
  ErrorOutlineRounded,
  FileUploadOutlined,
} from '@mui/icons-material';

/** A drag is interesting only if it is carrying files from outside. */
export const dragHasFiles = (transfer: DataTransfer | null): boolean =>
  Array.from(transfer?.types ?? []).includes('Files');

/**
 * The files in a drop, without the directories.
 *
 * A dropped folder arrives as a zero-byte entry the upload would fail on, and
 * webkitGetAsEntry is the only thing that tells them apart — an empty file is
 * also zero bytes, and it is a perfectly reasonable thing to upload.
 */
export const droppedFiles = (transfer: DataTransfer | null): File[] => {
  if (!transfer) return [];
  const items = Array.from(transfer.items ?? []);
  const files = Array.from(transfer.files ?? []);
  if (!items.length || typeof items[0].webkitGetAsEntry !== 'function') {
    return files;
  }
  return files.filter(
    (_, at) => items[at]?.webkitGetAsEntry()?.isFile !== false
  );
};

/** "3 files", "tapisjob.out" — what the overlay offers to do. */
export const dropLabel = (count: number, name?: string): string => {
  if (count === 1) return name ? `Drop to upload ${name}` : 'Drop to upload';
  return `Drop to upload ${count} files`;
};

type DropZoneProps = React.PropsWithChildren<{
  /** named beside the path, because "/" on its own says nothing */
  systemId: string;
  path: string;
  /** false in a picker, where a drop target is an offer to do another job */
  enabled?: boolean;
  /** where the dropped files go: the upload modal, with them already in it */
  onFiles?: (files: File[]) => void;
}>;

const FilesDropZone: React.FC<DropZoneProps> = ({
  systemId,
  path,
  enabled = true,
  onFiles,
  children,
}) => {
  const [over, setOver] = useState(0);
  const [dragging, setDragging] = useState(0);
  const [refused, setRefused] = useState<string | undefined>(undefined);
  // counted, not toggled: every row the pointer crosses fires its own pair
  const depth = useRef(0);
  const live = enabled && Boolean(onFiles);

  const onDragEnter = useCallback(
    (event: React.DragEvent) => {
      if (!live || !dragHasFiles(event.dataTransfer)) return;
      event.preventDefault();
      depth.current += 1;
      setOver(depth.current);
      setDragging(event.dataTransfer.items?.length ?? 0);
    },
    [live]
  );

  const onDragLeave = useCallback(
    (event: React.DragEvent) => {
      if (!live || !dragHasFiles(event.dataTransfer)) return;
      depth.current = Math.max(0, depth.current - 1);
      setOver(depth.current);
    },
    [live]
  );

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      if (!live || !dragHasFiles(event.dataTransfer)) return;
      // without this the browser navigates to the file instead
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    },
    [live]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (!live || !dragHasFiles(event.dataTransfer)) return;
      event.preventDefault();
      depth.current = 0;
      setOver(0);

      const files = droppedFiles(event.dataTransfer);
      if (!files.length) {
        setRefused('Only files can be dropped here, not folders.');
        return;
      }
      setRefused(undefined);
      // nothing is written yet: the modal opens with these in its list and
      // the Upload press in it is what starts the transfer
      onFiles?.(files);
    },
    [live, onFiles]
  );

  if (!live) return <>{children}</>;

  return (
    <Box
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flex: 1,
      }}
    >
      {children}

      {over > 0 && (
        <Box
          data-testid="files-drop-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            // dashed, and over the listing rather than replacing it, so you
            // can still see where you are about to put the thing
            border: '2px dashed #1565c0',
            borderRadius: '4px',
            bgcolor: 'rgba(21,101,192,0.06)',
            pointerEvents: 'none',
          }}
        >
          {/* The words get their own surface. A six-per-cent wash over a
              table of file names is not a background — the rows read
              straight through the label, and the label is the part that has
              to be read. */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              px: 2,
              py: 1.5,
              borderRadius: '6px',
              border: '1px solid',
              borderColor: '#bcd6ef',
              bgcolor: 'background.paper',
              boxShadow: '0 3px 14px rgba(0,0,0,0.16)',
              maxWidth: '90%',
            }}
          >
            <FileUploadOutlined sx={{ fontSize: 24, color: '#1565c0' }} />
            <Typography
              sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1565c0' }}
            >
              {dropLabel(dragging)}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
              opens the upload window — nothing is written yet
            </Typography>
            {/* The system, then the path. At the top of a system the path
                is "/" and on its own it is a slash in a box — which of the
                four systems you have open is the half of the answer that
                was missing. */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 0.5,
                maxWidth: '100%',
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'text.primary',
                  whiteSpace: 'nowrap',
                }}
              >
                {systemId}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  color: 'text.secondary',
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  // the tail is the part that says which directory
                  direction: 'rtl',
                  textAlign: 'left',
                }}
              >
                {path || '/'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {refused && (
        <Box
          sx={{
            mt: 0.5,
            p: 1,
            display: 'flex',
            gap: 0.75,
            alignItems: 'flex-start',
            border: '1px solid',
            borderColor: '#f0c2bb',
            borderRadius: '4px',
            bgcolor: '#fdf3f2',
          }}
        >
          <ErrorOutlineRounded sx={{ fontSize: 16, color: '#c62828' }} />
          <Typography
            sx={{ flex: 1, fontSize: '0.72rem', color: 'text.secondary' }}
          >
            {refused}
          </Typography>
          <Box
            component="button"
            type="button"
            aria-label="Dismiss upload errors"
            onClick={() => setRefused(undefined)}
            sx={{
              border: 'none',
              background: 'none',
              p: 0,
              lineHeight: 0,
              cursor: 'pointer',
              color: 'text.secondary',
              '& svg': { fontSize: 15, display: 'block' },
            }}
          >
            <CloseRounded />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FilesDropZone;
