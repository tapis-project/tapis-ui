/**
 * ToolbarV2 — the file-operations toolbar as a compact icon rail.
 *
 * Same eleven capabilities, same modals, a third of the width. The
 * "advertisement" the wide text buttons used to do moves into the hover
 * layer: every icon carries a rich tooltip — what it does in one line, and
 * when it is greyed, exactly what would enable it ("select one file"). A
 * disabled capability stays VISIBLE at low opacity on purpose: the bar is a
 * feature menu, not just a set of live controls.
 *
 * Grouped by intent, hairline-separated:
 *   in/out (upload · new folder · download · transfers)
 *   understand & share (view · visualize · share)
 *   reorganize (rename · move · copy)
 *   danger (delete, red, at arm's length)
 *
 * V1 (Toolbar.tsx) stays — other surfaces still render it.
 */
import { Files, Systems } from '@tapis/tapis-typescript';
import React, {
  useCallback,
  useState,
  useSyncExternalStore,
  lazy,
  Suspense,
} from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  UploadRounded,
  DownloadRounded,
  CreateNewFolderRounded,
  SwapHorizRounded,
  VisibilityRounded,
  ViewInArRounded,
  LinkRounded,
  DriveFileRenameOutlineRounded,
  DriveFileMoveRounded,
  ContentCopyRounded,
  DeleteOutlineRounded,
} from '@mui/icons-material';
import HostEvalRailButton from './HostEvalRailButton';
import { canHostEval } from '../hostEval';
import CreateDirModal from './CreateDirModal';
import MoveCopyModal from './MoveCopyModal';
import RenameModal from './RenameModal';
import UploadModal from './UploadModal';
import DeleteModal from './DeleteModal';
import CreatePostitModal from './CreatePostitModal';
import TransferModal from './TransferModal';
import ShareModal from './ShareModal';
const VtkModal = lazy(() => import('./VtkModal'));
import { useFilesSelect } from '../FilesContext';
import {
  Files as FilesHooks,
  Systems as SystemsHooks,
} from '@tapis/tapisui-hooks';
import { useNotifications } from 'app/_components/Notifications';
import {
  getInfoDetail,
  subscribeInfoDetail,
} from 'app/_components/PageShell/infoDetail';

// Paper-styled tooltip: the rail's tooltips carry real copy (feature pitch +
// enable hint), and body text on MUI's near-black default was unreadable.
export const PAPER_TOOLTIP = {
  tooltip: {
    sx: {
      bgcolor: 'background.paper',
      color: 'text.primary',
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
      borderRadius: '6px',
      px: 1.25,
      py: 0.75,
    },
  },
  arrow: {
    sx: {
      color: 'background.paper',
      '&::before': { border: '1px solid', borderColor: 'divider' },
    },
  },
} as const;

/**
 * One button on the file rail.
 *
 * Two things it reads from outside its props. The page header's ? decides
 * whether the label rides beside the glyph — the rail used to be a row of
 * labelled buttons and that switch is where 'say more' now lives. And `busy`
 * spins this button alone: the bar used to be wrapped in a QueryWrapper, so
 * the permission check replaced all eleven buttons with one spinner and the
 * layout jumped every time you opened a directory.
 */
const RailButton: React.FC<{
  label: string;
  desc: string;
  icon: React.ReactNode;
  disabled: boolean;
  /** what would light this up — shown when disabled */
  enableHint?: string;
  danger?: boolean;
  busy?: boolean;
  onClick: () => void;
}> = ({ label, desc, icon, disabled, enableHint, danger, busy, onClick }) => {
  const showLabel = useSyncExternalStore(subscribeInfoDetail, getInfoDetail);
  return (
    <Tooltip
      arrow
      disableInteractive
      componentsProps={PAPER_TOOLTIP}
      title={
        <Box sx={{ maxWidth: 220 }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
            {desc}
          </Typography>
          {disabled && enableHint && (
            <Typography
              sx={{
                fontSize: '0.66rem',
                mt: 0.25,
                color: 'text.secondary',
                fontStyle: 'italic',
              }}
            >
              {enableHint}
            </Typography>
          )}
        </Box>
      }
    >
      <span>
        <IconButton
          size="small"
          disabled={disabled || busy}
          onClick={onClick}
          aria-label={label}
          sx={{
            p: '3px',
            px: showLabel ? '6px' : '3px',
            gap: showLabel ? 0.4 : 0,
            borderRadius: '5px',
            color: danger ? '#c62828' : 'rgba(0,0,0,0.62)',
            '&:hover': {
              bgcolor: danger ? 'rgba(198,40,40,0.08)' : 'rgba(0,0,0,0.06)',
            },
            '&.Mui-disabled': { color: 'rgba(0,0,0,0.22)' },
            '& .MuiSvgIcon-root': { fontSize: 17 },
          }}
        >
          {busy ? <CircularProgress size={15} color="inherit" /> : icon}
          {showLabel && (
            <Box
              component="span"
              sx={{
                fontSize: '0.7rem',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Box>
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
};

const Sep: React.FC = () => (
  <Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5 }} />
);

export type ToolbarV2Props = { systemId: string; currentPath: string };

const ToolbarV2: React.FC<ToolbarV2Props> = ({ systemId, currentPath }) => {
  const [modal, setModal] = useState<string | undefined>(undefined);
  const { selectedFiles } = useFilesSelect();
  const { download } = FilesHooks.useDownload();
  const { addNotification: add } = useNotifications();

  const {
    data,
    isLoading: isLoadingPermissions,
    error: errorPermissions,
  } = FilesHooks.usePermissions({ systemId, path: currentPath });
  const permission = data?.result?.permission;
  const {
    data: systemData,
    isLoading,
    error,
  } = SystemsHooks.useDetails({ systemId, select: 'allAttributes' });
  const system = systemData?.result ?? undefined;

  const showHostEvalButton = canHostEval(system);
  const isAuthenticated = !isLoadingPermissions && !errorPermissions;

  const canModify =
    (system && system.isPublic) || permission === Files.PermEnum.Modify;

  const one = selectedFiles.length === 1;
  const some = selectedFiles.length > 0;
  const oneFile = one && selectedFiles[0].type === Files.FileTypeEnum.File;

  const onDownload = useCallback(() => {
    selectedFiles.forEach((file) => {
      const params: FilesHooks.DownloadStreamParams = {
        systemId,
        path: file.path ?? '',
        destination: file.name ?? 'tapisfile',
      };
      const isZip = file.type === 'dir';
      if (isZip) {
        params.zip = true;
        params.destination = `${params.destination}.zip`;
        add('Preparing download', 'Preparing download');
        params.onStart = () => {
          add('Starting download', 'Starting download');
        };
      }
      download(params, {
        onError: isZip
          ? () => {
              add('Download failed', 'Download failed', 'error');
            }
          : undefined,
      });
    });
  }, [selectedFiles, add, download, systemId]);

  const toggle = () => setModal(undefined);
  const needsModify = canModify
    ? undefined
    : 'needs MODIFY permission on this path';

  // The permission check is per-directory, so wrapping the bar in a
  // QueryWrapper meant every navigation swapped eleven buttons for a spinner
  // and shoved the layout around. The bar stays; the buttons that need the
  // answer spin on their own and say why they are dark if the check failed.
  const checking = isLoading || isLoadingPermissions;
  const permissionProblem = error || errorPermissions;
  const modifyHint = permissionProblem
    ? 'could not check your permissions on this path'
    : needsModify;

  return (
    <>
      <Box
        id="file-operation-toolbar"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          px: 0.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '6px',
          bgcolor: '#fcfcfb',
        }}
      >
        {some && (
          <Chip
            size="small"
            label={`${selectedFiles.length} sel`}
            sx={{
              height: 16,
              fontSize: '0.6rem',
              fontWeight: 600,
              borderRadius: '4px',
              mr: 0.25,
            }}
          />
        )}

        {/* in / out */}
        <RailButton
          label="Upload"
          desc="Send files from this device to the current directory."
          icon={<UploadRounded />}
          disabled={!canModify}
          busy={checking}
          enableHint={modifyHint}
          onClick={() => setModal('upload')}
        />
        <RailButton
          label="New folder"
          desc="Create a directory here."
          icon={<CreateNewFolderRounded />}
          disabled={!canModify}
          busy={checking}
          enableHint={modifyHint}
          onClick={() => setModal('createdir')}
        />
        <RailButton
          label="Download"
          desc="Stream the selection to this device — folders arrive zipped."
          icon={<DownloadRounded />}
          disabled={!some}
          enableHint="select at least one item"
          onClick={onDownload}
        />
        <RailButton
          label="Transfers"
          desc="Server-side copies between systems — no laptop in the loop, survives closing the tab."
          icon={<SwapHorizRounded />}
          disabled={false}
          onClick={() => setModal('transfer')}
        />
        <Sep />

        {/* understand & share */}
        <RailButton
          label="View"
          desc="Open the file's contents right here via a short-lived link."
          icon={<VisibilityRounded />}
          disabled={!oneFile}
          enableHint="select exactly one file"
          onClick={() => setModal('postit')}
        />
        <RailButton
          label="Visualize"
          desc="Render VTK/mesh data in 3D without downloading it."
          icon={<ViewInArRounded />}
          disabled={!oneFile}
          enableHint="select exactly one file"
          onClick={() => setModal('visualize')}
        />
        <RailButton
          label="Share"
          desc="Mint a link others can use to fetch this item."
          icon={<LinkRounded />}
          disabled={!one}
          enableHint="select exactly one item"
          onClick={() => setModal('share')}
        />
        <Sep />

        {/* reorganize */}
        <RailButton
          label="Rename"
          desc="Give the selected item a new name in place."
          icon={<DriveFileRenameOutlineRounded />}
          disabled={!one || !canModify}
          enableHint={!one ? 'select exactly one item' : needsModify}
          onClick={() => setModal('rename')}
        />
        <RailButton
          label="Move"
          desc="Relocate the selection to another path on this system."
          icon={<DriveFileMoveRounded />}
          disabled={!one || !canModify}
          enableHint={!one ? 'select exactly one item' : needsModify}
          onClick={() => setModal('move')}
        />
        <RailButton
          label="Copy"
          desc="Duplicate the selection to another path on this system."
          icon={<ContentCopyRounded />}
          disabled={!some || !canModify}
          enableHint={!some ? 'select at least one item' : needsModify}
          onClick={() => setModal('copy')}
        />

        {showHostEvalButton && (
          <>
            <Sep />
            <HostEvalRailButton
              systemId={systemId}
              isAuthenticated={isAuthenticated}
            />
          </>
        )}
        <Sep />

        {/* danger, at arm's length */}
        <RailButton
          label="Delete"
          desc="Remove the selected item from the system. No undo."
          icon={<DeleteOutlineRounded />}
          disabled={!one || !canModify}
          enableHint={!one ? 'select exactly one item' : needsModify}
          danger
          onClick={() => setModal('delete')}
        />

        {/* modals — identical machinery to V1 */}
        {modal === 'createdir' && (
          <CreateDirModal
            toggle={toggle}
            systemId={systemId}
            path={currentPath}
          />
        )}
        {modal === 'copy' && (
          <MoveCopyModal
            toggle={toggle}
            systemId={systemId}
            path={currentPath}
            operation={Files.MoveCopyRequestOperationEnum.Copy}
          />
        )}
        {modal === 'move' && (
          <MoveCopyModal
            toggle={toggle}
            systemId={systemId}
            path={currentPath}
            operation={Files.MoveCopyRequestOperationEnum.Move}
          />
        )}
        {modal === 'rename' && (
          <RenameModal toggle={toggle} systemId={systemId} path={currentPath} />
        )}
        {modal === 'transfer' && (
          <TransferModal
            toggle={toggle}
            systemId={systemId}
            path={currentPath}
          />
        )}
        {modal === 'upload' && (
          <UploadModal toggle={toggle} path={currentPath} systemId={systemId} />
        )}
        {modal === 'delete' && (
          <DeleteModal toggle={toggle} systemId={systemId} path={currentPath} />
        )}
        {modal === 'postit' && (
          <CreatePostitModal
            toggle={toggle}
            systemId={systemId}
            path={currentPath}
          />
        )}
        {modal === 'visualize' && (
          <Suspense fallback={null}>
            <VtkModal toggle={toggle} systemId={systemId} path={currentPath} />
          </Suspense>
        )}
        {modal === 'share' && (
          <ShareModal toggle={toggle} systemId={systemId} path={currentPath} />
        )}
      </Box>
    </>
  );
};

export default ToolbarV2;
