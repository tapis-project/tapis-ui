import { useState } from 'react';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import * as Models from '@mlhub/models-ts-sdk';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import { deploymentStatusChipColor } from '../_components/constants';
import {
  batchOutcomePresentation,
  canStartDeployment,
  canStopDeployment,
  canUndeployDeployment,
  reconciliationStatusPresentation,
} from '../_components/deploymentOperationalStatus';
import { useToast } from '../_context/ToastsContext/useToast';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { useNavigate } from '../_context/NavContext';
import { JsonViewer } from '../_components/JsonViewer';

type DeploymentTab =
  | 'overview'
  | 'configuration'
  | 'activity'
  | 'network'
  | 'json';

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactElement;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ color: 'text.secondary', display: 'flex', mt: 0.25 }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography color="text.secondary" variant="caption">
          {label}
        </Typography>
        <Box sx={{ minWidth: 0 }}>{value}</Box>
      </Box>
    </Stack>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactElement;
  title: string;
}) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontWeight: 700 }} variant="subtitle2">
        {title}
      </Typography>
    </Stack>
  );
}

function DeploymentOptionDetails({
  option,
}: {
  option: Models.DeploymentOptionDetail;
}) {
  const target = option.hpc_cluster_queue;

  return (
    <Stack spacing={2}>
      <Stack spacing={1.5}>
        <DetailRow
          icon={<SettingsOutlinedIcon fontSize="small" />}
          label="Serving runtime"
          value={
            <Typography variant="body2">{option.serving_runtime}</Typography>
          }
        />
        <DetailRow
          icon={<SettingsOutlinedIcon fontSize="small" />}
          label="Target type"
          value={
            <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ pt: 0.25 }}>
              <Chip
                label={option.deployment_target_type}
                size="small"
                variant="outlined"
              />
              <Chip
                color={option.available ? 'success' : 'warning'}
                label={option.available ? 'Available' : 'Unavailable'}
                size="small"
                variant="outlined"
              />
            </Stack>
          }
        />
        <DetailRow
          icon={<RocketLaunchIcon fontSize="small" />}
          label="Supported modalities"
          value={
            <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ pt: 0.25 }}>
              {option.supported_deployment_modalities.map((modality) => (
                <Chip
                  key={modality}
                  label={modality}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          }
        />
      </Stack>

      {target && (
        <>
          <Divider />
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1.25 }} variant="subtitle2">
              HPC target
            </Typography>
            <Stack spacing={1.5}>
              <DetailRow
                icon={<CloudOutlinedIcon fontSize="small" />}
                label="Data center"
                value={
                  <Typography variant="body2">{target.data_center}</Typography>
                }
              />
              <DetailRow
                icon={<MemoryOutlinedIcon fontSize="small" />}
                label="HPC cluster"
                value={
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    gap={0.5}
                    sx={{ pt: 0.25 }}
                  >
                    <Typography variant="body2">
                      {target.hpc_cluster_name}
                    </Typography>
                    <Chip
                      color={target.hpc_cluster_enabled ? 'success' : 'default'}
                      label={
                        target.hpc_cluster_enabled ? 'Enabled' : 'Disabled'
                      }
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                }
              />
              <DetailRow
                icon={<SettingsOutlinedIcon fontSize="small" />}
                label="Scheduler queue"
                value={
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    gap={0.5}
                    sx={{ pt: 0.25 }}
                  >
                    <Typography variant="body2">
                      {target.batch_scheduler_queue_name}
                    </Typography>
                    <Chip
                      color={
                        target.batch_scheduler_queue_enabled
                          ? 'success'
                          : 'default'
                      }
                      label={
                        target.batch_scheduler_queue_enabled
                          ? 'Enabled'
                          : 'Disabled'
                      }
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                }
              />
            </Stack>
          </Box>
        </>
      )}

      <Divider />
      <Box>
        <Typography sx={{ fontWeight: 700, mb: 1.25 }} variant="subtitle2">
          Option parameters
        </Typography>
        {option.parameters.length ? (
          <Stack spacing={1}>
            {option.parameters.map((parameter) => (
              <Box
                key={parameter.name}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  pb: 1,
                }}
              >
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
                >
                  <Typography sx={{ fontWeight: 600 }} variant="body2">
                    {parameter.name}
                  </Typography>
                  <Chip
                    label={parameter.parameter_type}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    color={parameter.required ? 'primary' : 'default'}
                    label={parameter.required ? 'Required' : 'Optional'}
                    size="small"
                    variant="outlined"
                  />
                  {parameter.secret && (
                    <Chip label="Secret" size="small" variant="outlined" />
                  )}
                </Stack>
                {parameter.description && (
                  <Typography
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                    variant="caption"
                  >
                    {parameter.description}
                  </Typography>
                )}
                {parameter._default && !parameter.secret && (
                  <Typography
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.25 }}
                    variant="caption"
                  >
                    Default: {parameter._default}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary" variant="body2">
            This deployment option has no additional parameters.
          </Typography>
        )}
      </Box>
      <DetailRow
        icon={<SettingsOutlinedIcon fontSize="small" />}
        label="Option ID"
        value={
          <Typography
            sx={{ fontFamily: 'monospace', overflowWrap: 'anywhere' }}
            variant="body2"
          >
            {option.id}
          </Typography>
        }
      />
    </Stack>
  );
}

export function DeploymentDetailContent({
  deployment: initialDeployment,
  model,
  onBack,
}: {
  deployment: Deployments.ModelDeployment;
  model?: Models.Model;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<DeploymentTab>('overview');
  const [deployment, setDeployment] = useState(initialDeployment);
  const toast = useToast();
  const { navigate } = useNavigate();
  const { start, isLoading: isStarting } =
    Hooks.Deployments.useStartModelDeployment();
  const { stop, isLoading: isStopping } =
    Hooks.Deployments.useStopModelDeployment();
  const { undeploy, isLoading: isUndeploying } =
    Hooks.Deployments.useUndeployModelDeployment();
  const deploymentOptionQuery =
    Hooks.Models.useGetExternalModelDeploymentOption({
      deploymentOptionId: deployment.deployment_option_id,
      externalModelId: deployment.external_model_id,
    });
  const stateLabel = deployment.state;
  const stateColor = deploymentStatusChipColor[deployment.state] ?? 'default';
  const endpoint = deployment.endpoint;
  const targetEndpoint = deployment.target_endpoint;
  const reconciliation = reconciliationStatusPresentation(
    deployment.reconciliation_status
  );
  const batchOutcome = batchOutcomePresentation(
    deployment.batch_execution_outcome
  );
  const isMutating = isStarting || isStopping || isUndeploying;
  const isRunning = deployment.state === Deployments.State.Running;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Box
        sx={{
          alignItems: 'center',
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexShrink: 0,
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3 },
          py: 1.5,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', minWidth: 0 }}
        >
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              color: 'success.main',
              height: 42,
              width: 42,
            }}
          >
            <RocketLaunchIcon />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <Typography noWrap sx={{ fontWeight: 700 }} variant="h6">
                {deployment.name}
              </Typography>
              {isRunning && (
                <AutorenewRoundedIcon
                  aria-label="Deployment is running"
                  color="success"
                  sx={{
                    animation: 'deployment-running 1.2s linear infinite',
                    flexShrink: 0,
                    fontSize: 19,
                    '@keyframes deployment-running': {
                      from: { transform: 'rotate(0deg)' },
                      to: { transform: 'rotate(360deg)' },
                    },
                  }}
                />
              )}
            </Stack>
            <Typography color="text.secondary" noWrap variant="caption">
              {deployment.deployment_modality} deployment
            </Typography>
          </Box>
        </Stack>
        <Button
          onClick={onBack}
          size="small"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Deployments
        </Button>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
          {deployment.description && (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {deployment.description}
            </Typography>
          )}
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            <Chip
              color={stateColor}
              label={`State: ${stateLabel}`}
              size="small"
            />
            <Chip
              color={reconciliation.color}
              label={`Status: ${reconciliation.label}`}
              size="small"
              variant="outlined"
            />
            {deployment.batch_execution_outcome && (
              <Chip
                color={batchOutcome.color}
                label={`Batch: ${batchOutcome.label}`}
                size="small"
                variant="outlined"
              />
            )}
            <Chip
              label={`Replicas: ${deployment.replicas.count}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`Modality: ${deployment.deployment_modality}`}
              size="small"
              variant="outlined"
            />
            {endpoint && (
              <Chip label="Endpoint: issued" size="small" variant="outlined" />
            )}
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 2 }}>
            <Button
              disabled={isMutating || !canStartDeployment(deployment)}
              onClick={() =>
                start(
                  { deploymentId: deployment.id },
                  {
                    onError: (error) => {
                      toast.error(
                        error.message || 'Unable to start deployment.'
                      );
                    },
                    onSuccess: (response) => {
                      setDeployment(response.result);
                      toast.success(`Started ${deployment.name}.`);
                    },
                  }
                )
              }
              size="small"
              startIcon={<PlayArrowIcon />}
              variant="outlined"
            >
              Start
            </Button>
            <Button
              color="warning"
              disabled={isMutating || !canStopDeployment(deployment)}
              onClick={() =>
                stop(
                  { deploymentId: deployment.id },
                  {
                    onError: (error) => {
                      toast.error(
                        error.message || 'Unable to stop deployment.'
                      );
                    },
                    onSuccess: (response) => {
                      setDeployment(response.result);
                      toast.success(`Stopped ${deployment.name}.`);
                    },
                  }
                )
              }
              size="small"
              startIcon={<StopCircleOutlinedIcon />}
              variant="outlined"
            >
              Stop
            </Button>
            <Button
              color="error"
              disabled={isMutating || !canUndeployDeployment(deployment)}
              onClick={() =>
                undeploy(
                  { deploymentId: deployment.id },
                  {
                    onError: (error) => {
                      toast.error(
                        error.message || 'Unable to undeploy deployment.'
                      );
                    },
                    onSuccess: (response) => {
                      setDeployment(response.result);
                      toast.success(`Undeployed ${deployment.name}.`);
                    },
                  }
                )
              }
              size="small"
              startIcon={<DeleteOutlineIcon />}
              variant="outlined"
            >
              Undeploy
            </Button>
          </Stack>
        </Box>
        <Divider />
        <Box sx={{ px: { xs: 2, sm: 3 } }}>
          <Tabs
            onChange={(_event, nextTab: DeploymentTab) => {
              if (nextTab === 'network') {
                navigate(
                  `/deployments/${encodeURIComponent(deployment.id)}/network`
                );
                return;
              }

              setTab(nextTab);
            }}
            value={tab}
            variant="scrollable"
          >
            <Tab label="Overview" value="overview" />
            <Tab label="Configuration" value="configuration" />
            <Tab label="Activity" value="activity" />
            <Tab label="Network" value="network" />
            <Tab label="JSON" value="json" />
          </Tabs>
        </Box>
        <Divider />

        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
          {tab === 'overview' && (
            <Stack spacing={3}>
              <Box>
                <SectionTitle
                  icon={<RocketLaunchIcon fontSize="small" />}
                  title="Deployment"
                />
                <DetailRow
                  icon={<SettingsOutlinedIcon fontSize="small" />}
                  label="Deployment ID"
                  value={
                    <Typography
                      sx={{ fontFamily: 'monospace', overflowWrap: 'anywhere' }}
                      variant="body2"
                    >
                      {deployment.id}
                    </Typography>
                  }
                />
              </Box>
              <Divider />
              <Box>
                <SectionTitle
                  icon={<SmartToyOutlinedIcon fontSize="small" />}
                  title="Model"
                />
                <Typography variant="body2">
                  {model?.name ?? deployment.external_model_id}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <SectionTitle
                  icon={<CloudOutlinedIcon fontSize="small" />}
                  title="Endpoints"
                />
                {endpoint || targetEndpoint ? (
                  <Stack spacing={1.75}>
                    {endpoint && (
                      <Box>
                        <DetailRow
                          icon={<CloudOutlinedIcon fontSize="small" />}
                          label="Platform endpoint"
                          value={
                            <Typography
                              sx={{
                                fontFamily: 'monospace',
                                overflowWrap: 'anywhere',
                              }}
                              variant="body2"
                            >
                              {endpoint.proxy_url}
                            </Typography>
                          }
                        />
                        <Button
                          endIcon={<OpenInNewIcon />}
                          onClick={() =>
                            navigate(
                              `/endpoints/${encodeURIComponent(endpoint.id)}`
                            )
                          }
                          size="small"
                          sx={{ ml: 3.25, mt: 0.75 }}
                          variant="text"
                        >
                          View endpoint details
                        </Button>
                      </Box>
                    )}
                    {targetEndpoint && (
                      <>
                        <DetailRow
                          icon={<CloudOutlinedIcon fontSize="small" />}
                          label="Target endpoint"
                          value={
                            <Typography variant="body2">
                              {targetEndpoint.name ??
                                targetEndpoint.base_url ??
                                'Pending'}
                            </Typography>
                          }
                        />
                        <DetailRow
                          icon={<SettingsOutlinedIcon fontSize="small" />}
                          label="Protocol"
                          value={
                            <Typography variant="body2">
                              {targetEndpoint.protocol}
                            </Typography>
                          }
                        />
                      </>
                    )}
                    <DetailRow
                      icon={<SettingsOutlinedIcon fontSize="small" />}
                      label="Target resource"
                      value={
                        <Typography
                          sx={{
                            fontFamily: 'monospace',
                            overflowWrap: 'anywhere',
                          }}
                          variant="body2"
                        >
                          {endpoint?.target_resource_urn ?? 'Not available'}
                        </Typography>
                      }
                    />
                  </Stack>
                ) : (
                  <Typography color="text.secondary" variant="body2">
                    No endpoint has been issued for this deployment yet.
                  </Typography>
                )}
              </Box>
            </Stack>
          )}

          {tab === 'configuration' && (
            <Stack spacing={3}>
              <Box>
                <SectionTitle
                  icon={<MemoryOutlinedIcon fontSize="small" />}
                  title="Replica group"
                />
                <Stack spacing={1.75}>
                  <DetailRow
                    icon={<MemoryOutlinedIcon fontSize="small" />}
                    label="Replicas"
                    value={
                      <Typography variant="body2">
                        {deployment.replicas.count}
                      </Typography>
                    }
                  />
                  <DetailRow
                    icon={<SettingsOutlinedIcon fontSize="small" />}
                    label="Parallelism"
                    value={
                      deployment.replicas.parallelism_strategies.length ? (
                        <Stack
                          direction="row"
                          flexWrap="wrap"
                          gap={0.5}
                          sx={{ pt: 0.5 }}
                        >
                          {deployment.replicas.parallelism_strategies.map(
                            (strategy) => (
                              <Chip
                                key={strategy}
                                label={strategy}
                                size="small"
                                variant="outlined"
                              />
                            )
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="body2">None configured</Typography>
                      )
                    }
                  />
                </Stack>
              </Box>
              <Divider />
              <Box>
                <SectionTitle
                  icon={<SettingsOutlinedIcon fontSize="small" />}
                  title="Deployment option"
                />
                {deploymentOptionQuery.isLoading ? (
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', py: 2 }}
                  >
                    <CircularProgress size={20} />
                  </Box>
                ) : deploymentOptionQuery.isError ? (
                  <Typography color="text.secondary" variant="body2">
                    Deployment option details are unavailable.
                  </Typography>
                ) : deploymentOptionQuery.data?.result ? (
                  <DeploymentOptionDetails
                    option={deploymentOptionQuery.data.result}
                  />
                ) : (
                  <Typography color="text.secondary" variant="body2">
                    Deployment option details are unavailable.
                  </Typography>
                )}
              </Box>
            </Stack>
          )}

          {tab === 'activity' && (
            <Stack spacing={3}>
              <Box>
                <SectionTitle
                  icon={<TimelineOutlinedIcon fontSize="small" />}
                  title="Status"
                />
                <Stack spacing={1.75}>
                  <DetailRow
                    icon={<CheckCircleOutlineIcon fontSize="small" />}
                    label="Current state"
                    value={
                      <Chip
                        color={stateColor}
                        label={stateLabel}
                        size="small"
                      />
                    }
                  />
                  <DetailRow
                    icon={<CheckCircleOutlineIcon fontSize="small" />}
                    label="Desired state"
                    value={
                      <Typography variant="body2">
                        {deployment.desired_state}
                      </Typography>
                    }
                  />
                  <DetailRow
                    icon={<TimelineOutlinedIcon fontSize="small" />}
                    label="Status"
                    value={
                      <Chip
                        color={reconciliation.color}
                        label={reconciliation.label}
                        size="small"
                        variant="outlined"
                      />
                    }
                  />
                  {deployment.batch_execution_outcome && (
                    <DetailRow
                      icon={<RocketLaunchIcon fontSize="small" />}
                      label="Batch execution"
                      value={
                        <Chip
                          color={batchOutcome.color}
                          label={batchOutcome.label}
                          size="small"
                          variant="outlined"
                        />
                      }
                    />
                  )}
                  <DetailRow
                    icon={<TimelineOutlinedIcon fontSize="small" />}
                    label="Retry attempts"
                    value={
                      <Typography variant="body2">
                        {deployment.retries}
                      </Typography>
                    }
                  />
                  {deployment.retry_after && (
                    <DetailRow
                      icon={<CalendarTodayOutlinedIcon fontSize="small" />}
                      label="Next retry"
                      value={
                        <Typography variant="body2">
                          {formatDateTime(deployment.retry_after)}
                        </Typography>
                      }
                    />
                  )}
                  {deployment.last_message && (
                    <DetailRow
                      icon={<TimelineOutlinedIcon fontSize="small" />}
                      label="Latest message"
                      value={
                        <Typography variant="body2">
                          {deployment.last_message}
                        </Typography>
                      }
                    />
                  )}
                </Stack>
              </Box>
              <Divider />
              <Box>
                <SectionTitle
                  icon={<CalendarTodayOutlinedIcon fontSize="small" />}
                  title="Timeline"
                />
                <Stack spacing={1.75}>
                  <DetailRow
                    icon={<CalendarTodayOutlinedIcon fontSize="small" />}
                    label="Created"
                    value={
                      <Typography variant="body2">
                        {formatDateTime(deployment.created_at)}
                      </Typography>
                    }
                  />
                  <DetailRow
                    icon={<CalendarTodayOutlinedIcon fontSize="small" />}
                    label="Last modified"
                    value={
                      <Typography variant="body2">
                        {formatDateTime(deployment.last_modified)}
                      </Typography>
                    }
                  />
                  <DetailRow
                    icon={<CalendarTodayOutlinedIcon fontSize="small" />}
                    label="Last state change"
                    value={
                      <Typography variant="body2">
                        {formatDateTime(deployment.last_state_change)}
                      </Typography>
                    }
                  />
                  {deployment.last_observed && (
                    <DetailRow
                      icon={<CalendarTodayOutlinedIcon fontSize="small" />}
                      label="Last observed"
                      value={
                        <Typography variant="body2">
                          {formatDateTime(deployment.last_observed)}
                        </Typography>
                      }
                    />
                  )}
                  {deployment.expires_at && (
                    <DetailRow
                      icon={<CalendarTodayOutlinedIcon fontSize="small" />}
                      label="Expires"
                      value={
                        <Typography variant="body2">
                          {formatDateTime(deployment.expires_at)}
                        </Typography>
                      }
                    />
                  )}
                </Stack>
              </Box>
              <Divider />
              <Box>
                <SectionTitle
                  icon={<AccountCircleOutlinedIcon fontSize="small" />}
                  title="Ownership"
                />
                <Stack spacing={1.75}>
                  <DetailRow
                    icon={<AccountCircleOutlinedIcon fontSize="small" />}
                    label="Owner"
                    value={
                      <Typography variant="body2">
                        {deployment.owner}
                      </Typography>
                    }
                  />
                  <DetailRow
                    icon={<AccountCircleOutlinedIcon fontSize="small" />}
                    label="Tenant"
                    value={
                      <Typography variant="body2">
                        {deployment.tenant_id}
                      </Typography>
                    }
                  />
                </Stack>
              </Box>
            </Stack>
          )}
          {tab === 'json' && <JsonViewer value={deployment} />}
        </Box>
      </Box>
    </Box>
  );
}
