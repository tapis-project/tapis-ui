import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
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
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import TableChartIcon from '@mui/icons-material/TableChart';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { Dataset, DatasetItem } from '@mlhub/datasets-ts-sdk';
import { DatasetProvider } from '@mlhub/datasets-ts-sdk';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { useHistory } from 'react-router-dom';
import { toFilesV2Route } from '../../Files/V2/utils';
import { DatasetProviderIcon } from '../_components';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** unitIndex;

  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  })} ${units[unitIndex]}`;
}

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

function DatasetPlatformButton({ dataset }: { dataset: Dataset }) {
  const history = useHistory();

  if (dataset.provider === DatasetProvider.HuggingFace) {
    const repositoryId = dataset.huggingface_repo_locator?.id;
    const repositoryUrl = repositoryId
      ? `https://huggingface.co/datasets/${repositoryId
          .split('/')
          .map(encodeURIComponent)
          .join('/')}`
      : undefined;

    return (
      <Button
        variant="outlined"
        size="small"
        href={repositoryUrl ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        disabled={!repositoryUrl}
        startIcon={
          <DatasetProviderIcon provider={DatasetProvider.HuggingFace} />
        }
        endIcon={<OpenInNewIcon />}
        sx={{
          borderColor: 'divider',
          color: 'text.primary',
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        View on Hugging Face
      </Button>
    );
  }

  const systemId = dataset.tapis_system_locator?.system_id;
  const path = dataset.tapis_system_locator?.path || '/';

  return (
    <Button
      variant="outlined"
      size="small"
      disabled={!systemId}
      startIcon={<DatasetProviderIcon provider={DatasetProvider.Tapis} />}
      onClick={() => systemId && history.push(toFilesV2Route(systemId, path))}
      sx={{
        borderColor: 'divider',
        color: 'text.primary',
        textTransform: 'none',
        fontWeight: 600,
      }}
    >
      View on Tapis
    </Button>
  );
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
  const query = Hooks.Datasets.useGetDataset(
    selectedId ? { datasetId: selectedId } : undefined
  );
  const dataset = query.data?.result;

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
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                color: 'text.secondary',
                flexShrink: 0,
              }}
            >
              <DatasetProviderIcon provider={dataset?.provider} size={26} />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
                {dataset?.name || dataset?.id || 'Dataset details'}
              </Typography>
              {query.isLoading ? (
                <Typography variant="caption" color="text.secondary" noWrap>
                  Loading…
                </Typography>
              ) : dataset ? (
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 0, sm: 1 }}
                  sx={{ minWidth: 0 }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    title={dataset.id}
                    sx={{ fontFamily: 'monospace' }}
                  >
                    UUID: {dataset.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {dataset.owner} · tenant {dataset.tenant_id}
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="caption" color="text.secondary" noWrap>
                  UUID: {selectedId}
                </Typography>
              )}
            </Box>
          </Stack>
          <IconButton aria-label="Close drawer" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {query.isLoading && (
            <Box sx={{ p: 3 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading dataset…
              </Typography>
            </Box>
          )}

          {query.isError && (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="error">
                {query.error instanceof Error
                  ? query.error.message
                  : 'Unable to load dataset details.'}
              </Typography>
            </Box>
          )}

          {!query.isLoading && !query.isError && dataset && (
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
                <Box sx={{ mt: 2 }}>
                  <DatasetPlatformButton dataset={dataset} />
                </Box>
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
