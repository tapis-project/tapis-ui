import * as React from 'react';
import {
  Box,
  Chip,
  Container,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Paper,
  useMediaQuery,
  useTheme,
  Skeleton,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import SearchIcon from '@mui/icons-material/Search';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import StorageIcon from '@mui/icons-material/Storage';
import PublicIcon from '@mui/icons-material/Public';
import type { Dataset } from '@mlhub/datasets-ts-sdk';
import { DatasetProvider } from '@mlhub/datasets-ts-sdk';
import { useListDatasets } from './hooks/use-list-datasets';
import { DatasetCard } from './components/dataset-card';
import { DatasetDetailDrawer } from './components/dataset-detail-drawer';
import { formatBytes } from './utils/format';

const ALL_PROVIDERS: DatasetProvider[] = [
  DatasetProvider.HuggingFace,
  DatasetProvider.Tapis,
];

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { datasets, isLoading, error } = useListDatasets();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const [query, setQuery] = React.useState('');
  const [provider, setProvider] = React.useState<DatasetProvider | 'All'>(
    'All'
  );

  const filtered = React.useMemo(() => {
    if (!datasets) return [];
    const q = query.trim().toLowerCase();
    return datasets.filter((d) => {
      if (provider !== 'All' && d.provider !== provider) return false;
      if (!q) return true;
      return (
        d.id.toLowerCase().includes(q) ||
        d.owner.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [datasets, query, provider]);

  const totalSize = React.useMemo(
    () => (datasets ? datasets.reduce((sum, d) => sum + d.size, 0) : 0),
    [datasets]
  );
  const publicCount = React.useMemo(
    () =>
      datasets ? datasets.filter((d) => d.visibility === 'Public').length : 0,
    [datasets]
  );
  const providerCount = React.useMemo(
    () => (datasets ? new Set(datasets.map((d) => d.provider)).size : 0),
    [datasets]
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container
          maxWidth="xl"
          component="main"
          sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}
        >
          <Stack spacing={3}>
            <Box component="header">
              <Typography
                variant="h4"
                component="h1"
                sx={{ lineHeight: 1.2, mb: 0.25 }}
              >
                Datasets Registry
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.2 }}
              >
                Explore machine learning datasets indexed by the ML Hub
                registry.
              </Typography>
            </Box>

            <StatsRow
              total={datasets?.length ?? 0}
              bytes={totalSize}
              publicCount={publicCount}
              providers={providerCount}
              loading={isLoading}
            />

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction={isMobile ? 'column' : 'row'}
                spacing={2}
                sx={{ alignItems: 'center' }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by id, owner, or tag…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ flexWrap: 'wrap' }}
                >
                  <ProviderChip
                    label="All"
                    active={provider === 'All'}
                    onClick={() => setProvider('All')}
                  />
                  {ALL_PROVIDERS.map((p) => (
                    <ProviderChip
                      key={p}
                      label={p}
                      active={provider === p}
                      onClick={() => setProvider(p)}
                    />
                  ))}
                </Stack>
              </Stack>
            </Paper>

            <Typography variant="body2" color="text.secondary">
              {isLoading
                ? 'Loading…'
                : `${filtered.length} dataset${
                    filtered.length === 1 ? '' : 's'
                  }`}
            </Typography>

            {isLoading ? (
              <GridSkeleton />
            ) : error ? (
              <Typography variant="body1" color="error">
                {error}
              </Typography>
            ) : filtered.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No datasets match your filters.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                    xl: 'repeat(4, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {filtered.map((dataset: Dataset) => (
                  <DatasetCard
                    key={dataset.id}
                    dataset={dataset}
                    onOpen={setSelectedId}
                  />
                ))}
              </Box>
            )}
          </Stack>
        </Container>

        <DatasetDetailDrawer
          selectedId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      </Box>
    </ThemeProvider>
  );
}

function ProviderChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Chip
      label={label}
      onClick={onClick}
      color={active ? 'primary' : 'default'}
      variant={active ? 'filled' : 'outlined'}
      size="small"
    />
  );
}

function StatsRow({
  total,
  bytes,
  publicCount,
  providers,
  loading,
}: {
  total: number;
  bytes: number;
  publicCount: number;
  providers: number;
  loading: boolean;
}) {
  const items = [
    {
      label: 'Datasets',
      value: loading ? '—' : String(total),
      icon: <FolderOpenIcon fontSize="small" />,
    },
    {
      label: 'Total Size',
      value: loading ? '—' : formatBytes(bytes),
      icon: <StorageIcon fontSize="small" />,
    },
    {
      label: 'Public',
      value: loading ? '—' : String(publicCount),
      icon: <PublicIcon fontSize="small" />,
    },
    {
      label: 'Providers',
      value: loading ? '—' : String(providers),
      icon: <FolderOpenIcon fontSize="small" />,
    },
  ];
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
        gap: 2,
      }}
    >
      {items.map((item) => (
        <Paper key={item.label} variant="outlined" sx={{ p: 2 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', color: 'text.secondary' }}
          >
            {item.icon}
            <Typography variant="caption">{item.label}</Typography>
          </Stack>
          <Typography variant="h5" sx={{ mt: 1 }}>
            {item.value}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}

function GridSkeleton() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
        gap: 2,
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Paper key={i} variant="outlined" sx={{ p: 2 }}>
          <Skeleton width="40%" height={20} />
          <Skeleton width="80%" height={28} sx={{ mt: 1 }} />
          <Skeleton width="60%" height={16} sx={{ mt: 1 }} />
          <Skeleton width="100%" height={32} sx={{ mt: 2 }} />
        </Paper>
      ))}
    </Box>
  );
}
