import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import type { FileItem } from '../../types/file-system';
import type { FileExplorerAction } from '../../types/actions';
import { resolveActionIcon, getFileIcon } from '../../utils/icon-resolver';

export interface SelectionActionBarProps {
  selectedItems: FileItem[];
  applicableActions: FileExplorerAction[];
  onExecuteAction: (action: FileExplorerAction) => void;
  onClearSelection: () => void;
}

export function SelectionActionBar({
  selectedItems,
  applicableActions,
  onExecuteAction,
  onClearSelection,
}: SelectionActionBarProps) {
  const [moreMenuAnchor, setMoreMenuAnchor] =
    React.useState<null | HTMLElement>(null);

  const isSingle = selectedItems.length === 1;
  const isAllFolders = selectedItems.every((t) => t.type === 'directory');
  const isAllFiles = selectedItems.every((t) => t.type === 'file');

  const renderHeaderIcon = (size = 18) => {
    if (isSingle) {
      return selectedItems[0].type === 'directory' ? (
        <FolderIcon sx={{ color: '#f59e0b', fontSize: size }} />
      ) : (
        getFileIcon(
          selectedItems[0].type,
          selectedItems[0].extension,
          selectedItems[0].mimeType,
          size
        )
      );
    }
    if (isAllFolders) {
      return <FolderIcon sx={{ color: '#f59e0b', fontSize: size }} />;
    }
    if (isAllFiles) {
      return (
        <InsertDriveFileIcon sx={{ color: 'primary.main', fontSize: size }} />
      );
    }
    return <FolderIcon sx={{ color: '#f59e0b', fontSize: size }} />;
  };

  // Reserved space placeholder when no items are selected
  if (selectedItems.length === 0) {
    return (
      <Box
        sx={{
          minHeight: 48,
          mb: 2,
          py: 0.75,
          px: 2,
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 1,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.disabled',
            }}
          >
            <FolderIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8125rem',
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            Select files or folders to view actions
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{ color: 'text.disabled', display: { xs: 'none', sm: 'block' } }}
        >
          Click checkboxes or select rows to perform actions
        </Typography>
      </Box>
    );
  }

  // Filter out removed actions
  const excludedActionIds = new Set([
    'compress-zip',
    'lock-toggle',
    'favorite-toggle',
  ]);
  const filteredActions = applicableActions.filter(
    (a) => !excludedActionIds.has(a.id)
  );

  // Explicit overflow actions stay in More even when there is room for them.
  const directActions = filteredActions.filter(
    (action) => !action.showInOverflow
  );
  const primaryButtons = directActions.slice(0, 5);
  const overflowActions = [
    ...filteredActions.filter((action) => action.showInOverflow),
    ...directActions.slice(5),
  ];

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMoreMenuAnchor(null);
  };

  const handleActionClick = (action: FileExplorerAction) => {
    handleCloseMenu();
    onExecuteAction(action);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        minHeight: 48,
        mb: 2,
        py: 0.75,
        px: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        boxSizing: 'border-box',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      {/* Selection Summary Header with Folder / File Icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 1,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {renderHeaderIcon(18)}
        </Box>

        <Chip
          label={`${selectedItems.length} selected`}
          color="primary"
          size="small"
          sx={{ fontWeight: 700 }}
        />

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          {selectedItems.length === 1
            ? selectedItems[0].name
            : `${selectedItems.length} items`}
        </Typography>

        <IconButton
          size="small"
          onClick={onClearSelection}
          title="Clear selection"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Dynamic Action Buttons from Registry */}
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
      >
        {primaryButtons.map((action) => (
          <Button
            key={action.id}
            size="small"
            variant={action.category === 'primary' ? 'contained' : 'outlined'}
            color={
              action.color ||
              (action.category === 'primary' ? 'primary' : 'inherit')
            }
            startIcon={resolveActionIcon(action.iconName)}
            onClick={() => onExecuteAction(action)}
            sx={{
              borderRadius: 1.5,
              fontSize: '0.8125rem',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {action.name}
          </Button>
        ))}

        {overflowActions.length > 0 && (
          <>
            <Tooltip title="More actions">
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={handleOpenMenu}
                endIcon={<MoreVertIcon />}
                sx={{
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '0.8125rem',
                }}
              >
                More
              </Button>
            </Tooltip>

            <Menu
              anchorEl={moreMenuAnchor}
              open={Boolean(moreMenuAnchor)}
              onClose={handleCloseMenu}
              slotProps={{ paper: { sx: { minWidth: 200, borderRadius: 2 } } }}
            >
              {overflowActions.map((action) => (
                <MenuItem
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  sx={{
                    py: 0.75,
                    color: action.color === 'error' ? 'error.main' : 'inherit',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color:
                        action.color === 'error'
                          ? 'error.main'
                          : 'text.secondary',
                    }}
                  >
                    {resolveActionIcon(action.iconName)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{ fontSize: '0.825rem', fontWeight: 500 }}
                      >
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
            </Menu>
          </>
        )}
      </Box>
    </Paper>
  );
}

export default SelectionActionBar;
