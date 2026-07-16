import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import type { SxProps } from '@mui/material/styles';

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
        <Chip
          key={tag}
          label={tag}
          size="small"
          sx={{ borderRadius: 4, fontWeight: 500 }}
        />
      ))}
    </Box>
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
