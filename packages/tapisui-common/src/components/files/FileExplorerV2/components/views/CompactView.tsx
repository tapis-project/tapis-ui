import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  IconButton,
  Tooltip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { FileItem } from '../../types/file-system';
import { getFileIcon } from '../../utils/icon-resolver';
import { formatBytes } from '../../utils/formatters';

export interface CompactViewProps {
  items: FileItem[];
  selectedIds: string[];
  onToggleSelect: (id: string, isMulti?: boolean, isRange?: boolean) => void;
  onOpenItem: (item: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
  onOpenActionMenu: (e: React.MouseEvent, item: FileItem) => void;
}

export function CompactView({
  items,
  selectedIds,
  onToggleSelect,
  onOpenItem,
  onContextMenu,
  onOpenActionMenu,
}: CompactViewProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 1.25,
        pb: 4,
      }}
    >
      {items.map((item) => {
        const isSelected = selectedIds.includes(item.id);
        return (
          <Paper
            key={item.id}
            elevation={0}
            onContextMenu={(e) => onContextMenu(e, item)}
            onClick={(e) =>
              onToggleSelect(item.id, e.ctrlKey || e.metaKey, e.shiftKey)
            }
            onDoubleClick={() => onOpenItem(item)}
            sx={{
              p: 1,
              px: 1.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: isSelected ? 'primary.main' : 'divider',
              bgcolor: isSelected ? 'action.selected' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: isSelected ? 'primary.main' : 'primary.light',
                bgcolor: isSelected ? 'action.selected' : 'action.hover',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                overflow: 'hidden',
              }}
            >
              <Checkbox
                size="small"
                checked={isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(item.id, true);
                }}
                aria-label={`Select ${item.name}`}
                sx={{ p: 0 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getFileIcon(item.type, item.extension, item.mimeType)}
              </Box>
              <Box sx={{ overflow: 'hidden' }}>
                <Tooltip title={item.name}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.name}
                  </Typography>
                </Tooltip>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  {item.type === 'directory'
                    ? 'Folder'
                    : formatBytes(item.size)}
                </Typography>
              </Box>
            </Box>

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onOpenActionMenu(e, item);
              }}
              sx={{ p: 0.5 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Paper>
        );
      })}
    </Box>
  );
}

export default CompactView;
