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

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

import {
  DeploymentOption,
  DeploymentStrategyReference,
  Model,
} from '@mlhub/models-ts-sdk';
import DeploymentDialog from '../../../_components/DeploymentDialog';
import { InfoSection } from './InfoSection';
import { MLHub as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { derivedMetadataFor } from '../../../modelMetadata';

interface DeploymentSectionProps {
  model: Model;
}

export function DeploymentSection({ model }: DeploymentSectionProps) {
  const strategies = derivedMetadataFor(model).deployment_strategies;
  const [strat, setStrat] = useState<DeploymentStrategyReference | undefined>(
    undefined
  );
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
  const deploymentOptions = deploymentOptionsQuery.data?.result ?? [];
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
            onChange={(event) => setDeploymentOptionsFilter(event.target.value)}
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
              sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}
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
                          <Typography sx={{ fontWeight: 600 }} variant="body2">
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
                      <DeploymentOptionCard key={option.id} option={option} />
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

      <Divider sx={{ my: 3 }} />

      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>How deployment strategies are determined</AlertTitle>
        We calculate deployment methods for models by analyzing their metadata -
        architecture, I/O specification, and runtime requirements - against our
        catalog of known deployment strategies. Only strategies with matching
        capabilities are shown here.
      </Alert>
      {strategies && strategies.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {strategies.map((strategy, index) => (
            <Box
              key={strategy.name ?? index}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: (theme) => theme.shadows[1],
                },
              }}
              onClick={() => setStrat(strategy)}
              role="button"
              tabIndex={0}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {strategy.name}
                  </Typography>
                  {strategy.name && (
                    <Chip
                      label={strategy.name}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>

                <Button
                  startIcon={<RocketLaunchIcon fontSize="small" />}
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStrat(strategy);
                  }}
                  sx={{ minWidth: 'auto' }}
                >
                  Deploy
                </Button>
              </Box>
            </Box>
          ))}
          <DeploymentDialog
            open={strat !== undefined}
            onClose={() => setStrat(undefined)}
            author={username}
            defaultModel={model}
            defaultStratRef={strat}
          />
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No deployment strategies configured.
        </Typography>
      )}
    </InfoSection>
  );
}

function DeploymentOptionCard({ option }: { option: DeploymentOption }) {
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
