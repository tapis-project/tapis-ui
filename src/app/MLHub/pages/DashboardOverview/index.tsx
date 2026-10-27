import * as React from 'react';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import {
  Box,
  Button,
  type ButtonProps,
  ButtonBase,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
  alpha,
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

type ResourceHeaderColor = 'primary' | 'secondary' | 'success' | 'info';
type ResourceActionColor = Exclude<ButtonProps['color'], undefined>;

function ResourceSection({
  actionColor,
  actionLabel,
  caption,
  children,
  count,
  headerColor,
  icon,
  marketplaceActionIcon,
  marketplaceActionColor,
  marketplaceActionLabel,
  onAction,
  onMarketplaceAction,
  secondaryActionLabel,
  secondaryActionIcon,
  secondaryActionColor,
  onSecondaryAction,
  title,
}: {
  actionColor?: ResourceActionColor;
  actionLabel: string;
  caption: string;
  children: React.ReactNode;
  count: number;
  headerColor: ResourceHeaderColor;
  icon: React.ReactElement;
  marketplaceActionIcon?: React.ReactElement;
  marketplaceActionColor?: ResourceActionColor;
  marketplaceActionLabel?: string;
  onAction: () => void;
  onMarketplaceAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionIcon?: React.ReactElement;
  secondaryActionColor?: ResourceActionColor;
  onSecondaryAction?: () => void;
  title: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '2px',
        boxShadow: (theme) => theme.shadows[1],
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
          bgcolor: (theme) => alpha(theme.palette[headerColor].main, 0.08),
          borderBottom: '3px solid',
          borderBottomColor: `${headerColor}.main`,
          justifyContent: 'space-between',
          px: 2.25,
          py: 1.75,
        }}
      >
        <ButtonBase
          aria-label={`View ${title}`}
          onClick={onAction}
          sx={{
            alignItems: 'center',
            borderRadius: 0,
            minWidth: 0,
            textAlign: 'left',
            '&:hover .resource-section-title': {
              color: `${headerColor}.main`,
              textDecoration: 'underline',
            },
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ color: `${headerColor}.main`, display: 'flex' }}>
              {icon}
            </Box>
            <Box>
              <Typography
                className="resource-section-title"
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
        </ButtonBase>
        <Chip
          label={count}
          size="small"
          sx={{ bgcolor: 'common.white', fontWeight: 700, minWidth: 34 }}
          variant="outlined"
        />
      </Stack>
      <Box sx={{ flex: 1, px: 2.25, py: 0.5 }}>
        <Stack spacing={0}>{children}</Stack>
      </Box>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
          justifyContent: 'space-between',
          gap: 1,
          mt: 'auto',
          px: 2.25,
          py: 1.25,
        }}
      >
        <Button
          color={actionColor ?? headerColor}
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={onAction}
          size="small"
          sx={{ borderRadius: '2px', textTransform: 'none' }}
          variant="outlined"
        >
          {actionLabel}
        </Button>
        {((marketplaceActionLabel && onMarketplaceAction) ||
          (secondaryActionLabel && onSecondaryAction)) && (
          <Stack direction="row" spacing={0.75} sx={{ ml: 'auto' }}>
            {marketplaceActionLabel && onMarketplaceAction && (
              <Button
                color={marketplaceActionColor ?? headerColor}
                onClick={onMarketplaceAction}
                size="small"
                startIcon={marketplaceActionIcon}
                sx={{ borderRadius: '2px', textTransform: 'none' }}
                variant="outlined"
              >
                {marketplaceActionLabel}
              </Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button
                color={secondaryActionColor ?? headerColor}
                onClick={onSecondaryAction}
                size="small"
                startIcon={secondaryActionIcon}
                sx={{ borderRadius: '2px', textTransform: 'none' }}
                variant="contained"
              >
                {secondaryActionLabel}
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
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
        py: 1.1,
        '& + &': { borderColor: 'divider', borderTop: '1px solid' },
        '&:hover': { bgcolor: 'action.hover', mx: -1, px: 1 },
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
  const isLoading =
    modelsQuery.isLoading ||
    datasetsQuery.isLoading ||
    deploymentsQuery.isLoading ||
    clustersQuery.isLoading;

  return (
    <Stack spacing={4} sx={{ pb: 3 }}>
      <Box>
        <SectionHeader
          title="Your workspace"
          caption="Open a resource to see its details, or continue where you left off."
        />
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ResourceSection
                actionColor="secondary"
                actionLabel="View my models"
                caption="Your model collection"
                count={modelCount}
                headerColor="secondary"
                icon={<SmartToyRoundedIcon />}
                marketplaceActionIcon={<StorefrontRoundedIcon />}
                marketplaceActionColor="secondary"
                marketplaceActionLabel="Explore marketplace"
                onAction={() => navigate('/models')}
                onMarketplaceAction={() => navigate('/marketplaces/models')}
                onSecondaryAction={() => navigate('/deployments')}
                secondaryActionIcon={<RocketLaunchRoundedIcon />}
                secondaryActionColor="success"
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
                actionColor="primary"
                actionLabel="View my datasets"
                caption="Datasets you own"
                count={datasetCount}
                headerColor="primary"
                icon={<DatasetRoundedIcon />}
                onAction={() => navigate('/datasets')}
                onSecondaryAction={() => navigate('/marketplaces/datasets')}
                secondaryActionIcon={<StorefrontRoundedIcon />}
                secondaryActionColor="primary"
                secondaryActionLabel="Explore marketplace"
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
                          `/datasets?dataset=${encodeURIComponent(dataset.id)}`
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
                actionColor="success"
                actionLabel="View deployments"
                caption="Models running in MLHub"
                count={deployments.length}
                headerColor="success"
                icon={<RocketLaunchRoundedIcon />}
                onAction={() => navigate('/deployments')}
                onSecondaryAction={() => navigate('/models')}
                secondaryActionIcon={<SmartToyRoundedIcon />}
                secondaryActionColor="secondary"
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <ResourceSection
                actionColor="info"
                actionLabel="View HPC clusters"
                caption="Compute targets and queues"
                count={clusterCount}
                headerColor="info"
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
    </Stack>
  );
}
