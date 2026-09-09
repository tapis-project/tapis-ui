/**
 * Looking at a file, without leaving the directory it is in.
 *
 * The viewer was an xl bootstrap modal: a black backdrop over the whole app,
 * an empty title bar, a fixed 500px iframe, and no way to tell what you were
 * looking at beyond remembering what you had clicked.
 *
 * This is a window. It floats over the listing without blacking it out, you
 * can move it by its title bar and resize it from any edge, and it remembers
 * where you left it. It says which file, how big, when it changed, and lets
 * you rename or download it from there.
 *
 * The other thing it fixes: .sh, .py and every other script used to DOWNLOAD
 * instead of opening. The frame followed the service's Content-Disposition,
 * which is `attachment` for anything it will not vouch for, so pressing View
 * on a submit script silently put a file in ~/Downloads. Text is fetched and
 * rendered here now, so what opens is what you asked to look at.
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { Files } from '@tapis/tapis-typescript';
import {
  Box,
  Button,
  CircularProgress,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CheckRounded,
  CloseRounded,
  DownloadRounded,
  DriveFileRenameOutlineRounded,
  FormatColorTextRounded,
  FormatListNumberedRounded,
  KeyboardArrowLeftRounded,
  KeyboardArrowRightRounded,
  OpenInNewRounded,
  RefreshRounded,
  WrapTextRounded,
} from '@mui/icons-material';
import sizeFormat from '../../../utils/sizeFormat';
import { fileExtension, fileKind, KIND_COLOR, KIND_LABEL } from './fileKind';
import { modifiedLabel } from './FileListingTableV2';
import {
  ANSI_LABEL,
  ANSI_MODES,
  getViewerAnsi,
  getViewerLineNumbers,
  getViewerWrap,
  setViewerAnsi,
  setViewerLineNumbers,
  setViewerWrap,
  subscribeListingPrefs,
  getViewerBinaryView,
} from './listingPrefs';
import { AnsiSegment, parseAnsi, splitAnsiLines, stripAnsi } from './ansi';
import BinaryView from './BinaryView';
import { imageFormat, isElf } from './elf';
import {
  FilesErrorExplanation,
  explainFilesError,
  filesErrorSummary,
  tapisErrorMessage,
} from './FilesError';

/** The service refuses to serve more than this through a PostIt anyway. */
export const MAX_VIEWABLE_BYTES = 50_000_000;

/** Past this the browser starts to struggle laying the text out. */
export const MAX_TEXT_CHARS = 400_000;

/**
 * How big the window gets when all it has to say is one short paragraph.
 *
 * A 1080×760 frame around "Too big to open here" is mostly empty paper. The
 * stored geometry is left alone — this only changes what is drawn, so the
 * window you sized for reading a log is still that size the next time there
 * is a log in it.
 */
export const NOTE_WIDTH = 520;
export const NOTE_HEIGHT = 260;

export const noteGeometry = (geometry: Geometry): Geometry => ({
  ...geometry,
  width: Math.min(geometry.width, NOTE_WIDTH),
  height: Math.min(geometry.height, NOTE_HEIGHT),
});

const FRAME_EXTENSIONS = ['pdf', 'html', 'htm', 'svg'];

export type ViewerMode = 'image' | 'frame' | 'text' | 'binary' | 'opaque';

/**
 * Bytes that are not text.
 *
 * A NUL in the first few kilobytes is the test every tool uses, because no
 * text encoding anyone browses puts one there and every compiled format
 * does. It matters here because extension is only a guess: a binary called
 * `a.out`, or called nothing at all, took the text path and arrived as a
 * screenful of mojibake starting `ELF>`.
 */
export const looksBinary = (bytes: Uint8Array): boolean => {
  if (isElf(bytes)) return true;
  const window = Math.min(bytes.length, 8192);
  for (let at = 0; at < window; at += 1) if (bytes[at] === 0) return true;
  return false;
};

/**
 * How to show it.
 *
 * Text is fetched and printed rather than framed: a frame obeys the response's
 * Content-Disposition, and the files service sends `attachment` for anything
 * it does not recognise — which is every script anyone actually wants to read.
 */
export const viewerMode = (file: Files.FileInfo): ViewerMode => {
  const kind = fileKind(file);
  if (kind === 'image') return 'image';
  if (FRAME_EXTENSIONS.includes(fileExtension(file.name))) return 'frame';
  if (kind === 'binary') return 'binary';
  if (kind === 'archive') return 'opaque';
  return 'text';
};

const GEOMETRY_KEY = 'files.viewer.window';
const MIN_WIDTH = 360;
const MIN_HEIGHT = 240;

export type Geometry = { x: number; y: number; width: number; height: number };

/** Centred, and big enough to read a job log on a large screen. */
export const defaultGeometry = (
  viewportWidth: number,
  viewportHeight: number
): Geometry => {
  const width = Math.max(MIN_WIDTH, Math.min(1080, viewportWidth * 0.72));
  const height = Math.max(MIN_HEIGHT, Math.min(760, viewportHeight * 0.78));
  return {
    width,
    height,
    x: Math.round((viewportWidth - width) / 2),
    y: Math.round((viewportHeight - height) / 2),
  };
};

/** Never off-screen, never smaller than readable, never bigger than the window. */
export const clampGeometry = (
  geometry: Geometry,
  viewportWidth: number,
  viewportHeight: number
): Geometry => {
  const width = Math.min(
    Math.max(geometry.width, MIN_WIDTH),
    Math.max(MIN_WIDTH, viewportWidth)
  );
  const height = Math.min(
    Math.max(geometry.height, MIN_HEIGHT),
    Math.max(MIN_HEIGHT, viewportHeight)
  );
  return {
    width,
    height,
    // 40px of title bar always reachable, so a window cannot be lost
    x: Math.min(Math.max(geometry.x, -width + 80), viewportWidth - 80),
    y: Math.min(Math.max(geometry.y, 0), viewportHeight - 40),
  };
};

/**
 * The geometry a window should actually be given, as opposed to the one it
 * was last dragged to.
 *
 * clampGeometry is the rule while you are dragging, and it deliberately lets
 * a window hang most of the way off an edge as long as some of its title bar
 * is reachable. That is wrong for restoring one: a window saved on a large
 * monitor and reopened on a laptop would come back mostly off the screen, or
 * bigger than the screen. So restoring — and resizing the browser under an
 * open window — shrinks it to fit and pulls it entirely into view.
 */
export const fitGeometry = (
  geometry: Geometry,
  viewportWidth: number,
  viewportHeight: number
): Geometry => {
  const width = Math.min(Math.max(geometry.width, MIN_WIDTH), viewportWidth);
  const height = Math.min(
    Math.max(geometry.height, MIN_HEIGHT),
    viewportHeight
  );
  return {
    width,
    height,
    x: Math.min(Math.max(geometry.x, 0), Math.max(0, viewportWidth - width)),
    y: Math.min(Math.max(geometry.y, 0), Math.max(0, viewportHeight - height)),
  };
};

const readGeometry = (): Geometry => {
  const fallback = defaultGeometry(window.innerWidth, window.innerHeight);
  try {
    const stored = window.localStorage.getItem(GEOMETRY_KEY);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    if (
      typeof parsed?.x !== 'number' ||
      typeof parsed?.y !== 'number' ||
      typeof parsed?.width !== 'number' ||
      typeof parsed?.height !== 'number'
    ) {
      return fallback;
    }
    return fitGeometry(parsed, window.innerWidth, window.innerHeight);
  } catch {
    return fallback;
  }
};

const Chip: React.FC<React.PropsWithChildren<{ title?: string }>> = ({
  title,
  children,
}) => {
  const chip = (
    <Box
      component="span"
      sx={{
        fontSize: '0.65rem',
        color: 'text.secondary',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '4px',
        px: 0.5,
        py: '1px',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Box>
  );
  return title ? <Tooltip title={title}>{chip}</Tooltip> : chip;
};

const BarButton: React.FC<
  React.PropsWithChildren<{
    label: string;
    title: string;
    href?: string;
    download?: boolean;
    disabled?: boolean;
    pressed?: boolean;
    onClick?: () => void;
  }>
> = ({
  label,
  title,
  href,
  download,
  disabled,
  pressed,
  onClick,
  children,
}) => (
  <Tooltip title={title}>
    <span>
      <Box
        component={href ? 'a' : 'button'}
        {...(href
          ? {
              href,
              target: download ? undefined : '_blank',
              rel: 'noreferrer',
              download,
            }
          : { type: 'button', onClick, disabled })}
        aria-label={label}
        {...(pressed === undefined ? {} : { 'aria-pressed': pressed })}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          p: '3px',
          borderRadius: '4px',
          cursor: disabled ? 'default' : 'pointer',
          // pressed is ink and a grey fill, the same as every other switch in
          // this app that is on most of the time
          background: pressed ? 'rgba(0,0,0,0.09)' : 'none',
          color: disabled
            ? 'text.disabled'
            : pressed
            ? 'text.primary'
            : 'text.secondary',
          '&:hover': disabled
            ? {}
            : { bgcolor: 'rgba(0,0,0,0.06)', color: 'text.primary' },
          '& svg': { fontSize: 16 },
        }}
      >
        {children}
      </Box>
    </span>
  </Tooltip>
);

type DragState =
  | { kind: 'move'; startX: number; startY: number; from: Geometry }
  | {
      kind: 'resize';
      edge: 'e' | 's' | 'se' | 'w' | 'sw';
      startX: number;
      startY: number;
      from: Geometry;
    }
  | null;

const FileViewerPanel: React.FC<{
  systemId: string;
  file: Files.FileInfo;
  onClose: () => void;
  /** the directory the file is in, so a rename knows where to put it back */
  path?: string;
  /** told after a successful rename, so the listing can refetch */
  onRenamed?: (newName: string) => void;
  /**
   * Walk to the file before or after this one, in the order the listing is
   * showing them. Reading a directory of job output is a sequence, and
   * closing the window to pick the next one is the wrong shape for that.
   *
   * Left and right rather than up and down, because up and down are what a
   * page of text is read with and the viewer is usually full of one.
   */
  onStep?: (delta: number) => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  /**
   * The file cannot be read at all, and the window should never have opened.
   *
   * A file you have no permission to read is not a viewer state — the
   * listing around it is fine and the window has nothing to put in itself.
   * The owner takes this, shuts the window and says so in passing instead.
   */
  onUnavailable?: (problem: {
    explanation: FilesErrorExplanation;
    message: string;
  }) => void;
}> = ({
  systemId,
  file,
  onClose,
  path,
  onRenamed,
  onStep,
  onUnavailable,
  hasPrevious,
  hasNext,
}) => {
  const [geometry, setGeometry] = useState<Geometry>(readGeometry);
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [text, setText] = useState<string | undefined>(undefined);
  const [bytes, setBytes] = useState<Uint8Array | undefined>(undefined);
  // the bytes turned out to be a picture, whatever the name said
  const [sniffedImage, setSniffedImage] = useState(false);
  const [textError, setTextError] = useState<string | undefined>(undefined);
  // the headline the detail belongs under, when the chain was one we know
  const [textErrorTitle, setTextErrorTitle] = useState<string | undefined>(
    undefined
  );
  const wrap = useSyncExternalStore(subscribeListingPrefs, getViewerWrap);
  const lineNumbers = useSyncExternalStore(
    subscribeListingPrefs,
    getViewerLineNumbers
  );
  const ansi = useSyncExternalStore(subscribeListingPrefs, getViewerAnsi);
  const binaryView = useSyncExternalStore(
    subscribeListingPrefs,
    getViewerBinaryView
  );
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(file.name ?? '');
  const drag = useRef<DragState>(null);
  const textRef = useRef<HTMLElement | null>(null);

  const { create, isLoading, isError, error } = Hooks.PostIts.useCreate();
  const { move, isLoading: renameLoading } = Hooks.useMove();

  const kind = fileKind(file);
  const mode = viewerMode(file);
  const tooBig = (file.size ?? 0) > MAX_VIEWABLE_BYTES;
  // "zero bytes" is the LISTING's claim, not a verified fact — the size can
  // be stale while something writes, and a refused read hides behind it.
  // Read-it-anyway drops the gate and lets the real fetch settle it.
  const [forceRead, setForceRead] = useState(false);
  const empty = file.size === 0 && !forceRead;
  // the fetch came back and the file really is empty — say verified, not sorry
  const verifiedEmpty = forceRead && text !== undefined && text.length === 0;

  // Nothing to read: a sentence and a way out. The window shrinks to fit it
  // rather than framing it in an acre of white.
  const note =
    tooBig ||
    empty ||
    verifiedEmpty ||
    mode === 'opaque' ||
    isError ||
    Boolean(textError);
  const shown = note ? noteGeometry(geometry) : geometry;

  const mint = useCallback(() => {
    if (!file.path || tooBig || empty) return;
    setUrl(undefined);
    setText(undefined);
    setBytes(undefined);
    setSniffedImage(false);
    setTextError(undefined);
    setTextErrorTitle(undefined);
    create(
      {
        systemId,
        path: file.path,
        createPostItRequest: {
          // one for the frame or the fetch, and a few spare so Open-in-tab
          // and Download in the same sitting do not each need a new link
          allowedUses: 5,
          validSeconds: 300,
        },
      },
      { onSuccess: (value) => setUrl(value.result?.redeemUrl) }
    );
    // create is a fresh identity every render, so it is deliberately not a dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemId, file.path, tooBig, empty]);

  // picking another file in the listing swaps the contents rather than
  // needing the window closed and reopened
  useEffect(() => {
    setRenaming(false);
    setDraftName(file.name ?? '');
    mint();
  }, [mint, file.name]);
  useEffect(() => {
    setForceRead(false);
    // a new file starts from its listing size again
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.path]);

  /**
   * What went wrong, said in words rather than in a status code.
   *
   * The refusal that brings people here is a unix permission on the file,
   * and it used to read "Could not fetch this file / 500 from the file" —
   * the status of a response whose body was three sentences saying exactly
   * which user was refused on which host. So the body is read, and if it is
   * one of the failures the error panel already knows how to explain, the
   * window bows out and lets the caller say so instead.
   */
  const report = useCallback(
    (body: string | undefined, fallback: string) => {
      const message = body ? tapisErrorMessage(body) : undefined;
      const explanation = explainFilesError(message);
      if (explanation && message) {
        onUnavailable?.({ explanation, message });
        // still shown, for a caller that has nowhere to put a notice
        const said = filesErrorSummary(
          explanation,
          file.name ?? 'this file',
          systemId
        );
        setTextErrorTitle(said.title);
        setTextError(said.detail);
        return;
      }
      setTextErrorTitle(undefined);
      setTextError(message ?? fallback);
    },
    [onUnavailable, file.name, systemId]
  );

  /**
   * Read here rather than framed — see viewerMode.
   *
   * As bytes, not as text, because extension is a guess and the guess is
   * wrong often enough to matter: a compiled program with no extension took
   * the text path and arrived as a screenful of mojibake. The bytes decide,
   * and only the ones that are text get decoded as text.
   */
  useEffect(() => {
    if (!url || (mode !== 'text' && mode !== 'binary')) return;
    let live = true;
    fetch(url)
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.text().catch(() => undefined);
          if (live) report(body, `${response.status} from the file`);
          return undefined;
        }
        return response.arrayBuffer();
      })
      .then((buffer) => {
        if (!live || buffer === undefined) return;
        const read = new Uint8Array(buffer);
        if (read.length === 0) {
          // the listing's size was stale or wrong; the file really is empty
          setText('');
          return;
        }
        // A picture is a picture whatever it is called. This is the case
        // that made the sniffing necessary and the one it must not get
        // wrong: a .png the service reported as OTHER, or a plot written
        // without an extension, is not a thing to run `strings` over.
        if (imageFormat(read)) {
          setSniffedImage(true);
          return;
        }
        if (mode === 'binary' || looksBinary(read)) {
          setBytes(read);
          return;
        }
        setText(
          new TextDecoder()
            .decode(read.subarray(0, MAX_TEXT_CHARS))
            .slice(0, MAX_TEXT_CHARS)
        );
      })
      .catch((problem: Error) => {
        if (live) report(undefined, problem.message);
      });
    return () => {
      live = false;
    };
  }, [url, mode, report]);

  /**
   * An image or a frame fails silently — there is no response to read,
   * only an onError. Asking for the same URL once it has already failed
   * costs nothing in the case that matters and gives the same sentence.
   */
  const readFailure = useCallback(() => {
    if (!url) return;
    fetch(url)
      .then((response) => response.text())
      .then((body) => report(body, 'The file could not be read'))
      .catch(() => report(undefined, 'The file could not be read'));
  }, [url, report]);

  // A window left where it was on a bigger screen is off this one. Same on
  // the way down: shrink the browser and the window follows rather than
  // hanging over the edge. Not persisted — the size you chose for a large
  // monitor should still be there when you are back on one.
  useEffect(() => {
    const onResize = () =>
      setGeometry((current) =>
        fitGeometry(current, window.innerWidth, window.innerHeight)
      );
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── move and resize ───────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const state = drag.current;
      if (!state) return;
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      const next =
        state.kind === 'move'
          ? { ...state.from, x: state.from.x + dx, y: state.from.y + dy }
          : {
              ...state.from,
              width:
                state.edge === 'w' || state.edge === 'sw'
                  ? state.from.width - dx
                  : state.edge === 'e' || state.edge === 'se'
                  ? state.from.width + dx
                  : state.from.width,
              // dragging the left edge moves the window as it resizes it
              x:
                state.edge === 'w' || state.edge === 'sw'
                  ? state.from.x + dx
                  : state.from.x,
              height:
                state.edge === 'e' ? state.from.height : state.from.height + dy,
            };
      setGeometry(clampGeometry(next, window.innerWidth, window.innerHeight));
    };
    const onUp = () => {
      if (!drag.current) return;
      drag.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setGeometry((current) => {
        try {
          window.localStorage.setItem(GEOMETRY_KEY, JSON.stringify(current));
        } catch {
          /* it still holds for this visit */
        }
        return current;
      });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const startDrag = (state: NonNullable<DragState>, cursor: string) => {
    drag.current = state;
    document.body.style.cursor = cursor;
    document.body.style.userSelect = 'none';
  };

  // Focus what you came to read, so up and down scroll it from the moment
  // the window opens rather than after a click nobody thinks to make.
  useEffect(() => {
    if (!renaming) textRef.current?.focus();
  }, [renaming, url, text, mode]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !renaming) {
        onClose();
        return;
      }
      if (renaming || !onStep) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      // Up and down belong to the text — the pane is focused on open so they
      // scroll it straight away. Left and right walk the directory, and are
      // swallowed so they do not also drag a wide line sideways.
      const focused = document.activeElement as HTMLElement | null;
      if (
        focused?.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }

      const delta = event.key === 'ArrowLeft' ? -1 : 1;
      if (delta < 0 ? !hasPrevious : !hasNext) return;
      event.preventDefault();
      onStep(delta);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, renaming, onStep, hasPrevious, hasNext]);

  const commitRename = () => {
    const name = draftName.trim();
    if (!name || name === file.name || !file.path) {
      setRenaming(false);
      setDraftName(file.name ?? '');
      return;
    }
    const directory = path ?? file.path.slice(0, file.path.lastIndexOf('/'));
    move(
      {
        systemId,
        path: file.path,
        newPath: `${directory}/${name}`.replace('//', '/'),
      },
      {
        onSuccess: () => {
          setRenaming(false);
          onRenamed?.(name);
        },
      }
    );
  };

  const edge = (
    key: 'e' | 's' | 'se' | 'w' | 'sw',
    cursor: string,
    sx: Record<string, unknown>
  ) => (
    <Box
      role="separator"
      aria-label={`Resize viewer ${key}`}
      onMouseDown={(event: React.MouseEvent) =>
        startDrag(
          {
            kind: 'resize',
            edge: key,
            startX: event.clientX,
            startY: event.clientY,
            // from what is drawn, not what is stored, or a note-sized window
            // would leap to its full size on the first pixel of a drag
            from: shown,
          },
          cursor
        )
      }
      sx={{ position: 'absolute', cursor, zIndex: 1, ...sx }}
    />
  );

  const body = useMemo(() => {
    if (tooBig) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
            Too big to open here
          </Typography>
          <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary' }}>
            {sizeFormat(file.size ?? 0)} is over the{' '}
            {sizeFormat(MAX_VIEWABLE_BYTES)} the viewer will fetch. Download it,
            or read it on the system.
          </Typography>
        </Box>
      );
    }
    if (empty) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
            Nothing to show — probably
          </Typography>
          <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary' }}>
            The listing says zero bytes, so the viewer did not fetch it. That
            can lag a file still being written — or hide a read the host would
            refuse.
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setForceRead(true)}
            sx={{
              mt: 1,
              textTransform: 'none',
              fontSize: '0.72rem',
              borderRadius: '5px',
              px: 1,
              py: '2px',
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)',
                borderColor: 'text.disabled',
              },
            }}
          >
            Read it anyway
          </Button>
        </Box>
      );
    }
    if (verifiedEmpty) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
            Verified empty
          </Typography>
          <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary' }}>
            Read just now — the file really is zero bytes on the host, not a
            stale listing and not a refused read.
          </Typography>
        </Box>
      );
    }
    if (isError || textError) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: textErrorTitle ? '#a35c00' : '#c62828',
            }}
          >
            {textErrorTitle ?? 'Could not fetch this file'}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.72rem',
              color: 'text.secondary',
              wordBreak: 'break-word',
            }}
          >
            {textError ?? (error as Error)?.message}
          </Typography>
        </Box>
      );
    }
    if (mode === 'opaque') {
      return (
        <Box sx={{ p: 2 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
            Not something to read
          </Typography>
          <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary' }}>
            {KIND_LABEL[kind]} files have nothing to show on screen. Download it
            to open it with something that understands it.
          </Typography>
        </Box>
      );
    }
    // Whatever the extension said, the bytes decide — a compiled program
    // called nothing in particular came down the text path and was printed
    // as a screenful of mojibake starting `ELF>`.
    if (bytes && !sniffedImage) {
      return (
        <BinaryView
          bytes={bytes}
          kindLabel={KIND_LABEL[kind]}
          view={binaryView}
        />
      );
    }

    if (
      !url ||
      ((mode === 'text' || mode === 'binary') &&
        text === undefined &&
        bytes === undefined &&
        !sniffedImage)
    ) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            height: '100%',
          }}
        >
          <CircularProgress size={16} />
          <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary' }}>
            {isLoading
              ? 'minting a short-lived link'
              : mode === 'binary'
              ? 'reading and decoding the file'
              : 'reading the file'}
          </Typography>
        </Box>
      );
    }
    if (mode === 'image' || sniffedImage) {
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            bgcolor: '#f4f4f2',
          }}
        >
          <Box
            component="img"
            alt={file.name}
            src={url}
            onError={readFailure}
            sx={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        </Box>
      );
    }
    if (mode === 'frame') {
      return (
        <Box
          component="iframe"
          title={`Contents of ${file.name}`}
          src={url}
          sx={{ width: '100%', height: '100%', border: 'none' }}
        />
      );
    }
    const truncated = Boolean(text && text.length >= MAX_TEXT_CHARS);
    const tail = truncated ? (
      <Box
        component="div"
        sx={{ color: 'text.secondary', pt: 1, fontStyle: 'italic' }}
      >
        {`— showing the first ${MAX_TEXT_CHARS.toLocaleString()} characters. Download it for the rest. —`}
      </Box>
    ) : null;

    // ── what the escape codes become ────────────────────────────────
    // strip is a single regex pass and keeps the whole body one text node;
    // render costs an element per run of colour, so it is opt-in
    const styleOf = (segment: AnsiSegment): React.CSSProperties => ({
      color: segment.style.color,
      backgroundColor: segment.style.background,
      fontWeight: segment.style.bold ? 700 : undefined,
      opacity: segment.style.dim ? 0.62 : undefined,
      fontStyle: segment.style.italic ? 'italic' : undefined,
      textDecoration: segment.style.underline ? 'underline' : undefined,
    });

    const paint = (segments: Array<AnsiSegment>) =>
      segments.map((segment, index) => (
        <span key={index} style={styleOf(segment)}>
          {segment.text}
        </span>
      ));

    const shell = {
      m: 0,
      height: '100%',
      overflow: 'auto',
      p: 1.25,
      fontFamily: 'monospace',
      fontSize: '0.72rem',
      lineHeight: 1.55,
      bgcolor: '#fcfcfb',
    } as const;

    const plain =
      ansi === 'raw'
        ? text ?? ''
        : ansi === 'strip'
        ? stripAnsi(text ?? '')
        : '';

    if (!lineNumbers) {
      return (
        <Box
          component="pre"
          data-testid="file-viewer-text"
          ref={textRef}
          tabIndex={0}
          sx={{
            ...shell,
            whiteSpace: wrap ? 'pre-wrap' : 'pre',
            outline: 'none',
          }}
        >
          {ansi === 'render' ? paint(parseAnsi(text ?? '')) : plain}
          {tail}
        </Box>
      );
    }

    const lines: Array<Array<AnsiSegment>> =
      ansi === 'render'
        ? splitAnsiLines(parseAnsi(text ?? ''))
        : plain.split('\n').map((line) => [{ text: line, style: {} }]);
    const gutter = `${String(lines.length).length}ch`;
    return (
      <Box
        data-testid="file-viewer-text"
        ref={textRef}
        tabIndex={0}
        sx={{
          ...shell,
          outline: 'none',
          // one flex row per line, so a wrapped line keeps its number beside
          // its first row rather than drifting out of step with a gutter
          '& .tfl-code-line': { display: 'flex', gap: 1 },
          '& .tfl-code-n': {
            flex: `0 0 ${gutter}`,
            textAlign: 'right',
            color: 'text.disabled',
            userSelect: 'none',
          },
          '& .tfl-code-t': {
            flex: 1,
            minWidth: 0,
            whiteSpace: wrap ? 'pre-wrap' : 'pre',
            wordBreak: wrap ? 'break-word' : 'normal',
          },
        }}
      >
        {lines.map((segments, index) => (
          <div className="tfl-code-line" key={index}>
            <span className="tfl-code-n">{index + 1}</span>
            <span className="tfl-code-t">
              {segments.length ? paint(segments) : ' '}
            </span>
          </div>
        ))}
        {tail}
      </Box>
    );
    // Every branch above reads from this list. The bytes especially: they
    // arrive after the text ones do, and a memo that does not name them
    // holds the loading spinner on screen over a file it has already read.
  }, [
    tooBig,
    empty,
    verifiedEmpty,
    forceRead,
    isError,
    textError,
    error,
    mode,
    url,
    text,
    bytes,
    sniffedImage,
    binaryView,
    isLoading,
    file.name,
    file.size,
    kind,
    wrap,
    lineNumbers,
    ansi,
  ]);

  return (
    <Box
      role="dialog"
      aria-label={`Viewing ${file.name}`}
      sx={{
        position: 'fixed',
        left: shown.x,
        top: shown.y,
        width: shown.width,
        height: shown.height,
        zIndex: 1250,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '6px',
        overflow: 'hidden',
        // a shadow, not a blackout: the directory behind stays readable and
        // stays clickable, which is the entire point
        boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
      }}
    >
      {edge('w', 'ew-resize', { left: -3, top: 0, bottom: 12, width: 6 })}
      {edge('e', 'ew-resize', { right: -3, top: 0, bottom: 12, width: 6 })}
      {edge('s', 'ns-resize', { left: 12, right: 12, bottom: -3, height: 6 })}
      {edge('sw', 'nesw-resize', {
        left: -3,
        bottom: -3,
        width: 14,
        height: 14,
      })}
      {edge('se', 'nwse-resize', {
        right: -3,
        bottom: -3,
        width: 14,
        height: 14,
      })}

      {/* ── title bar: what it is, and the handle you move it by ───────── */}
      <Box
        onMouseDown={(event: React.MouseEvent) => {
          if ((event.target as HTMLElement).closest('button, a, input')) return;
          startDrag(
            {
              kind: 'move',
              startX: event.clientX,
              startY: event.clientY,
              from: shown,
            },
            'grabbing'
          );
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1,
          py: 0.75,
          borderBottom: '1px solid',
          borderColor: 'divider',
          cursor: 'grab',
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: KIND_COLOR[kind],
            flexShrink: 0,
          }}
        />
        {renaming ? (
          <Box
            component="input"
            autoFocus
            aria-label="New file name"
            value={draftName}
            disabled={renameLoading}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setDraftName(event.target.value)
            }
            onKeyDown={(event: React.KeyboardEvent) => {
              if (event.key === 'Enter') commitRename();
              if (event.key === 'Escape') {
                event.stopPropagation();
                setRenaming(false);
                setDraftName(file.name ?? '');
              }
            }}
            sx={{
              flex: 1,
              minWidth: 0,
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              px: 0.5,
              py: '2px',
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: '4px',
              outline: 'none',
            }}
          />
        ) : (
          <Tooltip title={file.path ?? ''} enterDelay={500}>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                fontWeight: 600,
                // room for the descender: at a tight line-height `overflow:
                // hidden` clips the bottom of a glyph, and an underscore is
                // ENTIRELY below the baseline — file_name_here read as
                // 'file name here' with no way to tell it was not
                lineHeight: 1.7,
                py: '1px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              {file.name}
            </Typography>
          </Tooltip>
        )}
        <Box sx={{ flex: 1 }} />
        {onStep && (
          // one control with two ends, not two controls: they are the same
          // move in opposite directions, and a gap between them would say
          // otherwise
          <Box
            data-testid="viewer-step"
            sx={{
              display: 'inline-flex',
              alignItems: 'stretch',
              // the same height as the plain buttons beside it: the border
              // this group adds would otherwise make it two pixels taller
              // than everything on the row
              height: 22,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '4px',
              overflow: 'hidden',
              mr: 0.25,
              '& > span': { display: 'inline-flex' },
              '& > span > *': {
                borderRadius: 0,
                height: '100%',
                px: '2px',
                py: 0,
              },
              '& > span + span': {
                borderLeft: '1px solid',
                borderColor: 'divider',
              },
              // a dead end reads as a dead half of the control, not just as
              // a paler arrow
              '& > span > *:disabled': { bgcolor: 'rgba(0,0,0,0.04)' },
              '& svg': { fontSize: 15 },
            }}
          >
            <BarButton
              label="Previous file"
              title="The file before this one in the listing (←)"
              disabled={!hasPrevious}
              onClick={() => onStep(-1)}
            >
              <KeyboardArrowLeftRounded />
            </BarButton>
            <BarButton
              label="Next file"
              title="The file after this one in the listing (→)"
              disabled={!hasNext}
              onClick={() => onStep(1)}
            >
              <KeyboardArrowRightRounded />
            </BarButton>
          </Box>
        )}
        {renaming ? (
          <BarButton
            label="Confirm rename"
            title="Rename (Enter)"
            onClick={commitRename}
            disabled={renameLoading}
          >
            {renameLoading ? <CircularProgress size={13} /> : <CheckRounded />}
          </BarButton>
        ) : (
          <BarButton
            label="Rename file"
            title="Rename this file"
            onClick={() => setRenaming(true)}
          >
            <DriveFileRenameOutlineRounded />
          </BarButton>
        )}
        <BarButton
          label="Download file"
          title={url ? 'Download this file' : 'Waiting for a link'}
          href={url}
          download
          disabled={!url}
        >
          <DownloadRounded />
        </BarButton>
        {url && (
          <BarButton
            label="Open in a new tab"
            title="Open in a new tab"
            href={url}
          >
            <OpenInNewRounded />
          </BarButton>
        )}
        {mode === 'text' && !bytes && (
          <>
            <BarButton
              label="Wrap lines"
              title={wrap ? 'Stop wrapping long lines' : 'Wrap long lines'}
              pressed={wrap}
              onClick={() => setViewerWrap(!wrap)}
            >
              <WrapTextRounded />
            </BarButton>
            <BarButton
              label="Line numbers"
              title={lineNumbers ? 'Hide line numbers' : 'Show line numbers'}
              pressed={lineNumbers}
              onClick={() => setViewerLineNumbers(!lineNumbers)}
            >
              <FormatListNumberedRounded />
            </BarButton>
            <BarButton
              label="Colour codes"
              title={`Terminal colour codes: ${ANSI_LABEL[ansi]}`}
              pressed={ansi !== 'strip'}
              onClick={() =>
                setViewerAnsi(
                  ANSI_MODES[(ANSI_MODES.indexOf(ansi) + 1) % ANSI_MODES.length]
                )
              }
            >
              <FormatColorTextRounded />
            </BarButton>
          </>
        )}
        <BarButton
          label="Reload"
          title="Mint a fresh link and reload"
          onClick={mint}
        >
          <RefreshRounded />
        </BarButton>
        <BarButton label="Close viewer" title="Close (Esc)" onClick={onClose}>
          <CloseRounded />
        </BarButton>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.5,
          flexWrap: 'wrap',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: '#fcfcfb',
        }}
      >
        <Chip>{KIND_LABEL[kind]}</Chip>
        <Chip>{sizeFormat(file.size ?? 0)}</Chip>
        <Chip title={String(file.lastModified ?? '')}>
          {modifiedLabel(file)}
        </Chip>
        {file.owner && <Chip title="Owner">{file.owner}</Chip>}
        {file.nativePermissions && (
          <Chip title="Permissions">{file.nativePermissions}</Chip>
        )}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>{body}</Box>
    </Box>
  );
};

export default FileViewerPanel;
