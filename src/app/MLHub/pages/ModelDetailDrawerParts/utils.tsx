import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import Typography from '@mui/material/Typography';
import type { SxProps } from '@mui/material/styles';

const TAG_MAX_LENGTH = 25;

function truncateTag(tag: string): string {
  if (tag.length <= TAG_MAX_LENGTH) return tag;
  return tag.slice(0, TAG_MAX_LENGTH - 3) + '...';
}

interface TagCloudProps {
  tags: string[];
  sx?: SxProps;
}

export function TagCloud({ tags, sx }: TagCloudProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        ...sx,
      }}
    >
      {tags.map((tag) => (
        <TruncatedTagChip key={tag} tag={tag} />
      ))}
    </Box>
  );
}

interface ExpandableTagCloudProps {
  tags: string[];
  showCount: number;
  sx?: SxProps;
}

interface TruncatedTagChipProps {
  tag: string;
}

function TruncatedTagChip({ tag }: TruncatedTagChipProps) {
  const display = truncateTag(tag);
  if (display !== tag) {
    return (
      <Tooltip title={tag} arrow>
        <Chip
          label={display}
          size="small"
          sx={{ borderRadius: 4, fontWeight: 500 }}
        />
      </Tooltip>
    );
  }
  return (
    <Chip label={tag} size="small" sx={{ borderRadius: 4, fontWeight: 500 }} />
  );
}

export function ExpandableTagCloud({
  tags,
  showCount,
  sx,
}: ExpandableTagCloudProps) {
  if (!tags || tags.length === 0) return null;

  const [dialogOpen, setDialogOpen] = useState(false);
  const hasMore = tags.length > showCount;
  const visibleTags = tags.slice(0, showCount);
  const hiddenCount = tags.length - showCount;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          ...sx,
        }}
      >
        {visibleTags.map((tag) => (
          <TruncatedTagChip key={tag} tag={tag} />
        ))}
        {hasMore && (
          <Chip
            label={`+${hiddenCount} more`}
            size="small"
            onClick={() => setDialogOpen(true)}
            sx={{
              borderRadius: 4,
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': { opacity: 0.85 },
            }}
          />
        )}
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="tags-dialog-title"
      >
        <DialogTitle id="tags-dialog-title">All Tags</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            pt: 1,
          }}
        >
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{ borderRadius: 4, fontWeight: 500 }}
            />
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface KeyValueRowProps {
  label: string;
  value: string | number | boolean | null | undefined;
  formatValue?: (val: unknown) => string;
}

export function KeyValueRow({ label, value, formatValue }: KeyValueRowProps) {
  const displayValue =
    value === null || value === undefined
      ? '—'
      : value === true
      ? 'Yes'
      : value === false
      ? 'No'
      : formatValue
      ? formatValue(value)
      : String(value);

  return (
    <div style={{ marginBottom: 12 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ marginTop: 0.5, fontWeight: 500 }}>
        {displayValue}
      </Typography>
    </div>
  );
}

interface KeyValueGridProps {
  rows: Array<{
    label: string;
    value: string | number | boolean | null | undefined;
    formatValue?: (val: unknown) => string;
  }>;
  columns?: number;
}

export function KeyValueGrid({ rows, columns = 2 }: KeyValueGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '8px 24px',
      }}
    >
      {rows.map((row) => (
        <KeyValueRow key={row.label} {...row} />
      ))}
    </div>
  );
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}
