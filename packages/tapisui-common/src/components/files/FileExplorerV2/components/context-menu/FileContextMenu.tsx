import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import type { FileExplorerAction } from '../../types/actions';
import type { FileItem } from '../../types/file-system';
import { resolveActionIcon, getFileIcon } from '../../utils/icon-resolver';

interface ContextMenuState {
  mouseX: number;
  mouseY: number;
  targets: FileItem[];
}

export interface FileContextMenuProps {
  contextMenu: ContextMenuState | null;
  onClose: () => void;
  getApplicableActions: (targets: FileItem[]) => FileExplorerAction[];
  onExecuteAction: (action: FileExplorerAction, targets: FileItem[]) => void;
}

export function FileContextMenu({
  contextMenu,
  onClose,
  getApplicableActions,
  onExecuteAction,
}: FileContextMenuProps) {
  if (!contextMenu) return null;

  const targets = contextMenu.targets;
  // Filter out removed actions: compress, toggle lock, toggle favorite
  const excludedActionIds = new Set([
    'compress-zip',
    'lock-toggle',
    'favorite-toggle',
  ]);
  const actions = getApplicableActions(targets).filter(
    (a) => !excludedActionIds.has(a.id)
  );

  const handleActionClick = (action: FileExplorerAction) => {
    onClose();
    onExecuteAction(action, targets);
  };

  const isSingle = targets.length === 1;
  const isAllFolders = targets.every((t) => t.type === 'directory');
  const isAllFiles = targets.every((t) => t.type === 'file');

  // Group actions
  const primaryActions = actions.filter((a) => a.category === 'primary');
  const manageActions = actions.filter(
    (a) => a.category === 'manage' && a.id !== 'delete'
  );
  const transformActions = actions.filter(
    (a) => a.category === 'transform' || a.category === 'dev'
  );
  const shareActions = actions.filter((a) => a.category === 'share');
  const deleteAction = actions.find((a) => a.id === 'delete');

  return (
    <Menu
      open={Boolean(contextMenu)}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
      slotProps={{
        paper: {
          sx: {
            width: 250,
            maxWidth: '100%',
            borderRadius: 2,
            boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
            py: 0.5,
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Header with icon of a folder or a file */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          bgcolor: 'action.hover',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            height: 30,
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          {isSingle ? (
            targets[0].type === 'directory' ? (
              <FolderIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
            ) : (
              getFileIcon(
                targets[0].type,
                targets[0].extension,
                targets[0].mimeType,
                18
              )
            )
          ) : isAllFolders ? (
            <FolderIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
          ) : isAllFiles ? (
            <InsertDriveFileIcon sx={{ color: 'primary.main', fontSize: 18 }} />
          ) : (
            <FolderIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
          )}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.2 }}
          >
            {isSingle ? targets[0].name : `${targets.length} items selected`}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: '0.7rem' }}
          >
            {isSingle
              ? targets[0].type === 'directory'
                ? 'Folder'
                : `${targets[0].extension?.toUpperCase() || 'File'}`
              : isAllFolders
              ? `${targets.length} folders`
              : isAllFiles
              ? `${targets.length} files`
              : `${targets.length} items`}
          </Typography>
        </Box>
      </Box>

      {/* Primary Actions (Open, Info) */}
      {primaryActions.length > 0 && (
        <>
          {primaryActions.map((action) => (
            <MenuItem
              key={action.id}
              onClick={() => handleActionClick(action)}
              sx={{ py: 0.75 }}
            >
              <ListItemIcon sx={{ color: 'primary.main' }}>
                {resolveActionIcon(action.iconName)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {action.name}
                  </Typography>
                }
              />
              {action.shortcut && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  {action.shortcut}
                </Typography>
              )}
            </MenuItem>
          ))}
        </>
      )}

      {primaryActions.length > 0 && manageActions.length > 0 && (
        <Divider sx={{ my: 0.5 }} />
      )}

      {/* Management Actions */}
      {manageActions.map((action) => (
        <MenuItem
          key={action.id}
          onClick={() => handleActionClick(action)}
          sx={{ py: 0.6 }}
        >
          <ListItemIcon sx={{ color: 'text.secondary' }}>
            {resolveActionIcon(action.iconName)}
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography sx={{ fontSize: '0.825rem' }}>
                {action.name}
              </Typography>
            }
          />
          {action.shortcut && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.7rem' }}
            >
              {action.shortcut}
            </Typography>
          )}
        </MenuItem>
      ))}

      {transformActions.length > 0 && <Divider sx={{ my: 0.5 }} />}

      {/* Transform / Dev Actions */}
      {transformActions.map((action) => (
        <MenuItem
          key={action.id}
          onClick={() => handleActionClick(action)}
          sx={{ py: 0.6 }}
        >
          <ListItemIcon sx={{ color: 'info.main' }}>
            {resolveActionIcon(action.iconName)}
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography sx={{ fontSize: '0.825rem' }}>
                {action.name}
              </Typography>
            }
          />
        </MenuItem>
      ))}

      {shareActions.length > 0 && (
        <>
          <Divider sx={{ my: 0.5 }} />
          {shareActions.map((action) => (
            <MenuItem
              key={action.id}
              onClick={() => handleActionClick(action)}
              sx={{ py: 0.6 }}
            >
              <ListItemIcon sx={{ color: 'text.secondary' }}>
                {resolveActionIcon(action.iconName)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: '0.825rem' }}>
                    {action.name}
                  </Typography>
                }
              />
            </MenuItem>
          ))}
        </>
      )}

      {/* Destructive Delete Action */}
      {deleteAction && (
        <>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => handleActionClick(deleteAction)}
            sx={{ py: 0.6, color: 'error.main' }}
          >
            <ListItemIcon sx={{ color: 'error.main' }}>
              {resolveActionIcon(deleteAction.iconName)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: '0.825rem', fontWeight: 600 }}>
                  {deleteAction.name}
                </Typography>
              }
            />
            {deleteAction.shortcut && (
              <Typography
                variant="caption"
                color="error.light"
                sx={{ fontSize: '0.7rem' }}
              >
                {deleteAction.shortcut}
              </Typography>
            )}
          </MenuItem>
        </>
      )}
    </Menu>
  );
}

export default FileContextMenu;
