import {
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import PublicIcon from '@mui/icons-material/Public';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import * as Datasets from '@mlhub/datasets-ts-sdk';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import * as React from 'react';
import type { ReactElement } from 'react';

const providerConfig: Record<
  Datasets.DatasetProvider,
  { color: string; icon: ReactElement; label: string }
> = {
  [Datasets.DatasetProvider.HuggingFace]: {
    color: '#b7791f',
    icon: <CloudOutlinedIcon fontSize="small" />,
    label: 'Hugging Face',
  },
  [Datasets.DatasetProvider.Tapis]: {
    color: '#1976d2',
    icon: <StorageOutlinedIcon fontSize="small" />,
    label: 'Tapis',
  },
};

const formatBytes = (bytes: number) => {
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
};

const getDatasetLabel = (dataset: Datasets.Dataset) =>
  dataset.provider === Datasets.DatasetProvider.HuggingFace
    ? dataset.huggingface_repo_locator.id
    : dataset.id;

function DatasetCard({ dataset }: { dataset: Datasets.Dataset }) {
  const provider = providerConfig[dataset.provider];
  const isPublic = dataset.visibility === Datasets.Visibility.Public;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: (theme) =>
            `0 12px 28px ${alpha(theme.palette.primary.main, 0.1)}`,
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
        },
      }}
    >
      <CardContent
        sx={{
          height: '100%',
          p: 2.5,
          '&:last-child': { pb: 2.5 },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <Chip
            icon={provider.icon}
            label={provider.label}
            size="small"
            variant="outlined"
            sx={{
              color: provider.color,
              borderColor: alpha(provider.color, 0.4),
              fontWeight: 600,
              fontSize: '0.72rem',
            }}
          />
          <Chip
            icon={isPublic ? <PublicIcon /> : <LockOutlinedIcon />}
            label={isPublic ? 'Public' : 'Private'}
            size="small"
            variant="outlined"
            sx={{
              color: isPublic ? 'success.dark' : 'text.secondary',
              borderColor: isPublic ? 'success.light' : 'divider',
              fontWeight: 600,
              fontSize: '0.68rem',
              '& .MuiChip-icon': { fontSize: 15 },
            }}
          />
        </Stack>

        <Typography
          variant="subtitle1"
          title={getDatasetLabel(dataset)}
          sx={{
            fontWeight: 700,
            lineHeight: 1.35,
            mt: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {getDatasetLabel(dataset)}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, minHeight: 20 }}
        >
          Dataset ID: {dataset.id}
        </Typography>

        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, mt: 2 }}>
          <PersonOutlineIcon sx={{ color: 'text.secondary', fontSize: 17 }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {dataset.owner}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          sx={{ flexWrap: 'wrap', gap: 0.5, mt: 2, minHeight: 22 }}
        >
          {dataset.tags.slice(0, 4).map((tag) => (
            <Chip
              key={tag}
              label={`#${tag}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 20, borderColor: 'divider' }}
            />
          ))}
          {dataset.tags.length > 4 && (
            <Chip
              label={`+${dataset.tags.length - 4}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 20, borderColor: 'divider' }}
            />
          )}
        </Stack>

        <Box sx={{ flex: 1 }} />

        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            gap: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            mt: 2,
            pt: 1.5,
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
            <FolderOutlinedIcon
              sx={{ color: 'text.secondary', fontSize: 17 }}
            />
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 600 }}
            >
              {dataset.item_count.toLocaleString()} item
              {dataset.item_count === 1 ? '' : 's'}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {formatBytes(dataset.size)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DatasetCardSkeleton() {
  return (
    <Card variant="outlined" sx={{ borderRadius: '8px' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Skeleton variant="rounded" width={108} height={24} />
          <Skeleton variant="rounded" width={74} height={24} />
        </Stack>
        <Skeleton width="68%" height={30} sx={{ mt: 1.5 }} />
        <Skeleton width="88%" height={20} />
        <Skeleton width="55%" height={20} sx={{ mt: 1.5 }} />
        <Skeleton width="45%" height={20} />
        <Skeleton width="100%" height={1} sx={{ mt: 4, mb: 1.5 }} />
        <Skeleton width="42%" height={20} />
      </CardContent>
    </Card>
  );
}

function PaginationControls({
  canGoPrevious,
  canGoNext,
  isFetching,
  onPrevious,
  onNext,
}: {
  canGoPrevious: boolean;
  canGoNext: boolean;
  isFetching: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Button
        variant="outlined"
        startIcon={<NavigateBeforeIcon />}
        disabled={isFetching || !canGoPrevious}
        onClick={onPrevious}
        sx={{ textTransform: 'none' }}
      >
        Previous
      </Button>
      <Button
        variant="outlined"
        endIcon={<NavigateNextIcon />}
        disabled={isFetching || !canGoNext}
        onClick={onNext}
        sx={{ textTransform: 'none' }}
      >
        Next
      </Button>
    </Stack>
  );
}

type PaginationMetadata = {
  count?: number;
  cursor?: string;
  next_cursor?: string;
  prev_cursor?: string;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function DatasetsMarketplacePage() {
  const [limit, setLimit] = React.useState(25);
  const [cursor, setCursor] = React.useState<string | undefined>();
  const [previousCursors, setPreviousCursors] = React.useState<
    Array<string | undefined>
  >([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data, isLoading, isFetching, isError, error } =
    Hooks.Datasets.useListGlobalDatasets(
      { cursor, includeCount: true, limit },
      { keepPreviousData: true }
    );

  console.log({ data });
  const datasets = data?.result ?? [];
  const metadata = (data?.metadata ?? {}) as PaginationMetadata;
  const totalCount = metadata.count;
  const nextCursor = metadata.cursor ?? metadata.next_cursor;
  const previousCursor = metadata.prev_cursor;

  const filteredDatasets = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return datasets;

    return datasets.filter((dataset) => {
      const searchableFields = [
        dataset.id,
        dataset.owner,
        dataset.provider,
        dataset.visibility,
        dataset.size,
        dataset.item_count,
        ...(dataset.tags ?? []),
        dataset.huggingface_repo_locator?.id ?? '',
        dataset.huggingface_repo_locator?.sha ?? '',
        dataset.tapis_system_locator?.path ?? '',
        dataset.tapis_system_locator?.site_id ?? '',
        dataset.tapis_system_locator?.system_id ?? '',
        dataset.tapis_system_locator?.tenant_id ?? '',
      ];

      return searchableFields.join(' ').toLowerCase().includes(query);
    });
  }, [datasets, searchQuery]);

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setCursor(undefined);
    setPreviousCursors([]);
  };

  const handleNextPage = () => {
    if (!nextCursor) return;

    setPreviousCursors((previous) => [...previous, cursor]);
    setCursor(nextCursor);
  };

  const handlePreviousPage = () => {
    if (previousCursors.length > 0) {
      const priorCursor = previousCursors.at(-1);
      setPreviousCursors((previous) => previous.slice(0, -1));
      setCursor(priorCursor);
      return;
    }

    if (previousCursor) setCursor(previousCursor);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <StorefrontIcon sx={{ fontSize: 28, color: 'info.main' }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            Datasets Marketplace
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Discover public datasets contributed to MLHub from connected data
          platforms.
        </Typography>
      </Box>

      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }, (_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <DatasetCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : isError ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'error.light',
            p: 4,
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Unable to load global datasets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error instanceof Error ? error.message : 'Please try again later.'}
          </Typography>
        </Card>
      ) : datasets.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: '8px',
            border: '1px dashed',
            borderColor: 'divider',
            py: 10,
            textAlign: 'center',
          }}
        >
          <StorefrontIcon
            sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No global datasets found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Global datasets will appear here when they become available.
          </Typography>
        </Card>
      ) : (
        <>
          <Card
            elevation={0}
            sx={{
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'divider',
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                sx={{ alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5 }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search this page by dataset, owner, tag, provider..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon
                            sx={{ color: 'text.secondary', fontSize: 20 }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery ? (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="Clear dataset search"
                            edge="end"
                            size="small"
                            onClick={() => setSearchQuery('')}
                          >
                            <ClearIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </InputAdornment>
                      ) : undefined,
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', gap: 1, flexShrink: 0 }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 600 }}
                  >
                    Limit
                  </Typography>
                  <FormControl size="small">
                    <Select
                      value={limit}
                      onChange={(event) =>
                        handleLimitChange(Number(event.target.value))
                      }
                      sx={{ minWidth: 76, borderRadius: '8px' }}
                    >
                      {PAGE_SIZE_OPTIONS.map((pageSize) => (
                        <MenuItem key={pageSize} value={pageSize}>
                          {pageSize}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Box sx={{ mb: 3 }}>
            <PaginationControls
              canGoPrevious={previousCursors.length > 0 || !!previousCursor}
              canGoNext={!!nextCursor}
              isFetching={isFetching}
              onPrevious={handlePreviousPage}
              onNext={handleNextPage}
            />
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1,
              mb: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {filteredDatasets.length.toLocaleString()} of{' '}
              {datasets.length.toLocaleString()} dataset
              {datasets.length === 1 ? '' : 's'} on this page
              {typeof totalCount === 'number'
                ? ` (${totalCount.toLocaleString()} global datasets total)`
                : ''}
            </Typography>
            {isFetching && (
              <Typography variant="caption" color="text.secondary">
                Loading page…
              </Typography>
            )}
          </Stack>

          {filteredDatasets.length === 0 ? (
            <Card
              elevation={0}
              sx={{
                borderRadius: '8px',
                border: '1px dashed',
                borderColor: 'divider',
                py: 7,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No datasets match this search
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                Try another term or clear the search to see this page’s
                datasets.
              </Typography>
              <Button size="small" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {filteredDatasets.map((dataset) => (
                <Grid key={dataset.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <DatasetCard dataset={dataset} />
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ mt: 3 }}>
            <PaginationControls
              canGoPrevious={previousCursors.length > 0 || !!previousCursor}
              canGoNext={!!nextCursor}
              isFetching={isFetching}
              onPrevious={handlePreviousPage}
              onNext={handleNextPage}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
