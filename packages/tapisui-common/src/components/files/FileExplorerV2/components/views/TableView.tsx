import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Paper,
  Box,
  Typography,
  Button,
} from '@mui/material';
import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import type { FileItem } from '../../types/file-system';
import { FileRow } from './FileRow';

export interface TableViewProps {
  items: FileItem[];
  selectedIds: string[];
  onToggleSelect: (id: string, isMulti?: boolean, isRange?: boolean) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onOpenItem: (item: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
  onOpenActionMenu: (e: React.MouseEvent, item: FileItem) => void;
  onNewFolder?: () => void;
}

export function TableView({
  items,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onOpenItem,
  onContextMenu,
  onOpenActionMenu,
  onNewFolder,
}: TableViewProps) {
  if (items.length === 0) {
    return (
      <Box
        sx={{
          py: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        <FolderOffOutlinedIcon sx={{ fontSize: 56, mb: 1.5, opacity: 0.4 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          No files or folders here
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 360 }}>
          This directory is currently empty. Drop files here or create a new
          folder to get started.
        </Typography>
        {onNewFolder && (
          <Button
            variant="outlined"
            startIcon={<CreateNewFolderIcon />}
            onClick={onNewFolder}
          >
            Create Folder
          </Button>
        )}
      </Box>
    );
  }

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;
  const isPartiallySelected =
    selectedIds.length > 0 && selectedIds.length < items.length;

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2.5,
        overflow: 'hidden',
        mb: 4,
      }}
    >
      <Table size="small">
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell padding="checkbox" sx={{ width: 40 }}>
              <Checkbox
                size="small"
                checked={isAllSelected}
                indeterminate={isPartiallySelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    onSelectAll?.();
                  } else {
                    onClearSelection?.();
                  }
                }}
                aria-label="Select all items"
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
              Name
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: '0.8125rem', width: 180 }}
            >
              Date Modified
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, fontSize: '0.8125rem', width: 120 }}
            >
              Type
            </TableCell>
            <TableCell
              align="right"
              sx={{ fontWeight: 700, fontSize: '0.8125rem', width: 110 }}
            >
              Size
            </TableCell>
            <TableCell
              align="right"
              sx={{ fontWeight: 700, fontSize: '0.8125rem', width: 60 }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <FileRow
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              onSelect={(e) =>
                onToggleSelect(item.id, e.ctrlKey || e.metaKey, e.shiftKey)
              }
              onToggleCheckbox={() => onToggleSelect(item.id, true)}
              onOpen={() => onOpenItem(item)}
              onContextMenu={(e) => onContextMenu(e, item)}
              onOpenActionMenu={(e) => onOpenActionMenu(e, item)}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TableView;
