import React from 'react';
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import SortIcon from '@mui/icons-material/Sort';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import type { SortConfig, SortField, FileItem } from '../../types/file-system';

export interface ExplorerToolbarProps {
  currentFolder: FileItem | null;
  title?: string;
  displayedCount: number;
  totalSelected: number;
  sortConfig: SortConfig;
  searchQuery: string;
  onSortChange: (field: SortField) => void;
  onToggleSortOrder: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onNewFolder?: () => void;
  onNewFile?: () => void;
  onUploadFile?: () => void;
  onTransfers?: () => void;
  additionalActions?: React.ReactNode;
}

export function ExplorerToolbar({
  currentFolder,
  title,
  displayedCount,
  totalSelected,
  sortConfig,
  searchQuery,
  onSortChange,
  onToggleSortOrder,
  onSelectAll,
  onClearSelection,
  onNewFolder,
  onNewFile,
  onUploadFile,
  onTransfers,
  additionalActions,
}: ExplorerToolbarProps) {
  const [sortMenuAnchor, setSortMenuAnchor] =
    React.useState<null | HTMLElement>(null);

  const getTitle = () => {
    if (searchQuery.trim()) {
      return `Search Results for "${searchQuery}"`;
    }
    if (title) return title;
    if (currentFolder) return currentFolder.name;
    return 'Root Directory';
  };

  const handleOpenSort = (e: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchor(e.currentTarget);
  };

  const handleCloseSort = () => {
    setSortMenuAnchor(null);
  };

  const handleSelectSortField = (field: SortField) => {
    onSortChange(field);
    handleCloseSort();
  };

  const isAllSelected = displayedCount > 0 && totalSelected === displayedCount;
  const isPartiallySelected =
    totalSelected > 0 && totalSelected < displayedCount;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        mb: 2,
        pb: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Title & Count */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
          {getTitle()}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            bgcolor: 'action.hover',
            px: 1,
            py: 0.25,
            borderRadius: 1,
            fontWeight: 600,
            color: 'text.secondary',
          }}
        >
          {displayedCount} {displayedCount === 1 ? 'item' : 'items'}
        </Typography>
      </Box>

      {/* Toolbar Controls */}
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
      >
        {/* Select All Checkbox */}
        <Tooltip title={isAllSelected ? 'Deselect all' : 'Select all items'}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={isAllSelected}
                indeterminate={isPartiallySelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    onSelectAll();
                  } else {
                    onClearSelection();
                  }
                }}
              />
            }
            label={
              <Typography
                variant="body2"
                sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}
              >
                Select all
              </Typography>
            }
            sx={{ mr: 1 }}
          />
        </Tooltip>

        {/* Sort Menu Button */}
        <Button
          size="small"
          variant="text"
          color="inherit"
          startIcon={<SortIcon fontSize="small" />}
          endIcon={
            sortConfig.order === 'asc' ? (
              <ArrowUpwardIcon sx={{ fontSize: '14px !important' }} />
            ) : (
              <ArrowDownwardIcon sx={{ fontSize: '14px !important' }} />
            )
          }
          onClick={handleOpenSort}
          sx={{ textTransform: 'capitalize', fontSize: '0.8125rem' }}
        >
          Sort: {sortConfig.field}
        </Button>

        <Menu
          anchorEl={sortMenuAnchor}
          open={Boolean(sortMenuAnchor)}
          onClose={handleCloseSort}
          slotProps={{ paper: { sx: { minWidth: 180, borderRadius: 2 } } }}
        >
          <MenuItem
            selected={sortConfig.field === 'name'}
            onClick={() => handleSelectSortField('name')}
          >
            <ListItemText primary="Name" />
          </MenuItem>
          <MenuItem
            selected={sortConfig.field === 'updatedAt'}
            onClick={() => handleSelectSortField('updatedAt')}
          >
            <ListItemText primary="Date Modified" />
          </MenuItem>
          <MenuItem
            selected={sortConfig.field === 'size'}
            onClick={() => handleSelectSortField('size')}
          >
            <ListItemText primary="File Size" />
          </MenuItem>
          <MenuItem
            selected={sortConfig.field === 'type'}
            onClick={() => handleSelectSortField('type')}
          >
            <ListItemText primary="File Type" />
          </MenuItem>
          <Box
            sx={{ borderTop: '1px solid', borderColor: 'divider', my: 0.5 }}
          />
          <MenuItem onClick={onToggleSortOrder}>
            <ListItemIcon>
              {sortConfig.order === 'asc' ? (
                <ArrowDownwardIcon fontSize="small" />
              ) : (
                <ArrowUpwardIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                sortConfig.order === 'asc'
                  ? 'Switch to Descending'
                  : 'Switch to Ascending'
              }
            />
          </MenuItem>
        </Menu>

        {/* Action Buttons: New Folder / New File / Upload */}
        {onNewFolder && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<CreateNewFolderIcon fontSize="small" />}
            onClick={onNewFolder}
            sx={{ fontWeight: 600, fontSize: '0.8125rem' }}
          >
            New Folder
          </Button>
        )}

        {onNewFile && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<NoteAddIcon fontSize="small" />}
            onClick={onNewFile}
            sx={{ fontWeight: 600, fontSize: '0.8125rem' }}
          >
            New File
          </Button>
        )}

        {onUploadFile && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<UploadFileIcon fontSize="small" />}
            onClick={onUploadFile}
            sx={{ fontWeight: 600, fontSize: '0.8125rem' }}
          >
            Upload
          </Button>
        )}
        {onTransfers && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<SwapHorizIcon fontSize="small" />}
            onClick={onTransfers}
            sx={{ fontWeight: 600, fontSize: '0.8125rem' }}
          >
            Transfers
          </Button>
        )}
        {additionalActions}
      </Box>
    </Box>
  );
}

export default ExplorerToolbar;
