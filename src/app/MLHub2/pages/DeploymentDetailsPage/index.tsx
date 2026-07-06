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
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MemoryIcon from '@mui/icons-material/Memory';
import SpeedIcon from '@mui/icons-material/Speed';
import DnsIcon from '@mui/icons-material/Dns';
import LinkIcon from '@mui/icons-material/Link';
import type { Deployment } from '../../types';

// Shared
import {
  deploymentStatusChipColor,
  deploymentStatusLabelMap,
  envColorMap,
} from '../../_components/constants';
import MetaItem from '../../_components/MetaItem';

interface DeploymentDetailsPageProps {
  deployments: Deployment[];
  onDelete: (id: string) => void;
}

export default function DeploymentDetailsPage({
  deployments,
  onDelete,
}: DeploymentDetailsPageProps) {
  const { '*': deploymentId } = useParams<{ '*': string }>();
  const history = useHistory();

  // HashRouter captures the wildcard segment after /deployments/
  const deployment = deployments.find((d) => d.id === deploymentId);

  if (!deployment) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" gutterBottom>
          Deployment not found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The deployment you&apos;re looking for does not exist or has been
          removed.
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => history.push('/deployments')}
          variant="contained"
        >
          Back to Deployments
        </Button>
      </Box>
    );
  }

  /* Helpers */
  const envLabel =
    deployment.environment.charAt(0).toUpperCase() +
    deployment.environment.slice(1);
  const statusLabel =
    deploymentStatusLabelMap[deployment.status] || deployment.status;
  const statusColor = deploymentStatusChipColor[deployment.status] || 'default';
  const envChipColor = envColorMap[deployment.environment];

  const deploymentIdSx = {
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
            onClick={() => history.push('/deployments')}
            sx={{ mr: 1, textTransform: 'none' }}
          >
            Deployments
          </Button>
          <Typography variant="body2" color="text.disabled">
            /
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            Deployment Details
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Inspect deployment configuration, resource allocation, endpoint
          health, and runtime details.
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
              background: (t) => alpha(t.palette.success.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <RocketLaunchIcon sx={{ fontSize: 34, color: 'success.main' }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1, width: 200 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
            >
              {deployment.modelName}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1.25, flexWrap: 'wrap' }}
            >
              <Chip
                label={envLabel}
                size="small"
                variant="outlined"
                color={envChipColor}
                sx={{ fontWeight: 600, textTransform: 'capitalize' }}
              />
              <Chip
                label={statusLabel}
                size="small"
                color={statusColor}
                sx={{ fontWeight: 500 }}
              />
              <Chip
                label={`${deployment.replicas}x replicas`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            </Stack>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Delete this deployment">
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                onClick={() => onDelete(deployment.id)}
                size="small"
              >
                Delete
              </Button>
            </Tooltip>
            <Tooltip title="Edit deployment configuration">
              <Button startIcon={<EditIcon />} variant="contained" size="small">
                Edit Config
              </Button>
            </Tooltip>
          </Stack>
        </Box>
      </Paper>

      {/* Description */}
      <Card
        variant="outlined"
        sx={{ bgcolor: (t) => alpha(t.palette.success.main, 0.03), mb: 3 }}
      >
        <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            Endpoint & Health
          </Typography>
          <Stack spacing={1.5}>
            <MetaItem
              icon={<LinkIcon fontSize="inherit" />}
              label="Endpoint URL"
              value={
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    bgcolor: (t) =>
                      t.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                    color: (t) =>
                      t.palette.mode === 'dark' ? 'grey.300' : 'text.secondary',
                    px: 1,
                    py: 0.35,
                    borderRadius: 1,
                    border: (t) =>
                      t.palette.mode === 'dark' ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  {deployment.endpoint}
                </Typography>
              }
            />
            {deployment.deployedAt && (
              <MetaItem
                icon={<CalendarTodayIcon fontSize="inherit" />}
                label="Deployed At"
                value={new Date(deployment.deployedAt).toLocaleString(
                  undefined,
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                )}
              />
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Metrics + Metadata Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Resources Card */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent
              sx={{ py: 3, '&:last-child': { pb: 3 }, textAlign: 'center' }}
            >
              <MemoryIcon
                sx={{ fontSize: 40, mb: 1.5, color: 'success.main' }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{ fontWeight: 500 }}
              >
                Resources Allocated
              </Typography>

              <Grid
                container
                spacing={2}
                sx={{ justifyContent: 'center', mt: 0.5 }}
              >
                <Grid size={6}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      color: 'primary.main',
                    }}
                  >
                    {deployment.cpu}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    CPU Cores
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      color: 'secondary.main',
                    }}
                  >
                    {deployment.memory}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Memory
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <DnsIcon sx={{ fontSize: 28, mb: 0.75, color: 'info.main' }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Replica Count
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 800, color: 'info.main' }}
              >
                {deployment.replicas}
              </Typography>
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
                  icon={<SmartToyIcon fontSize="inherit" />}
                  label="Model"
                  value={
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{ alignItems: 'center' }}
                    >
                      <RocketLaunchIcon
                        sx={{ fontSize: 16, color: 'primary.main' }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {deployment.modelName}
                      </Typography>
                      {deployment.modelVersion && (
                        <Chip
                          label={`v${deployment.modelVersion}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Stack>
                  }
                />
                <MetaItem
                  icon={<PersonIcon fontSize="inherit" />}
                  label="Started By"
                  value={deployment.startedBy}
                />
                <MetaItem
                  icon={<FingerprintIcon fontSize="inherit" />}
                  label="Deployment ID"
                  value={
                    <Typography
                      component="span"
                      variant="body2"
                      sx={deploymentIdSx}
                    >
                      {deployment.id}
                    </Typography>
                  }
                />
                <MetaItem
                  icon={<SpeedIcon fontSize="inherit" />}
                  label="Environment"
                  value={
                    <Chip
                      label={envLabel}
                      size="small"
                      color={envChipColor}
                      variant="outlined"
                      sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                    />
                  }
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Status Timeline */}
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
          <RocketLaunchIcon
            sx={{
              fontSize: 20,
              color:
                statusColor === 'success'
                  ? 'success.main'
                  : statusColor === 'error'
                  ? 'error.main'
                  : 'warning.main',
            }}
          />{' '}
          Status Information
        </Typography>
        <Card
          variant="outlined"
          sx={{
            py: 3,
            px: 3,
            bgcolor: (t) => alpha(t.palette[statusColor].main, 0.04),
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Chip
              label={statusLabel}
              color={statusColor}
              sx={{ fontWeight: 700, fontSize: '0.9rem', py: 1, px: 1 }}
            />
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, lineHeight: 1.4 }}
              >
                This deployment is currently in{' '}
                <strong>{statusLabel.toLowerCase()}</strong> state.
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.25, display: 'block' }}
              >
                Environment: <strong>{envLabel}</strong> · Replicas:{' '}
                <strong>{deployment.replicas}x</strong> · Resources:{' '}
                <strong>
                  {deployment.cpu} CPU / {deployment.memory} RAM
                </strong>
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}
