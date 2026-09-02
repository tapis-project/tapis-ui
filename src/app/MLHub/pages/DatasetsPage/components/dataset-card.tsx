import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import FolderIcon from '@mui/icons-material/Folder';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { Dataset } from '@mlhub/datasets-ts-sdk';
import { DatasetProvider } from '@mlhub/datasets-ts-sdk';
import { formatBytes } from '../utils/format';

const PROVIDER_COLOR: Record<DatasetProvider, 'info' | 'warning'> = {
  [DatasetProvider.HuggingFace]: 'info',
  [DatasetProvider.Tapis]: 'warning',
};

export function DatasetCard({
  dataset,
  onOpen,
}: {
  dataset: Dataset;
  onOpen: (id: string) => void;
}) {
  const isPublic = dataset.visibility === 'Public';
  const accent = PROVIDER_COLOR[dataset.provider];

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        transition: 'box-shadow 180ms ease, transform 180ms ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardActionArea
        onClick={() => onOpen(dataset.id)}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          p: 2,
          textAlign: 'left',
          '& .MuiCardActionArea-focusHighlight': {
            display: 'none',
          },
        }}
      >
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, width: '100%' }}>
          {/* Header */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 40,
                height: 40,
                bgcolor: `${accent}.main`,
                color: `${accent}.contrastText`,
                flexShrink: 0,
              }}
            >
              {dataset.provider === 'HuggingFace' ? (
                <CloudIcon fontSize="small" />
              ) : (
                <StorageIcon fontSize="small" />
              )}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle1"
                noWrap
                sx={{ fontWeight: 600, lineHeight: 1.2 }}
                title={dataset.id}
              >
                {dataset.id}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ lineHeight: 1.2 }}
              >
                {dataset.owner}
              </Typography>
            </Box>
            <Tooltip title={isPublic ? 'Public' : 'Private'}>
              <Box
                component="span"
                sx={{
                  color: isPublic ? 'success.main' : 'text.secondary',
                  display: 'flex',
                  flexShrink: 0,
                }}
              >
                {isPublic ? (
                  <PublicIcon fontSize="small" />
                ) : (
                  <LockIcon fontSize="small" />
                )}
              </Box>
            </Tooltip>
          </Stack>

          {/* Tags */}
          <Stack
            direction="row"
            spacing={0.5}
            useFlexGap
            sx={{ flexWrap: 'wrap', mt: 1.5 }}
          >
            {dataset.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ height: 22 }}
              />
            ))}
            {dataset.tags.length > 3 && (
              <Chip
                label={`+${dataset.tags.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ height: 22 }}
              />
            )}
          </Stack>

          {/* Meta row */}
          <Box
            sx={{
              pt: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: 'text.secondary',
            }}
          >
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <FolderIcon fontSize="small" />
              <Typography variant="body2">
                {dataset.items.length} file
                {dataset.items.length === 1 ? '' : 's'}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              ·
            </Typography>
            <Typography variant="body2">{formatBytes(dataset.size)}</Typography>
          </Box>
        </CardContent>
      </CardActionArea>

      <Divider />

      {/* Footer actions */}
      <CardActions sx={{ px: 1, py: 0.75, justifyContent: 'space-between' }}>
        <Chip
          label={dataset.provider}
          size="small"
          color={accent}
          sx={{ height: 22, '& .MuiChip-label': { px: 1, fontSize: 11 } }}
        />
        <Stack
          component="button"
          onClick={() => onOpen(dataset.id)}
          direction="row"
          spacing={0.5}
          sx={{
            alignItems: 'center',
            cursor: 'pointer',
            bgcolor: 'transparent',
            border: 'none',
            p: 0.5,
            borderRadius: 1,
            color: 'primary.main',
            fontSize: 13,
            fontWeight: 600,
            '&:hover': { bgcolor: 'action.hover' },
          }}
          aria-label={`Open ${dataset.id}`}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: 'primary.main' }}
          >
            View
          </Typography>
          <ChevronRightIcon fontSize="small" />
        </Stack>
      </CardActions>
    </Card>
  );
}
