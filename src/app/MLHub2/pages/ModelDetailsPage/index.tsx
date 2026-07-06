import * as React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  Card,
  CardContent,
  alpha,
  Button,
  Grid,
  Tooltip,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SpeedIcon from '@mui/icons-material/Speed';
import type { Model, Deployment, Artifact } from '../../types';

// Shared
import {
  modelStatusColorMap,
  frameworkIconMap,
  frameworkLabelMap,
} from '../../_components/constants';
import MetaItem from '../../_components/MetaItem';

interface ModelDetailsPageProps {
  models: Model[];
  deployments: Deployment[];
  artifacts: Artifact[];
  onEdit: (model: Model) => void;
  onDelete: (id: string) => void;
}

export default function ModelDetailsPage({
  models,
  deployments,
  artifacts,
  onEdit,
  onDelete,
}: ModelDetailsPageProps) {
  const { modelId } = useParams<{ modelId: string }>();
  const history = useHistory();

  const model = models.find((m) => m.id === modelId);

  if (!model) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" gutterBottom>
          Model not found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The model you&apos;re looking for does not exist or has been removed.
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => history.push('/')}
          variant="contained"
        >
          Back to Models
        </Button>
      </Box>
    );
  }

  const relatedDeployments = deployments.filter((d) => d.modelId === model.id);
  const relatedArtifacts = artifacts.filter((a) => a.modelId === model.id);

  /* Helpers */
  const depChipColor = (
    s: Deployment['status']
  ): 'success' | 'error' | 'warning' | 'info' | 'default' =>
    s === 'Running'
      ? 'success'
      : s === 'Failed'
      ? 'error'
      : s === 'Blocked'
      ? 'warning'
      : s === 'Unknown'
      ? 'info'
      : 'default';

  const artChipColor = (
    s: Artifact['status']
  ): 'success' | 'error' | 'warning' | 'default' =>
    s === 'available'
      ? 'success'
      : s === 'uploading'
      ? 'warning'
      : s === 'error'
      ? 'error'
      : 'default';

  const modelIdSx = {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    bgcolor: 'grey.100',
    px: 0.75,
    py: 0.2,
    borderRadius: 1,
    color: 'text.secondary',
  };

  return (
    <Box>
      {/* ─── Header ─────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => history.push('/models')}
            sx={{ mr: 1, textTransform: 'none' }}
          >
            Models
          </Button>
          <Typography variant="body2" color="text.disabled">
            /
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            Model Details
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Inspect model metadata, performance scores, deployments, and linked
          artifacts.
        </Typography>
      </Box>

      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2.5,
            flexWrap: 'wrap',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              background: (t) => alpha(t.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <SmartToyIcon sx={{ fontSize: 34, color: 'primary.main' }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1, width: 200 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
            >
              {model.name}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1.25, flexWrap: 'wrap' }}
            >
              <Chip
                label={`v${model.version}`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: '0.72rem' }}
              />
              <Chip
                label={
                  model.status.charAt(0).toUpperCase() + model.status.slice(1)
                }
                size="small"
                color={modelStatusColorMap[model.status]}
                sx={{ fontWeight: 500, textTransform: 'capitalize' }}
              />
              {model.libraries.map((lib) => (
                <Chip
                  key={lib}
                  icon={<span>{frameworkIconMap[lib]}</span>}
                  label={frameworkLabelMap[lib]}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
              ))}
            </Stack>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Delete this model">
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                onClick={() => onDelete(model.id)}
                size="small"
              >
                Delete
              </Button>
            </Tooltip>
            <Tooltip title="Edit model">
              <Button
                startIcon={<EditIcon />}
                variant="contained"
                onClick={() => onEdit(model)}
                size="small"
              >
                Edit Model
              </Button>
            </Tooltip>
          </Stack>
        </Box>
      </Paper>

      {/* Description */}
      <Card
        variant="outlined"
        sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.03), mb: 3 }}
      >
        <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            Description
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            {model.description || 'No description provided.'}
          </Typography>
        </CardContent>
      </Card>

      {/* Metrics + Metadata Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* F1 Score Card */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              background: (t) => {
                const f1 = model.f1Score;
                return f1 != null && f1 >= 95
                  ? alpha(t.palette.success.main, 0.06)
                  : f1 != null && f1 >= 85
                  ? alpha(t.palette.warning.main, 0.06)
                  : 'transparent';
              },
            }}
          >
            <CardContent
              sx={{ py: 3, '&:last-child': { pb: 3 }, textAlign: 'center' }}
            >
              {(() => {
                const f1 = model.f1Score;
                const f1Color =
                  f1 != null && f1 >= 95
                    ? 'success.main'
                    : f1 != null && f1 >= 85
                    ? 'warning.main'
                    : 'text.disabled';
                const f1TextColor =
                  f1 != null && f1 >= 95
                    ? 'success.main'
                    : f1 != null && f1 >= 85
                    ? 'warning.main'
                    : 'error.main';

                return (
                  <>
                    <SpeedIcon sx={{ fontSize: 40, mb: 1.5, color: f1Color }} />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                      sx={{ fontWeight: 500 }}
                    >
                      F1 Score
                    </Typography>
                    {model.f1Score != null ? (
                      <>
                        <Typography
                          variant="h2"
                          sx={{
                            fontWeight: 800,
                            lineHeight: 1,
                            letterSpacing: '-0.02em',
                            color: f1TextColor,
                          }}
                        >
                          {model.f1Score}%
                        </Typography>
                        <Box
                          sx={{
                            mt: 2,
                            mx: 'auto',
                            width: 160,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'divider',
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: `${model.f1Score}%`,
                              borderRadius: 4,
                              bgcolor: f1TextColor,
                              transition: 'width 0.6s ease',
                            }}
                          />
                        </Box>
                      </>
                    ) : (
                      <Typography
                        variant="h3"
                        sx={{ color: 'text.disabled', fontWeight: 700 }}
                      >
                        —
                      </Typography>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </Grid>

        {/* Metadata Card */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ mb: 2, fontWeight: 600 }}
              >
                Metadata
              </Typography>
              <Stack spacing={2}>
                <MetaItem
                  icon={<PersonIcon fontSize="inherit" />}
                  label="Author"
                  value={model.author}
                />
                <MetaItem
                  icon={<FingerprintIcon fontSize="inherit" />}
                  label="Model ID"
                  value={
                    <Typography component="span" variant="body2" sx={modelIdSx}>
                      {model.id}
                    </Typography>
                  }
                />
                <MetaItem
                  icon={<CalendarTodayIcon fontSize="inherit" />}
                  label="Created"
                  value={new Date(model.createdAt).toLocaleDateString(
                    undefined,
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                />
                <MetaItem
                  icon={<UpdateIcon fontSize="inherit" />}
                  label="Last Updated"
                  value={new Date(model.updatedAt).toLocaleDateString(
                    undefined,
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tags */}
      {model.tags.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mb: 1.5, fontWeight: 600 }}
          >
            Tags
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {model.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="medium"
                color="primary"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Related Deployments */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <RocketLaunchIcon sx={{ fontSize: 20, color: 'success.main' }} />{' '}
          Active Deployments ({relatedDeployments.length})
        </Typography>
        {relatedDeployments.length > 0 ? (
          <Card variant="outlined">
            <Box sx={{ overflowX: 'auto' }}>
              {relatedDeployments.map((dep) => (
                <Box
                  key={dep.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2.5,
                    py: 1.5,
                    borderBottom: (t) =>
                      `1px solid ${alpha(t.palette.divider, 0.6)}`,
                    ':last-child': { borderBottom: 'none' },
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.75}
                    sx={{ alignItems: 'center' }}
                  >
                    <RocketLaunchIcon
                      sx={{
                        fontSize: 20,
                        color:
                          dep.environment === 'production'
                            ? 'error.main'
                            : 'warning.main',
                      }}
                    />
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, fontSize: '0.88rem' }}
                      >
                        {dep.environment === 'production'
                          ? 'Production'
                          : 'Staging'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dep.replicas}x replicas · {dep.cpu} CPU / {dep.memory}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <Chip
                      label={dep.status}
                      size="small"
                      color={depChipColor(dep.status)}
                      sx={{
                        textTransform: 'capitalize',
                        fontWeight: 500,
                        fontSize: '0.72rem',
                        height: 26,
                      }}
                    />
                    <Typography
                      component="code"
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.68rem',
                        bgcolor: (t) =>
                          t.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                        color: (t) =>
                          t.palette.mode === 'dark'
                            ? 'grey.300'
                            : 'text.secondary',
                        px: 0.7,
                        py: 0.25,
                        borderRadius: 1,
                        maxWidth: 260,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        border: (t) =>
                          t.palette.mode === 'dark' ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      {dep.endpoint}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Card>
        ) : (
          <Card
            variant="outlined"
            sx={{
              py: 5,
              textAlign: 'center',
              bgcolor: (t) => alpha(t.palette.text.secondary, 0.04),
            }}
          >
            <RocketLaunchIcon
              sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }}
            />
            <Typography variant="body1" color="text.secondary">
              No deployments for this model yet
            </Typography>
          </Card>
        )}
      </Box>

      {/* Related Artifacts */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <FolderOpenIcon sx={{ fontSize: 20, color: 'info.main' }} /> Artifacts
          ({relatedArtifacts.length})
        </Typography>
        {relatedArtifacts.length > 0 ? (
          <Card variant="outlined">
            <Box sx={{ overflowX: 'auto' }}>
              {relatedArtifacts.map((art) => (
                <Box
                  key={art.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2.5,
                    py: 1.5,
                    borderBottom: (t) =>
                      `1px solid ${alpha(t.palette.divider, 0.6)}`,
                    ':last-child': { borderBottom: 'none' },
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.75}
                    sx={{ alignItems: 'center' }}
                  >
                    <FolderOpenIcon
                      sx={{ fontSize: 20, color: 'text.secondary' }}
                    />
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, fontSize: '0.88rem' }}
                      >
                        {art.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {art.storageType.toUpperCase()} · {art.size}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    label={art.status}
                    size="small"
                    color={artChipColor(art.status)}
                    sx={{
                      textTransform: 'capitalize',
                      fontSize: '0.72rem',
                      height: 26,
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Card>
        ) : (
          <Card
            variant="outlined"
            sx={{
              py: 5,
              textAlign: 'center',
              bgcolor: (t) => alpha(t.palette.text.secondary, 0.04),
            }}
          >
            <FolderOpenIcon
              sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }}
            />
            <Typography variant="body1" color="text.secondary">
              No artifacts registered for this model
            </Typography>
          </Card>
        )}
      </Box>
    </Box>
  );
}
