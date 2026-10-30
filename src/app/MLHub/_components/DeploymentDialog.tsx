import { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemIcon,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsSuggestOutlinedIcon from '@mui/icons-material/SettingsSuggestOutlined';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import { LoadingButton } from '@mui/lab';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import * as Models from '@mlhub/models-ts-sdk';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useToast } from '../_context/ToastsContext/useToast';
import { useNavigate } from '../_context/NavContext';

interface DeploymentDialogProps {
  defaultModel?: Models.Model;
  defaultDeploymentOption?: Models.DeploymentOption;
  open: boolean;
  onClose: () => void;
  author: string;
}

type FormInput = {
  name: string;
  description: string;
  model: Models.Model | null;
  deploymentOption: Models.DeploymentOption | null;
  deploymentModality: Deployments.DeploymentModality | null;
  deploymentTargetType: Models.DeploymentTargetType | null;
  hpcClusterId: string;
  parameterValues: Record<string, string>;
  parallelismStrategies: Deployments.ParallelismStrategy[];
  replicas: number;
};

const steps = [
  'Model',
  'General information',
  'Deployment modality',
  'Deployment target',
  'HPC cluster',
  'Queue',
  'Configuration',
  'Review',
];
const deploymentNameFor = (modelName: string) => `${modelName} Deployment`;

const optionTitle = (option: Models.DeploymentOption) =>
  option.hpc_cluster_queue?.batch_scheduler_queue_name ??
  option.serving_runtime;

const optionDescription = (option: Models.DeploymentOption) => {
  const target = option.hpc_cluster_queue;
  return target
    ? `${target.data_center} · ${target.hpc_cluster_name} · ${option.serving_runtime}`
    : `${option.deployment_target_type} · ${option.serving_runtime}`;
};

type SelectMenuItemProps = React.ComponentProps<typeof MenuItem>;

function QueueMenuItem({
  option,
  ...menuItemProps
}: {
  option: Models.DeploymentOption;
} & SelectMenuItemProps) {
  const target = option.hpc_cluster_queue;
  const clusterQuery = Hooks.Deployments.Targets.useGetHpcCluster(
    target
      ? {
          dataCenter:
            target.data_center as unknown as Deployments.GetHpcClusterDataCenterEnum,
          hpcClusterId: target.hpc_cluster_id,
        }
      : undefined
  );
  const queue = clusterQuery.data?.result?.queues.find(
    (item) => item.id === target?.batch_scheduler_queue_id
  );
  const hardware = queue?.hardware_profile;
  const disabled =
    !target?.hpc_cluster_enabled || !target.batch_scheduler_queue_enabled;

  return (
    <MenuItem
      {...menuItemProps}
      disabled={disabled}
      sx={{ alignItems: 'flex-start', py: 1 }}
      value={option.id}
    >
      <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
        <StorageOutlinedIcon fontSize="small" />
      </ListItemIcon>
      <Box sx={{ minWidth: 0 }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {optionTitle(option)}
          </Typography>
          {queue && (
            <Chip
              label={queue.scheduler_type}
              size="small"
              variant="outlined"
            />
          )}
          {queue && !queue.enabled && (
            <Chip color="warning" label="Disabled" size="small" />
          )}
        </Stack>
        <Typography color="text.secondary" variant="caption">
          {target
            ? `${target.hpc_cluster_name} · ${target.data_center} · ${option.serving_runtime}`
            : option.serving_runtime}
        </Typography>
        {hardware && (
          <Typography component="div" color="text.secondary" variant="caption">
            {hardware.total_nodes.toLocaleString()} nodes ·{' '}
            {hardware.cpu_cores_per_node.toLocaleString()} cores/node ·{' '}
            {hardware.memory_gb.toLocaleString()} GB/node
            {hardware.gpu
              ? ` · ${hardware.gpu.count_per_node} × ${hardware.gpu.gpu_vendor} ${hardware.gpu.gpu_model}`
              : ''}
          </Typography>
        )}
      </Box>
    </MenuItem>
  );
}

function HpcClusterMenuItem({
  option,
  ...menuItemProps
}: {
  option: Models.DeploymentOption;
} & SelectMenuItemProps) {
  const target = option.hpc_cluster_queue;
  const disabled = !target?.hpc_cluster_enabled;

  return (
    <MenuItem
      {...menuItemProps}
      disabled={disabled}
      sx={{ alignItems: 'flex-start', py: 1 }}
      value={target?.hpc_cluster_id}
    >
      <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
        <HubOutlinedIcon fontSize="small" />
      </ListItemIcon>
      <Box>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {target?.hpc_cluster_name}
          </Typography>
          {disabled && <Chip color="warning" label="Disabled" size="small" />}
        </Stack>
        <Typography color="text.secondary" variant="caption">
          {target?.data_center}
        </Typography>
      </Box>
    </MenuItem>
  );
}

type QueueRow = {
  option?: Models.DeploymentOption;
  queue: Deployments.BatchSchedulerQueue;
};

function ClusterQueueMenuItem({
  queueRow,
  ...menuItemProps
}: {
  queueRow: QueueRow;
} & SelectMenuItemProps) {
  const { option, queue } = queueRow;
  const hardware = queue.hardware_profile;
  const disabled = !queue.enabled || !option;

  return (
    <MenuItem
      {...menuItemProps}
      disabled={disabled}
      sx={{ alignItems: 'flex-start', py: 1 }}
      value={queue.id}
    >
      <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
        <StorageOutlinedIcon fontSize="small" />
      </ListItemIcon>
      <Box sx={{ minWidth: 0 }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {queue.name}
          </Typography>
          <Chip label={queue.scheduler_type} size="small" variant="outlined" />
          {!queue.enabled && (
            <Chip color="warning" label="Disabled" size="small" />
          )}
          {queue.enabled && !option && (
            <Chip label="Not compatible" size="small" variant="outlined" />
          )}
        </Stack>
        <Typography component="div" color="text.secondary" variant="caption">
          {hardware.total_nodes.toLocaleString()} nodes ·{' '}
          {hardware.cpu_cores_per_node.toLocaleString()} cores/node ·{' '}
          {hardware.memory_gb.toLocaleString()} GB/node
          {hardware.gpu
            ? ` · ${hardware.gpu.count_per_node} × ${hardware.gpu.gpu_vendor} ${hardware.gpu.gpu_model}`
            : ' · CPU only'}
        </Typography>
      </Box>
    </MenuItem>
  );
}

function DeployableModelMenuItem({
  model,
  ...menuItemProps
}: {
  model: Models.Model;
} & SelectMenuItemProps) {
  const optionsQuery = Hooks.Models.useListExternalModelDeploymentOptions({
    externalModelId: model.external_model_id,
    includeCount: true,
  });
  const hasAvailableOption = (optionsQuery.data?.result ?? []).some(
    (option) => option.available
  );
  const isChecking = optionsQuery.isLoading || optionsQuery.isIdle;
  const disabled = isChecking || !hasAvailableOption;

  return (
    <MenuItem
      {...menuItemProps}
      disabled={disabled}
      sx={{ alignItems: 'flex-start', py: 1 }}
      value={model.id}
    >
      <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
        <SmartToyIcon fontSize="small" />
      </ListItemIcon>
      <Box>
        <Typography variant="body2">{model.name}</Typography>
        <Typography color="text.secondary" variant="caption">
          {isChecking
            ? 'Checking deployment options'
            : hasAvailableOption
            ? model.external_model.provider
            : 'No deployment options available'}
        </Typography>
      </Box>
    </MenuItem>
  );
}

const DeploymentDialog = ({
  defaultModel,
  defaultDeploymentOption,
  open,
  onClose,
  author,
}: DeploymentDialogProps) => {
  const toast = useToast();
  const { navigate } = useNavigate();
  const [activeStep, setActiveStep] = useState(defaultModel ? 1 : 0);
  const { data: modelsData, isLoading: isLoadingModels } =
    Hooks.Models.useListByAuthor({ author });
  const models = modelsData?.result ?? [];
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
    setValue,
    trigger,
  } = useForm<FormInput>({
    defaultValues: {
      name: defaultModel ? deploymentNameFor(defaultModel.name) : '',
      description: '',
      model: defaultModel ?? null,
      deploymentOption: defaultDeploymentOption ?? null,
      deploymentModality: null,
      deploymentTargetType: null,
      hpcClusterId: '',
      parameterValues: {},
      parallelismStrategies: [],
      replicas: 1,
    },
  });
  const [
    model,
    deploymentOption,
    modality,
    deploymentTargetType,
    hpcClusterId,
  ] = useWatch({
    control,
    name: [
      'model',
      'deploymentOption',
      'deploymentModality',
      'deploymentTargetType',
      'hpcClusterId',
    ],
  });
  const deploymentOptionsQuery =
    Hooks.Models.useListExternalModelDeploymentOptions(
      model
        ? { externalModelId: model.external_model_id, includeCount: true }
        : undefined
    );
  const availableOptions = useMemo(
    () => deploymentOptionsQuery.data?.result ?? [],
    [deploymentOptionsQuery.data]
  );
  const supportedModalities = useMemo(
    () =>
      Array.from(
        new Set(
          availableOptions.flatMap(
            (option) => option.supported_deployment_modalities
          )
        )
      ),
    [availableOptions]
  );
  const modalityOptions = useMemo(
    () =>
      modality
        ? availableOptions.filter((option) =>
            option.supported_deployment_modalities.includes(modality as never)
          )
        : [],
    [availableOptions, modality]
  );
  const availableTargetTypes = useMemo(
    () =>
      Array.from(
        new Set(modalityOptions.map((option) => option.deployment_target_type))
      ),
    [modalityOptions]
  );
  const clusterOptions = useMemo(() => {
    const byClusterId = new Map<string, Models.DeploymentOption>();
    modalityOptions
      .filter(
        (option) => option.deployment_target_type === deploymentTargetType
      )
      .forEach((option) => {
        const clusterId = option.hpc_cluster_queue?.hpc_cluster_id;
        if (clusterId && !byClusterId.has(clusterId)) {
          byClusterId.set(clusterId, option);
        }
      });
    return Array.from(byClusterId.values());
  }, [deploymentTargetType, modalityOptions]);
  const selectedClusterOption = clusterOptions.find(
    (option) => option.hpc_cluster_queue?.hpc_cluster_id === hpcClusterId
  );
  const clusterDetailsQuery = Hooks.Deployments.Targets.useGetHpcCluster(
    selectedClusterOption?.hpc_cluster_queue
      ? {
          dataCenter: selectedClusterOption.hpc_cluster_queue
            .data_center as unknown as Deployments.GetHpcClusterDataCenterEnum,
          hpcClusterId: selectedClusterOption.hpc_cluster_queue.hpc_cluster_id,
        }
      : undefined
  );
  const queueRows = useMemo(() => {
    const compatibleOptions = new Map(
      modalityOptions
        .filter(
          (option) =>
            option.deployment_target_type === deploymentTargetType &&
            option.hpc_cluster_queue?.hpc_cluster_id === hpcClusterId
        )
        .map((option) => [
          option.hpc_cluster_queue?.batch_scheduler_queue_id,
          option,
        ])
    );
    return (clusterDetailsQuery.data?.result?.queues ?? [])
      .map((queue) => ({
        queue,
        option: compatibleOptions.get(queue.id),
      }))
      .sort((left, right) => Number(!left.option) - Number(!right.option));
  }, [
    clusterDetailsQuery.data,
    deploymentTargetType,
    hpcClusterId,
    modalityOptions,
  ]);
  const hasEnabledCluster = clusterOptions.some(
    (option) => option.hpc_cluster_queue?.hpc_cluster_enabled
  );
  const hasEnabledQueue = queueRows.some(
    (row) => row.queue.enabled && row.option
  );
  const deploymentOptionDetailQuery =
    Hooks.Models.useGetExternalModelDeploymentOption(
      model && deploymentOption
        ? {
            externalModelId: model.external_model_id,
            deploymentOptionId: deploymentOption.id,
          }
        : undefined
    );
  const deploymentParameters =
    deploymentOptionDetailQuery.data?.result.parameters ?? [];
  const {
    deploy,
    isLoading: isDeploying,
    error: deploymentError,
    reset: resetDeployment,
  } = Hooks.Deployments.useDeployWithOption();

  useEffect(() => {
    if (!open) return;
    const target = defaultDeploymentOption?.hpc_cluster_queue;
    reset({
      name: defaultModel ? deploymentNameFor(defaultModel.name) : '',
      description: '',
      model: defaultModel ?? null,
      deploymentOption: defaultDeploymentOption ?? null,
      deploymentModality:
        defaultDeploymentOption?.supported_deployment_modalities[0] ?? null,
      deploymentTargetType:
        defaultDeploymentOption?.deployment_target_type ?? null,
      hpcClusterId: target?.hpc_cluster_id ?? '',
      parameterValues: {},
      parallelismStrategies: [],
      replicas: 1,
    });
    setActiveStep(defaultModel ? 1 : 0);
    resetDeployment();
  }, [defaultDeploymentOption, defaultModel, open, reset, resetDeployment]);

  useEffect(() => {
    if (!deploymentOption) return;
    if (!deploymentOptionsQuery.isSuccess) return;
    if (!availableOptions.some((option) => option.id === deploymentOption.id)) {
      setValue('deploymentOption', null);
    }
  }, [
    availableOptions,
    deploymentOption,
    deploymentOptionsQuery.isSuccess,
    setValue,
  ]);

  useEffect(() => {
    if (!modality || supportedModalities.includes(modality as never)) return;
    setValue('deploymentModality', null);
    setValue('deploymentTargetType', null);
    setValue('hpcClusterId', '');
    setValue('deploymentOption', null);
  }, [modality, setValue, supportedModalities]);

  useEffect(() => {
    if (!deploymentOptionDetailQuery.isSuccess) return;
    setValue(
      'parameterValues',
      Object.fromEntries(
        deploymentParameters.map((parameter) => [
          parameter.name,
          parameter._default ?? '',
        ])
      )
    );
  }, [deploymentOptionDetailQuery.isSuccess, deploymentParameters, setValue]);

  const next = async () => {
    const fields: Array<Array<keyof FormInput>> = [
      ['model'],
      ['name'],
      ['deploymentModality'],
      ['deploymentTargetType'],
      ['hpcClusterId'],
      ['deploymentOption'],
      ['replicas'],
    ];
    const isValid =
      activeStep === 6
        ? await trigger()
        : await trigger(fields[activeStep] ?? []);
    if (isValid) {
      setActiveStep((step) => Math.min(step + 1, steps.length - 1));
    }
  };

  const submit = (data: FormInput) => {
    if (!data.deploymentOption || !data.deploymentModality) return;
    deploy(
      {
        deployModelWithOptionBody: {
          deployment_option_id: data.deploymentOption.id,
          deployment_modality: data.deploymentModality,
          name: data.name.trim(),
          description: data.description.trim() || null,
          replicas: data.replicas,
          parallelism_strategies: data.parallelismStrategies,
          arguments: deploymentParameters
            .map((parameter) => ({
              parameter_name: parameter.name,
              value: data.parameterValues[parameter.name]?.trim() ?? '',
            }))
            .filter((argument) => argument.value.length > 0),
        },
      },
      {
        onSuccess: () => {
          toast.success('Deployment created successfully');
          onClose();
          navigate('/deployments');
        },
      }
    );
  };

  const selectedModelName = model?.name ?? 'the selected model';
  const selectedOption = getValues('deploymentOption');

  return (
    <Dialog fullWidth maxWidth="md" onClose={onClose} open={open}>
      <DialogTitle>Deploy model</DialogTitle>
      <DialogContent dividers>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {deploymentError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {deploymentError.message}
          </Alert>
        )}
        {activeStep === 0 && (
          <Stack spacing={2}>
            <Typography variant="h6">Select a model</Typography>
            <Controller
              control={control}
              name="model"
              rules={{ required: 'Select a model to deploy' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={
                    fieldState.error?.message ??
                    'Only models in your collection are shown.'
                  }
                  label="Model"
                  onChange={(event) => {
                    const nextModel =
                      models.find((item) => item.id === event.target.value) ??
                      null;
                    field.onChange(nextModel);
                    setValue(
                      'name',
                      nextModel ? deploymentNameFor(nextModel.name) : ''
                    );
                    setValue('deploymentOption', null);
                    setValue('deploymentModality', null);
                    setValue('deploymentTargetType', null);
                    setValue('hpcClusterId', '');
                  }}
                  SelectProps={{
                    renderValue: (selected: unknown) => {
                      const selectedModel = models.find(
                        (item) => item.id === selected
                      );
                      return (
                        <Stack
                          direction="row"
                          sx={{ alignItems: 'center', gap: 1 }}
                        >
                          <SmartToyIcon fontSize="small" />
                          <Typography variant="body2">
                            {selectedModel?.name ?? String(selected)}
                          </Typography>
                        </Stack>
                      );
                    },
                  }}
                  value={field.value?.id ?? ''}
                >
                  {isLoadingModels ? (
                    <MenuItem disabled>Loading models…</MenuItem>
                  ) : (
                    models.map((item) => (
                      <DeployableModelMenuItem
                        key={item.id}
                        model={item}
                        value={item.id}
                      />
                    ))
                  )}
                </TextField>
              )}
            />
          </Stack>
        )}
        {activeStep === 1 && (
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">Deployment details</Typography>
              <Typography color="text.secondary" variant="body2">
                Name this deployment of {selectedModelName}.
              </Typography>
            </Box>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Deployment name is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  autoFocus
                  fullWidth
                  required
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  label="Deployment name"
                />
              )}
            />
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Description"
                  minRows={2}
                  multiline
                  placeholder="Optional operational context"
                />
              )}
            />
          </Stack>
        )}
        {activeStep === 2 && (
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">Choose a deployment modality</Typography>
              <Typography color="text.secondary" variant="body2">
                Choose how this model will be deployed before selecting its
                target.
              </Typography>
            </Box>
            {deploymentOptionsQuery.isLoading ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={28} />
              </Box>
            ) : deploymentOptionsQuery.isError ? (
              <Alert severity="error">
                Unable to load deployment options for this model.
              </Alert>
            ) : supportedModalities.length === 0 ? (
              <Alert severity="warning">
                No available deployment options exist for this model.
              </Alert>
            ) : (
              <Controller
                control={control}
                name="deploymentModality"
                rules={{ required: 'Choose a deployment modality' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    required
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    label="Deployment modality"
                    value={field.value ?? ''}
                    onChange={(event) => {
                      field.onChange(event.target.value || null);
                      setValue('deploymentTargetType', null);
                      setValue('hpcClusterId', '');
                      setValue('deploymentOption', null);
                    }}
                    SelectProps={{
                      renderValue: (selected: unknown) => (
                        <Stack
                          direction="row"
                          sx={{ alignItems: 'center', gap: 1 }}
                        >
                          <RocketLaunchIcon fontSize="small" />
                          <Typography variant="body2">
                            {String(selected)}
                          </Typography>
                        </Stack>
                      ),
                    }}
                  >
                    {supportedModalities.map((item) => (
                      <MenuItem key={item} value={item}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <RocketLaunchIcon fontSize="small" />
                        </ListItemIcon>
                        <Typography variant="body2">{item}</Typography>
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}
          </Stack>
        )}
        {activeStep === 3 && (
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">Choose a deployment target</Typography>
              <Typography color="text.secondary" variant="body2">
                HPC Cluster is the currently available deployment target.
              </Typography>
            </Box>
            <Controller
              control={control}
              name="deploymentTargetType"
              rules={{ required: 'Choose a deployment target' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  required
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  label="Deployment target"
                  value={field.value ?? ''}
                  onChange={(event) => {
                    field.onChange(event.target.value || null);
                    setValue('hpcClusterId', '');
                    setValue('deploymentOption', null);
                  }}
                  SelectProps={{
                    renderValue: (selected: unknown) => (
                      <Stack
                        direction="row"
                        sx={{ alignItems: 'center', gap: 1 }}
                      >
                        <HubOutlinedIcon fontSize="small" />
                        <Typography variant="body2">
                          {selected ===
                          Models.DeploymentTargetType.HpcClusterQueue
                            ? 'HPC Cluster'
                            : String(selected)}
                        </Typography>
                      </Stack>
                    ),
                  }}
                >
                  {availableTargetTypes.map((targetType) => (
                    <MenuItem key={targetType} value={targetType}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <HubOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <Box>
                        <Typography variant="body2">
                          {targetType ===
                          Models.DeploymentTargetType.HpcClusterQueue
                            ? 'HPC Cluster'
                            : targetType}
                        </Typography>
                        <Typography color="text.secondary" variant="caption">
                          Select an HPC scheduler queue next
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Stack>
        )}
        {activeStep === 4 && (
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">Choose an HPC cluster</Typography>
              <Typography color="text.secondary" variant="body2">
                Select the cluster that will host this deployment.
              </Typography>
            </Box>
            {clusterOptions.length === 0 ? (
              <Alert severity="warning">
                No HPC clusters support the selected modality and target.
              </Alert>
            ) : (
              <Controller
                control={control}
                name="hpcClusterId"
                rules={{ required: 'Choose an HPC cluster' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    required
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    label="HPC cluster"
                    value={field.value ?? ''}
                    onChange={(event) => {
                      field.onChange(event.target.value || '');
                      setValue('deploymentOption', null);
                    }}
                    SelectProps={{
                      renderValue: (selected: unknown) => {
                        const selectedCluster = clusterOptions.find(
                          (option) =>
                            option.hpc_cluster_queue?.hpc_cluster_id ===
                            selected
                        );
                        return (
                          <Stack
                            direction="row"
                            sx={{ alignItems: 'center', gap: 1 }}
                          >
                            <HubOutlinedIcon fontSize="small" />
                            <Typography variant="body2">
                              {selectedCluster
                                ? selectedCluster.hpc_cluster_queue
                                    ?.hpc_cluster_name
                                : String(selected)}
                            </Typography>
                          </Stack>
                        );
                      },
                    }}
                  >
                    {clusterOptions.map((option) => (
                      <HpcClusterMenuItem
                        key={option.id}
                        option={option}
                        value={option.hpc_cluster_queue?.hpc_cluster_id}
                      />
                    ))}
                  </TextField>
                )}
              />
            )}
          </Stack>
        )}
        {activeStep === 5 && (
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">Choose a queue</Typography>
              <Typography color="text.secondary" variant="body2">
                Select a scheduler queue on the selected HPC cluster.
              </Typography>
            </Box>
            {clusterDetailsQuery.isLoading ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={28} />
              </Box>
            ) : queueRows.length === 0 ? (
              <Alert severity="warning">
                This cluster has no scheduler queues.
              </Alert>
            ) : (
              <Controller
                control={control}
                name="deploymentOption"
                rules={{ required: 'Choose a scheduler queue' }}
                render={({ field, fieldState }) => (
                  <TextField
                    select
                    fullWidth
                    required
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    label="Scheduler queue"
                    value={
                      field.value
                        ? queueRows.find(
                            (row) => row.option?.id === field.value?.id
                          )?.queue.id ?? ''
                        : ''
                    }
                    onChange={(event) =>
                      field.onChange(
                        queueRows.find(
                          (row) => row.queue.id === event.target.value
                        )?.option ?? null
                      )
                    }
                    SelectProps={{
                      renderValue: (selected: unknown) => {
                        const selectedQueue = queueRows.find(
                          (row) => row.queue.id === selected
                        );
                        return (
                          <Stack
                            direction="row"
                            sx={{ alignItems: 'center', gap: 1 }}
                          >
                            <StorageOutlinedIcon fontSize="small" />
                            <Typography variant="body2">
                              {selectedQueue
                                ? selectedQueue.queue.name
                                : String(selected)}
                            </Typography>
                          </Stack>
                        );
                      },
                    }}
                  >
                    {queueRows.map((queueRow) => (
                      <ClusterQueueMenuItem
                        key={queueRow.queue.id}
                        queueRow={queueRow}
                        value={queueRow.queue.id}
                      />
                    ))}
                  </TextField>
                )}
              />
            )}
          </Stack>
        )}
        {activeStep === 6 && (
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">Configure deployment</Typography>
              <Typography color="text.secondary" variant="body2">
                Provide the selected option's required values and choose scaling
                settings.
              </Typography>
            </Box>
            {deploymentOptionDetailQuery.isLoading ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={28} />
              </Box>
            ) : deploymentOptionDetailQuery.isError ? (
              <Alert severity="error">
                Unable to load deployment configuration requirements.
              </Alert>
            ) : (
              <>
                {deploymentParameters.map((parameter) => (
                  <Controller
                    control={control}
                    key={parameter.name}
                    name={`parameterValues.${parameter.name}`}
                    rules={{
                      validate: (value) =>
                        !parameter.required ||
                        Boolean(value?.trim()) ||
                        `${parameter.name} is required`,
                    }}
                    render={({ field, fieldState }) => {
                      const choices =
                        parameter.choices?.filter((choice) => choice.enabled) ??
                        [];
                      const isBoolean =
                        parameter.parameter_type ===
                        Models.DeploymentParameterType.Boolean;
                      const isNumber =
                        parameter.parameter_type ===
                          Models.DeploymentParameterType.Integer ||
                        parameter.parameter_type ===
                          Models.DeploymentParameterType.Float;
                      const isChoice = choices.length > 0 || isBoolean;

                      return (
                        <TextField
                          {...field}
                          select={isChoice}
                          fullWidth
                          required={parameter.required}
                          error={Boolean(fieldState.error)}
                          helperText={
                            fieldState.error?.message ?? parameter.description
                          }
                          label={parameter.name}
                          type={
                            isNumber
                              ? 'number'
                              : parameter.secret
                              ? 'password'
                              : 'text'
                          }
                          value={field.value ?? ''}
                        >
                          {isBoolean ? (
                            <>
                              <MenuItem value="true">True</MenuItem>
                              <MenuItem value="false">False</MenuItem>
                            </>
                          ) : (
                            choices.map((choice) => (
                              <MenuItem key={choice.value} value={choice.value}>
                                {choice.value}
                                {choice.description
                                  ? ` · ${choice.description}`
                                  : ''}
                              </MenuItem>
                            ))
                          )}
                        </TextField>
                      );
                    }}
                  />
                ))}
                <Accordion
                  disableGutters
                  elevation={0}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: '2px',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack
                      direction="row"
                      sx={{ alignItems: 'center', gap: 1 }}
                    >
                      <SettingsSuggestOutlinedIcon color="action" />
                      <Box>
                        <Typography sx={{ fontWeight: 600 }} variant="body2">
                          Advanced settings
                        </Typography>
                        <Typography color="text.secondary" variant="caption">
                          Configure replicas and parallel model execution.
                        </Typography>
                      </Box>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <Controller
                        control={control}
                        name="replicas"
                        rules={{
                          required: 'Replica count is required',
                          min: {
                            value: 1,
                            message: 'At least one replica is required',
                          },
                        }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            fullWidth
                            required
                            error={Boolean(fieldState.error)}
                            helperText={
                              fieldState.error?.message ??
                              'Number of deployment replicas.'
                            }
                            inputProps={{ min: 1, step: 1 }}
                            label="Replicas"
                            onChange={(event) =>
                              field.onChange(Number(event.target.value))
                            }
                            type="number"
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name="parallelismStrategies"
                        render={({ field }) => (
                          <TextField
                            select
                            fullWidth
                            SelectProps={{ multiple: true }}
                            helperText="Optional strategies for parallel model execution."
                            label="Parallelism strategies"
                            onChange={(event) =>
                              field.onChange(
                                typeof event.target.value === 'string'
                                  ? event.target.value.split(',')
                                  : event.target.value
                              )
                            }
                            value={field.value}
                          >
                            {Object.values(Deployments.ParallelismStrategy).map(
                              (strategy) => (
                                <MenuItem key={strategy} value={strategy}>
                                  {strategy}
                                </MenuItem>
                              )
                            )}
                          </TextField>
                        )}
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </>
            )}
          </Stack>
        )}
        {activeStep === 7 && (
          <Stack spacing={2}>
            <Typography variant="h6">Review deployment</Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 1,
                gridTemplateColumns: {
                  sm: 'repeat(3, minmax(0, 1fr))',
                  xs: '1fr',
                },
              }}
            >
              <ReviewCard
                color="secondary.main"
                icon={<SmartToyIcon />}
                label="Model"
                span={3}
              >
                {selectedModelName}
              </ReviewCard>
              <ReviewCard
                color="success.main"
                icon={<RocketLaunchIcon />}
                label="Deployment name"
                span={2}
              >
                {getValues('name')}
              </ReviewCard>
              <ReviewCard
                color="warning.main"
                icon={<RocketLaunchIcon />}
                label="Modality"
              >
                {modality ?? 'Not selected'}
              </ReviewCard>
              {getValues('description') && (
                <ReviewCard
                  color="text.secondary"
                  icon={<DescriptionOutlinedIcon />}
                  label="Description"
                  span={3}
                >
                  {getValues('description')}
                </ReviewCard>
              )}
              <ReviewCard
                color="primary.main"
                icon={<SettingsSuggestOutlinedIcon />}
                label="Deployment option"
                span={3}
              >
                {selectedOption ? (
                  <Stack
                    direction="row"
                    sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}
                  >
                    <Typography>{optionTitle(selectedOption)}</Typography>
                    <Chip label={selectedOption.serving_runtime} size="small" />
                    <Chip
                      label={selectedOption.deployment_target_type}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                ) : (
                  'Not selected'
                )}
              </ReviewCard>
              <ReviewCard
                color="info.main"
                icon={<HubOutlinedIcon />}
                label="Target"
              >
                {deploymentTargetType ===
                Models.DeploymentTargetType.HpcClusterQueue
                  ? 'HPC Cluster'
                  : deploymentTargetType ?? 'Not selected'}
              </ReviewCard>
              <ReviewCard
                color="secondary.main"
                icon={<StorageOutlinedIcon />}
                label="HPC cluster"
              >
                {clusterOptions.find(
                  (option) =>
                    option.hpc_cluster_queue?.hpc_cluster_id === hpcClusterId
                )?.hpc_cluster_queue?.hpc_cluster_name ?? 'Not selected'}
              </ReviewCard>
              <ReviewCard
                color="success.main"
                icon={<ViewListOutlinedIcon />}
                label="Queue"
              >
                {selectedOption ? optionTitle(selectedOption) : 'Not selected'}
              </ReviewCard>
              <ReviewCard
                color="primary.main"
                icon={<GroupsOutlinedIcon />}
                label="Replicas"
              >
                {getValues('replicas')}
              </ReviewCard>
              {getValues('parallelismStrategies').length > 0 && (
                <ReviewCard
                  color="info.main"
                  icon={<AccountTreeOutlinedIcon />}
                  label="Parallelism strategies"
                  span={2}
                >
                  {getValues('parallelismStrategies').join(', ')}
                </ReviewCard>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {activeStep > 0 && (
          <Button onClick={() => setActiveStep((step) => step - 1)}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            disabled={
              (activeStep === 2 &&
                (deploymentOptionsQuery.isLoading ||
                  supportedModalities.length === 0)) ||
              (activeStep === 4 && !hasEnabledCluster) ||
              (activeStep === 5 && !hasEnabledQueue) ||
              (activeStep === 6 &&
                (deploymentOptionDetailQuery.isLoading ||
                  deploymentOptionDetailQuery.isError))
            }
            onClick={next}
            variant="contained"
          >
            Continue
          </Button>
        ) : (
          <LoadingButton
            loading={isDeploying}
            onClick={handleSubmit(submit)}
            startIcon={<RocketLaunchIcon />}
            variant="contained"
          >
            Deploy
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

const ReviewCard = ({
  color,
  icon,
  label,
  span = 1,
  children,
}: {
  color: string;
  icon: React.ReactNode;
  label: string;
  span?: 1 | 2 | 3;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      border: 1,
      borderColor: 'divider',
      borderRadius: '2px',
      gridColumn: { sm: `span ${span}` },
      minWidth: 0,
      p: 1.5,
    }}
  >
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ color, display: 'flex', mt: 0.25 }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography color="text.secondary" variant="caption">
          {label}
        </Typography>
        <Typography
          component="div"
          sx={{ fontWeight: 700, mt: 0.25 }}
          variant="body2"
        >
          {children}
        </Typography>
      </Box>
    </Stack>
  </Box>
);

export default DeploymentDialog;
