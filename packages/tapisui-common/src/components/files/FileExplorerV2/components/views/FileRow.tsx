import React from 'react';
import {
  TableRow,
  TableCell,
  Checkbox,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { FileItem } from '../../types/file-system';
import { getFileIcon } from '../../utils/icon-resolver';
import { formatBytes, formatDate } from '../../utils/formatters';

export interface FileRowProps {
  item: FileItem;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onToggleCheckbox: (e: React.MouseEvent) => void;
  onOpen: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onOpenActionMenu: (e: React.MouseEvent) => void;
}

export function FileRow({
  item,
  isSelected,
  onSelect,
  onToggleCheckbox,
  onOpen,
  onContextMenu,
  onOpenActionMenu,
}: FileRowProps) {
  const handleClick = (e: React.MouseEvent) => {
    // If modifier keys are held, perform selection
    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      onSelect(e);
      return;
    }

    // For folders, single click directly navigates inside the directory
    if (item.type === 'directory') {
      onOpen();
      return;
    }

    // For files, select the item
    onSelect(e);
  };

  return (
    <TableRow
      hover
      selected={isSelected}
      onContextMenu={onContextMenu}
      onClick={handleClick}
      onDoubleClick={onOpen}
      sx={{
        cursor: 'pointer',
        '&.Mui-selected': {
          bgcolor: 'action.selected',
        },
      }}
    >
      {/* Selection Checkbox */}
      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          size="small"
          checked={isSelected}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheckbox(e);
          }}
          aria-label={`Select ${item.name}`}
        />
      </TableCell>

      {/* Name with Icon & Shared badge (always showing icon, no image/video thumbnail preview) */}
      <TableCell sx={{ py: 1.25 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            minWidth: 200,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getFileIcon(item.type, item.extension, item.mimeType)}
          </Box>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.name}
            </Typography>
            {item.author && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.72rem' }}
              >
                by {item.author}
              </Typography>
            )}
          </Box>
          {item.isShared && (
            <Tooltip title="Shared file">
              <PeopleIcon sx={{ fontSize: 16, color: 'info.main', ml: 0.5 }} />
            </Tooltip>
          )}
        </Box>
      </TableCell>

      {/* Date Modified */}
      <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
        {formatDate(item.updatedAt)}
      </TableCell>

      {/* Type */}
      <TableCell
        sx={{
          color: 'text.secondary',
          fontSize: '0.8125rem',
          textTransform: 'capitalize',
        }}
      >
        {item.type === 'directory'
          ? 'Folder'
          : item.extension?.toUpperCase() || 'File'}
      </TableCell>

      {/* Size */}
      <TableCell
        align="right"
        sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}
      >
        {item.type === 'directory' ? '—' : formatBytes(item.size)}
      </TableCell>

      {/* Action Menu */}
      <TableCell align="right" sx={{ py: 0.5 }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onOpenActionMenu(e);
          }}
          title="More actions"
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

export default FileRow;
