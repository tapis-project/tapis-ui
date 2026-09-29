import * as Deployments from '@mlhub/deployments-ts-sdk';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import DoNotDisturbOnOutlinedIcon from '@mui/icons-material/DoNotDisturbOnOutlined';
import LaunchIcon from '@mui/icons-material/Launch';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import ViewInArRoundedIcon from '@mui/icons-material/ViewInArRounded';
import { useParams } from 'react-router-dom';
import { useNavigate } from '../../_context/NavContext';

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

export default function HpcClusterDetailsPage() {
  const { navigate } = useNavigate();
  const { clusterId } = useParams<{ clusterId: string }>();
  const clusterQuery = Hooks.Deployments.Targets.useGetHpcCluster(
    clusterId
      ? {
          dataCenter: Deployments.GetHpcClusterDataCenterEnum.Tacc,
          hpcClusterId: clusterId,
        }
      : undefined
  );
  const cluster = clusterQuery.data?.result;
  const availableQueueCount =
    cluster?.queues.filter((queue) => queue.enabled).length ?? 0;
  const containerRuntimes = cluster?.container_runtimes ?? [];

  return (
    <Box>
      {clusterQuery.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : clusterQuery.isError ? (
        <Alert severity="error">Unable to load this cluster’s details.</Alert>
      ) : !cluster ? (
        <Alert severity="warning">This HPC cluster could not be found.</Alert>
      ) : (
        <Stack spacing={3}>
          <Box>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              sx={{
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 1.5,
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                <DnsRoundedIcon color="primary" sx={{ fontSize: 30 }} />
                <Box>
                  <Typography sx={{ fontWeight: 800 }} variant="h4">
                    {cluster.name}
                  </Typography>
                  <Typography color="text.secondary">
                    {cluster.data_center} data center
                  </Typography>
                </Box>
              </Stack>
              <EnabledChip enabled={cluster.enabled} />
            </Stack>
            {cluster.description && (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                {cluster.description}
              </Typography>
            )}
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mt: 2 }}>
              <Chip
                icon={<TerminalRoundedIcon />}
                label={`${cluster.host}:${cluster.port}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`${availableQueueCount} available queue${
                  availableQueueCount === 1 ? '' : 's'
                }`}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<ViewInArRoundedIcon />}
                label={`${containerRuntimes.length} container runtime${
                  containerRuntimes.length === 1 ? '' : 's'
                }`}
                size="small"
                variant="outlined"
              />
            </Stack>
            {cluster.documentation_url && (
              <Link
                href={cluster.documentation_url}
                rel="noreferrer"
                target="_blank"
                sx={{
                  alignItems: 'center',
                  display: 'inline-flex',
                  gap: 0.5,
                  mt: 1.5,
                }}
              >
                Documentation <LaunchIcon fontSize="inherit" />
              </Link>
            )}
            <Button
              onClick={() => navigate('/hpc-clusters')}
              size="small"
              startIcon={<ArrowBackRoundedIcon />}
              sx={{ display: 'flex', mt: 1.5, px: 0, textTransform: 'none' }}
            >
              Back to HPC clusters
            </Button>
          </Box>

          <Divider />

          <Box>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}
            >
              <ViewInArRoundedIcon color="primary" />
              <Typography sx={{ fontWeight: 700 }} variant="h6">
                Supported container runtimes
              </Typography>
            </Stack>
            {containerRuntimes.length ? (
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                {containerRuntimes.map((runtime) => (
                  <Chip
                    key={runtime}
                    icon={<ViewInArRoundedIcon />}
                    label={runtime}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary" variant="body2">
                No container runtimes have been configured for this cluster.
              </Typography>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }} variant="h6">
              Scheduler queues ({availableQueueCount} available)
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                },
              }}
            >
              {cluster.queues.map((queue) => (
                <Card key={queue.id} variant="outlined" sx={{ height: '100%' }}>
                  <CardContent
                    sx={{
                      '&:last-child': { pb: 2 },
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      p: 2,
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
                    >
                      <Typography sx={{ fontWeight: 700 }}>
                        {queue.name}
                      </Typography>
                      <Chip
                        color="primary"
                        label={queue.scheduler_type}
                        size="small"
                        variant="outlined"
                      />
                      <EnabledChip enabled={queue.enabled} />
                    </Stack>
                    <Stack
                      direction="row"
                      sx={{ flexWrap: 'wrap', gap: 1.25, mt: 1.5 }}
                    >
                      <HardwareProfile
                        accentColor="info.main"
                        icon={
                          <MemoryRoundedIcon color="info" fontSize="small" />
                        }
                        title="CPU profile"
                      >
                        {queue.hardware_profile.total_nodes.toLocaleString()}{' '}
                        nodes · {queue.hardware_profile.cpu_cores_per_node}{' '}
                        cores/node · {queue.hardware_profile.memory_gb} GB/node
                      </HardwareProfile>
                      <HardwareProfile
                        accentColor={
                          queue.hardware_profile.gpu
                            ? 'secondary.main'
                            : 'divider'
                        }
                        icon={
                          <StorageRoundedIcon
                            color={
                              queue.hardware_profile.gpu
                                ? 'secondary'
                                : 'disabled'
                            }
                            fontSize="small"
                          />
                        }
                        title="GPU profile"
                      >
                        {queue.hardware_profile.gpu ? (
                          <>
                            {queue.hardware_profile.gpu.count_per_node} ×{' '}
                            {queue.hardware_profile.gpu.gpu_vendor}{' '}
                            <Box component="span" sx={{ fontWeight: 700 }}>
                              {queue.hardware_profile.gpu.gpu_model}
                            </Box>{' '}
                            · {queue.hardware_profile.gpu.gpu_memory_gb} GB/GPU
                          </>
                        ) : (
                          'No GPU accelerator'
                        )}
                      </HardwareProfile>
                    </Stack>
                    <Typography
                      color="text.secondary"
                      sx={{ mt: 1 }}
                      variant="caption"
                    >
                      {queue.scheduling_policy.min_nodes_per_job}–
                      {queue.scheduling_policy.max_nodes_per_job} nodes/job · up
                      to {queue.scheduling_policy.max_wall_time_per_job_hr}{' '}
                      hours
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Stack>
      )}
    </Box>
  );
}

function HardwareProfile({
  accentColor,
  children,
  icon,
  title,
}: {
  accentColor: string;
  children: React.ReactNode;
  icon: React.ReactElement;
  title: string;
}) {
  return (
    <Box
      sx={{
        bgcolor: 'action.hover',
        borderColor: accentColor,
        borderLeft: '3px solid',
        flex: '1 1 220px',
        px: 1.25,
        py: 1,
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
        {icon}
        <Typography sx={{ fontWeight: 700 }} variant="caption">
          {title}
        </Typography>
      </Stack>
      <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="caption">
        {children}
      </Typography>
    </Box>
  );
}
