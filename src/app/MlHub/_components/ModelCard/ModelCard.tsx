import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  SxProps,
  Theme,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LabelIcon from '@mui/icons-material/Label';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ModelMetadata, Platform } from '@mlhub/models-ts-sdk';
import { ClientStrategySet, Strategy } from '@mlhub/deployments-ts-sdk';
import { Code, Gavel, Polyline } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';

// ── Icons ──────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getPlatformName(platform: Platform): string {
  if (!platform) return 'Unknown';
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

function formatBigNumber(n: string): string {
  const val = Number(n);
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return String(val);
}

// ── Sub-components ─────────────────────────────────────────────

const PlatformChip = ({ platform }: { platform: Platform }) => {
  const color = platform === Platform.HuggingFace ? 'primary' : 'default';
  return (
    <Chip
      label={getPlatformName(platform) as any}
      size="small"
      sx={{
        borderRadius: 0.5,
        fontSize: '0.7rem',
        fontWeight: 600,
        height: 22,
        backgroundColor:
          color === 'primary' ? 'rgba(24,24,27,0.05)' : 'transparent',
        color: color === 'primary' ? 'text.primary' : 'text.secondary',
        border: '1px solid',
        borderColor: 'divider',
      }}
    />
  );
};

const HeartIcon = () => {
  return (
    <SvgIcon
      sx={{ width: 14, height: 14 }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </SvgIcon>
  );
};

const DownloadIcon = () => {
  return (
    <SvgIcon
      sx={{ width: 14, height: 14 }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </SvgIcon>
  );
};

// ── Deploy Popover Content ─────────────────────────────────────

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`deploy-tabpanel-${index}`}
      aria-labelledby={`deploy-tab-${index}`}
      style={{ width: '100%' }}
    >
      {value === index && <Box sx={{ py: 1.25 }}>{children}</Box>}
    </div>
  );
}

const DeployDropdown = ({
  clientStrategySets,
  model,
  onDeploy,
}: {
  clientStrategySets: ClientStrategySet[];
  model: ModelMetadata;
  onDeploy?: (model: ModelMetadata) => void;
}) => {
  const [tabValue, setTabValue] = React.useState(0);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    setTabValue(0);
  };

  const handleClose = () => setAnchorEl(null);
  const tabs = clientStrategySets.map((css) => {
    return css.platform;
  });
  const optionsCount = clientStrategySets.flatMap((s) => s.strategies).length;

  return (
    <>
      <Tooltip title="View all deployment strategies">
        <Button
          size="small"
          variant="outlined"
          startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
          onClick={handleOpen}
          disableRipple
          sx={{
            height: 26,
            px: 1.25,
            py: 0.35,
            fontSize: '0.71rem',
            fontWeight: 600,
            borderRadius: 0.5,
            color: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.05)',
            borderColor: 'rgba(37, 99, 235, 0.18)',
            textTransform: 'none',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
            minWidth: 0,
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              borderColor: 'rgba(37, 99, 235, 0.3)',
            },
            transition: 'all 0.15s ease',
          }}
        >
          Deploy
        </Button>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              width: '450px',
              borderRadius: 0.5,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'visible',
            },
          },
        }}
      >
        <Box sx={{ zIndex: 1 }}>
          <Box
            sx={{
              px: 2,
              pb: 0,
              pt: 1.25,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <CloudUploadIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'text.primary',
                }}
              >
                Deploy
              </Typography>
              <Chip
                label={`${optionsCount} opt${
                  optionsCount !== 1 ? 'ions' : 'ion'
                }`}
                size="small"
                sx={{
                  ml: 'auto',
                  height: 18,
                  fontSize: '0.55rem',
                  fontWeight: 600,
                  backgroundColor: 'action.hover',
                  color: 'text.secondary',
                }}
              />
            </Stack>
          </Box>

          {/* Platform tabs */}
          {tabs.length > 1 && (
            <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={(_, v) => setTabValue(v)}
                sx={{
                  minHeight: 32,
                  '& .MuiTab-root': {
                    minHeight: 32,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 1.5,
                    letterSpacing: '0.02em',
                    color: 'text.secondary',
                    '&.Mui-selected': { color: 'primary.main' },
                    '&:hover': { color: 'text.primary' },
                  },
                  '& .MuiTabs-indicator': {
                    height: 1.5,
                    borderRadius: 0.5,
                  },
                }}
              >
                {tabs.map((platform) => (
                  <Tab
                    key={platform}
                    label={platform}
                    id={`deploy-tab-${platform}`}
                    aria-controls={`deploy-tabpanel-${platform}`}
                    sx={{ fontSize: '0.675rem' }}
                  />
                ))}
              </Tabs>
            </Box>
          )}

          {/* Strategy chips per platform */}
          <Box sx={{ maxHeight: 200, overflow: 'auto', py: 0.5 }}>
            {clientStrategySets.map((css, i) => (
              <TabPanel key={css.platform} value={tabValue} index={i}>
                {tabs.length === 1 && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: 'text.disabled',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      mb: 0.75,
                      display: 'block',
                    }}
                  >
                    {css.platform}
                  </Typography>
                )}
                <Stack direction="column" spacing={0.5}>
                  {css.strategies.map((strategy: Strategy) => {
                    return (
                      <Box
                        key={strategy.name}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 1.25,
                          py: 0.65,
                          borderRadius: 0.5,
                          backgroundColor: 'action.hover' /** 'transparent' */,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'text.primary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {strategy.name}
                          </Typography>
                          {strategy.description && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.65rem',
                                color: 'text.disabled',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {strategy.description}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label="Deploy"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeploy?.(model);
                            handleClose();
                          }}
                          sx={{
                            width: 56,
                            height: 20,
                            fontSize: '0.575rem',
                            fontWeight: 700,
                            color: '#2563eb',
                            backgroundColor: 'rgba(37, 99, 235, 0.06)',
                            border: '1px solid',
                            borderColor: 'rgba(37, 99, 235, 0.15)',
                            borderRadius: 0.5,
                            flexShrink: 0,
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'rgba(37, 99, 235, 0.14)',
                              borderColor: 'rgba(37, 99, 235, 0.3)',
                            },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </TabPanel>
            ))}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              px: 2,
              py: 0.75,
              borderTop: '1px solid',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontSize: '0.6rem', color: 'text.disabled' }}
            >
              {tabs.length > 1
                ? 'Switch tabs to browse platforms'
                : 'Select a strategy above'}
            </Typography>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

// ── Main component ─────────────────────────────────────────────

interface ModelCardProps {
  model: ModelMetadata;
  scope: 'global' | 'tenant';
}

const ModelCard = ({ model, scope }: ModelCardProps) => {
  const history = useHistory();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const [keywordAnchorEl, setKeywordAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const openKeywords = Boolean(keywordAnchorEl);

  const clientStrategySets: Array<ClientStrategySet> =
    model.annotations?.deployment_strategies ?? [];

  let hasDeploymentStrats =
    clientStrategySets.flatMap((item) => item.strategies).length > 0;

  const visibleCount = 5;
  const keywords = model.keywords || [];
  const hiddenKeywords = keywords.slice(visibleCount);

  const libraries = model.libraries || [];
  const taskTypes = model.task_types || [];

  const handleViewDetails = () => {
    let scopeUri = scope === 'global' ? 'global/' : '';
    history.push(`/mlhub/${scopeUri}models/${model.author}/${model.name}`);
  };

  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: '3px',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          borderColor: 'rgba(37, 99, 235, 0.35)',
          boxShadow: '0 2px 8px rgb(0 0 0 / 0.04)',
        },
      }}
    >
      <CardContent
        sx={{
          p: 2,
          pb: 1.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          '&:last-child': { pb: 1.5 },
        }}
      >
        {/* ── 1. Left: Initials Avatar ──────────────────────── */}
        <Avatar
          sx={{
            flexShrink: 0,
            width: 52,
            height: 52,
            borderRadius: 0.5,
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            color: '#2563eb',
            fontWeight: 700,
            fontSize: '1rem',
            border: '2px solid',
            borderColor: 'divider',
          }}
        >
          {getInitials(model.name!)}
        </Avatar>

        {/* ── 2. Middle-left: Title / Author / Inference attributes ────── */}
        <Stack
          direction="column"
          spacing={0.5}
          sx={{ flex: '1 1 0', minWidth: 0 }}
        >
          {/* Title row - alignItems moved to sx */}
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ alignItems: 'center' }}
          >
            <Typography
              variant="subtitle1"
              onClick={handleViewDetails}
              sx={{
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.9375rem',
                lineHeight: 1.4,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {model.name}
            </Typography>

            {model.canonical && (
              <>
                {/* likes/downloads row - alignItems moved to sx */}
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: 'center' }}
                >
                  <PlatformChip platform={model.canonical.platform} />
                  {model.canonical?.likes && (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ alignItems: 'center' }}
                    >
                      <HeartIcon />
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      >
                        {formatBigNumber(`${model.canonical.likes!}`)}
                      </Typography>
                    </Stack>
                  )}
                  {model.canonical?.downloads && (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ alignItems: 'center' }}
                    >
                      <DownloadIcon />
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      >
                        {formatBigNumber(`${model.canonical.downloads!}`)}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
                {model.canonical?.gated !== undefined &&
                  model.canonical?.gated && (
                    <Chip
                      label="Gated"
                      size="small"
                      color="warning"
                      variant="filled"
                      sx={{
                        borderRadius: 0.5,
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        height: 20,
                      }}
                    />
                  )}
              </>
            )}
          </Stack>

          {/* Author */}
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8125rem',
              color: 'text.secondary',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            by <b>{model.author}</b>
          </Typography>

          {/** Task types */}
          {taskTypes.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Polyline sx={{ fontSize: 15, color: 'text.disabled' }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: 'text.disabled',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Capabilities
              </Typography>
              {(model.task_types || []).map((t) => (
                <Chip
                  key={t}
                  label={t}
                  size="small"
                  sx={{
                    borderRadius: 0.5,
                    border: '1px solid #69c0a5',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    height: 18,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#059669',
                  }}
                />
              ))}
            </Stack>
          )}

          {/** Libraries and framworks */}
          {libraries.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Code sx={{ fontSize: 15, color: 'text.disabled' }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: 'text.disabled',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Libraries
              </Typography>
              {libraries.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  size="small"
                  sx={{
                    borderRadius: 0.5,
                    border: '1px solid #FFD699',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    height: 18,
                    backgroundColor: '#FFF1DC',
                    color: 'warning.dark',
                  }}
                />
              ))}
            </Stack>
          )}

          {/* Keywords row - alignItems moved to sx */}
          {keywords.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              <LabelIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: 'text.disabled',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Keywords
              </Typography>
              {keywords.slice(0, visibleCount).map((kw) => (
                <Chip
                  key={kw}
                  label={kw.length > 22 ? kw.slice(0, 19) + '…' : kw}
                  size="small"
                  sx={{
                    borderRadius: 0.5,
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    height: 18,
                    backgroundColor: 'rgba(139, 92, 246, 0.05)',
                    color: '#7c3aed',
                    borderWidth: '1.5px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(139, 92, 246, 0.15)',
                  }}
                />
              ))}
              {keywords.length > visibleCount && (
                <Chip
                  label={`+${hiddenKeywords.length}`}
                  size="small"
                  onClick={(e) => setKeywordAnchorEl(e.currentTarget)}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.transform = 'scale(1.05)';
                    (e.target as HTMLElement).style.transition =
                      'transform 0.1s ease';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.transform = 'scale(1)';
                    (e.target as HTMLElement).style.transition =
                      'transform 0.1s ease';
                  }}
                  sx={{
                    borderRadius: 0.5,
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    height: 18,
                    backgroundColor: 'rgba(139, 92, 246, 0.03)',
                    color: 'text.disabled',
                    borderWidth: '1.5px',
                    borderStyle: 'dashed',
                    borderColor: 'rgba(139, 92, 246, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      borderColor: 'rgba(139, 92, 246, 0.4)',
                      color: '#7c3aed',
                    },
                  }}
                />
              )}
            </Stack>
          )}
          {model.license && (
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Gavel sx={{ fontSize: 15, color: 'text.disabled' }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: 'text.disabled',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                License
              </Typography>
              <Chip
                key={model.license}
                label={model.license}
                size="small"
                sx={{
                  borderRadius: 0.5,
                  border: '1px solid #2C67EC',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  height: 18,
                  backgroundColor: '#E6ECFD',
                  color: '#2C67EC',
                }}
              />
            </Stack>
          )}
        </Stack>

        {/* ── 3. Middle-right: Stats ──────────────────────────── */}
        {/* alignItems moved to sx */}
        <Stack
          direction="column"
          spacing={1}
          sx={{ alignItems: 'flex-end', flexShrink: 0 }}
        ></Stack>

        {/* ── 4. Right: Actions Menu ─────────────────────────── */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'stretch',
            ml: 0.5,
            mt: -0.25,
          }}
        >
          <IconButton
            size="small"
            aria-label="More actions"
            aria-controls={openMenu ? 'model-card-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openMenu ? 'true' : undefined}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              alignSelf: 'flex-end',
              borderRadius: 0.5,
              p: 0.75,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
                color: 'text.primary',
              },
            }}
          >
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
          {hasDeploymentStrats && (
            <Box sx={{ mt: 'auto' }}>
              <DeployDropdown
                clientStrategySets={clientStrategySets}
                model={model}
                onDeploy={() => {
                  alert('Deploy model');
                }}
              />
            </Box>
          )}

          <Menu
            id="model-card-menu"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={() => setAnchorEl(null)}
            onClick={() => setAnchorEl(null)}
            MenuListProps={{
              'aria-label': 'Model actions',
              sx: { py: 0.5, borderRadius: 2, minWidth: 200 },
            }}
            slotProps={{
              paper: {
                elevation: 4,
                sx: {
                  borderRadius: 0.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  mt: 0.5,
                  py: 0.5,
                },
              },
            }}
          >
            {/* View Details */}
            <MenuItem
              onClick={handleViewDetails}
              sx={{ borderRadius: 0.5, gap: 1.5, px: 1.5, py: 0.75 }}
            >
              <CloudUploadIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                View Details
              </Typography>
            </MenuItem>

            {/* Download / Source */}
            {model.canonical?.locator?.url && (
              <MenuItem
                onClick={() => {
                  if (model.canonical?.locator?.url) {
                    window.open(model.canonical?.locator.url, '_blank');
                  }
                }}
                sx={{ borderRadius: 0.5, gap: 1.5, px: 1.5, py: 0.75 }}
              >
                <SvgIcon
                  sx={{ fontSize: 18, color: 'text.secondary' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </SvgIcon>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  View on {getPlatformName(model.canonical.platform)}
                </Typography>
              </MenuItem>
            )}

            <Box
              sx={{
                my: 0.5,
                mx: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            />

            {/* Deploy option */}
            {hasDeploymentStrats && (
              <MenuItem
                onClick={() => {
                  alert('Deploy Model');
                }}
                sx={{ borderRadius: 0.5, gap: 1.5, px: 1.5, py: 0.75 }}
              >
                <CloudUploadIcon sx={{ fontSize: 18, color: 'success.main' }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: 'success.dark' }}
                >
                  Deploy
                </Typography>
              </MenuItem>
            )}

            {/* Share */}
            {/* <MenuItem
              onClick={() => actions?.onShare?.(model)}
              sx={{ borderRadius: 0.5, gap: 1.5, px: 1.5, py: 0.75 }}
            >
              <SvgIcon
                sx={{ fontSize: 18, color: 'text.secondary' }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </SvgIcon>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Share
              </Typography>
            </MenuItem> */}
          </Menu>
        </Box>
      </CardContent>

      {/* Keywords dropdown - hidden tags shown as clickable overlay */}
      <Popover
        open={openKeywords}
        anchorEl={keywordAnchorEl}
        onClose={() => setKeywordAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              p: 1.25,
              borderRadius: '3px',
              border: '1px solid',
              borderColor: 'divider',
              width: 'auto',
              maxWidth: 380,
              minWidth: 180,
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: -8,
                left: 'calc(50% - 8px)',
                width: 16,
                height: 16,
                background: 'inherit',
                border: '1px solid',
                borderColor: 'divider',
                transform: 'rotate(45deg)',
                borderTop: 'none',
                borderRight: 'none',
                zIndex: 0,
              },
            },
          },
        }}
      >
        <Box sx={{ zIndex: 1, position: 'relative' }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'text.disabled',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'block',
              mb: 0.75,
            }}
          >
            Keywords ({keywords.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.375 }}>
            {keywords.map((kw) => {
              const isHidden = keywords.indexOf(kw) >= visibleCount;
              return (
                <Chip
                  key={kw}
                  label={kw}
                  size="small"
                  sx={{
                    borderRadius: '2px',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    height: 18,
                    backgroundColor: isHidden
                      ? 'rgba(139, 92, 246, 0.08)'
                      : 'rgba(139, 92, 246, 0.03)',
                    color: isHidden ? '#7c3aed' : 'text.disabled',
                    borderWidth: '1.5px',
                    borderStyle: isHidden ? 'solid' : 'dashed',
                    borderColor: isHidden
                      ? 'rgba(139, 92, 246, 0.25)'
                      : 'rgba(139, 92, 246, 0.12)',
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Popover>
    </Card>
  );
};

export default ModelCard;
