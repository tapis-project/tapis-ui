import React from 'react';
import {
  Card,
  CardActionArea,
  Box,
  Typography,
  IconButton,
  Checkbox,
  Tooltip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { FileItem } from '../../types/file-system';
import { getFileIcon } from '../../utils/icon-resolver';
import { formatBytes, formatDate } from '../../utils/formatters';

export interface FileCardProps {
  item: FileItem;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onToggleCheckbox: (e: React.MouseEvent) => void;
  onOpen: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onOpenActionMenu: (e: React.MouseEvent) => void;
}

export function FileCard({
  item,
  isSelected,
  onSelect,
  onToggleCheckbox,
  onOpen,
  onContextMenu,
  onOpenActionMenu,
}: FileCardProps) {
  return (
    <Card
      elevation={0}
      onContextMenu={onContextMenu}
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2.5,
        border: '1.5px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        bgcolor: isSelected ? 'action.selected' : 'background.paper',
        transition: 'all 0.18s ease-in-out',
        userSelect: 'none',
        '&:hover': {
          borderColor: isSelected ? 'primary.main' : 'primary.light',
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Top action header: Checkbox, Shared Indicator, Context Trigger */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 0.75,
          px: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover',
        }}
      >
        <Checkbox
          size="small"
          checked={isSelected}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheckbox(e);
          }}
          aria-label={`Select ${item.name}`}
          sx={{ p: 0.25 }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {item.isShared && (
            <Tooltip title="Shared with colleagues">
              <PeopleIcon sx={{ fontSize: 16, color: 'info.main' }} />
            </Tooltip>
          )}
          <IconButton
            size="small"
            onClick={onOpenActionMenu}
            sx={{ p: 0.25 }}
            title="Actions"
          >
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Main Clickable Content Area */}
      <CardActionArea
        onClick={onSelect}
        onDoubleClick={onOpen}
        sx={{
          p: 1.5,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        }}
      >
        {/* Large Icon (Image/video preview removed; showing standard file/folder icon) */}
        <Box
          sx={{
            width: '100%',
            height: 90,
            borderRadius: 1.5,
            mb: 1.25,
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ transform: 'scale(1.8)' }}>
            {getFileIcon(item.type, item.extension, item.mimeType)}
          </Box>
        </Box>

        {/* File / Folder Name */}
        <Tooltip title={item.name} enterDelay={600}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              lineHeight: 1.3,
              width: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 0.5,
            }}
          >
            {item.name}
          </Typography>
        </Tooltip>

        {/* File details: Size and Last Modified */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: '0.75rem', mt: 'auto' }}
        >
          {item.type === 'directory' ? 'Folder' : formatBytes(item.size)} •{' '}
          {formatDate(item.updatedAt)}
        </Typography>
      </CardActionArea>
    </Card>
  );
}

export default FileCard;
