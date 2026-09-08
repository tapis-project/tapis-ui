import * as React from 'react';
import type { ReactElement } from 'react';
import {
  alpha,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import DatasetIcon from '@mui/icons-material/Dataset';
import PublicIcon from '@mui/icons-material/Public';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import StorefrontIcon from '@mui/icons-material/Storefront';
import * as Datasets from '@mlhub/datasets-ts-sdk';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { useNavigate } from '../_context/NavContext';
import DatasetEmptyState from './DatasetEmptyState';
import { DatasetDetailDrawer } from './DatasetDetailDrawer';
import { DatasetProviderIcon } from '../_components';

type DatasetScope = 'owned' | 'shared';
type ViewMode = 'grid' | 'table';

type ScopeState = {
  cursor?: string;
  previousCursors: Array<string | undefined>;
  limit: number;
  searchQuery: string;
  viewMode: ViewMode;
};

type PaginationMetadata = {
  count?: number;
  cursor?: string;
  next_cursor?: string;
  prev_cursor?: string;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const providerConfig: Record<
  Datasets.DatasetProvider,
  { color: string; icon: ReactElement; label: string }
> = {
  [Datasets.DatasetProvider.HuggingFace]: {
    color: '#b7791f',
    icon: (
      <DatasetProviderIcon
        provider={Datasets.DatasetProvider.HuggingFace}
        size={18}
      />
    ),
    label: 'Hugging Face',
  },
  [Datasets.DatasetProvider.Tapis]: {
    color: '#1976d2',
    icon: (
      <DatasetProviderIcon
        provider={Datasets.DatasetProvider.Tapis}
        size={18}
      />
    ),
    label: 'Tapis',
  },
};

const initialScopeState = (): ScopeState => ({
  previousCursors: [],
  limit: 25,
  searchQuery: '',
  viewMode: 'grid',
});

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
  dataset.name || dataset.id;

const getDatasetAuthor = (dataset: Datasets.Dataset) => {
  if (dataset.provider !== Datasets.DatasetProvider.HuggingFace) {
    return dataset.owner;
  }

  return dataset.huggingface_repo_locator?.id?.split('/')[0] || dataset.owner;
};

const filterDatasets = (datasets: Datasets.Dataset[], query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return datasets;

  return datasets.filter((dataset) => {
    const searchableFields = [
      dataset.id,
      dataset.name ?? '',
      dataset.description ?? '',
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

    return searchableFields.join(' ').toLowerCase().includes(normalizedQuery);
  });
};

function ProviderChip({ dataset }: { dataset: Datasets.Dataset }) {
  const provider = providerConfig[dataset.provider];

  return (
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
  );
}

function VisibilityChip({ dataset }: { dataset: Datasets.Dataset }) {
  const isPublic = dataset.visibility === Datasets.Visibility.Public;

  return (
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
  );
}

function DatasetCard({
  dataset,
  onOpen,
}: {
  dataset: Datasets.Dataset;
  onOpen: (datasetId: string) => void;
}) {
  const provider = providerConfig[dataset.provider];

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
      <CardActionArea
        onClick={() => onOpen(dataset.id)}
        aria-label={`View details for ${getDatasetLabel(dataset)}`}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          textAlign: 'left',
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
            sx={{ justifyContent: 'space-between', gap: 1 }}
          >
            <ProviderChip dataset={dataset} />
            <VisibilityChip dataset={dataset} />
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
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Dataset ID: {dataset.id}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5 }}>
            by {getDatasetAuthor(dataset)} &middot; from {provider.label}
          </Typography>
          {dataset.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                lineHeight: 1.5,
                mt: 1.25,
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
              }}
            >
              {dataset.description}
            </Typography>
          )}
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
      </CardActionArea>
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

export default function DatasetCollectionPage() {
  const { navigate } = useNavigate();
  const [activeScope, setActiveScope] = React.useState<DatasetScope>('owned');
  const [selectedDatasetId, setSelectedDatasetId] = React.useState<
    string | null
  >(null);
  const [scopeState, setScopeState] = React.useState<
    Record<DatasetScope, ScopeState>
  >({ owned: initialScopeState(), shared: initialScopeState() });
  const activeState = scopeState[activeScope];

  const ownedQuery = Hooks.Datasets.useListOwnedDatasets(
    {
      cursor: scopeState.owned.cursor,
      includeCount: true,
      limit: scopeState.owned.limit,
    },
    { enabled: activeScope === 'owned', keepPreviousData: true }
  );
  const sharedQuery = Hooks.Datasets.useListSharedDatasets(
    {
      cursor: scopeState.shared.cursor,
      includeCount: true,
      limit: scopeState.shared.limit,
    },
    { enabled: activeScope === 'shared', keepPreviousData: true }
  );
  const query = activeScope === 'owned' ? ownedQuery : sharedQuery;
  const datasets = query.data?.result ?? [];
  const metadata = (query.data?.metadata ?? {}) as PaginationMetadata;
  const nextCursor = metadata.cursor ?? metadata.next_cursor;
  const previousCursor = metadata.prev_cursor;
  const filteredDatasets = React.useMemo(
    () => filterDatasets(datasets, activeState.searchQuery),
    [activeState.searchQuery, datasets]
  );

  const updateActiveState = (update: (current: ScopeState) => ScopeState) => {
    setScopeState((current) => ({
      ...current,
      [activeScope]: update(current[activeScope]),
    }));
  };

  const handleLimitChange = (limit: number) => {
    updateActiveState((current) => ({
      ...current,
      limit,
      cursor: undefined,
      previousCursors: [],
    }));
  };

  const handleNextPage = () => {
    if (!nextCursor) return;
    updateActiveState((current) => ({
      ...current,
      previousCursors: [...current.previousCursors, current.cursor],
      cursor: nextCursor,
    }));
  };

  const handlePreviousPage = () => {
    if (activeState.previousCursors.length > 0) {
      updateActiveState((current) => ({
        ...current,
        previousCursors: current.previousCursors.slice(0, -1),
        cursor: current.previousCursors.at(-1),
      }));
      return;
    }

    if (previousCursor) {
      updateActiveState((current) => ({ ...current, cursor: previousCursor }));
    }
  };

  const scopeLabel = activeScope === 'owned' ? 'owned' : 'shared';
  const canGoPrevious =
    activeState.previousCursors.length > 0 || Boolean(previousCursor);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.25,
            mb: 0.5,
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
            <DatasetIcon sx={{ fontSize: 28, color: 'secondary.main' }} />
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
            >
              My Datasets
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            size="small"
            startIcon={<StorefrontIcon />}
            onClick={() => navigate('/marketplaces/datasets')}
            sx={{ textTransform: 'none' }}
          >
            Explore Marketplace
          </Button>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Browse datasets you own and datasets shared with you in MLHub.
        </Typography>
      </Box>

      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          mb: 2.5,
        }}
      >
        <Tabs
          value={activeScope}
          onChange={(_, value: DatasetScope) => setActiveScope(value)}
          aria-label="Dataset collection scope"
          sx={{ px: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Tab
            value="owned"
            label="Owned"
            sx={{ textTransform: 'none', fontWeight: 700 }}
          />
          <Tab
            value="shared"
            label="Shared with me"
            sx={{ textTransform: 'none', fontWeight: 700 }}
          />
        </Tabs>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            sx={{ alignItems: { xs: 'stretch', md: 'center' }, gap: 1.5 }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search this page by dataset, owner, tag, provider..."
              value={activeState.searchQuery}
              onChange={(event) =>
                updateActiveState((current) => ({
                  ...current,
                  searchQuery: event.target.value,
                }))
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{ color: 'text.secondary', fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: activeState.searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Clear dataset search"
                        edge="end"
                        size="small"
                        onClick={() =>
                          updateActiveState((current) => ({
                            ...current,
                            searchQuery: '',
                          }))
                        }
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
                  value={activeState.limit}
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
              <ToggleButtonGroup
                exclusive
                size="small"
                value={activeState.viewMode}
                onChange={(_, value: ViewMode | null) =>
                  value &&
                  updateActiveState((current) => ({
                    ...current,
                    viewMode: value,
                  }))
                }
                aria-label="Dataset layout"
              >
                <ToggleButton value="grid" aria-label="Card view">
                  <ViewModuleIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="table" aria-label="Table view">
                  <ViewListIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ mb: 2.5 }}>
        <PaginationControls
          canGoPrevious={canGoPrevious}
          canGoNext={Boolean(nextCursor)}
          isFetching={query.isFetching}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
        />
      </Box>

      {query.isFetching ? (
        activeState.viewMode === 'grid' ? (
          <Grid container spacing={2}>
            {Array.from({ length: 6 }, (_, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
                <DatasetCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card variant="outlined" sx={{ borderRadius: '8px', p: 2 }}>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} height={46} />
            ))}
          </Card>
        )
      ) : query.isError ? (
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
            Unable to load {scopeLabel} datasets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {query.error instanceof Error
              ? query.error.message
              : 'Please try again later.'}
          </Typography>
        </Card>
      ) : datasets.length === 0 ? (
        <DatasetEmptyState
          scope={activeScope}
          onExploreMarketplace={() => navigate('/marketplaces/datasets')}
        />
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {filteredDatasets.length.toLocaleString()} of{' '}
            {datasets.length.toLocaleString()} dataset
            {datasets.length === 1 ? '' : 's'} on this page
          </Typography>
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
                Try another term or clear the search to see this page&apos;s
                datasets.
              </Typography>
              <Button
                size="small"
                onClick={() =>
                  updateActiveState((current) => ({
                    ...current,
                    searchQuery: '',
                  }))
                }
              >
                Clear search
              </Button>
            </Card>
          ) : activeState.viewMode === 'grid' ? (
            <Grid container spacing={2}>
              {filteredDatasets.map((dataset) => (
                <Grid key={dataset.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <DatasetCard
                    dataset={dataset}
                    onOpen={setSelectedDatasetId}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <DatasetTable
              datasets={filteredDatasets}
              onOpen={setSelectedDatasetId}
            />
          )}
          <Box sx={{ mt: 3 }}>
            <PaginationControls
              canGoPrevious={canGoPrevious}
              canGoNext={Boolean(nextCursor)}
              isFetching={query.isFetching}
              onPrevious={handlePreviousPage}
              onNext={handleNextPage}
            />
          </Box>
        </>
      )}
      <DatasetDetailDrawer
        selectedId={selectedDatasetId}
        onClose={() => setSelectedDatasetId(null)}
      />
    </Box>
  );
}

function DatasetTable({
  datasets,
  onOpen,
}: {
  datasets: Datasets.Dataset[];
  onOpen: (datasetId: string) => void;
}) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px',
        overflowX: 'auto',
      }}
    >
      <Box
        component="table"
        sx={{
          borderCollapse: 'collapse',
          minWidth: 850,
          width: '100%',
          '& th': {
            bgcolor: 'action.hover',
            color: 'text.secondary',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textAlign: 'left',
            textTransform: 'uppercase',
          },
          '& th, & td': {
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 2,
            py: 1.25,
            verticalAlign: 'top',
          },
          '& tbody tr:last-of-type td': { borderBottom: 0 },
          '& tbody tr': {
            cursor: 'pointer',
            transition: 'background-color 120ms ease',
          },
          '& tbody tr:hover, & tbody tr:focus-visible': {
            bgcolor: 'action.hover',
            outline: 'none',
          },
        }}
      >
        <thead>
          <tr>
            <th>Dataset</th>
            <th>Provider</th>
            <th>Visibility</th>
            <th>Tags</th>
            <th>Items</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {datasets.map((dataset) => (
            <tr
              key={dataset.id}
              tabIndex={0}
              aria-label={`View details for ${getDatasetLabel(dataset)}`}
              onClick={() => onOpen(dataset.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpen(dataset.id);
                }
              }}
            >
              <td>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {getDatasetLabel(dataset)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {dataset.id}
                </Typography>
                {dataset.description && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      lineHeight: 1.5,
                      mt: 0.5,
                      maxWidth: 300,
                    }}
                  >
                    {dataset.description}
                  </Typography>
                )}
              </td>
              <td>
                <ProviderChip dataset={dataset} />
              </td>
              <td>
                <VisibilityChip dataset={dataset} />
              </td>
              <td>
                <Stack
                  direction="row"
                  sx={{ flexWrap: 'wrap', gap: 0.5, maxWidth: 180 }}
                >
                  {dataset.tags.slice(0, 3).map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  ))}
                  {dataset.tags.length > 3 && (
                    <Chip
                      label={`+${dataset.tags.length - 3}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  )}
                </Stack>
              </td>
              <td>
                <Typography variant="body2">
                  {dataset.item_count.toLocaleString()}
                </Typography>
              </td>
              <td>
                <Typography variant="body2">
                  {formatBytes(dataset.size)}
                </Typography>
              </td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}
