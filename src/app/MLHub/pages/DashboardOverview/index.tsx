import * as React from 'react';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import DatasetRoundedIcon from '@mui/icons-material/DatasetRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { DatasetProviderIcon } from '../../_components';
import { MarketplaceButton } from '../../_components/MarketplaceButton';
import { SectionHeader } from '../../_components/SectionHeader';
import { useNavigate } from '../../_context/NavContext';
import { modelAuthorFor } from '../../modelMetadata';

function ResourceSection({
  actionLabel,
  caption,
  children,
  count,
  icon,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  title,
}: {
  actionLabel: string;
  caption: string;
  children: React.ReactNode;
  count: number;
  icon: React.ReactElement;
  onAction: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  title: string;
}) {
  return (
    <Box
      sx={{
        borderTop: '3px solid',
        borderColor: 'primary.main',
        boxShadow: (theme) => theme.shadows[2],
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        px: 2,
        py: 2.25,
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 1.25,
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
          <Box>
            <Typography
              sx={{ fontWeight: 700, lineHeight: 1.25 }}
              variant="subtitle1"
            >
              {title}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              {caption}
            </Typography>
          </Box>
        </Stack>
        <Chip
          label={count}
          size="small"
          sx={{ fontWeight: 700 }}
          variant="outlined"
        />
      </Stack>
      <Stack spacing={0}>{children}</Stack>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 1.25 }}>
        <Button
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={onAction}
          size="small"
          sx={{ px: 0, textTransform: 'none' }}
        >
          {actionLabel}
        </Button>
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            onClick={onSecondaryAction}
            size="small"
            sx={{ textTransform: 'none' }}
            variant="outlined"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </Stack>
    </Box>
  );
}

function ResourceRow({
  icon,
  onClick,
  primary,
  secondary,
}: {
  icon: React.ReactElement;
  onClick: () => void;
  primary: React.ReactNode;
  secondary: React.ReactNode;
}) {
  return (
    <Stack
      direction="row"
      onClick={onClick}
      sx={{
        alignItems: 'flex-start',
        cursor: 'pointer',
        gap: 1,
        minWidth: 0,
        py: 0.9,
        '& + &': { borderColor: 'divider', borderTop: '1px solid' },
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{ color: 'text.secondary', display: 'flex', mt: 0.25 }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 600 }} variant="body2">
          {primary}
        </Typography>
        <Typography color="text.secondary" noWrap variant="caption">
          {secondary}
        </Typography>
      </Box>
    </Stack>
  );
}

function KpiRailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactElement;
  label: string;
  value: number;
}) {
  return (
    <Box sx={{ bgcolor: 'action.hover', p: 2 }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
        <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography color="text.secondary" variant="caption">
            {label}
          </Typography>
          <Typography sx={{ fontWeight: 800 }} variant="h5">
            {value.toLocaleString()}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

type ListMetadata = { count?: number };

const totalFrom = (metadata: object | undefined, fallback: number) =>
  (metadata as ListMetadata | undefined)?.count ?? fallback;

export default function DashboardOverview() {
  const { navigate } = useNavigate();
  const modelsQuery = Hooks.Models.useListByAuthor({
    includeCount: true,
    limit: 3,
  });
  const datasetsQuery = Hooks.Datasets.useListOwnedDatasets({
    includeCount: true,
    limit: 3,
  });
  const deploymentsQuery = Hooks.Deployments.useList();
  const clustersQuery = Hooks.Deployments.Targets.useListHpcClusters({
    dataCenter: Deployments.ListHpcClustersDataCenterEnum.Tacc,
    includeCount: true,
    limit: 3,
  });
  const models = modelsQuery.data?.result ?? [];
  const datasets = datasetsQuery.data?.result ?? [];
  const deployments = deploymentsQuery.data?.result ?? [];
  const clusters = clustersQuery.data?.result ?? [];
  const modelCount = totalFrom(modelsQuery.data?.metadata, models.length);
  const datasetCount = totalFrom(datasetsQuery.data?.metadata, datasets.length);
  const clusterCount = totalFrom(clustersQuery.data?.metadata, clusters.length);
  const activeDeployments = deployments.filter(
    (deployment) => deployment.state === Deployments.State.Running
  ).length;
  const isLoading =
    modelsQuery.isLoading ||
    datasetsQuery.isLoading ||
    deploymentsQuery.isLoading ||
    clustersQuery.isLoading;

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Box sx={{ px: { xs: 0, sm: 1 }, py: { xs: 1, sm: 2 } }}>
          <Box sx={{ mb: 2.5 }}>
            <SectionHeader
              title="Explore MLHub"
              caption="Models, data, deployments, and infrastructure in one place."
            />
          </Box>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ResourceSection
                  actionLabel="View my models"
                  caption="Your model collection"
                  count={modelCount}
                  icon={<SmartToyRoundedIcon />}
                  onAction={() => navigate('/models')}
                  onSecondaryAction={() => navigate('/deployments')}
                  secondaryActionLabel="Deploy a model"
                  title="Models"
                >
                  {models.length ? (
                    models.map((model) => (
                      <ResourceRow
                        key={model.id}
                        icon={<SmartToyRoundedIcon fontSize="small" />}
                        onClick={() =>
                          navigate(
                            `/models?model=${encodeURIComponent(model.id)}`
                          )
                        }
                        primary={model.name}
                        secondary={`by ${modelAuthorFor(model)}`}
                      />
                    ))
                  ) : (
                    <MarketplaceButton marketplace="model" />
                  )}
                </ResourceSection>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ResourceSection
                  actionLabel="View my datasets"
                  caption="Datasets you own"
                  count={datasetCount}
                  icon={<DatasetRoundedIcon />}
                  onAction={() => navigate('/datasets')}
                  onSecondaryAction={() => navigate('/marketplaces/datasets')}
                  secondaryActionLabel="Find datasets"
                  title="Datasets"
                >
                  {datasets.length ? (
                    datasets.map((dataset) => (
                      <ResourceRow
                        key={dataset.id}
                        icon={
                          <DatasetProviderIcon
                            provider={dataset.provider}
                            size={16}
                          />
                        }
                        onClick={() =>
                          navigate(
                            `/datasets?dataset=${encodeURIComponent(
                              dataset.id
                            )}`
                          )
                        }
                        primary={dataset.name || dataset.id}
                        secondary={dataset.description || dataset.provider}
                      />
                    ))
                  ) : (
                    <MarketplaceButton marketplace="dataset" />
                  )}
                </ResourceSection>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ResourceSection
                  actionLabel="View deployments"
                  caption="Models running in MLHub"
                  count={deployments.length}
                  icon={<RocketLaunchRoundedIcon />}
                  onAction={() => navigate('/deployments')}
                  onSecondaryAction={() => navigate('/models')}
                  secondaryActionLabel="Choose a model"
                  title="Deployments"
                >
                  {deployments.length ? (
                    deployments
                      .slice(0, 3)
                      .map((deployment) => (
                        <ResourceRow
                          key={deployment.id}
                          icon={<RocketLaunchRoundedIcon fontSize="small" />}
                          onClick={() =>
                            navigate(`/deployments/${deployment.id}`)
                          }
                          primary={deployment.name}
                          secondary={deployment.state}
                        />
                      ))
                  ) : (
                    <Typography color="text.secondary" variant="body2">
                      No deployments are configured.
                    </Typography>
                  )}
                </ResourceSection>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <ResourceSection
                  actionLabel="Browse all marketplaces"
                  caption="Curated catalogs from MLHub and connected providers"
                  count={2}
                  icon={<StorefrontRoundedIcon />}
                  onAction={() => navigate('/marketplaces')}
                  title="Marketplaces"
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                      onClick={() => navigate('/marketplaces/models')}
                      startIcon={<SmartToyRoundedIcon />}
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                      }}
                      variant="outlined"
                    >
                      Discover models
                    </Button>
                    <Button
                      onClick={() => navigate('/marketplaces/datasets')}
                      startIcon={<DatasetRoundedIcon />}
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none',
                      }}
                      variant="outlined"
                    >
                      Explore datasets
                    </Button>
                  </Stack>
                </ResourceSection>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ResourceSection
                  actionLabel="View HPC clusters"
                  caption="Compute targets and queues"
                  count={clusterCount}
                  icon={<DnsRoundedIcon />}
                  onAction={() => navigate('/hpc-clusters')}
                  title="Infrastructure"
                >
                  {clusters.length ? (
                    clusters.map((cluster) => (
                      <ResourceRow
                        key={cluster.id}
                        icon={<DnsRoundedIcon fontSize="small" />}
                        onClick={() =>
                          navigate(
                            `/hpc-clusters/${encodeURIComponent(cluster.id)}`
                          )
                        }
                        primary={cluster.name}
                        secondary={cluster.data_center}
                      />
                    ))
                  ) : (
                    <Typography color="text.secondary" variant="body2">
                      No HPC clusters are available.
                    </Typography>
                  )}
                </ResourceSection>
              </Grid>
            </Grid>
          )}
        </Box>
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Stack spacing={1.5} sx={{ pt: { xs: 1, sm: 2 } }}>
          <SectionHeader title="At a glance" caption="Your MLHub inventory" />
          <Stack spacing={1.5} sx={{ pt: 1.5 }}>
            <KpiRailItem
              icon={<SmartToyRoundedIcon />}
              label="Models"
              value={modelCount}
            />
            <KpiRailItem
              icon={<DatasetRoundedIcon />}
              label="Datasets"
              value={datasetCount}
            />
            <KpiRailItem
              icon={<RocketLaunchRoundedIcon />}
              label="Active deployments"
              value={activeDeployments}
            />
            <KpiRailItem
              icon={<DnsRoundedIcon />}
              label="HPC clusters"
              value={clusterCount}
            />
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}
