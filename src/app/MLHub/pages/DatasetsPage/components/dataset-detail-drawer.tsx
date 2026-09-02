import * as React from 'react';
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import TableChartIcon from '@mui/icons-material/TableChart';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DescriptionIcon from '@mui/icons-material/Description';
import type { Dataset, DatasetItem } from '@mlhub/datasets-ts-sdk';
import { DatasetProvider } from '@mlhub/datasets-ts-sdk';
import { useGetDataset } from '../hooks/use-get-dataset';
import { formatBytes } from '../utils/format';

function locatorSummary(dataset: Dataset): string {
  if (dataset.provider === DatasetProvider.HuggingFace) {
    return dataset.huggingface_repo_locator.id || 'Hugging Face repo';
  }
  if (dataset.tapis_system_locator) {
    return (
      [
        dataset.tapis_system_locator.system_id,
        dataset.tapis_system_locator.path,
      ]
        .filter(Boolean)
        .join(' : ') || 'Tapis system'
    );
  }
  return '—';
}

function fileBase(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

function fileIcon(path: string): React.ReactNode {
  if (path.endsWith('/')) {
    return <FolderIcon fontSize="small" />;
  }
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'parquet':
    case 'csv':
    case 'tsv':
    case 'jsonl':
      return <TableChartIcon fontSize="small" />;
    case 'json':
    case 'yaml':
    case 'yml':
      return <DataObjectIcon fontSize="small" />;
    case 'py':
    case 'js':
    case 'ts':
    case 'sh':
    case 'ipynb':
      return <CodeIcon fontSize="small" />;
    case 'txt':
    case 'md':
      return <DescriptionIcon fontSize="small" />;
    default:
      return <InsertDriveFileIcon fontSize="small" />;
  }
}

function totalItemsSize(items: DatasetItem[]): number {
  return items.reduce((sum, item) => sum + item.size, 0);
}

function DatasetItemRow({ item }: { item: DatasetItem }) {
  return (
    <ListItem
      disableGutters
      secondaryAction={
        <Typography variant="caption" color="text.secondary" component="span">
          {formatBytes(item.size)}
        </Typography>
      }
    >
      <ListItemAvatar sx={{ minWidth: 36 }}>
        <Avatar
          variant="rounded"
          sx={{
            width: 28,
            height: 28,
            bgcolor: `${
              item.path.endsWith('/') ? 'action.selected' : 'action.hover'
            }`,
            color: item.path.endsWith('/') ? 'text.primary' : 'text.secondary',
          }}
        >
          {fileIcon(item.path)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
            {fileBase(item.path)}
          </Typography>
        }
        secondary={
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            component="span"
            sx={{ fontFamily: 'monospace' }}
          >
            {item.path}
          </Typography>
        }
      />
    </ListItem>
  );
}

export function DatasetDetailDrawer({
  selectedId,
  onClose,
}: {
  selectedId: string | null;
  onClose: () => void;
}) {
  const { dataset, isLoading, error } = useGetDataset(selectedId);

  return (
    <Drawer
      anchor="right"
      open={Boolean(selectedId)}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: '92vw',
          maxWidth: 1100,
          height: '100%',
          bgcolor: 'background.default',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header bar */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 1.5,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', minWidth: 0 }}
          >
            <Avatar
              variant="rounded"
              sx={{
                width: 40,
                height: 40,
                bgcolor: `${
                  dataset?.provider === DatasetProvider.HuggingFace
                    ? 'info'
                    : 'warning'
                }.main`,
                color: `${
                  dataset?.provider === DatasetProvider.HuggingFace
                    ? 'info'
                    : 'warning'
                }.contrastText`,
                flexShrink: 0,
              }}
            >
              {dataset?.provider === DatasetProvider.HuggingFace ? (
                <CloudIcon fontSize="small" />
              ) : (
                <StorageIcon fontSize="small" />
              )}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
                {dataset?.id ?? 'Dataset details'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {isLoading
                  ? 'Loading…'
                  : dataset
                  ? `${dataset.owner} · tenant ${dataset.tenant_id}`
                  : '\u00A0'}
              </Typography>
            </Box>
          </Stack>
          <IconButton aria-label="Close drawer" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {isLoading && (
            <Box sx={{ p: 3 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading dataset…
              </Typography>
            </Box>
          )}

          {error && (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            </Box>
          )}

          {!isLoading && !error && dataset && (
            <Stack spacing={3} sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
              {/* Title / summary */}
              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ flexWrap: 'wrap', mb: 1.5 }}
                >
                  <Chip label={dataset.provider} size="small" />
                  <Chip
                    label={dataset.visibility}
                    size="small"
                    variant="outlined"
                    color={
                      dataset.visibility === 'Public' ? 'success' : 'default'
                    }
                  />
                </Stack>
                <Stack
                  direction="row"
                  spacing={0.5}
                  useFlexGap
                  sx={{ flexWrap: 'wrap' }}
                >
                  {dataset.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>

              <Divider />

              {/* Facts */}
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Details
                </Typography>
                <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemText primary="Owner" secondary={dataset.owner} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Tenant"
                      secondary={dataset.tenant_id}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Total size"
                      secondary={formatBytes(dataset.size)}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Location"
                      secondary={locatorSummary(dataset)}
                    />
                  </ListItem>
                </List>
              </Box>

              <Divider />

              {/* Repo / system locator */}
              <Box>
                {dataset.provider === DatasetProvider.HuggingFace ? (
                  <>
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Hugging Face repo
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ wordBreak: 'break-word' }}
                    >
                      {dataset.huggingface_repo_locator.id}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
                    >
                      sha {dataset.huggingface_repo_locator.sha}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Tapis system
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ wordBreak: 'break-word' }}
                    >
                      site: {dataset.tapis_system_locator.site_id}
                      <br />
                      system: {dataset.tapis_system_locator.system_id}
                      <br />
                      path: {dataset.tapis_system_locator.path || '—'}
                    </Typography>
                  </>
                )}
              </Box>

              <Divider />

              {/* Files */}
              <Box>
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Files
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dataset.items.length} ·{' '}
                    {formatBytes(totalItemsSize(dataset.items))}
                  </Typography>
                </Stack>
                <List dense disablePadding sx={{ mt: 0.5 }}>
                  {dataset.items.map((item) => (
                    <DatasetItemRow key={item.path} item={item} />
                  ))}
                </List>
              </Box>
            </Stack>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
