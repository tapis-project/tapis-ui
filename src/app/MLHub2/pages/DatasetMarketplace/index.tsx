import * as React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  alpha,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import PublicIcon from '@mui/icons-material/Public';
import DownloadIcon from '@mui/icons-material/Download';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GetAppIcon from '@mui/icons-material/GetApp';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import type {
  MarketplaceDataset,
  DatasetPlatform,
  DatasetFormat,
} from '../../types';

// ── Platform config ───────────────────────────────────
const platformConfig: Record<
  DatasetPlatform,
  { label: string; color: string; icon: string }
> = {
  huggingface: { label: 'Hugging Face', color: '#FFD21E', icon: '🤗' },
  kaggle: { label: 'Kaggle', color: '#20BEFF', icon: '📊' },
  uciml: { label: 'UCI ML Repository', color: '#1a237e', icon: '📚' },
  github: { label: 'GitHub', color: '#24292e', icon: '🐙' },
  activeloop: { label: 'ActiveLoop / Hub', color: '#00b4d8', icon: '🔄' },
};

const domainColorMap: Record<string, string> = {
  'Computer Vision': '#7c3aed',
  NLP: '#2563eb',
  Tabular: '#059669',
  Audio: '#dc2626',
  Multimodal: '#c2410c',
};

const formatLabelMap: Record<DatasetFormat, string> = {
  csv: 'CSV',
  parquet: 'Parquet',
  json: 'JSON',
  jsonl: 'JSONL',
  image: 'Image',
  text: 'Text',
  delta: 'Delta Lake',
  audio: 'Audio',
  custom: 'Custom',
};

const ALL_PLATFORMS: DatasetPlatform[] = [
  'huggingface',
  'kaggle',
  'uciml',
  'github',
  'activeloop',
];
const ALL_DOMAINS = [
  'Computer Vision',
  'NLP',
  'Tabular',
  'Audio',
  'Multimodal',
];
const ALL_FORMATS: DatasetFormat[] = [
  'csv',
  'parquet',
  'json',
  'jsonl',
  'image',
  'text',
  'delta',
  'custom',
];

interface DatasetMarketplaceProps {
  datasets: MarketplaceDataset[];
}

export default function DatasetMarketplace({
  datasets,
}: DatasetMarketplaceProps) {
  const navigate = useNavigate();

  // ─── Filter state ───────────────────────────────
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<
    Set<DatasetPlatform>
  >(new Set());
  const [selectedDomains, setSelectedDomains] = React.useState<string[]>([]);
  const [showFilters, setShowFilters] = React.useState(false);

  // ─── Filtering logic ────────────────────────────
  const filteredDatasets = React.useMemo(() => {
    return datasets.filter((dataset) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          dataset.name,
          dataset.description,
          dataset.domain,
          dataset.author,
          ...dataset.tags,
        ]
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      // Platform filter
      if (
        selectedPlatforms.size > 0 &&
        !selectedPlatforms.has(dataset.platform)
      )
        return false;

      // Domain filter
      if (
        selectedDomains.length > 0 &&
        !selectedDomains.includes(dataset.domain)
      )
        return false;

      return true;
    });
  }, [datasets, searchQuery, selectedPlatforms, selectedDomains]);

  // ─── Toggle helpers ────────────────────────────
  const togglePlatform = (platform: DatasetPlatform) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      next.has(platform) ? next.delete(platform) : next.add(platform);
      return next;
    });
  };

  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domain)
        ? prev.filter((d) => d !== domain)
        : [...prev, domain]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedPlatforms(new Set());
    setSelectedDomains([]);
  };

  const hasActiveFilters =
    searchQuery || selectedPlatforms.size > 0 || selectedDomains.length > 0;

  // ─── Format number helper ──────────────────────
  const formatCount = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <Box>
      {/* ─── Header ─────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <PublicIcon sx={{ fontSize: 28, color: 'secondary.main' }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            Datasets Marketplace
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Discover curated datasets from leading open-source platforms and
          repositories — brought to you by MLHub.
        </Typography>
      </Box>

      {/* ─── Search + Filter Bar ─────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
            <TextField
              placeholder="Search by name, domain, author, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              size="small"
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
                        size="small"
                        onClick={() => setSearchQuery('')}
                        edge="end"
                      >
                        <ClearIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                bgcolor: 'background.default',
              }}
            />

            <Tooltip title={showFilters ? 'Hide filters' : 'Show filters'}>
              <Button
                variant={showFilters ? 'contained' : 'outlined'}
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                Filters
                {hasActiveFilters && (
                  <Chip
                    label={
                      (searchQuery ? 1 : 0) +
                      selectedPlatforms.size +
                      selectedDomains.length
                    }
                    size="small"
                    color="secondary"
                    sx={{
                      ml: 1,
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  />
                )}
              </Button>
            </Tooltip>

            {hasActiveFilters && (
              <Button
                size="small"
                onClick={clearAllFilters}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
              >
                Clear all
              </Button>
            )}
          </Stack>

          {/* ── Expanded Filters ───────────────────────── */}
          {showFilters && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />

              {/* Platform chips */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}
                >
                  Platform
                </Typography>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                  {ALL_PLATFORMS.map((platform) => {
                    const cfg = platformConfig[platform];
                    const isSelected = selectedPlatforms.has(platform);
                    return (
                      <Chip
                        key={platform}
                        label={`${cfg.icon} ${cfg.label}`}
                        onClick={() => togglePlatform(platform)}
                        variant={isSelected ? 'filled' : 'outlined'}
                        color={isSelected ? 'secondary' : 'default'}
                        sx={{
                          borderColor: isSelected ? undefined : 'divider',
                          '& .MuiChip-label': { fontWeight: 500 },
                          textTransform: 'none',
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>

              {/* Domain chips */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}
                >
                  Domain
                </Typography>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                  {ALL_DOMAINS.map((domain) => {
                    const isSelected = selectedDomains.includes(domain);
                    return (
                      <Chip
                        key={domain}
                        label={domain}
                        onClick={() => toggleDomain(domain)}
                        variant={isSelected ? 'filled' : 'outlined'}
                        sx={{
                          bgcolor: isSelected
                            ? alpha(domainColorMap[domain], 0.12)
                            : undefined,
                          color: isSelected
                            ? domainColorMap[domain]
                            : undefined,
                          borderColor: isSelected ? undefined : 'divider',
                          '& .MuiChip-label': { fontWeight: 500 },
                          textTransform: 'capitalize',
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ─── Results Summary ────────────────────────────── */}
      <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
        Showing {filteredDatasets.length} of {datasets.length} curated datasets
      </Typography>

      {/* ─── Dataset Cards Grid ─────────────────────────── */}
      {filteredDatasets.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px dashed',
            borderColor: 'divider',
            py: 10,
            textAlign: 'center',
          }}
        >
          <PublicIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No datasets found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Try adjusting your search or filter criteria.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {filteredDatasets.map((dataset) => {
            const platCfg = platformConfig[dataset.platform];

            return (
              <Grid size={{ xs: 12 }} key={dataset.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition:
                      'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: (theme) =>
                        `0 12px 28px ${alpha(
                          theme.palette.secondary.main,
                          0.1
                        )}`,
                      borderColor: (theme) =>
                        alpha(theme.palette.secondary.main, 0.25),
                    },
                  }}
                >
                  {/* Card Header with platform badge */}
                  <Box
                    sx={{
                      px: 2.5,
                      pt: 2.25,
                      pb: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Chip
                      label={`${platCfg.icon} ${platCfg.label}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        borderColor: (theme) => alpha(platCfg.color, 0.4),
                        color: 'text.primary',
                        textTransform: 'none',
                      }}
                    />
                    <Tooltip title="Open on source platform">
                      <IconButton
                        size="small"
                        href={dataset.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        sx={{ opacity: 0.55, '&:hover': { opacity: 1 } }}
                      >
                        <OpenInNewIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <CardContent
                    sx={{
                      flex: 1,
                      p: 2.5,
                      pt: 0.5,
                      '&:last-child': { pb: 2.5 },
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Domain badge */}
                    <Chip
                      label={dataset.domain}
                      size="small"
                      color="secondary"
                      variant="filled"
                      sx={{
                        alignSelf: 'flex-start',
                        fontWeight: 600,
                        fontSize: '0.68rem',
                        height: 22,
                        mb: 1.25,
                        textTransform: 'capitalize',
                      }}
                    />

                    {/* Name */}
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, lineHeight: 1.35, mb: 0.25 }}
                    >
                      {dataset.name}
                    </Typography>

                    {/* Author info */}
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: 'block', mb: 0.75 }}
                    >
                      by {dataset.author}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.55,
                        mb: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: 44,
                      }}
                    >
                      {dataset.description}
                    </Typography>

                    {/* Spacer */}
                    <Box sx={{ flex: 1 }} />

                    {/* Format + Size + Rows info */}
                    <Stack
                      direction="row"
                      sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}
                    >
                      <Chip
                        label={formatLabelMap[dataset.format]}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.65rem',
                          height: 20,
                          textTransform: 'uppercase',
                          borderColor: 'divider',
                          color: 'text.secondary',
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={dataset.size}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.65rem',
                          height: 20,
                          fontFamily: 'monospace',
                          borderColor: 'divider',
                          color: 'text.secondary',
                          fontWeight: 600,
                        }}
                      />
                      {dataset.rowCount != null && (
                        <Chip
                          label={`${formatCount(dataset.rowCount)} rows`}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.65rem',
                            height: 20,
                            fontFamily: 'monospace',
                            borderColor: 'divider',
                            color: 'text.secondary',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Stack>

                    {/* Tags + License */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        mb: 1.75,
                      }}
                    >
                      <Stack
                        direction="row"
                        sx={{ flexWrap: 'wrap', gap: 0.4 }}
                      >
                        {dataset.tags.slice(0, 4).map((tag) => (
                          <Chip
                            key={tag}
                            label={`#${tag}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.62rem',
                              height: 18,
                              borderColor: 'divider',
                              textTransform: 'none',
                            }}
                          />
                        ))}
                      </Stack>
                      <Chip
                        icon={<span style={{ fontSize: 10 }}>⚖</span>}
                        label={dataset.license}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.65rem',
                          height: 20,
                          borderColor: 'divider',
                          color: 'text.disabled',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                          '& .MuiChip-label': { fontWeight: 500 },
                        }}
                      />
                    </Box>

                    {/* Footer: stats + Download button */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        pt: 1.5,
                      }}
                    >
                      {/* Stats */}
                      <Stack
                        direction="row"
                        sx={{ gap: 1.5, alignItems: 'center' }}
                      >
                        {/* Downloads */}
                        <Stack
                          direction="row"
                          sx={{ gap: 0.35, alignItems: 'center' }}
                        >
                          <DownloadIcon
                            sx={{ fontSize: 15, color: 'text.secondary' }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, color: 'text.secondary' }}
                          >
                            {formatCount(dataset.downloads)}
                          </Typography>
                        </Stack>
                        {/* Likes */}
                        <Stack
                          direction="row"
                          sx={{ gap: 0.35, alignItems: 'center' }}
                        >
                          <FavoriteBorderIcon
                            sx={{ fontSize: 15, color: 'error.main' }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, color: 'text.secondary' }}
                          >
                            {formatCount(dataset.likes)}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Download Button — bottom right */}
                      <Button
                        variant="contained"
                        size="small"
                        color="secondary"
                        startIcon={<GetAppIcon sx={{ fontSize: 16 }} />}
                        href={dataset.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: 2,
                          px: 2,
                          boxShadow: 'none',
                          '&:hover': {
                            boxShadow: (theme) =>
                              `0 4px 12px ${alpha(
                                theme.palette.secondary.main,
                                0.3
                              )}`,
                          },
                        }}
                      >
                        Get Dataset
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
