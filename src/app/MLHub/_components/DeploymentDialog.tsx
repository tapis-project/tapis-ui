import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { ExpandMore, Visibility, VisibilityOff } from '@mui/icons-material';
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
import { derivedMetadataFor, modelAuthorFor } from '../modelMetadata';

interface DeploymentDialogProps {
  defaultModel?: Models.Model;
  defaultStratRef?: Models.DeploymentStrategyReference;
  open: boolean;
  onClose: () => void;
  author: string;
}

type FormInput = {
  name: string;
  description: string | null;
  model: Models.Model | null;
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
type DeploymentReviewProps = {
  model: Models.Model | null;
  name: string;
  description: string | null;
  modality: Deployments.DeploymentModality | null;
  strategy: Deployments.Strategy | null;
  replicas: FormInput['replicas'];
  parallelism: Deployments.ParallelismStrategy[];
  parameters: DeploymentParameterInput[];
};
type DeploymentModalityMenuItemProps = {
  deploymentModality: Deployments.DeploymentModality;
};
type ModelMenuItemProps = {
  model: Models.Model;
  replicas?: FormInput['replicas'];
};
type DeploymentStrategyMenuItemProps = {
  strat: Pick<Deployments.Strategy, 'platform' | 'name' | 'description'>;
};
const deploymentNameFor = (modelName: string) => `${modelName} Deployment`;
const hasParameterValue = (value: unknown) =>
  value !== null &&
  value !== undefined &&
  (typeof value !== 'string' || value.trim().length > 0);
const strategyKey = (
  strategy: Pick<Deployments.Strategy, 'platform' | 'name'>
) => `${strategy.platform}:${strategy.name}`;

const wizardSteps = [
  'Model',
  'Details',
  'Modality',
  'Configuration',
  'Review',
] as const;

const initialStepFor = (defaultModel?: Models.Model) => (defaultModel ? 1 : 0);

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
  const [activeStep, setActiveStep] = useState(() =>
    initialStepFor(defaultModel)
  );
  const { data: modelsData } = Hooks.Models.useListByAuthor({ author });
  const { data: strategiesData } = Hooks.Deployments.Strategies.useList();
  const models = modelsData?.result ?? [];
  const deployableModels = models.filter(
    (item) => derivedMetadataFor(item).deployment_strategies.length > 0
  );
  const hasDeployableModel =
    deployableModels.length > 0 ||
    Boolean(
      defaultModel &&
        derivedMetadataFor(defaultModel).deployment_strategies.length
    );
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
    setValue,
    trigger,
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
    if (open && !isDirty) reset(initialValues);
  }, [initialValues, isDirty, open, reset]);

  useEffect(() => {
    if (open) setActiveStep(initialStepFor(defaultModel));
  }, [defaultModel, open]);

  const availableStrategies = useMemo(() => {
    if (!model || !modality) return [];
    const allowedStrategyKeys = new Set(
      derivedMetadataFor(model).deployment_strategies.map(
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
  const canSubmit = Boolean(
    model &&
      modality &&
      strategy &&
      requiredParametersHaveValues &&
      !isDeploying
  );
  const selectedModelIsDeployable = Boolean(
    model && derivedMetadataFor(model).deployment_strategies.length
  );

  const close = () => {
    reset(emptyValues);
    resetDeploy();
    setActiveStep(initialStepFor(defaultModel));
    onClose();
  };

  const goNext = async () => {
    let valid = false;
    switch (activeStep) {
      case 0:
        valid = (await trigger('model')) && Boolean(selectedModelIsDeployable);
        break;
      case 1:
        valid = await trigger(['name', 'description']);
        break;
      case 2:
        valid = await trigger('deploymentModality');
        break;
      case 3:
        valid = await trigger(['strategy', 'parameters']);
        break;
      default:
        valid = true;
    }

    if (valid) {
      setActiveStep((current) => Math.min(current + 1, wizardSteps.length - 1));
    }
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
          model_id: data.model.id,
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
              <b>{data.result.model.model_id}</b>{' '}
            </p>
          );
        },
      }
    );
  };

  const handleFormSubmit = (event: FormEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (activeStep === wizardSteps.length - 1) {
      void handleSubmit(submit)(event);
      return;
    }
    void goNext();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      onSubmit={handleFormSubmit}
      component="form"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6">Model Deployment Wizard</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure and review a model deployment in five guided steps.
        </Typography>
      </DialogTitle>

      {!hasDeployableModel ? (
        <DialogContent dividers sx={contentSx}>
          <Alert severity="warning">
            <AlertTitle>No deployable models are available</AlertTitle>
            Add a model with at least one compatible deployment strategy from
            the Model Marketplace.
          </Alert>
          <MarketplaceButton marketplace="model" />
        </DialogContent>
      ) : (
        <DialogContent dividers sx={contentSx}>
          {deploymentError && <ErrorAlert error={deploymentError} />}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 1 }}>
            {wizardSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ minHeight: 320 }}>
            {activeStep === 0 && (
              <WizardStep
                title="Choose a model"
                description="Select the model that you want to deploy. Only models with compatible deployment strategies are available."
              >
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
                      value={field.value?.id ?? ''}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      onBlur={field.onBlur}
                      onChange={(event) => {
                        const selected =
                          deployableModels.find(
                            ({ id }) => id === event.target.value
                          ) ?? null;
                        field.onChange(selected);
                        setValue(
                          'name',
                          selected ? deploymentNameFor(selected.name) : '',
                          { shouldValidate: true }
                        );
                        setValue('deploymentModality', null);
                        setValue('strategy', null);
                        replaceParameters([]);
                      }}
                    >
                      {deployableModels.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          <ModelMenuItem model={item} />
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                {model && !selectedModelIsDeployable && (
                  <Alert severity="warning">
                    This model has no compatible deployment strategy and cannot
                    be deployed.
                  </Alert>
                )}
              </WizardStep>
            )}

            {activeStep === 1 && (
              <WizardStep
                title="Deployment details"
                description="Give this deployment a recognizable name and optional description."
              >
                <DeploymentDetails control={control} />
              </WizardStep>
            )}

            {activeStep === 2 && (
              <WizardStep
                title="Choose a deployment modality"
                description="Select whether this model runs as a persistent service or a batch workload."
              >
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
                      value={field.value ?? ''}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      onBlur={field.onBlur}
                      onChange={(event) => {
                        const selected = event.target
                          .value as Deployments.DeploymentModality;
                        field.onChange(selected);
                        if (
                          strategy &&
                          !strategy.config.supported_deployment_modalities.includes(
                            selected
                          )
                        ) {
                          setValue('strategy', null);
                          replaceParameters([]);
                        }
                      }}
                    >
                      {Object.values(Deployments.DeploymentModality).map(
                        (item) => (
                          <MenuItem key={item} value={item}>
                            <DeploymentModalityMenuItem
                              deploymentModality={item}
                            />
                          </MenuItem>
                        )
                      )}
                    </TextField>
                  )}
                />
              </WizardStep>
            )}

            {activeStep === 3 && (
              <WizardStep
                title="Configure the deployment"
                description="Choose a compatible strategy, provide its parameters, and adjust optional scaling settings."
              >
                <StrategyPicker
                  control={control}
                  strategies={availableStrategies}
                  onSelect={(selected) =>
                    replaceParameters(
                      parameterInputsFor(selected?.parameters ?? [])
                    )
                  }
                />
                {availableStrategies.length === 0 && (
                  <Alert severity="warning">
                    No deployment strategies support the selected modality.
                  </Alert>
                )}
                {strategy && (
                  <>
                    <ParametersAccordion
                      control={control}
                      parameters={parameters}
                      errors={errors}
                      requiredCount={requiredParameterCount}
                    />
                    <AdvancedSettings control={control} strategy={strategy} />
                  </>
                )}
              </WizardStep>
            )}

            {activeStep === 4 && (
              <WizardStep
                title="Review deployment"
                description="Confirm the configuration below before submitting the deployment request."
              >
                <DeploymentReview
                  model={model}
                  name={name}
                  description={description}
                  modality={modality}
                  strategy={strategy}
                  replicas={replicas}
                  parallelism={parallelism}
                  parameters={parameterValues ?? []}
                />
              </WizardStep>
            )}
          </Box>
        </DialogContent>
      )}

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button type="button" onClick={close} color="inherit">
          Cancel
        </Button>
        <Box sx={{ flex: 1 }} />
        {hasDeployableModel && activeStep > 0 && (
          <Button
            type="button"
            color="inherit"
            disabled={isDeploying}
            onClick={() => setActiveStep((current) => current - 1)}
          >
            Back
          </Button>
        )}
        {hasDeployableModel && activeStep === wizardSteps.length - 1 ? (
          <LoadingButton
            loading={isDeploying}
            type="submit"
            variant="contained"
            disabled={!canSubmit}
          >
            🚀 Deploy
          </LoadingButton>
        ) : hasDeployableModel ? (
          <Button
            type="button"
            variant="contained"
            disabled={isDeploying}
            onClick={goNext}
          >
            Next
          </Button>
        ) : null}
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

const WizardStep = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <Stack spacing={2.5}>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
    {children}
  </Stack>
);

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

const DeploymentReview = ({
  model,
  name,
  description,
  modality,
  strategy,
  replicas,
  parallelism,
  parameters,
}: DeploymentReviewProps) => {
  return (
    <Stack
      divider={<Divider flexItem />}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        px: 2.5,
      }}
    >
      <ReviewRow label="Model">
        {model ? <ModelMenuItem model={model} replicas={replicas} /> : '—'}
      </ReviewRow>
      <ReviewRow label="Deployment">
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {name}
          </Typography>
          {description && (
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      </ReviewRow>
      <ReviewRow label="Modality">
        {modality ? (
          <DeploymentModalityMenuItem deploymentModality={modality} />
        ) : (
          '—'
        )}
      </ReviewRow>
      <ReviewRow label="Strategy">
        {strategy ? <DeploymentStrategyMenuItem strat={strategy} /> : '—'}
      </ReviewRow>
      <ReviewRow label="Parameters">
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          {parameters.length ? (
            parameters.map(({ definition, value }) => (
              <Chip
                key={definition.name}
                size="small"
                variant="outlined"
                label={`${definition.name}: ${
                  definition.secret
                    ? hasParameterValue(value)
                      ? 'Configured'
                      : 'Not set'
                    : String(value ?? 'Not set')
                }`}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No parameters
            </Typography>
          )}
        </Stack>
      </ReviewRow>
      <ReviewRow label="Scaling">
        <Typography variant="body2">
          {replicas} replica{replicas === 1 ? '' : 's'}
          {parallelism.length
            ? ` · ${parallelism.join(', ')}`
            : ' · No sharding'}
        </Typography>
      </ReviewRow>
    </Stack>
  );
};

const ReviewRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '140px 1fr' },
      gap: 1.5,
      py: 1.75,
      alignItems: 'center',
    }}
  >
    <Typography
      variant="caption"
      sx={{
        color: 'text.secondary',
        fontWeight: 700,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </Typography>
    <Box>{children}</Box>
  </Box>
);

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
        {derivedMetadataFor(model).deployment_strategies.length ? '🤖' : '🚫'}
      </Typography>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {model.name}
          {replicas ? ` × ${replicas}` : ''}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {modelAuthorFor(model)}
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
