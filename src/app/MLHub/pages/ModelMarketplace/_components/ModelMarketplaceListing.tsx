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
  Skeleton,
} from '@mui/material';
import { useMemo } from 'react';
import * as Models from '@mlhub/models-ts-sdk';
import {
  InferenceBackend,
  inferenceBackendColorMap,
  inferenceBackendLabelMap,
} from '../../../enums';
import {
  Download,
  Favorite,
  LibraryAddOutlined,
  OpenInNew,
  StorageOutlined,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { formatCount } from '../../../_utils';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { useNavigate } from '../../../_context/NavContext';
import { useToast } from '../../../_context/ToastsContext/useToast';
import {
  derivedMetadataFor,
  modelAuthorFor,
  modelNameFor,
} from '../../../modelMetadata';

type ModelMarketplaceListingProps = {
  models: Array<Models.ExternalModel>;
  count?: number;
  previous?: () => void;
  next?: () => void;
  isLoading?: boolean;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';

  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 4);
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const value = bytes / 1024 ** unitIndex;

  return `${
    value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)
  } ${units[unitIndex]}`;
};

export const ModelMarketplaceListing: React.FC<
  ModelMarketplaceListingProps
> = ({ models, count, next, previous, isLoading }) => {
  // ----- Hooks
  const { navigate } = useNavigate();
  const toast = useToast();
  const { fork, isLoading: isAddingToCollection } = Hooks.Models.useForkModel();

  const appropriateModels: Models.ExternalModel[] = useMemo(() => {
    return models.filter((m) => {
      return (
        !derivedMetadataFor(m).tags.includes('not-for-all-audiences') &&
        !derivedMetadataFor(m).tags.includes('roleplay')
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
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
      {isLoading && appropriateModels.length === 0 ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }, (_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: '8px' }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Skeleton variant="rounded" width={110} height={24} />
                  <Skeleton width="68%" height={30} sx={{ mt: 1.5 }} />
                  <Skeleton width="88%" height={20} />
                  <Skeleton width="100%" height={48} sx={{ mt: 1.5 }} />
                  <Skeleton width="100%" height={1} sx={{ mt: 4, mb: 1.5 }} />
                  <Skeleton width="45%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {appropriateModels.map((model) => {
            const derived = derivedMetadataFor(model);
            const libraries = derived.inference_runtimes;
            const tags = derived.tags;
            const provider =
              model.provider === Models.ModelProvider.HuggingFace
                ? {
                    color: '#ff9d00',
                    icon: '🤗',
                    label: 'Hugging Face',
                  }
                : { color: '#7c3aed', icon: '◈', label: 'Tapis' };
            const name = modelNameFor(model);

            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={model.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
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
                      label={`${provider.icon} ${provider.label}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        borderColor: (theme) => alpha(provider.color, 0.4),
                        color: 'text.primary',
                        textTransform: 'none',
                      }}
                    />
                    <Tooltip title={`Open on ${provider.label}`}>
                      <IconButton
                        size="small"
                        href={`https://huggingface.co/${
                          model.huggingface_repo_locator?.id ?? model.id
                        }`}
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
                    {derived.task_types.map((t) => (
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
                      {name}
                    </Typography>

                    {/* Author info */}
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: 'block', mb: 0.75 }}
                    >
                      by {modelAuthorFor(model)} &middot; from {model.provider}{' '}
                      &middot; curated by MLHub
                    </Typography>

                    {/* Description */}

                    {/* Spacer */}
                    <Box sx={{ flex: 1 }} />

                    {/* Inference Backends */}
                    <Stack
                      direction="row"
                      sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}
                    >
                      {libraries.map((lib) => {
                        const library = lib as InferenceBackend;
                        const libraryColor =
                          inferenceBackendColorMap[library] ?? '#64748b';
                        const libraryLabel =
                          inferenceBackendLabelMap[library] ?? lib;
                        return (
                          <Chip
                            key={lib}
                            label={libraryLabel}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.65rem',
                              height: 20,
                              textTransform: 'capitalize',
                              borderColor: alpha(libraryColor, 0.35),
                              color: libraryColor,
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
                      <Stack
                        direction="row"
                        sx={{ flexWrap: 'wrap', gap: 0.4 }}
                      >
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
                        label={derived.license ?? 'unknown'}
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

                    {/* Footer: stats + collection action */}
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
                        {derived.downloads && (
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
                              {formatCount(derived.downloads)}
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
                            {formatCount(derived.likes ?? 0)}{' '}
                            {/** TODO check for undefined */}
                          </Typography>
                        </Stack>
                        {derived.size !== undefined && (
                          <Stack
                            direction="row"
                            sx={{ gap: 0.35, alignItems: 'center' }}
                          >
                            <StorageOutlined
                              sx={{ fontSize: 15, color: 'text.secondary' }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600, color: 'text.secondary' }}
                            >
                              {formatBytes(derived.size)}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>

                      <Button
                        size="small"
                        startIcon={<LibraryAddOutlined />}
                        disabled={isAddingToCollection}
                        onClick={() => {
                          fork(
                            {
                              createModelBody: {
                                external_model_id: model.id,
                                name,
                              },
                            },
                            {
                              onSuccess: (response) => {
                                toast.success(
                                  `${name} was added to your collection.`
                                );
                                navigate(
                                  `/models?model=${encodeURIComponent(
                                    response.result.id
                                  )}`
                                );
                              },
                            }
                          );
                        }}
                        sx={{ flexShrink: 0, textTransform: 'none' }}
                      >
                        Add to collection
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </>
  );
};
