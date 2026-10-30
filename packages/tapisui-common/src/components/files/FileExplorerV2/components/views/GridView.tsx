import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import type { FileItem } from '../../types/file-system';
import { FileCard } from './FileCard';

export interface GridViewProps {
  items: FileItem[];
  selectedIds: string[];
  onToggleSelect: (id: string, isMulti?: boolean, isRange?: boolean) => void;
  onOpenItem: (item: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
  onOpenActionMenu: (e: React.MouseEvent, item: FileItem) => void;
  onNewFolder?: () => void;
}

export function GridView({
  items,
  selectedIds,
  onToggleSelect,
  onOpenItem,
  onContextMenu,
  onOpenActionMenu,
  onNewFolder,
}: GridViewProps) {
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

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
          xl: 'repeat(5, 1fr)',
        },
        gap: 2,
        pb: 4,
      }}
    >
      {items.map((item) => (
        <FileCard
          key={item.id}
          item={item}
          isSelected={selectedIds.includes(item.id)}
          onSelect={(e) =>
            onToggleSelect(item.id, e.ctrlKey || e.metaKey, e.shiftKey)
          }
          onToggleCheckbox={() => onToggleSelect(item.id, true)}
          onOpen={() => onOpenItem(item)}
          onContextMenu={(e) => onContextMenu(e, item)}
          onOpenActionMenu={(e) => {
            e.stopPropagation();
            onOpenActionMenu(e, item);
          }}
        />
      ))}
    </Box>
  );
}

export default GridView;
