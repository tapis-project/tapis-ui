import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ExpandMore,
  Undo,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import * as Models from '@mlhub/models-ts-sdk';
import {
  Control,
  Controller,
  FieldErrors,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { getPlatformConfig } from '../enums';
import DiscreteIntegerSlider from './DiscreteIntegerSlider';
import { MarketplaceButton } from './MarketplaceButton';
import { SectionHeader } from './SectionHeader';
import { useToast } from '../_context/ToastsContext/useToast';

interface DeploymentDialogProps {
  defaultModel?: Models.ModelMetadata;
  defaultStratRef?: Models.DeploymentStrategyReference;
  open: boolean;
  onClose: () => void;
  author: string;
}

type FormInput = {
  name: string;
  description: string | null;
  model: Models.ModelMetadata | null;
  strategy: Deployments.Strategy | null;
  deploymentModality: Deployments.DeploymentModality | null;
  parameters: DeploymentParameterInput[];
  replicas: Deployments.ReplicaGroup['count'];
  parallelismStrategies: Deployments.ParallelismStrategy[];
};

type DeploymentParameterInput = {
  definition: Deployments.Parameter;
  value: Deployments.Parameter['_default'];
};

const parameterInputsFor = (parameters: Deployments.Parameter[]) =>
  parameters.map((definition) => ({
    definition,
    value: definition._default ?? '',
  }));

type ErrorAlertProps = { error: Error };
type DeploymentDetailsProps = { control: Control<FormInput> };
type StrategyPickerProps = {
  control: Control<FormInput>;
  strategies: Deployments.Strategy[];
  onSelect: (strategy: Deployments.Strategy | null) => void;
};
type ParametersAccordionProps = {
  control: Control<FormInput>;
  parameters: Array<DeploymentParameterInput & { id: string }>;
  errors: FieldErrors<FormInput>;
  requiredCount: number;
};
type ParameterFieldProps = {
  parameter: DeploymentParameterInput & { id: string };
  index: number;
  control: Control<FormInput>;
  error?: { message?: string };
};
type AdvancedSettingsProps = {
  control: Control<FormInput>;
  strategy: Deployments.Strategy;
};
type DeploymentSummaryProps = {
  model: Models.ModelMetadata | null;
  name: string;
  description: string | null;
  detailsConfirmed: boolean;
  modality: Deployments.DeploymentModality | null;
  strategy: Deployments.Strategy | null;
  replicas: FormInput['replicas'];
  parallelism: Deployments.ParallelismStrategy[];
  canUndoModel: boolean;
  canUndoStrategy: boolean;
  onClearModel: () => void;
  onClearDetails: () => void;
  onClearModality: () => void;
  onClearStrategy: () => void;
};
type SummaryItemProps = PropsWithChildren<{
  canUndo?: boolean;
  onClear: () => void;
}>;
type DeploymentModalityMenuItemProps = {
  deploymentModality: Deployments.DeploymentModality;
};
type ModelMenuItemProps = {
  model: Models.ModelMetadata;
  replicas?: FormInput['replicas'];
};
type DeploymentStrategyMenuItemProps = {
  strat: Pick<Deployments.Strategy, 'platform' | 'name' | 'description'>;
};
type DetailsSummaryItemProps = { name: string; description?: string };

const deploymentNameFor = (modelName: string) => `${modelName} Deployment`;
const hasParameterValue = (value: unknown) =>
  value !== null &&
  value !== undefined &&
  (typeof value !== 'string' || value.trim().length > 0);
const strategyKey = (
  strategy: Pick<Deployments.Strategy, 'platform' | 'name'>
) => `${strategy.platform}:${strategy.name}`;

const emptyValues: FormInput = {
  name: '',
  description: null,
  model: null,
  strategy: null,
  deploymentModality: null,
  parameters: [],
  replicas: 1,
  parallelismStrategies: [],
};

const DeploymentDialog = ({
  open,
  onClose,
  author,
  defaultModel,
  defaultStratRef,
}: DeploymentDialogProps) => {
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);
  const { data: modelsData } = Hooks.Models.useListByAuthor({ author });
  const { data: strategiesData } = Hooks.Deployments.Strategies.useList();
  const models = modelsData?.result ?? [];
  const strategies = strategiesData?.result ?? [];
  const {
    deploy,
    isLoading: isDeploying,
    error: deploymentError,
    reset: resetDeploy,
  } = Hooks.Deployments.useDeployWithStrategy();
  const toast = useToast();

  const defaultStrategy = useMemo(
    () =>
      strategies.find(
        ({ name, platform }) =>
          name === defaultStratRef?.name &&
          platform === defaultStratRef?.platform
      ),
    [defaultStratRef, strategies]
  );

  const initialValues = useMemo<FormInput>(
    () => ({
      ...emptyValues,
      name: defaultModel ? deploymentNameFor(defaultModel.name) : '',
      model: defaultModel ?? null,
      strategy: defaultStrategy ?? null,
      deploymentModality: null,
      parameters: parameterInputsFor(defaultStrategy?.parameters ?? []),
    }),
    [defaultModel, defaultStrategy]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    resetField,
    setValue,
  } = useForm<FormInput>({ defaultValues: initialValues, mode: 'onChange' });
  const { fields: parameters, replace: replaceParameters } = useFieldArray({
    control,
    name: 'parameters',
  });

  const [name, description, model, modality, strategy, replicas, parallelism] =
    useWatch({
      control,
      name: [
        'name',
        'description',
        'model',
        'deploymentModality',
        'strategy',
        'replicas',
        'parallelismStrategies',
      ],
    });
  const parameterValues = useWatch({ control, name: 'parameters' });

  // Async model/strategy data can arrive after the form mounts. Do not overwrite edits.
  useEffect(() => {
    if (!isDirty) reset(initialValues);
  }, [initialValues, isDirty, reset]);

  const availableStrategies = useMemo(() => {
    if (!model || !modality) return [];
    const allowedStrategyKeys = new Set(
      model.deployment_strategy_refs.map(
        ({ name, platform }) => `${platform}:${name}`
      )
    );
    return strategies.filter(
      (item) =>
        item.config.supported_deployment_modalities.includes(modality) &&
        allowedStrategyKeys.has(strategyKey(item))
    );
  }, [model, modality, strategies]);

  const requiredParameterCount =
    strategy?.parameters.filter(({ required }) => required).length ?? 0;
  const requiredParametersHaveValues = parameters.every(
    (parameter, index) =>
      !parameter.definition.required ||
      hasParameterValue(parameterValues?.[index]?.value)
  );
  const hasSummary = Boolean(
    model || name || description || modality || strategy
  );
  const canSubmit = Boolean(
    detailsConfirmed &&
      model &&
      modality &&
      strategy &&
      requiredParametersHaveValues &&
      !isDeploying
  );

  const clearFrom = (field: 'model' | 'modality' | 'strategy') => {
    if (field === 'model') resetField('model');
    if (field === 'model' || field === 'modality')
      resetField('deploymentModality');
    resetField('strategy');
    replaceParameters([]);
  };

  const close = () => {
    reset(emptyValues);
    resetDeploy();
    setDetailsConfirmed(false);
    onClose();
  };

  const submit = (data: FormInput) => {
    if (!data.model || !data.strategy || !data.deploymentModality) return;
    deploy(
      {
        strategyName: data.strategy.name,
        platform: data.strategy.platform,
        deployModelWithStrategyBody: {
          name: data.name,
          description: data.description || null,
          model_author: data.model.author,
          model_name: data.model.name,
          arguments: data.parameters.map(({ definition, value }) => ({
            parameter_name: definition.name,
            value: value!, // TODO Handle null/undefined values
          })),
          deployment_modality: data.deploymentModality,
          replicas: data.replicas,
          parallelism_strategies: data.parallelismStrategies,
        },
      },
      {
        onSuccess: (data) => {
          close();
          toast.success(
            <p>
              Deployment request <b>({data.result.name})</b> for model{' '}
              <b>
                {data.result.model.author}/{data.result.model.name}
              </b>{' '}
            </p>
          );
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      onSubmit={handleSubmit(submit)}
      component="form"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ typography: 'h6' }}>Deploy Model</DialogTitle>

      {models.length === 0 ? (
        <DialogContent dividers sx={contentSx}>
          <Alert severity="warning">
            <AlertTitle>You have no models that we can deploy!</AlertTitle>
            Search the Model Marketplace for deployable models.
          </Alert>
          <MarketplaceButton marketplace="model" />
        </DialogContent>
      ) : (
        <DialogContent dividers sx={contentSx}>
          {deploymentError && <ErrorAlert error={deploymentError} />}
          {hasSummary && (
            <DeploymentSummary
              model={model}
              name={name}
              description={description}
              detailsConfirmed={detailsConfirmed}
              modality={modality}
              strategy={strategy}
              replicas={replicas}
              parallelism={parallelism}
              canUndoModel={Boolean(defaultModel)}
              canUndoStrategy={Boolean(defaultStratRef)}
              onClearModel={() => clearFrom('model')}
              onClearDetails={() => {
                resetField('name');
                resetField('description');
                setDetailsConfirmed(false);
              }}
              onClearModality={() => clearFrom('modality')}
              onClearStrategy={() => clearFrom('strategy')}
            />
          )}

          {!model && (
            <Controller
              name="model"
              control={control}
              rules={{ required: 'Must select a model' }}
              render={({ field, fieldState }) => (
                <TextField
                  select
                  fullWidth
                  required
                  label="Select Model"
                  value={field.value?.name ?? ''}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    const selected =
                      models.find(({ name }) => name === event.target.value) ??
                      null;
                    field.onChange(selected);
                    setValue(
                      'name',
                      selected ? deploymentNameFor(selected.name) : '',
                      { shouldValidate: true }
                    );
                  }}
                >
                  {models.map((item) => (
                    <MenuItem
                      key={item.name}
                      value={item.name}
                      disabled={!item.deployment_strategy_refs.length}
                    >
                      <ModelMenuItem model={item} />
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}

          {model && !detailsConfirmed && (
            <DeploymentDetails control={control} />
          )}

          {model && detailsConfirmed && !modality && (
            <Controller
              name="deploymentModality"
              control={control}
              rules={{ required: 'Must select a deployment modality' }}
              render={({ field, fieldState }) => (
                <TextField
                  select
                  fullWidth
                  required
                  label="Deployment Modality"
                  {...field}
                  value={field.value ?? ''}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                >
                  {Object.values(Deployments.DeploymentModality).map((item) => (
                    <MenuItem key={item} value={item}>
                      <DeploymentModalityMenuItem deploymentModality={item} />
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}

          {model && modality && !strategy && (
            <StrategyPicker
              control={control}
              strategies={availableStrategies}
              onSelect={(selected) =>
                replaceParameters(
                  parameterInputsFor(selected?.parameters ?? [])
                )
              }
            />
          )}

          {strategy && detailsConfirmed && (
            <ParametersAccordion
              control={control}
              parameters={parameters}
              errors={errors}
              requiredCount={requiredParameterCount}
            />
          )}
          {model && detailsConfirmed && modality && strategy && (
            <AdvancedSettings control={control} strategy={strategy} />
          )}
        </DialogContent>
      )}

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button type="button" onClick={close} color="inherit">
          Cancel
        </Button>
        {detailsConfirmed ? (
          <LoadingButton
            loading={isDeploying}
            type="submit"
            variant="contained"
            disabled={!canSubmit}
          >
            🚀 Deploy
          </LoadingButton>
        ) : (
          <Button
            type="button"
            disabled={!name?.trim()}
            onClick={() => {
              setDetailsConfirmed(true);
            }}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeploymentDialog;

const contentSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2.5,
  pt: 2.5,
};
const accordionSx = { borderRadius: '8px', border: '1px solid #CCCCCC' };

const ErrorAlert = ({ error }: ErrorAlertProps) => {
  return (
    <Alert severity="error">
      <AlertTitle>Failed to Deploy</AlertTitle>
      {error.message}
    </Alert>
  );
};

const DeploymentDetails = ({ control }: DeploymentDetailsProps) => {
  return (
    <>
      <Controller
        name="name"
        control={control}
        rules={{ required: 'Deployment name is required' }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            fullWidth
            required
            label="Deployment Name"
            placeholder="e.g., My Llama Deployment - Live"
            error={Boolean(fieldState.error)}
            helperText={
              fieldState.error?.message ?? 'Provide a name for this deployment.'
            }
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        rules={{
          validate: (value) =>
            !value ||
            value.length <= 200 ||
            'Description cannot exceed 200 characters',
        }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            value={field.value ?? ''}
            fullWidth
            multiline
            rows={2}
            maxRows={6}
            label="Description"
            placeholder="Describe the operational scope or purpose of this deployment..."
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
          />
        )}
      />
    </>
  );
};

const StrategyPicker = ({
  control,
  strategies,
  onSelect,
}: StrategyPickerProps) => {
  return (
    <Controller
      name="strategy"
      control={control}
      rules={{ required: 'Deployment strategy is required' }}
      render={({ field, fieldState }) => (
        <TextField
          select
          fullWidth
          required
          label="Choose deployment strategy"
          value={field.value ? strategyKey(field.value) : ''}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
          onBlur={field.onBlur}
          onChange={(event) => {
            const selected =
              strategies.find(
                (item) => strategyKey(item) === event.target.value
              ) ?? null;
            field.onChange(selected);
            onSelect(selected);
          }}
        >
          {strategies.map((item) => (
            <MenuItem
              key={strategyKey(item)}
              value={strategyKey(item)}
              sx={{ borderBottom: '1px solid #CCCCCC' }}
            >
              <DeploymentStrategyMenuItem strat={item} />
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
};

const ParametersAccordion = ({
  control,
  parameters,
  errors,
  requiredCount,
}: ParametersAccordionProps) => {
  return (
    <Accordion defaultExpanded sx={accordionSx}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <SectionHeader
          title={`Parameters (${parameters.length})`}
          caption={requiredCount > 0 ? `${requiredCount} required` : undefined}
          captionColor="error"
        />
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2.5}>
          {parameters.map((parameter, index) => (
            <ParameterField
              key={parameter.id}
              parameter={parameter}
              index={index}
              control={control}
              error={errors.parameters?.[index]?.value}
            />
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

const ParameterField = ({
  parameter,
  index,
  control,
  error,
}: ParameterFieldProps) => {
  const [showSecret, setShowSecret] = useState(false);
  const definition = parameter.definition;
  return (
    <Controller
      name={`parameters.${index}.value`}
      control={control}
      rules={{
        validate: (value) =>
          !definition.required ||
          hasParameterValue(value) ||
          'This parameter is required',
      }}
      render={({ field }) =>
        definition.choices?.length ? (
          <TextField
            {...field}
            select
            fullWidth
            label={definition.name}
            required={definition.required}
            error={Boolean(error)}
            helperText={error?.message ?? definition.description}
            autoComplete={`dont-autofill-${definition.name}`} // Prevent autofill
            slotProps={{
              input: {
                sx: {
                  '& input:-webkit-autofill': {
                    // Adjust this to match your theme background and text color
                    WebkitBoxShadow: '0 0 0 100px #ffffff inset !important',
                    WebkitTextFillColor: '#000000 !important',
                    // Fixes the transition lag when autofill triggers
                    transition: 'background-color 5000s ease-in-out 0s',
                  },
                },
              },
            }}
          >
            {definition.choices.map((choice) => (
              <MenuItem
                key={choice.value}
                value={choice.value}
                disabled={!choice.enabled}
              >
                <Box>
                  <Typography variant="body2">{choice.value}</Typography>
                  {choice.description && (
                    <Typography variant="caption" color="text.secondary">
                      {choice.description}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <TextField
            {...field}
            fullWidth
            label={definition.name}
            required={definition.required}
            error={Boolean(error)}
            type={definition.secret && !showSecret ? 'password' : 'text'}
            helperText={
              error?.message ??
              (definition.secret
                ? `(Secret) ${definition.description ?? ''}`
                : definition.description)
            }
            autoComplete={`dont-autofill-${definition.name}`} // Prevent autofill
            slotProps={{
              input: {
                sx: {
                  '& input:-webkit-autofill': {
                    // Adjust this to match your theme background and text color
                    WebkitBoxShadow: '0 0 0 100px #ffffff inset !important',
                    WebkitTextFillColor: '#000000 !important',
                    // Fixes the transition lag when autofill triggers
                    transition: 'background-color 5000s ease-in-out 0s',
                  },
                },
                endAdornment: definition.secret ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={`${showSecret ? 'hide' : 'show'} ${
                        definition.name
                      }`}
                      onClick={() => setShowSecret((shown) => !shown)}
                      onMouseDown={(event) => event.preventDefault()}
                      edge="end"
                    >
                      {!showSecret ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
        )
      }
    />
  );
};

const AdvancedSettings = ({ control, strategy }: AdvancedSettingsProps) => {
  return (
    <Accordion sx={accordionSx}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <SectionHeader
          title="Advanced Settings"
          caption="Replication & Parallelism"
        />
      </AccordionSummary>
      <AccordionDetails
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Controller
          name="replicas"
          control={control}
          rules={{ required: 'Must specify replica count' }}
          render={({ field, fieldState }) => (
            <Box>
              <SectionHeader
                title="Replicas"
                caption="Specify the total number of instances to deploy"
              />
              <Alert severity="info">
                Note: This is not the same as the number of nodes this model
                will be deployed across. A single instance (replica) may require
                multiple nodes and sharding.
              </Alert>
              <DiscreteIntegerSlider
                min={1}
                sliderMin={0}
                max={5}
                value={typeof field.value === 'number' ? field.value : 1}
                onChange={field.onChange}
              />
              {fieldState.error && (
                <Typography color="error" variant="caption">
                  {fieldState.error.message}
                </Typography>
              )}
            </Box>
          )}
        />
        <Controller
          name="parallelismStrategies"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <SectionHeader
                title="Sharding"
                caption="How the model is sharded across nodes. Applies to all replicas"
              />
              {strategy.config.supported_paralellism_strategies.length ===
                0 && (
                <Alert severity="warning">
                  Sharding is not supported by the selected deployment strategy
                  ({strategy.name})
                </Alert>
              )}
              <FormControl fullWidth error={Boolean(fieldState.error)}>
                <InputLabel id="parallelism-strategies-label">
                  Parallelism Strategies
                </InputLabel>
                <Select
                  {...field}
                  labelId="parallelism-strategies-label"
                  multiple
                  value={Array.isArray(field.value) ? field.value : []}
                  input={<OutlinedInput label="Parallelism Strategies" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {Object.values(Deployments.ParallelismStrategy).map(
                    (item) => (
                      <MenuItem
                        disabled={
                          !strategy.config.supported_paralellism_strategies.includes(
                            item
                          )
                        }
                        key={item}
                        value={item}
                      >
                        {item}
                      </MenuItem>
                    )
                  )}
                </Select>
                <FormHelperText>
                  {fieldState.error?.message ??
                    'Choose parallelism strategies for this deployment.'}
                </FormHelperText>
              </FormControl>
            </>
          )}
        />
      </AccordionDetails>
    </Accordion>
  );
};

const DeploymentSummary = ({
  model,
  name,
  description,
  detailsConfirmed,
  modality,
  strategy,
  replicas,
  parallelism,
  canUndoModel,
  canUndoStrategy,
  onClearModel,
  onClearDetails,
  onClearModality,
  onClearStrategy,
}: DeploymentSummaryProps) => {
  const check = (value: unknown) => (value ? '✅' : '');
  return (
    <Accordion sx={accordionSx}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box>
          <Typography sx={{ fontWeight: 600 }}>Deployment Summary</Typography>
          <Typography variant="caption">
            {check(model)} model · {check(detailsConfirmed)} name &amp;
            description · {check(modality)} modality · {check(strategy)}{' '}
            strategy · {check(replicas)} replicas · {check(parallelism?.length)}{' '}
            sharding
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {model && (
          <SummaryItem canUndo={canUndoModel} onClear={onClearModel}>
            <ModelMenuItem model={model} replicas={replicas} />
          </SummaryItem>
        )}
        {detailsConfirmed && (
          <SummaryItem onClear={onClearDetails}>
            <DetailsSummaryItem
              name={name}
              description={description ?? undefined}
            />
          </SummaryItem>
        )}
        {modality && (
          <SummaryItem canUndo={canUndoStrategy} onClear={onClearModality}>
            <DeploymentModalityMenuItem deploymentModality={modality} />
          </SummaryItem>
        )}
        {strategy && (
          <SummaryItem canUndo={canUndoStrategy} onClear={onClearStrategy}>
            <DeploymentStrategyMenuItem strat={strategy} />
          </SummaryItem>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

const SummaryItem = ({ children, canUndo, onClear }: SummaryItemProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        borderTop: '1px solid #CCCCCC',
        p: 1,
      }}
    >
      {children}
      {!canUndo && (
        <IconButton size="small" color="error" onClick={onClear}>
          <Undo fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

const DeploymentModalityMenuItem = ({
  deploymentModality,
}: DeploymentModalityMenuItemProps) => {
  const isService =
    deploymentModality === Deployments.DeploymentModality.Service;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Typography>{isService ? '⚙️' : '🔄'}</Typography>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {isService ? 'Service' : 'Batch'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {isService
            ? 'Deploy this model as a persistent service'
            : 'Deploy this model as a batch job on HPC systems'}
        </Typography>
      </Box>
    </Box>
  );
};

const ModelMenuItem = ({ model, replicas }: ModelMenuItemProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Typography>
        {model.deployment_strategy_refs.length ? '🤖' : '🚫'}
      </Typography>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {model.name}
          {replicas ? ` × ${replicas}` : ''}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {model.author}
        </Typography>
      </Box>
    </Box>
  );
};

const DeploymentStrategyMenuItem = ({
  strat,
}: DeploymentStrategyMenuItemProps) => {
  const config = getPlatformConfig(strat.platform);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      🚀
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          <Chip size="small" label={config.label} sx={{ mr: 0.5 }} />
          {strat.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {strat.description}
        </Typography>
      </Box>
    </Box>
  );
};

const DetailsSummaryItem = ({ name, description }: DetailsSummaryItemProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      📖
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Box>
  );
};
