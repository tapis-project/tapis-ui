import * as React from 'react';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import DoNotDisturbOnOutlinedIcon from '@mui/icons-material/DoNotDisturbOnOutlined';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import { useNavigate } from '../../_context/NavContext';

type ClusterListItem = Deployments.HpcClusterSummary;

const taccDataCenter = Deployments.ListHpcClustersDataCenterEnum.Tacc;

function EnabledChip({ enabled }: { enabled: boolean }) {
  return (
    <Chip
      color={enabled ? 'success' : 'default'}
      icon={
        enabled ? (
          <CheckCircleOutlineRoundedIcon />
        ) : (
          <DoNotDisturbOnOutlinedIcon />
        )
      }
      label={enabled ? 'Enabled' : 'Disabled'}
      size="small"
      variant="outlined"
    />
  );
}

export default function HpcClustersPage() {
  const { navigate } = useNavigate();
  const [groupByDataCenter, setGroupByDataCenter] = React.useState(true);
  const listQuery = Hooks.Deployments.Targets.useListHpcClusters({
    dataCenter: taccDataCenter,
    includeCount: true,
  });
  const clusters: ClusterListItem[] = listQuery.data?.result ?? [];
  const totalClusterCount =
    (listQuery.data?.metadata as { count?: number } | undefined)?.count ??
    clusters.length;
  const clustersByDataCenter = React.useMemo(
    () =>
      clusters.reduce<Record<string, ClusterListItem[]>>((groups, cluster) => {
        (groups[cluster.data_center] ??= []).push(cluster);
        return groups;
      }, {}),
    [clusters]
  );

  const renderClusterCard = (cluster: ClusterListItem) => (
    <Card key={cluster.id} variant="outlined">
      <CardActionArea
        onClick={() =>
          navigate(`/hpc-clusters/${encodeURIComponent(cluster.id)}`)
        }
        sx={{ height: '100%' }}
      >
        <CardContent>
          <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1.5 }}>
            <DnsRoundedIcon color="primary" />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }} variant="subtitle1">
                {cluster.name}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                HPC compute target
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mt: 2 }}>
            <Chip label="HPC target" size="small" variant="outlined" />
            <EnabledChip enabled={cluster.enabled} />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1,
            mb: 0.5,
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
            <DnsRoundedIcon color="primary" sx={{ fontSize: 30 }} />
            <Typography
              sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
              variant="h4"
            >
              HPC Clusters
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${totalClusterCount} cluster${
                totalClusterCount === 1 ? '' : 's'
              }`}
              size="small"
              variant="outlined"
            />
            <ToggleButtonGroup
              exclusive
              size="small"
              value={groupByDataCenter ? 'data-center' : 'all'}
              onChange={(_, value: 'all' | 'data-center' | null) => {
                if (value) setGroupByDataCenter(value === 'data-center');
              }}
            >
              <ToggleButton value="data-center">
                <AccountTreeRoundedIcon fontSize="small" sx={{ mr: 0.75 }} />
                Group by Data Center
              </ToggleButton>
              <ToggleButton value="all">
                <ViewModuleRoundedIcon fontSize="small" sx={{ mr: 0.75 }} />
                Show All
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
        <Typography color="text.secondary">
          Explore compute targets and the scheduler queues available for MLHub
          deployments.
        </Typography>
      </Box>

      {listQuery.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : listQuery.isError ? (
        <Alert severity="error">
          {listQuery.error instanceof Error
            ? listQuery.error.message
            : 'Unable to load HPC clusters.'}
        </Alert>
      ) : clusters.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ py: 7, textAlign: 'center' }}>
            <DnsRoundedIcon color="disabled" sx={{ fontSize: 42, mb: 1 }} />
            <Typography variant="h6">No HPC clusters available</Typography>
            <Typography color="text.secondary">
              Clusters will appear here when they are registered in this data
              center.
            </Typography>
          </CardContent>
        </Card>
      ) : groupByDataCenter ? (
        <Stack spacing={3.5}>
          {Object.entries(clustersByDataCenter).map(
            ([dataCenter, dataCenterClusters]) => (
              <Box key={dataCenter}>
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', gap: 1, mb: 1 }}
                >
                  <Typography sx={{ fontWeight: 700 }} variant="h6">
                    {dataCenter}
                  </Typography>
                  <Chip
                    label={`${dataCenterClusters.length} cluster${
                      dataCenterClusters.length === 1 ? '' : 's'
                    }`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
                <Divider sx={{ mb: 1.5 }} />
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(280px, 1fr))',
                  }}
                >
                  {dataCenterClusters.map(renderClusterCard)}
                </Box>
              </Box>
            )
          )}
        </Stack>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          }}
        >
          {clusters.map(renderClusterCard)}
        </Box>
      )}
    </Box>
  );
}
