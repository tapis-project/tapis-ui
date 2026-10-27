import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ClearIcon from '@mui/icons-material/Clear';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';

import { DeploymentOption, Model } from '@mlhub/models-ts-sdk';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import DeploymentDialog from '../../../_components/DeploymentDialog';
import {
  batchOutcomePresentation,
  canStartDeployment,
  canStopDeployment,
  canUndeployDeployment,
  isDeploymentExpired,
  isTerminalDeployment,
  reconciliationStatusPresentation,
} from '../../../_components/deploymentOperationalStatus';
import { useToast } from '../../../_context/ToastsContext/useToast';
import { useNavigate } from '../../../_context/NavContext';
import { InfoSection } from './InfoSection';
import { MLHub as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { NoActiveDeployments } from '../../../_components/NoActiveDeployments';

interface DeploymentSectionProps {
  model: Model;
  view: 'deployments' | 'options';
}

export function DeploymentSection({ model, view }: DeploymentSectionProps) {
  const toast = useToast();
  const { navigate } = useNavigate();
  const [selectedDeploymentOption, setSelectedDeploymentOption] = useState<
    DeploymentOption | undefined
  >();
  const { username } = useTapisConfig();
  const [deploymentOptionsFilter, setDeploymentOptionsFilter] = useState('');
  const [selectedServingRuntimes, setSelectedServingRuntimes] = useState<
    string[]
  >([]);
  const [selectedDataCenters, setSelectedDataCenters] = useState<string[]>([]);
  const deploymentOptionsQuery =
    Hooks.Models.useListExternalModelDeploymentOptions({
      externalModelId: model.external_model_id,
      includeCount: true,
    });
  const deploymentsQuery = Hooks.Deployments.useList();
  const { start, isLoading: isStarting } =
    Hooks.Deployments.useStartModelDeployment();
  const { stop, isLoading: isStopping } =
    Hooks.Deployments.useStopModelDeployment();
  const { undeploy, isLoading: isUndeploying } =
    Hooks.Deployments.useUndeployModelDeployment();
  const deploymentOptions = deploymentOptionsQuery.data?.result ?? [];
  const { activeDeployments, terminalDeployments } = useMemo(() => {
    const newestFirst = (deploymentsQuery.data?.result ?? [])
      .filter(
        (deployment) => deployment.external_model_id === model.external_model_id
      )
      .sort((left, right) => {
        const rightTimestamp = Date.parse(right.created_at);
        const leftTimestamp = Date.parse(left.created_at);

        return (
          (Number.isNaN(rightTimestamp) ? 0 : rightTimestamp) -
          (Number.isNaN(leftTimestamp) ? 0 : leftTimestamp)
        );
      });

    return newestFirst.reduce<{
      activeDeployments: Deployments.ModelDeployment[];
      terminalDeployments: Deployments.ModelDeployment[];
    }>(
      (groups, deployment) => {
        if (isTerminalDeployment(deployment)) {
          groups.terminalDeployments.push(deployment);
        } else {
          groups.activeDeployments.push(deployment);
        }
        return groups;
      },
      { activeDeployments: [], terminalDeployments: [] }
    );
  }, [deploymentsQuery.data?.result, model.external_model_id]);
  const isLifecycleMutating = isStarting || isStopping || isUndeploying;
  const availableServingRuntimes = useMemo(
    () =>
      Array.from(
        new Set(deploymentOptions.map((option) => option.serving_runtime))
      ),
    [deploymentOptions]
  );
  const availableDataCenters = useMemo(
    () =>
      Array.from(
        new Set(
          deploymentOptions.flatMap((option) =>
            option.hpc_cluster_queue
              ? [option.hpc_cluster_queue.data_center]
              : []
          )
        )
      ),
    [deploymentOptions]
  );
  const filteredDeploymentOptions = useMemo(() => {
    const query = deploymentOptionsFilter.trim().toLowerCase();

    return deploymentOptions.filter((option) => {
      const target = option.hpc_cluster_queue;
      const matchesText =
        !query ||
        [
          option.id,
          option.serving_runtime,
          option.deployment_target_type,
          ...option.supported_deployment_modalities,
          target?.data_center,
          target?.hpc_cluster_id,
          target?.hpc_cluster_name,
          target?.batch_scheduler_queue_id,
          target?.batch_scheduler_queue_name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);
      const matchesRuntime =
        selectedServingRuntimes.length === 0 ||
        selectedServingRuntimes.includes(option.serving_runtime);
      const matchesDataCenter =
        selectedDataCenters.length === 0 ||
        (!!target && selectedDataCenters.includes(target.data_center));

      return matchesText && matchesRuntime && matchesDataCenter;
    });
  }, [
    deploymentOptions,
    deploymentOptionsFilter,
    selectedDataCenters,
    selectedServingRuntimes,
  ]);
  const { hpcOptionGroups, nonHpcOptions } = useMemo(() => {
    const groups = new Map<
      string,
      Map<string, { clusterName: string; options: DeploymentOption[] }>
    >();
    const nonHpc: DeploymentOption[] = [];

    filteredDeploymentOptions.forEach((option) => {
      const target = option.hpc_cluster_queue;
      if (!target) {
        nonHpc.push(option);
        return;
      }

      const dataCenterGroups = groups.get(target.data_center) ?? new Map();
      const cluster = dataCenterGroups.get(target.hpc_cluster_id) ?? {
        clusterName: target.hpc_cluster_name,
        options: [],
      };
      cluster.options.push(option);
      dataCenterGroups.set(target.hpc_cluster_id, cluster);
      groups.set(target.data_center, dataCenterGroups);
    });

    return {
      hpcOptionGroups: Array.from(groups, ([dataCenter, clusters]) => ({
        dataCenter,
        clusters: Array.from(clusters, ([clusterId, cluster]) => ({
          clusterId,
          ...cluster,
        })),
      })),
      nonHpcOptions: nonHpc,
    };
  }, [filteredDeploymentOptions]);

  return (
    <InfoSection>
      {view === 'deployments' && (
        <>
          <Typography sx={{ fontWeight: 700, mb: 0.5 }} variant="h6">
            Model deployments
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
            Start, stop, or undeploy instances of this model.
          </Typography>
          {deploymentsQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : deploymentsQuery.isError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Unable to load this model&apos;s deployments.
            </Alert>
          ) : (
            <Stack spacing={2.5} sx={{ mb: 3 }}>
              <DeploymentListSection
                caption="Deployments that are still running or can be managed."
                count={activeDeployments.length}
                deployments={activeDeployments}
                isMutating={isLifecycleMutating}
                onStart={(deployment) =>
                  start(
                    { deploymentId: deployment.id },
                    {
                      onError: (error) => {
                        toast.error(
                          error.message || 'Unable to start deployment.'
                        );
                      },
                      onSuccess: () => {
                        toast.success(`Started ${deployment.name}.`);
                      },
                    }
                  )
                }
                onStop={(deployment) =>
                  stop(
                    { deploymentId: deployment.id },
                    {
                      onError: (error) => {
                        toast.error(
                          error.message || 'Unable to stop deployment.'
                        );
                      },
                      onSuccess: () => {
                        toast.success(`Stopped ${deployment.name}.`);
                      },
                    }
                  )
                }
                onUndeploy={(deployment) =>
                  undeploy(
                    { deploymentId: deployment.id },
                    {
                      onError: (error) => {
                        toast.error(
                          error.message || 'Unable to undeploy deployment.'
                        );
                      },
                      onSuccess: () => {
                        toast.success(`Undeployed ${deployment.name}.`);
                      },
                    }
                  )
                }
                onOpen={(deployment) =>
                  navigate(`/deployments/${deployment.id}`)
                }
                title="Active deployments"
              />
              {terminalDeployments.length > 0 && (
                <DeploymentListSection
                  caption="Deployments that have reached a final outcome."
                  count={terminalDeployments.length}
                  deployments={terminalDeployments}
                  isMutating={isLifecycleMutating}
                  onStart={(deployment) =>
                    start(
                      { deploymentId: deployment.id },
                      {
                        onError: (error) => {
                          toast.error(
                            error.message || 'Unable to start deployment.'
                          );
                        },
                        onSuccess: () => {
                          toast.success(`Started ${deployment.name}.`);
                        },
                      }
                    )
                  }
                  onStop={(deployment) =>
                    stop(
                      { deploymentId: deployment.id },
                      {
                        onError: (error) => {
                          toast.error(
                            error.message || 'Unable to stop deployment.'
                          );
                        },
                        onSuccess: () => {
                          toast.success(`Stopped ${deployment.name}.`);
                        },
                      }
                    )
                  }
                  onUndeploy={(deployment) =>
                    undeploy(
                      { deploymentId: deployment.id },
                      {
                        onError: (error) => {
                          toast.error(
                            error.message || 'Unable to undeploy deployment.'
                          );
                        },
                        onSuccess: () => {
                          toast.success(`Undeployed ${deployment.name}.`);
                        },
                      }
                    )
                  }
                  onOpen={(deployment) =>
                    navigate(`/deployments/${deployment.id}`)
                  }
                  title="Terminal deployments"
                />
              )}
            </Stack>
          )}
        </>
      )}

      {view === 'options' && (
        <>
          <Typography sx={{ fontWeight: 700, mb: 0.5 }} variant="h6">
            Deployment options
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
            Compatible runtime, target, and deployment modality combinations for
            this model.
          </Typography>
          {deploymentOptionsQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : deploymentOptionsQuery.isError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Unable to load deployment options.
            </Alert>
          ) : deploymentOptions.length ? (
            <>
              <TextField
                fullWidth
                label="Filter deployment options"
                onChange={(event) =>
                  setDeploymentOptionsFilter(event.target.value)
                }
                placeholder="Search runtime, modality, data center, cluster, or queue…"
                size="small"
                sx={{ mb: 2 }}
                value={deploymentOptionsFilter}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: deploymentOptionsFilter ? (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="Clear deployment option filter"
                          edge="end"
                          onClick={() => setDeploymentOptionsFilter('')}
                          size="small"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : undefined,
                  },
                }}
              />
              {(availableServingRuntimes.length > 0 ||
                availableDataCenters.length > 0) && (
                <Stack
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  {availableServingRuntimes.length > 0 && (
                    <DeploymentOptionFilterChips
                      label="Serving runtimes"
                      onToggle={(runtime) =>
                        setSelectedServingRuntimes((current) =>
                          current.includes(runtime)
                            ? current.filter((value) => value !== runtime)
                            : [...current, runtime]
                        )
                      }
                      selected={selectedServingRuntimes}
                      values={availableServingRuntimes}
                    />
                  )}
                  {availableDataCenters.length > 0 && (
                    <DeploymentOptionFilterChips
                      label="Data centers"
                      onToggle={(dataCenter) =>
                        setSelectedDataCenters((current) =>
                          current.includes(dataCenter)
                            ? current.filter((value) => value !== dataCenter)
                            : [...current, dataCenter]
                        )
                      }
                      selected={selectedDataCenters}
                      values={availableDataCenters}
                    />
                  )}
                </Stack>
              )}
              {filteredDeploymentOptions.length ? (
                <Stack spacing={2.5}>
                  {hpcOptionGroups.map((dataCenterGroup) => (
                    <Box key={dataCenterGroup.dataCenter}>
                      <Typography
                        sx={{ fontWeight: 700, mb: 0.75 }}
                        variant="subtitle2"
                      >
                        {dataCenterGroup.dataCenter}
                      </Typography>
                      <Divider sx={{ mb: 1.25 }} />
                      <Stack spacing={1.5}>
                        {dataCenterGroup.clusters.map((clusterGroup) => (
                          <Box key={clusterGroup.clusterId}>
                            <Stack
                              direction="row"
                              sx={{ alignItems: 'center', gap: 0.75, mb: 0.75 }}
                            >
                              <Typography
                                sx={{ fontWeight: 600 }}
                                variant="body2"
                              >
                                {clusterGroup.clusterName}
                              </Typography>
                              <Chip
                                label={`${clusterGroup.options.length} option${
                                  clusterGroup.options.length === 1 ? '' : 's'
                                }`}
                                size="small"
                                variant="outlined"
                              />
                            </Stack>
                            <Box
                              sx={{
                                display: 'grid',
                                gap: 1.25,
                                gridTemplateColumns: {
                                  xs: '1fr',
                                  sm: 'repeat(2, minmax(0, 1fr))',
                                  lg: 'repeat(3, minmax(0, 1fr))',
                                },
                              }}
                            >
                              {clusterGroup.options.map((option) => (
                                <DeploymentOptionCard
                                  key={option.id}
                                  onDeploy={setSelectedDeploymentOption}
                                  option={option}
                                />
                              ))}
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                  {nonHpcOptions.length ? (
                    <Box>
                      <Typography
                        sx={{ fontWeight: 700, mb: 0.75 }}
                        variant="subtitle2"
                      >
                        Other deployment targets
                      </Typography>
                      <Divider sx={{ mb: 1.25 }} />
                      <Box
                        sx={{
                          display: 'grid',
                          gap: 1.25,
                          gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, minmax(0, 1fr))',
                            lg: 'repeat(3, minmax(0, 1fr))',
                          },
                        }}
                      >
                        {nonHpcOptions.map((option) => (
                          <DeploymentOptionCard
                            key={option.id}
                            onDeploy={setSelectedDeploymentOption}
                            option={option}
                          />
                        ))}
                      </Box>
                    </Box>
                  ) : null}
                </Stack>
              ) : (
                <Typography color="text.secondary" variant="body2">
                  No deployment options match this filter.
                </Typography>
              )}
            </>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              No deployment options are currently available for this model.
            </Alert>
          )}

          <DeploymentDialog
            author={username}
            defaultDeploymentOption={selectedDeploymentOption}
            defaultModel={model}
            onClose={() => setSelectedDeploymentOption(undefined)}
            open={selectedDeploymentOption !== undefined}
          />
        </>
      )}
    </InfoSection>
  );
}

function DeploymentListSection({
  caption,
  count,
  deployments,
  isMutating,
  onOpen,
  onStart,
  onStop,
  onUndeploy,
  title,
}: {
  caption: string;
  count: number;
  deployments: Deployments.ModelDeployment[];
  isMutating: boolean;
  onOpen: (deployment: Deployments.ModelDeployment) => void;
  onStart: (deployment: Deployments.ModelDeployment) => void;
  onStop: (deployment: Deployments.ModelDeployment) => void;
  onUndeploy: (deployment: Deployments.ModelDeployment) => void;
  title: string;
}) {
  return (
    <Box>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          justifyContent: 'space-between',
          mb: 1.25,
          pb: 0.75,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700 }} variant="subtitle1">
            {title}
          </Typography>
          <Typography color="text.secondary" variant="caption">
            {caption}
          </Typography>
        </Box>
        <Chip label={count} size="small" variant="outlined" />
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gap: 1.25,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        {deployments.length ? (
          deployments.map((deployment) => (
            <ModelDeploymentCard
              deployment={deployment}
              isMutating={isMutating}
              key={deployment.id}
              onOpen={() => onOpen(deployment)}
              onStart={() => onStart(deployment)}
              onStop={() => onStop(deployment)}
              onUndeploy={() => onUndeploy(deployment)}
            />
          ))
        ) : (
          <NoActiveDeployments />
        )}
      </Box>
    </Box>
  );
}

function ModelDeploymentCard({
  deployment,
  isMutating,
  onOpen,
  onStart,
  onStop,
  onUndeploy,
}: {
  deployment: Deployments.ModelDeployment;
  isMutating: boolean;
  onOpen: () => void;
  onStart: () => void;
  onStop: () => void;
  onUndeploy: () => void;
}) {
  const reconciliation = reconciliationStatusPresentation(
    deployment.reconciliation_status
  );
  const batchOutcome = batchOutcomePresentation(
    deployment.batch_execution_outcome
  );
  const isExpired = isDeploymentExpired(deployment);
  const isRunning =
    !isExpired && deployment.state === Deployments.State.Running;

  return (
    <Card
      onClick={onOpen}
      sx={{
        cursor: 'pointer',
        height: '100%',
        '&:hover': { borderColor: 'primary.main' },
      }}
      variant="outlined"
    >
      <CardContent
        sx={{
          '&:last-child': { pb: 1.5 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          p: 1.5,
        }}
      >
        <Stack spacing={1.25} sx={{ flex: 1 }}>
          <Stack
            direction={{ sm: 'row', xs: 'column' }}
            sx={{ alignItems: { sm: 'flex-start' }, gap: 1, width: '100%' }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }} variant="subtitle2">
                {deployment.name}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                {deployment.deployment_modality} deployment
                {deployment.target_endpoint?.base_url
                  ? ` · ${deployment.target_endpoint.base_url}`
                  : ''}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ display: 'block', fontFamily: 'monospace' }}
                variant="caption"
              >
                Deployment ID: {deployment.id}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            <Button
              disabled={isMutating || !canStartDeployment(deployment)}
              onClick={(event) => {
                event.stopPropagation();
                onStart();
              }}
              size="small"
              startIcon={<PlayArrowIcon />}
              variant="outlined"
            >
              Start
            </Button>
            <Button
              color="warning"
              disabled={isMutating || !canStopDeployment(deployment)}
              onClick={(event) => {
                event.stopPropagation();
                onStop();
              }}
              size="small"
              startIcon={<StopCircleOutlinedIcon />}
              variant="outlined"
            >
              Stop
            </Button>
            <Button
              color="error"
              disabled={isMutating || !canUndeployDeployment(deployment)}
              onClick={(event) => {
                event.stopPropagation();
                onUndeploy();
              }}
              size="small"
              startIcon={<DeleteOutlineIcon />}
              variant="outlined"
            >
              Undeploy
            </Button>
          </Stack>
        </Stack>
        {deployment.last_message && (
          <Typography
            color="text.secondary"
            sx={{ display: 'block', mt: 1 }}
            variant="caption"
          >
            {deployment.last_message}
          </Typography>
        )}
        <Stack
          direction="row"
          sx={{ flexShrink: 0, flexWrap: 'wrap', gap: 0.75, mt: 1.25 }}
        >
          <Chip
            color={reconciliation.color}
            icon={
              isRunning ? (
                <AutorenewRoundedIcon
                  aria-label="Deployment is running"
                  sx={{
                    animation: 'deployment-running 1.2s linear infinite',
                    fontSize: 16,
                    '@keyframes deployment-running': {
                      from: { transform: 'rotate(0deg)' },
                      to: { transform: 'rotate(360deg)' },
                    },
                  }}
                />
              ) : undefined
            }
            label={reconciliation.label}
            size="small"
            variant="outlined"
          />
          {isExpired && (
            <Chip
              color="warning"
              label="Expired"
              size="small"
              variant="outlined"
            />
          )}
          {deployment.batch_execution_outcome && (
            <Chip
              color={batchOutcome.color}
              label={`Batch: ${batchOutcome.label}`}
              size="small"
              variant="outlined"
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function DeploymentOptionCard({
  onDeploy,
  option,
}: {
  onDeploy: (option: DeploymentOption) => void;
  option: DeploymentOption;
}) {
  const target = option.hpc_cluster_queue;
  const title = target?.batch_scheduler_queue_name ?? option.serving_runtime;

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: option.available ? 'divider' : 'warning.light',
        borderLeft: '3px solid',
        borderLeftColor: option.available ? 'success.main' : 'warning.main',
        borderRadius: '2px',
        height: '100%',
      }}
    >
      <CardContent
        sx={{
          '&:last-child': { pb: 1.5 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          p: 1.5,
        }}
      >
        <Typography sx={{ fontWeight: 700 }} variant="subtitle2">
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.25 }} variant="caption">
          Runtime: {option.serving_runtime}
        </Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
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
          {option.supported_deployment_modalities.map((modality) => (
            <Chip key={modality} label={modality} size="small" />
          ))}
        </Stack>
        <Box sx={{ flex: 1 }} />
        {target && (
          <Typography color="text.secondary" sx={{ mt: 1 }} variant="caption">
            {target.hpc_cluster_name} · {target.data_center}
            {!target.hpc_cluster_enabled ||
            !target.batch_scheduler_queue_enabled
              ? ' · target disabled'
              : ''}
          </Typography>
        )}
        <Button
          disabled={!option.available}
          onClick={() => onDeploy(option)}
          size="small"
          sx={{ alignSelf: 'flex-end', mt: 1 }}
          variant="outlined"
        >
          Deploy
        </Button>
      </CardContent>
    </Card>
  );
}

function DeploymentOptionFilterChips({
  label,
  onToggle,
  selected,
  values,
}: {
  label: string;
  onToggle: (value: string) => void;
  selected: string[];
  values: string[];
}) {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}
    >
      <Typography
        color="text.secondary"
        sx={{ fontWeight: 700 }}
        variant="caption"
      >
        {label}
      </Typography>
      {values.map((value) => {
        const isSelected = selected.includes(value);
        return (
          <Chip
            color={isSelected ? 'primary' : 'default'}
            key={value}
            label={value}
            onClick={() => onToggle(value)}
            size="small"
            variant={isSelected ? 'filled' : 'outlined'}
          />
        );
      })}
    </Stack>
  );
}
