import {
  Box,
  Button,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  Card,
} from '@mui/material';
import { useMemo } from 'react';
import * as Models from '@mlhub/models-ts-sdk';
import {
  InferenceBackend,
  getPlatformConfig,
  inferenceBackendColorMap,
  inferenceBackendLabelMap,
} from '../../../enums';
import { Download, Favorite, ForkRight, OpenInNew } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { formatCount } from '../../../_utils';

type ModelMarketplaceListingProps = {
  models: Array<Models.ModelMetadata>;
  count?: number;
  previous?: () => void;
  next?: () => void;
  isLoading?: boolean;
};

export const ModelMarketplaceListing: React.FC<
  ModelMarketplaceListingProps
> = ({ models, count, next, previous, isLoading }) => {
  const appropriateModels = useMemo(() => {
    return models.filter((m) => {
      return (
        !m.tags?.includes('not-for-all-audiences') &&
        !m.tags?.includes('roleplay')
      );
    });
  }, [models, count]);

  const renderInappropriateModelsCountComponent = () => {
    let diff = models.length - appropriateModels.length;
    if (diff > 0) {
      return (
        <>
          <Typography variant="body2" sx={{ color: '#d32f2f' }}>
            {diff} model{diff > 1 ? 's' : ''} hidden due to questionable content
          </Typography>
        </>
      );
    }
  };

  return (
    <>
      {/* ─── Results Summary ────────────────────────────── */}
      <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
        Showing {appropriateModels.length} of {models.length} curated models
        {appropriateModels.length < models.length &&
          renderInappropriateModelsCountComponent()}
      </Typography>
      {(next || previous) && (
        <Box sx={{ display: 'flex', width: '100%', mb: '8px' }}>
          <LoadingButton
            size="small"
            disabled={
              isLoading || previous === undefined || models.length === 0
            }
            loading={isLoading}
            onClick={previous}
            variant="outlined"
            sx={{ cursor: 'pointer', borderRadius: '3px' }}
            startIcon={<MdNavigateBefore />}
          >
            Previous
          </LoadingButton>
          <LoadingButton
            size="small"
            disabled={isLoading || next === undefined || models.length === 0}
            loading={isLoading}
            onClick={next}
            variant="outlined"
            sx={{ cursor: 'pointer', ml: 'auto', borderRadius: '3px' }}
            endIcon={<MdNavigateNext />}
          >
            Next
          </LoadingButton>
        </Box>
      )}
      <Grid container spacing={'16px'}>
        {appropriateModels.map((model) => {
          const libraries = model.libraries || [];
          const tags = model.tags || [];
          const platCfg = getPlatformConfig(model.canonical?.platform);

          return (
            <Grid size={{ xs: 12 }} key={model.author + model.name}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition:
                    'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: (theme) =>
                      `0 12px 28px ${alpha(theme.palette.primary.main, 0.1)}`,
                    borderColor: (theme) =>
                      alpha(theme.palette.primary.main, 0.25),
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
                      href={model.canonical?.locator.url!} // TODO Check for undefined
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      sx={{ opacity: 0.55, '&:hover': { opacity: 1 } }}
                    >
                      <OpenInNew sx={{ fontSize: 16 }} />
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
                  {/* Task badges */}
                  {model.task_types?.map((t) => (
                    <Chip
                      label={t}
                      size="small"
                      color="primary"
                      variant="filled"
                      sx={{
                        alignSelf: 'flex-start',
                        fontWeight: 600,
                        fontSize: '0.68rem',
                        height: 22,
                        mb: 1.25,
                        textTransform: 'none',
                      }}
                    />
                  ))}

                  {/* Name */}
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, lineHeight: 1.35, mb: 0.25 }}
                  >
                    {model.name}
                  </Typography>

                  {/* Author info */}
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ display: 'block', mb: 0.75 }}
                  >
                    by {model.canonical?.author} &middot; curated by MLHub
                  </Typography>

                  {/* Description */}
                  {model.description && (
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
                      {model.description}
                    </Typography>
                  )}

                  {/* Spacer */}
                  <Box sx={{ flex: 1 }} />

                  {/* Inference Backends */}
                  <Stack
                    direction="row"
                    sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}
                  >
                    {libraries.map((lib) => {
                      const library = lib as InferenceBackend;
                      return (
                        <Chip
                          key={lib}
                          label={inferenceBackendLabelMap[library]}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.65rem',
                            height: 20,
                            textTransform: 'capitalize',
                            borderColor: alpha(
                              inferenceBackendColorMap[library],
                              0.35
                            ),
                            color: inferenceBackendColorMap[library],
                            fontWeight: 600,
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                      );
                    })}
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
                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.4 }}>
                      {tags.map((tag) => (
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
                      label={model.license ?? 'unknown'}
                      size="small"
                      variant="outlined"
                      sx={{
                        textAlign: 'center',
                        // fontSize: '0.65rem',
                        // height: 20,
                        // borderColor: 'divider',
                        // color: 'text.disabled',
                        textTransform: 'uppercase',
                        // letterSpacing: '0.03em',
                        '& .MuiChip-label': { fontWeight: 500 },
                      }}
                    />
                  </Box>

                  {/* Footer: stats + Fork button */}
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
                      {model.canonical?.downloads && (
                        <Stack
                          direction="row"
                          sx={{ gap: 0.35, alignItems: 'center' }}
                        >
                          <Download
                            sx={{ fontSize: 15, color: 'text.secondary' }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, color: 'text.secondary' }}
                          >
                            {formatCount(model.canonical.downloads)}
                          </Typography>
                        </Stack>
                      )}
                      {/* Likes */}
                      <Stack
                        direction="row"
                        sx={{ gap: 0.35, alignItems: 'center' }}
                      >
                        <Favorite style={{ fontSize: 15, color: 'red' }} />
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: 'text.secondary' }}
                        >
                          {formatCount(model.canonical?.likes!)}{' '}
                          {/** TODO check for undefined */}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Fork Button — bottom right */}
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ForkRight sx={{ fontSize: 16 }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('Fork model');
                      }}
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
                              theme.palette.primary.main,
                              0.3
                            )}`,
                        },
                      }}
                    >
                      Fork Model
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
